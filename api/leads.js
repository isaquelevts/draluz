const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
const PREFIX = 'draluz:';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const equal = (a,b) => typeof a === 'string' && typeof b === 'string' && crypto.timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b)));
async function db(...command) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('STORAGE_UNAVAILABLE');
  const response = await fetch(url, {method:'POST', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(10000)});
  if (!response.ok) throw new Error('STORAGE_UNAVAILABLE');
  const result = await response.json();
  if (result.error) throw new Error('STORAGE_UNAVAILABLE');
  return result.result;
}
async function limited(req, type, maximum) {
  const ip = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const key = `${PREFIX}limit:${type}:${hash(String(ip))}:${Math.floor(Date.now()/900000)}`;
  const count = await db('INCR',key);
  if (count === 1) await db('EXPIRE',key,960);
  return count > maximum;
}
async function session(req) {
  const token = (req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith('draluz_session='))?.slice(15);
  return token && /^[a-f0-9]{64}$/.test(token) && await db('GET',PREFIX+'session:'+hash(token));
}
function cookie(res,token,age) {
  res.setHeader('Set-Cookie',`draluz_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`);
}
module.exports = async (req,res) => {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  const send = (status,data) => res.status(status).json(data);
  try {
    if (!['GET','POST','PATCH','DELETE'].includes(req.method)) return send(405,{error:'Método não permitido.'});
    if (req.method !== 'GET') {
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host) return send(403,{error:'Origem inválida.'});
      if (!(req.headers['content-type'] || '').includes('application/json')) return send(415,{error:'Formato inválido.'});
    }
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (JSON.stringify(body).length > 8000) return send(413,{error:'Dados muito extensos.'});
    const action = req.query?.action || '';
    if (action === 'session' && req.method === 'GET') {
      const user = await session(req);
      return send(200,{authenticated:Boolean(user),username:user || null,setupRequired:!(await db('GET',PREFIX+'admin'))});
    }
    if (['setup','login'].includes(action) && req.method === 'POST') {
      if (await limited(req,'login',15)) return send(429,{error:'Muitas tentativas. Aguarde 15 minutos.'});
      const username = String(body.username || '').trim();
      const password = String(body.password || '');
      if (!/^[a-zA-Z0-9_.@-]{3,80}$/.test(username) || password.length < 12 || password.length > 128) return send(400,{error:'Use um usuário com 3 a 80 caracteres e senha com 12 a 128 caracteres.'});
      if (action === 'setup') {
        const setupToken = process.env.ADMIN_SETUP_TOKEN;
        if (!setupToken || setupToken.length < 32 || !equal(body.setupToken,setupToken)) return send(403,{error:'Chave de configuração inválida.'});
        const salt = crypto.randomBytes(16).toString('hex');
        const derived = (await scrypt(password,salt,64)).toString('hex');
        const created = await db('SET',PREFIX+'admin',JSON.stringify({username,salt,password:derived}),'NX');
        if (!created) return send(409,{error:'O administrador já foi criado. Entre com seu usuário e senha.'});
      } else {
        const raw = await db('GET',PREFIX+'admin');
        if (!raw) return send(401,{error:'Usuário ou senha inválidos.'});
        const admin = JSON.parse(raw);
        const derived = (await scrypt(password,admin.salt,64)).toString('hex');
        if (!equal(username,admin.username) || !equal(derived,admin.password)) return send(401,{error:'Usuário ou senha inválidos.'});
      }
      const token = crypto.randomBytes(32).toString('hex');
      await db('SET',PREFIX+'session:'+hash(token),username,'EX',28800);
      cookie(res,token,28800);
      return send(200,{ok:true});
    }
    if (action === 'logout' && req.method === 'POST') {
      const token = (req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith('draluz_session='))?.slice(15);
      if (token) await db('DEL',PREFIX+'session:'+hash(token));
      cookie(res,'',0);return send(200,{ok:true});
    }
    if (req.method === 'POST' && !action) {
      if (await limited(req,'submit',10)) return send(429,{error:'Muitos envios. Aguarde alguns minutos ou fale pelo WhatsApp.'});
      const name=String(body.nome||'').trim(), phone=String(body.telefone||'').replace(/\D/g,''), treatment=String(body.tratamento||'').trim(), message=String(body.mensagem||'').trim();
      if (name.length<2 || name.length>100 || !/^\d{10,13}$/.test(phone) || !treatment || treatment.length>120 || message.length>1500) return send(400,{error:'Confira o nome, telefone e tratamento informado.'});
      if (body.consent !== true) return send(400,{error:'Autorize o uso dos dados para receber contato.'});
      if (!/^[a-f0-9-]{36}$/.test(body.requestId||'')) return send(400,{error:'Identificador de envio inválido.'});
      const lead = {id:body.requestId,name,phone,treatment,message,status:'Novo',createdAt:new Date().toISOString(),consentAt:new Date().toISOString()};
      // The hash stores each submission atomically; retrying its id does not create duplicates.
      await db('HSETNX',PREFIX+'leads',lead.id,JSON.stringify(lead));
      return send(201,{ok:true,id:lead.id});
    }
    if (!(await session(req))) return send(401,{error:'Entre no painel para continuar.'});
    if (req.method === 'GET' && !action) {
      const values = await db('HVALS',PREFIX+'leads');
      return send(200,{leads:values.map(v=>JSON.parse(v)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});
    }
    if (req.method === 'PATCH' && !action) {
      if (!['Novo','Em contato','Agendado','Concluído'].includes(body.status)) return send(400,{error:'Status inválido.'});
      const raw = await db('HGET',PREFIX+'leads',String(body.id));
      if (!raw) return send(404,{error:'Contato não encontrado.'});
      await db('HSET',PREFIX+'leads',String(body.id),JSON.stringify({...JSON.parse(raw),status:body.status}));
      return send(200,{ok:true});
    }
    return send(404,{error:'Operação não encontrada.'});
  } catch (error) {
    return send(error instanceof SyntaxError?400:503,{error:error instanceof SyntaxError?'Dados inválidos.':'Não foi possível concluir agora. Tente novamente ou fale pelo WhatsApp.'});
  }
};
