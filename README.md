# Ajuda MEI (Sala do Empreendedor)

Bem-vindo ao repositório do **Ajuda MEI**, a plataforma oficial de atendimento digital e inteligente da Sala do Empreendedor focada no Microempreendedor Individual (MEI).

## Visão Geral

O sistema tem como objetivo principal simplificar e digitalizar o atendimento ao MEI, permitindo que os empreendedores tirem dúvidas, encontrem soluções para problemas comuns (como pagamento de DAS, Declaração Anual, emissão de Notas Fiscais) e, caso necessário, abram chamados (tickets) para atendimento humano. O sistema oferece:

- **Busca inteligente e Chat 24h**: Soluções imediatas baseadas em uma base de conhecimento (soluções).
- **Protocolo digital**: Acompanhamento de chamados pelo número do protocolo.
- **Painel Administrativo (Staff)**: Gestão de chamados, setores, soluções, análise de dados (BI), logs de auditoria e gestão de documentos para os servidores públicos/atendentes.

## Principais Funcionalidades

- **Autenticação**: Baseada em Supabase Auth, separando usuários comuns (MEI) e equipe interna (Atendente, Gestor, Admin).
- **Gestão de Tickets**: Fluxo completo de criação, resposta, delegação, escalonamento e avaliação de chamados.
- **Base de Conhecimento**: Cadastro de soluções (passo a passo) para autoatendimento.
- **Setores Parceiros**: Organização do atendimento em diferentes áreas (ex: Tributário, Vigilância Sanitária).
- **OCR Integrado**: Leitura de documentos do MEI automaticamente utilizando Tesseract.js.
- **Dashboard e Analytics**: Relatórios visuais e indicadores de desempenho do atendimento.

## Stack Tecnológica

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema JavaScript/TypeScript:

- **Frontend**: React 19
- **Roteamento**: TanStack Router (com suporte a rotas baseadas em arquivos)
- **Estilização**: Tailwind CSS v4 + Radix UI (shadcn/ui)
- **Forms & Validação**: React Hook Form + Zod
- **Backend & Database**: Supabase (PostgreSQL, Realtime, Storage, Auth)
- **Gráficos**: Recharts
- **Build & Dev**: Vite

## Como Rodar Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env` e preencha as variáveis do Supabase.
4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor local.
- `npm run build`: Gera a build de produção.
- `npm run lint`: Executa a verificação do ESLint.
- `npm run format`: Formata o código com Prettier.

## Estrutura de Pastas

- `src/routes/`: Contém todas as páginas do sistema, divididas entre áreas públicas e a área `_authenticated/` (área logada).
- `src/components/`: Componentes reutilizáveis (UI, layouts).
- `src/lib/`: Funções utilitárias e configurações.
- `src/hooks/`: Hooks customizados do React.
- `supabase/migrations/`: Scripts SQL para criação das tabelas, funções, triggers e políticas de segurança (RLS).
