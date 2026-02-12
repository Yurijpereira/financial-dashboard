# Correções de Hidratação SSR/Cliente

## Problemas Identificados e Corrigidos

### 1. **Composables com acesso a localStorage/window no servidor**
- **Problema**: `useFilters`, `useSavedViews`, `useFiltersUrlSync` estavam acessando `localStorage` e `window` no servidor
- **Solução**: Adicionados guards `process.client` em todos os lugares que acessam APIs do navegador

### 2. **Watchers causando loops infinitos**
- **Problema**: Múltiplos watchers sendo criados e causando loops de atualização
- **Solução**: 
  - Adicionado flag `watcherActive` em `useFilters` para garantir watcher único
  - Adicionado `flush: 'post'` nos watchers para executar após a atualização do DOM
  - Adicionado debounce de 500ms no `watchFiltersForUrlSync`

### 3. **Objetos Date criando diferenças servidor/cliente**
- **Problema**: Uso de `new Date()` e timezone causando diferenças entre servidor e cliente
- **Solução**: 
  - Formatação manual de datas usando string manipulation
  - Uso de guards `isClient` antes de usar `Intl.DateTimeFormat`
  - Adicionado `ClientOnly` wrapper no Calendar component

### 4. **Router sendo usado no servidor**
- **Problema**: `useRouter()` e `useRoute()` sendo chamados no servidor em `useFiltersUrlSync`
- **Solução**: Movido inicialização para dentro do guard `process.client`

### 5. **PrimeVue Calendar com problemas de hidratação**
- **Problema**: Calendar component renderizando diferente no servidor vs cliente
- **Solução**: 
  - Envolvido em `<ClientOnly>` com fallback de loading
  - Adicionado flag `isClient` para controlar renderização

### 6. **Vue Query refetch loops**
- **Problema**: Configurações de refetch causando loops infinitos
- **Solução**: 
  - Aumentado `staleTime` para 5 minutos
  - Desabilitado `refetchOnWindowFocus`, `refetchOnMount`, `refetchOnReconnect`
  - Movido hydrate para hook `app:mounted` em vez de imediato
  - Adicionado `getCachedData` no `useFinancialSummaryQuery` para evitar refetches desnecessários

### 7. **Intl formatters causando divergências**
- **Problema**: `Intl.NumberFormat` e `Intl.DateTimeFormat` podem ter resultados diferentes servidor/cliente
- **Solução**: Adicionado guard `isClient` antes de usar qualquer Intl formatter em todos os componentes

### 8. **Nuxt Config**
- **Problema**: Configurações padrão não otimizadas para hidratação
- **Solução**: 
  - Adicionado `experimental.payloadExtraction: false`
  - Adicionado `features.inlineStyles: false`

## Arquivos Modificados

### Composables
- ✅ `composables/useFilters.ts` - Guards para localStorage, watcher único
- ✅ `composables/useFiltersUrlSync.ts` - Guards para router/route
- ✅ `composables/useSavedViews.ts` - Guards para localStorage
- ✅ `composables/useFinancialSummaryQuery.ts` - Melhorado fetch com cache
- ➕ `composables/useClientOnly.ts` - Novo composable helper

### Components
- ✅ `components/filters/DateRangePicker.vue` - ClientOnly wrapper, guards para Date
- ✅ `components/filters/FilterBar.vue` - isClient guard, debounce
- ✅ `components/filters/ComparisonToggle.vue` - Formatação manual de datas
- ✅ `components/filters/SavedViewsManager.vue` - Guard para Intl.DateTimeFormat
- ✅ `components/dashboard/ConversionMetrics.vue` - Guards para toLocaleString
- ✅ `components/dashboard/SalesChart.client.vue` - Guards para Intl e window
- ✅ `components/dashboard/TopCustomersChart.client.vue` - Guards para Intl e window
- ✅ `components/dashboard/MonthlyComparisonChart.client.vue` - Guards para Intl e window

### Pages
- ✅ `pages/index.vue` - Guards para Intl formatters

### Plugins
- ✅ `plugins/vue-query.ts` - Melhorado hidratação e aumentado staleTime
- ➕ `plugins/hydration.client.ts` - Novo plugin para melhorar hidratação

### Config
- ✅ `nuxt.config.ts` - Adicionadas configurações otimizadas

## Como Testar

1. **Limpe o cache e node_modules**:
   ```bash
   rm -rf .nuxt node_modules/.cache
   ```

2. **Reinicie o servidor de desenvolvimento**:
   ```bash
   pnpm dev
   ```

3. **Teste em modo SSR**:
   ```bash
   pnpm build
   pnpm preview
   ```

4. **Verifique no console do navegador**:
   - Não deve haver warnings de hydration mismatch
   - Não deve haver loops de refetch
   - O app deve carregar suavemente

## Best Practices Aplicadas

1. ✅ Sempre usar `process.client` para código que acessa APIs do navegador
2. ✅ Usar `onMounted` para inicializar estado que depende do cliente
3. ✅ Evitar `new Date()` no código que roda no servidor
4. ✅ Usar `ClientOnly` para componentes que não podem ser renderizados no servidor
5. ✅ Adicionar debounce em watchers que fazem operações custosas
6. ✅ Configurar queries com `staleTime` apropriado para evitar refetches excessivos
7. ✅ Usar `flush: 'post'` em watchers para evitar loops
8. ✅ Guards para todos os formatters (`Intl.NumberFormat`, `Intl.DateTimeFormat`, etc.)

## Próximos Passos Recomendados

1. Monitorar o console em produção para verificar se ainda há algum warning
2. Considerar adicionar testes E2E para verificar a hidratação
3. Adicionar monitoring para detectar loops de refetch em produção
4. Considerar usar `@vueuse/core` para helpers de client detection mais robustos

## Suporte Adicional

Se ainda houver problemas:
1. Verifique o console do navegador para erros específicos
2. Use o Vue DevTools para inspecionar o estado dos componentes
3. Verifique a aba Network para ver se há múltiplas requisições duplicadas
4. Teste com cache do navegador limpo (`Ctrl+Shift+R` ou `Cmd+Shift+R`)
