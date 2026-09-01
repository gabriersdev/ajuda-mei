# Notas da migração

O projeto foi limpo para usar apenas integrações e plugins oficiais, sem configuração, telemetria ou gateway proprietário da plataforma de origem.

## Alterações principais

- Build migrado para plugins oficiais do Vite, TanStack Start, Nitro, Tailwind e TypeScript paths.
- Metadados específicos da plataforma removidos.
- Relatório de erros substituído por logger local.
- URLs de preview removidas da documentação e dos testes.
- IA alterada para API Gemini direta e opcional.
- Quando a chave de IA não está configurada, o classificador usa regras locais e a busca semântica cai para busca textual.

## Por que o projeto não foi convertido integralmente para HTML/CSS/JavaScript de navegador

A aplicação atual possui SSR, autenticação, rotas protegidas e dezenas de funções executadas somente no servidor, inclusive operações administrativas no Supabase. Converter tudo automaticamente para JavaScript executado no navegador exporia credenciais administrativas ou removeria funcionalidades.

O frontend pode ser migrado para JavaScript puro em uma segunda etapa, mas o backend seguro ainda precisa existir no servidor. Nesta versão, foi priorizada a remoção completa das dependências proprietárias mantendo o comportamento da aplicação.

## Execução

```bash
npm install
npm run dev
```

Produção:

```bash
npm run build
npm start
```

Consulte `.env.example` para as variáveis necessárias.
