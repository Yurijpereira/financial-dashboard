---
name: dashboard-chart-refactor
description: Use esta skill quando a tarefa envolver dashboards, gráficos, filtros, KPIs, comparativos, ECharts, cards analíticos ou reorganização visual/estrutural em telas de indicadores.
---

# Objetivo

Evoluir dashboards com segurança, consistência visual e respeito às regras de filtro e período.

# Regras

- Preservar coerência entre filtro aplicado, legenda exibida e dados renderizados.
- Validar comportamento de período, acumulado e comparação.
- Não duplicar lógica de gráfico se puder extrair composable/util.
- Considerar SSR/client-only em gráficos.
- Garantir estados vazios, loading e erro.

# Checklist

- Labels coerentes com o filtro
- Séries e métricas consistentes
- Responsividade
- Nenhuma quebra visual evidente
- Tipagem preservada
