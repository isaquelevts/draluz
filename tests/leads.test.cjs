const {test}=require('node:test');
const assert=require('node:assert/strict');
const handler=require('../api/leads.js');
test('lead storage, authentication, duplicate protection and failure handling',async()=>{
 const records=new Map(),hashes=new Map();
 process.env.UPSTASH_REDIS_REST_URL='https://database.invalid';
 process.env.UPSTASH_REDIS_REST_TOKEN='test';process.env.ADMIN_SETUP_TOKEN='a'.repeat(40);
 const originalFetch=global.fetch;
 global.fetch=async(url,options)=>{
  const [cmd,key,...args]=JSON.parse(options.body);let result=null;
  if(cmd==='INCR'){result=(records.get(key)||0)+1;records.set(key,result)}
  if(cmd==='EXPIRE')result=1;
  if(cmd==='GET')result=records.get(key)||null;
  if(cmd==='SET'){if(!args.includes('NX')||!records.has(key)){records.set(key,args[0]);result='OK'}}
  if(cmd==='DEL'){result=records.delete(key)?1:0}
  if(['HSETNX','HSET'].includes(cmd)){const h=hashes.get(key)||new Map();if(cmd==='HSET'||!h.has(args[0])){h.set(args[0],args[1]);result=1}else result=0;hashes.set(key,h)}
  if(cmd==='HGET')result=hashes.get(key)?.get(args[0])||null;
  if(cmd==='HVALS')result=[...(hashes.get(key)?.values()||[])];
  return {ok:true,json:async()=>({result})};
 };
 async function call(method,action='',body={},cookie='',origin='https://example.test'){
  const response={headers:{},status(c){this.code=c;return this},setHeader(k,v){this.headers[k]=v},json(data){this.data=data;return this}};
  await handler({method,query:{action},body,headers:{host:'example.test',origin,'content-type':'application/json',cookie},socket:{remoteAddress:'test'}},response);return response;
 }
 try{
  assert.equal((await call('GET')).code,401);
  assert.equal((await call('POST','setup',{username:'admin',password:'test-password-123',setupToken:'wrong'})).code,403);
  let result=await call('POST','setup',{username:'admin',password:'test-password-123',setupToken:'a'.repeat(40)});
  assert.equal(result.code,200);const cookie=result.headers['Set-Cookie'].split(';')[0];
  assert.match(result.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Strict/);
  assert.equal((await call('POST','setup',{username:'other',password:'test-password-123',setupToken:'a'.repeat(40)})).code,409);
  assert.equal((await call('POST','login',{username:'admin',password:'wrong-password'})).code,401);
  assert.equal((await call('POST','login',{username:'admin',password:'test-password-123'})).code,200);
  assert.equal((await call('POST','',{nome:'A'})).code,400);
  const lead={nome:'Contato de teste',telefone:'61999999999',tratamento:'Cicatriz',mensagem:'Teste fictício',consent:true,requestId:'11111111-1111-4111-8111-111111111111'};
  assert.equal((await call('POST','',lead,'','https://evil.test')).code,403);
  assert.equal((await call('POST','',lead)).code,201);
  assert.equal((await call('POST','',lead)).code,201);
  result=await call('GET','',{},cookie);assert.equal(result.code,200);assert.equal(result.data.leads.length,1);
  assert.equal((await call('PATCH','',{id:lead.requestId,status:'Agendado'},cookie)).code,200);
  assert.equal((await call('GET','',{},cookie)).data.leads[0].status,'Agendado');
  await call('POST','logout',{},cookie);assert.equal((await call('GET','',{},cookie)).code,401);
  global.fetch=async()=>{throw Error('Database offline')};
  assert.equal((await call('POST','',lead)).code,503);
 }finally{global.fetch=originalFetch}
});
