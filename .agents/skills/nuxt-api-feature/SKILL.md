---
name: nuxt-api-feature
description: Use esta skill quando a tarefa envolver server routes do Nuxt, integração de endpoints, validação com Zod, uso de Prisma, autenticação, multi-tenant ou sincronização entre front e back no projeto.
---

# Objetivo

Implementar ou ajustar endpoints e integrações preservando segurança, contratos e consistência de domínio.

# Fluxo

1. Entender contrato de entrada e saída.
2. Verificar autenticação, autorização e escopo tenant.
3. Validar dados com o padrão existente.
4. Preservar compatibilidade com consumidores atuais.
5. Confirmar tratamento de erro e shape de resposta.

# Regras

- Nunca ignorar escopo tenant.
- Nunca retornar dados sem filtragem correta por contexto.
- Sempre manter a tipagem alinhada entre server e client.
- Evitar lógica duplicada entre endpoints.
