# Arquitetura do Projeto Ajuda MEI

Este documento descreve a arquitetura técnica da plataforma Ajuda MEI. O sistema foi desenhado para ser rápido, escalável e de fácil manutenção, aproveitando o máximo do ecossistema serverless/BaaS e das novidades do React.

## Visão Geral

A aplicação segue uma arquitetura Cliente-Servidor onde o cliente (Frontend) é um Single Page Application (SPA) rico em funcionalidades e interatividade, conectando-se diretamente a um Backend as a Service (BaaS) fornecido pelo Supabase.

### 1. Frontend (Client-Side)
- **Framework**: React 19, utilizando os novos recursos da biblioteca.
- **Roteamento**: TanStack Router. Proporciona rotas tipadas, baseadas no sistema de arquivos (`src/routes`), garantindo segurança de tipos (Type-Safety) na navegação e nos parâmetros.
- **Gerenciamento de Estado/Cache**: TanStack Query (React Query) é indiretamente utilizado ou conceitos similares para chamadas assíncronas (como buscas no Supabase), além do roteador gerenciar o estado da aplicação em muitos casos.
- **Estilização**: Tailwind CSS v4 acoplado aos componentes de acessibilidade do Radix UI (base do `shadcn/ui`).
- **Validação de Dados**: Formulários são controlados com `react-hook-form` e a validação esquemática com `zod`.
- **Análise de Imagem (OCR)**: O projeto utiliza `tesseract.js` no client-side/server-side para extrair textos de documentos submetidos pelos usuários (ex: extrair CNPJ de um certificado MEI).

### 2. Backend & Banco de Dados (Supabase)
Toda a infraestrutura de backend é terceirizada para o Supabase, que fornece:
- **Banco de Dados**: PostgreSQL com esquemas definidos via Migrations (`supabase/migrations/`).
- **Autenticação**: Supabase Auth gerencia sessões, senhas, login social e e-mails de recuperação.
- **Segurança (Row Level Security - RLS)**: O controle de acesso e autorização é feito diretamente no banco de dados. Políticas de RLS garantem que um usuário MEI só possa ler/editar seus próprios chamados, enquanto usuários com perfil Staff (atendente, gestor) possuam acessos ampliados através da verificação de roles na tabela `user_roles`.
- **Funções (Edge Functions / RPCs)**: Procedimentos armazenados no banco de dados (ex: `has_role`, `escalate_stale_tickets`) executam lógica de negócio complexa de forma segura e atômica.
- **Realtime**: Assinatura em canais do PostgreSQL para atualização de tickets e mensagens de chat em tempo real.
- **Storage**: Armazenamento de arquivos anexados (documentos, comprovantes).

## Fluxo de Dados e Segurança

1. **Autenticação**: O usuário loga no frontend. O Supabase Auth emite um JWT.
2. **Requisições**: O frontend faz requisições diretas ao banco de dados PostgreSQL usando o `@supabase/supabase-js`.
3. **RLS (Políticas)**: O PostgreSQL avalia o JWT do usuário ativo contra as políticas da tabela.
   - *Exemplo*: `CREATE POLICY "users view own tickets" ON tickets FOR SELECT USING (auth.uid() = created_by)`.
4. **Respostas**: Os dados são retornados, cacheados e a UI é atualizada de forma reativa.

## Organização de Pastas do Frontend

- `/src/routes`: Define a árvore de rotas da aplicação.
  - `__root.tsx`: Layout raiz.
  - `/api`: Rotas de servidor/API, caso sejam expostas pelo TanStack Start ou Vite Server.
  - `/_authenticated`: Layout para rotas protegidas (exige que o usuário esteja logado).
    - `/staff.*`: Telas exclusivas para administradores e atendentes (dashboard, BI, auditoria).
- `/src/components`: Componentes UI modulares (botões, inputs, modais).
- `/src/hooks`: Lógicas reaproveitáveis atreladas ao ciclo de vida do React.
- `/src/lib`: Bibliotecas auxiliares, configuração de instâncias (Supabase client), funções de analytics.

## Deploy e Build

O build da aplicação é orquestrado pelo **Vite**. A compilação resulta em arquivos estáticos otimizados que podem ser hospedados em qualquer CDN ou provedor de hospedagem estática (Vercel, Netlify, Cloudflare Pages), enquanto o backend permanece no Supabase. O empacotador já utiliza configurações para lidar com bibliotecas pesadas como o `tesseract.js`.
