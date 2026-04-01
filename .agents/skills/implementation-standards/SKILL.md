---
name: implementation-standards
description: Use esta skill quando a tarefa pedir implementação de feature, ajuste estrutural, refactor pequeno ou alinhamento com padrão do projeto. Não use para perguntas conceituais simples.
---

# Objetivo

Executar implementações com qualidade sênior, baixo impacto sistêmico e alta aderência ao padrão existente no projeto.

# Fluxo obrigatório

1. Entender o objetivo funcional e técnico.
2. Localizar arquivos e padrões já existentes relacionados.
3. Identificar a menor mudança segura que resolve o problema.
4. Implementar mantendo consistência arquitetural e visual.
5. Validar tipagem, efeitos colaterais e regressões óbvias.
6. Resumir o que mudou e como testar.

# Regras

- Não introduzir novo padrão se já existir um padrão consolidado no projeto.
- Não criar dependências novas sem necessidade real.
- Não usar `any` desnecessariamente.
- Não fazer refactor amplo sem pedido explícito.
- Preservar compatibilidade com SSR/hydration quando aplicável.
- Preferir nomes descritivos para símbolos.
- Manter código legível e fácil de revisar.

# Checklist de saída

- Requisito atendido
- Código consistente com o projeto
- Tipagem preservada
- Mudança minimizada
- Como testar descrito claramente
