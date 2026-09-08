# Regras de Negócio - Ajuda MEI

Este documento descreve as principais regras de negócio da plataforma, definindo permissões, fluxos de status, ações de sistema e regras de segurança.

## 1. Papéis de Usuário (Roles)

O sistema possui quatro papéis bem definidos na tabela `user_roles`, utilizando o enum `app_role`:

- **MEI (Microempreendedor Individual)**: Papel padrão atribuído a todos os novos usuários ao se cadastrarem.
  - Pode abrir novos chamados (tickets).
  - Pode visualizar, comentar e adicionar anexos apenas nos SEUS próprios chamados.
  - Pode visualizar soluções públicas e setores.
  - Pode avaliar chamados que foram resolvidos.
  
- **Atendente**: Servidor público ou funcionário designado para responder aos MEIs.
  - Pode visualizar e responder a qualquer chamado em aberto.
  - Pode reatribuir chamados para si ou para outros setores.
  - Não pode acessar configurações administrativas.

- **Gestor**: Responsável pela supervisão de setores.
  - Possui os mesmos privilégios do Atendente.
  - Pode visualizar relatórios de Analytics e ferramentas de BI (`/staff/bi`, `/staff/analytics`).
  - Pode gerenciar o cadastro de Soluções e Setores.

- **Admin**: Administrador geral do sistema.
  - Acesso total a todos os recursos.
  - Único que pode gerenciar as permissões de outros usuários.
  - Acesso exclusivo aos Logs de Auditoria (`/staff/audit`).

## 2. Gestão de Chamados (Tickets)

### 2.1. Criação e Propriedade
- Quando um chamado é criado, um `protocolo` único é gerado automaticamente.
- O chamado fica atrelado ao `auth.uid()` do usuário criador (MEI).

### 2.2. Status do Ticket
Os chamados fluem por estados pré-determinados:
1. **Aberto**: Acabou de ser criado pelo MEI.
2. **Em Atendimento**: Um atendente assumiu o ticket ou respondeu a ele.
3. **Pendente Cliente**: O atendente solicitou mais informações ou documentos do MEI.
4. **Resolvido**: O atendente concluiu a requisição.
5. **Fechado / Encerrado**: O chamado foi arquivado (após a avaliação ou prazo expirado).

### 2.3. Escalonamento e SLA
- O sistema possui funções para detectar "chamados estagnados" (Stale Tickets).
- Através da procedure `escalate_stale_tickets()`, tickets que não recebem interação por um prazo definido têm seu status alterado para evitar atrasos no atendimento.

### 2.4. Avaliações (CSAT)
- Após a resolução de um ticket, o usuário MEI pode deixar uma nota e comentário (tabela `avaliacoes`).
- Um ticket só pode ser avaliado se pertencer ao usuário e já estiver com status de "Resolvido".

## 3. Segurança e Auditoria

- **Row Level Security (RLS)**: É estritamente proibido que o Frontend manipule dados de outros usuários se não houver permissão. As lógicas de checagem (`has_role`) são resolvidas no lado do Banco de Dados para evitar interceptações no client-side.
- **Audit Log**: Ações sensíveis (como deleção de registros, alterações em usuários ou configurações) geram registros na tabela `audit_log`, visível apenas para os perfis Admin.

## 4. Integrações de Documentos e OCR

- **Uso do OCR**: O sistema utiliza tecnologia de OCR (Leitura Óptica de Caracteres) via `tesseract.js` para pré-processar documentos enviados pelo MEI (ex: Certificado de Condição de Microempreendedor Individual).
- A leitura ajuda na triagem ou na extração automática de dados do documento para acelerar o tempo do atendente, no entanto, a validação legal dos dados continua dependendo de aprovação humana (Atendente).
