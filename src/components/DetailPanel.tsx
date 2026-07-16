import { useMemo } from "react";

import { useFilters } from "@/contexts/FilterContext";
import { useInsightPanelConfig, type InsightDimension } from "@/contexts/InsightPanelContext";

type ActiveInsight = {
  key: string;
  dimension: InsightDimension;
  label: string;
  total: number;
  percentage: number;
  avgDuration?: string;
  interpretiveText: string;
};

const DIMENSION_LABELS: Record<InsightDimension, string> = {
  month: "Mes",
  province: "Provincia",
  canton: "Cantón",
  cause: "Causa",
  duration: "Duración",
  age: "Edad",
  education: "Educación",
  ethnicity: "Etnia",
  children: "Hijos",
};

function formatNumber(value: number) {
  return value.toLocaleString("es-EC");
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function DetailPanel() {
  const config = useInsightPanelConfig();
  const {
    filteredData,
    selectedProvince,
    selectedCanton,
    selectedMonth,
    selectedCause,
    selectedDuration,
    selectedAge,
    selectedEdu,
    selectedEthnicity,
    selectedChildren,
    selectedSexFocus,
  } = useFilters();

  const activeInsight = useMemo<ActiveInsight | null>(() => {
    if (!config || !filteredData) return null;

    const getSexedTotal = (mapH: Record<string, number>, mapM: Record<string, number>, key: string) => {
      const male = mapH[key] ?? 0;
      const female = mapM[key] ?? 0;
      if (selectedSexFocus === "hombres") return male;
      if (selectedSexFocus === "mujeres") return female;
      return male + female;
    };

    const candidates: Array<{ dimension: InsightDimension; key: string | null; total: number }> = [
      { dimension: "month", key: selectedMonth, total: selectedMonth ? filteredData.mes[selectedMonth] ?? 0 : 0 },
      { dimension: "canton", key: selectedCanton, total: selectedCanton ? filteredData.canton[selectedCanton] ?? 0 : 0 },
      { dimension: "province", key: selectedProvince, total: selectedProvince ? filteredData.provincia[selectedProvince] ?? 0 : 0 },
      { dimension: "cause", key: selectedCause, total: selectedCause ? filteredData.causa[selectedCause] ?? 0 : 0 },
      { dimension: "duration", key: selectedDuration, total: selectedDuration ? filteredData.duracion[selectedDuration] ?? 0 : 0 },
      { dimension: "age", key: selectedAge, total: selectedAge ? getSexedTotal(filteredData.edad_h, filteredData.edad_m, selectedAge) : 0 },
      { dimension: "education", key: selectedEdu, total: selectedEdu ? getSexedTotal(filteredData.nivel_h, filteredData.nivel_m, selectedEdu) : 0 },
      { dimension: "ethnicity", key: selectedEthnicity, total: selectedEthnicity ? filteredData.etnia[selectedEthnicity] ?? 0 : 0 },
      { dimension: "children", key: selectedChildren, total: selectedChildren ? filteredData.hijos[selectedChildren] ?? 0 : 0 },
    ];

    const active = config.priority
      .map((dimension) => candidates.find((candidate) => candidate.dimension === dimension && candidate.key))
      .find((candidate): candidate is { dimension: InsightDimension; key: string; total: number } => Boolean(candidate));

    if (!active) return null;

    const detail = config.details[active.key];
    const total = active.total;
    const percentage = filteredData.total > 0 ? (total / filteredData.total) * 100 : 0;

    return {
      key: active.key,
      dimension: active.dimension,
      label: detail?.label ?? active.key,
      total,
      percentage,
      avgDuration: detail?.avgDuration,
      interpretiveText: detail?.interpretiveText ?? config.overviewText,
    };
  }, [
    config,
    filteredData,
    selectedAge,
    selectedCause,
    selectedCanton,
    selectedChildren,
    selectedDuration,
    selectedEdu,
    selectedEthnicity,
    selectedMonth,
    selectedProvince,
    selectedSexFocus,
  ]);

  if (!config || !filteredData) {
    return null;
  }

  return (
    <aside className="rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur xl:sticky xl:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Detalle activo</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Ficha interpretativa</h2>
        </div>
        <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {activeInsight ? DIMENSION_LABELS[activeInsight.dimension] : "General"}
        </span>
      </div>

      {activeInsight ? (
        <div className="mt-5 space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Elemento</div>
            <div className="mt-1 text-xl font-semibold text-foreground leading-tight">{activeInsight.label}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background/70 p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{formatNumber(activeInsight.total)}</div>
            </div>
            <div className="rounded-xl border border-border bg-background/70 p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">%</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{formatPercent(activeInsight.percentage)}</div>
            </div>
          </div>

          {activeInsight.avgDuration && (
            <div className="rounded-xl border border-border bg-background/70 p-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Duración promedio</div>
              <div className="mt-1 text-base font-semibold text-foreground">{activeInsight.avgDuration}</div>
            </div>
          )}

          <p className="rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-foreground">
            {activeInsight.interpretiveText}
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Vista general</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">{formatNumber(filteredData.total)} casos</div>
            <div className="mt-1 text-sm text-muted-foreground">100% del universo filtrado</div>
          </div>
          <p className="rounded-xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
            {config.overviewText}
          </p>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Haz clic en cualquier barra, provincia o categoría para actualizar esta ficha.
      </p>
    </aside>
  );
}