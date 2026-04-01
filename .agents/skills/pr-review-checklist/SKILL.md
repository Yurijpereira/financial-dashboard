---
name: pr-review-checklist
description: Use esta skill quando a tarefa for revisar diff, revisar PR, validar qualidade de implementação, checar risco de regressão ou apontar melhorias antes de merge.
---

# Objetivo

Executar uma revisão técnica objetiva, rigorosa e útil.

# Checklist

## Correção funcional

- Resolve o requisito real?
- Existe gap entre requisito e implementação?
- Há edge cases ignorados?

## Arquitetura

- A solução segue os padrões já existentes?
- Há duplicação evitável?
- O acoplamento aumentou sem necessidade?

## Qualidade

- Nomes estão claros?
- Tipos estão corretos?
- Existe lógica confusa ou frágil?
- Há risco de regressão?

## Front-end

- Estados de loading, erro e vazio foram considerados?
- Há risco de hidratação/SSR?
- O layout permanece consistente e responsivo?

## Testes

- Precisava atualizar testes?
- Os cenários mais críticos estão cobertos?
- Há comportamento novo sem validação?

# Saída esperada

- Problemas críticos
- Problemas importantes
- Melhorias opcionais
- Veredito final
