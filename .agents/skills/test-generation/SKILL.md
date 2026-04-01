---
name: test-generation
description: Use esta skill quando a tarefa exigir criação ou atualização de testes unitários, de integração ou E2E, especialmente após mudanças de comportamento, bugfix ou refactor.
---

# Objetivo

Garantir cobertura útil e confiável, focada no comportamento relevante.

# Diretrizes

- Testar comportamento, não implementação interna desnecessária.
- Cobrir fluxo principal, edge cases relevantes e regressões prováveis.
- Manter testes legíveis e determinísticos.
- Não criar mocks excessivos se houver padrão melhor já usado no projeto.

# Para componentes front-end

- Validar renderização condicional
- Interações do usuário
- Emissão de eventos
- Reações a props/estado
- Casos de erro/loading quando relevantes

# Para resposta final

- O que foi testado
- O que ficou fora e por quê
- Como executar os testes
