# Dra. Luz Marina

Landing page em português para atendimento especializado em feridas e cicatrização em Brasília.

## Prévia local

Com Python instalado, execute na pasta do projeto:

```sh
python -m http.server 4173 --directory dist
```

Abra http://localhost:4173 no navegador.

## Arquivos

- `dist/index.html`: conteúdo da página e depoimentos.
- `dist/style.css`: estilos e layout responsivo.
- `dist/app.js`: carrossel automático e interações.
- `dist/dra-luz-marina.jpeg`: foto da profissional.

O site é estático e não exige instalação de dependências ou compilação. Para hospedagem estática, use `dist` como diretório de publicação.

## Publicar na Vercel

1. Na Vercel, escolha **Add New → Project** e importe `isaquelevts/draluz`.
2. Mantenha **Root Directory** na raiz do repositório (`./`).
3. O arquivo `vercel.json` configura o projeto como **Other**, sem instalação ou compilação, com saída em `dist`.
4. Clique em **Deploy**.

Se o projeto já estiver importado, confira a pasta raiz e faça um novo deploy da branch `main`. Não são necessárias variáveis de ambiente.

Referência: https://vercel.com/docs/project-configuration/vercel-json

## Agendamento

Os links de agendamento em `dist/index.html` abrem diretamente o WhatsApp informado: +55 (61) 8175-7514. Atendimento domiciliar em Brasília–DF.
