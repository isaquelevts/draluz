import fs from 'node:fs';
import path from 'node:path';

const dist=path.resolve('dist');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const filename=path.join(dir,entry.name);if(entry.isDirectory())walk(filename);else if(entry.name==='index.html')files.push(filename)}}
walk(dist);
const titles=new Set();
const errors=[];
const sitemap=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  const relative=path.relative(dist,file).replaceAll('\\','/');
  const slug=relative==='index.html'?'':relative.replace(/index\.html$/,'');
  const canonical=`https://www.draluzmarinacicatriza.com.br/${slug}`;
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  if(!title)errors.push(`${relative}: sem título`);
  if(titles.has(title))errors.push(`${relative}: título duplicado`);
  titles.add(title);
  if((html.match(/<h1\b/g)||[]).length!==1)errors.push(`${relative}: não possui exatamente um H1`);
  if(!html.includes(`rel="canonical" href="${canonical}"`))errors.push(`${relative}: canonical ausente ou incorreto`);
  if(!sitemap.includes(`<loc>${canonical}</loc>`))errors.push(`${relative}: ausente do sitemap`);
  if(!/<meta name="description" content="[^"]+">/.test(html))errors.push(`${relative}: sem descrição`);
  for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]+)(?:[?#][^"]*)?"/g)){
    const target=match[1];
    if(target.startsWith('/api/'))continue;
    const local=path.join(dist,target.slice(1));
    if(!fs.existsSync(local)&&!fs.existsSync(path.join(local,'index.html')))errors.push(`${relative}: link interno inexistente ${target}`);
  }
  for(const match of html.matchAll(/srcset="([^"]+)"/g)){
    for(const candidate of match[1].split(',')){
      const source=candidate.trim().split(/\s+/)[0];
      if(source.startsWith('/')&&!fs.existsSync(path.join(dist,source.slice(1))))errors.push(`${relative}: imagem responsiva inexistente ${source}`);
    }
  }
  for(const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
    try{JSON.parse(script[1])}catch{errors.push(`${relative}: JSON-LD inválido`)}
  }
}
const home=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const hero=home.indexOf('class="hero"'),testimonials=home.indexOf('class="content testimonials"'),treatments=home.indexOf('id="tratamentos"'),stats=home.indexOf('class="stats"');
if(!(hero>=0&&hero<testimonials&&testimonials<treatments&&treatments<stats))errors.push('Página inicial: depoimentos e tratamentos devem vir após a primeira seção, nessa ordem');
for(const name of ['robots.txt','sitemap.xml','llms.txt'])if(!fs.existsSync(path.join(dist,name)))errors.push(`${name} ausente`);
for(const name of ['obrigado.html','painel.html'])if(!fs.readFileSync(path.join(dist,name),'utf8').includes('name="robots" content="noindex'))errors.push(`${name}: noindex ausente`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`${files.length} páginas públicas verificadas; links, metadados, sitemap e noindex corretos.`);
