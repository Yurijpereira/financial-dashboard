# AGENTS.md

## Project overview

Este projeto é um dashboard financeiro B2B construído com:

- Nuxt
- Vue 3
- TypeScript strict
- Pinia com persistência localStorage
- TanStack Query com SSR hydration
- PrimeVue
- Tailwind CSS
- ECharts client-only
- validação com Zod nos endpoints
- exportação client-side de Excel/PDF

## Objetivo das mudanças

Toda alteração deve priorizar:

- confiabilidade
- aderência ao padrão do projeto
- SSR seguro
- zero erros de TypeScript
- boa experiência de uso
- código de fácil manutenção

## Regras do projeto

- Não quebrar SSR/hydration.
- Não introduzir acesso a browser APIs fora de contexto client-only.
- Componentes de gráfico devem continuar seguros para SSR.
- Preferir mudanças incrementais.
- Não mockar comportamento novo sem necessidade; integrar com a estrutura real existente.
- Não duplicar lógica se já existir util/composable/store adequado.

## Padrões técnicos

- Sempre usar TypeScript corretamente, sem `any` desnecessário.
- Preferir tipos explícitos e funções pequenas.
- Reaproveitar composables/stores/utils já existentes.
- Preservar contratos entre frontend e server routes.
- Validar payloads e respostas com o padrão já usado no projeto.
- Ao tocar em gráficos, considerar extração/reuso em composables quando fizer sentido.
- Ao tocar em fetch de dados, respeitar padrões do TanStack Query e SSR hydration do projeto.

## Estrutura esperada

Observe primeiro estas áreas antes de implementar:

- `components/`
- `composables/`
- `stores/`
- `types/`
- `utils/`
- `server/api/`
- `pages/`
- `modules/` se existir contexto de domínio
- componentes de gráficos e filtros já existentes

## UX/UI

- Manter consistência visual com PrimeVue + Tailwind.
- Evitar layout quebrado em mobile.
- Preservar loading, empty state e error state.
- Ao seguir protótipo/Figma, aplicar o layout novo sem alterar a lógica já suportada, salvo pedido explícito.

## Quando receber uma issue/tarefa

Sempre seguir esta ordem:

1. entender contexto e arquivos relacionados
2. localizar padrão existente semelhante
3. propor plano curto
4. implementar com a menor mudança segura
5. validar types, lint e testes relevantes
6. revisar risco de regressão
7. resumir alterações e como testar

## Definition of done

Uma tarefa só está concluída quando:

- o requisito foi atendido
- não foram introduzidos erros de TypeScript
- lint relevante não foi quebrado
- testes relevantes foram atualizados/criados quando necessário
- a solução segue o padrão do projeto
- o impacto sistêmico foi minimizado

## O que evitar

- refactor amplo sem necessidade
- dependência nova sem justificativa
- alterar múltiplos padrões de uma vez
- misturar mudanças estruturais com mudanças de regra de negócio sem necessidade
- corrigir apenas o sintoma quando a causa raiz é identificável

## Formato de resposta final esperado

Ao concluir uma tarefa, responder com:

- Resumo
- Arquivos alterados
- Decisões técnicas
- Riscos/atenções
- Como testar
