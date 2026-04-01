---
name: bugfix-workflow
description: Use esta skill quando a tarefa for corrigir bug, comportamento inconsistente, regressão, warning, erro de interface, problema de permissão, tipagem ou fluxo quebrado.
---

# Objetivo

Corrigir bugs pela causa raiz, não apenas mascarar sintomas.

# Fluxo obrigatório

1. Reproduzir mentalmente ou pelo código o bug relatado.
2. Identificar causa raiz.
3. Confirmar arquivos e fluxos impactados.
4. Corrigir com a menor mudança segura possível.
5. Validar se a correção não quebra casos próximos.
6. Descrever claramente causa, correção e teste.

# Perguntas que devem ser respondidas internamente

- Qual é o comportamento atual?
- Qual é o comportamento esperado?
- Onde a regra se perde?
- O bug é de UI, estado, contrato, permissão, tipagem ou sincronização?
- Há risco de regressão em fluxos semelhantes?

# Regras

- Não aplicar patch visual quando o problema é estrutural.
- Não duplicar lógica para “forçar” funcionamento.
- Não ignorar warnings relevantes.
- Sempre considerar loading, empty, erro e edge cases.

# Formato da resposta final

- Causa raiz
- Correção aplicada
- Arquivos alterados
- Riscos
- Como validar
