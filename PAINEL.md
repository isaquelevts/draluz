# Painel de leads

O painel abre em `/painel`. Os contatos são armazenados em um banco Redis Upstash, acessado apenas pelas funções do servidor na Vercel. Nenhuma senha ou credencial do banco é enviada para o navegador.

## Ativação na Vercel

1. Conecte um banco **Upstash Redis** ao projeto `draluz` pelo Marketplace/Storage da Vercel.
2. Em Settings → Environment Variables, configure para Production:
   - `UPSTASH_REDIS_REST_URL`: endereço REST do banco.
   - `UPSTASH_REDIS_REST_TOKEN`: token REST de leitura e escrita.
   - `ADMIN_SETUP_TOKEN`: uma chave aleatória privada com pelo menos 32 caracteres, criada por você. Ela permite criar o primeiro administrador. Não coloque a chave no GitHub nem na URL.
3. Faça um novo deploy e abra `/painel`.
4. Informe a chave de configuração e escolha seu usuário e uma senha de pelo menos 12 caracteres. Só é permitida a criação de um administrador.
5. Depois, remova `ADMIN_SETUP_TOKEN` das variáveis da Vercel e faça outro deploy. Os próximos acessos usam somente usuário e senha.

Não envie senhas ou tokens pela conversa. Configure-os diretamente na Vercel e no formulário protegido por HTTPS.

## Funcionamento

- O formulário salva nome, telefone, tratamento, mensagem e data de consentimento antes de abrir `/obrigado`.
- Falhas mantêm o formulário preenchido e mostram uma alternativa de contato pelo WhatsApp.
- Os dados não são colocados na URL nem enviados ao Google tag pelo código do painel.
- Senhas são derivadas com scrypt; sessões ficam no servidor, com cookie HttpOnly, Secure e duração de 8 horas.
- Busca e filtros exibem contatos do mais recente ao mais antigo. Status: Novo, Em contato, Agendado e Concluído.
- Reenvios da mesma tentativa não duplicam o contato. O formulário e o login possuem limites de tentativas.
- O banco não usa expiração automática para os leads. Defina com a clínica uma rotina de retenção e exclusão conforme suas necessidades.

Antes de considerar a captação ativa, envie um contato de teste com dados fictícios pelo site e confira sua chegada no painel. Sem as variáveis do banco, o envio retorna erro e não mostra uma confirmação falsa.
