# Dra. Luz Marina

Site em português para atendimento especializado em feridas e cicatrização em Brasília, com páginas estáticas de serviços e blog.

## Prévia local

Com Node.js instalado, execute na pasta do projeto:

```sh
node scripts/preview.mjs
```

Abra http://127.0.0.1:4181/ no navegador.

## Arquivos

- `dist/index.html`: conteúdo da página e depoimentos.
- `dist/style.css`: estilos e layout responsivo.
- `dist/app.js`: carrossel automático e interações da página inicial.
- `dist/dra-luz-marina.jpeg`: foto da profissional.
- `dist/<tema>/index.html`: páginas de atendimento; `dist/blog/`: artigos.
- `dist/sitemap.xml`, `dist/robots.txt`, `dist/llms.txt`: descoberta do conteúdo.
- `scripts/build-seo.mjs`: fonte e gerador das páginas de SEO.

O site é estático e não exige instalação de dependências. Ao editar os textos em `scripts/build-seo.mjs`, execute `node scripts/build-seo.mjs` e `node scripts/check-seo.mjs` antes de publicar. A pasta `dist` é o diretório de publicação.

## Publicar na Vercel

1. Na Vercel, escolha **Add New → Project** e importe `isaquelevts/draluz`.
2. Mantenha **Root Directory** na raiz do repositório (`./`).
3. O arquivo `vercel.json` configura o projeto como **Other**, sem instalação ou compilação, com saída em `dist`.
4. Clique em **Deploy**.

Se o projeto já estiver importado, confira a pasta raiz e faça um novo deploy da branch `main`. As variáveis de ambiente do painel de leads continuam necessárias; consulte a configuração existente na Vercel.

Referência: https://vercel.com/docs/project-configuration/vercel-json

## Agendamento

Os links de agendamento abrem diretamente o WhatsApp informado: +55 (61) 8175-7514. A modalidade e a disponibilidade são confirmadas pela equipe.

## Próximos passos fora do código

1. Conferir a exatidão dos dados profissionais e revisar clinicamente os artigos antes de campanhas de divulgação.
2. Enviar `https://www.draluzmarinacicatriza.com.br/sitemap.xml` ao Google Search Console e ao Bing Webmaster Tools.
3. Verificar indexação, consultas, cliques e páginas de destino no Search Console. Atualizar artigos conforme dúvidas reais dos pacientes.
4. Conferir os dados públicos do Perfil da Empresa no Google sem inventar endereço ou modalidade de atendimento.
