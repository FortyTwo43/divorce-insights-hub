import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import { useFilters } from "@/contexts/FilterContext";
import { type InsightPanelConfig, useSetInsightPanelConfig } from "@/contexts/InsightPanelContext";
import { HeroBadge } from "@/components/HeroBadge";
import { LegalGlossary } from "@/components/LegalGlossary";
import { ContextNote } from "@/components/ContextNote";

/* ─── SVG Icons ─── */
function IconScale({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.258a33.186 33.186 0 016.668.83.75.75 0 01-.336 1.461 31.28 31.28 0 00-1.103-.232l1.702 7.545a.75.75 0 01-.387.832A4.981 4.981 0 0115 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 01-.387-.832l1.77-7.849a31.743 31.743 0 00-3.339-.254V15h2.25a.75.75 0 010 1.5h-6a.75.75 0 010-1.5H9.25V4.509a31.742 31.742 0 00-3.34.254l1.771 7.85a.75.75 0 01-.387.831A4.98 4.98 0 015 14a4.98 4.98 0 01-2.294-.556.75.75 0 01-.387-.832L4.02 5.067c-.37.07-.738.148-1.103.232A.75.75 0 012.25 3.84a33.19 33.19 0 016.668-.831V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
    </svg>
  );
}
function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
    </svg>
  );
}

export const Route = createFileRoute("/causas")({
  head: () => ({ meta: [{ title: "Causas y duración · Divorcios Ecuador 2020" }] }),
  component: Causas,
});

const CAUSA_CORTA: Record<string, string> = {
  "Por mutuo consentimiento vía judicial": "Mutuo acuerdo (judicial)",
  "Por mutuo consentimiento vía notarial": "Mutuo acuerdo (notarial)",
  "El abandono injustificado de cualquiera de los cónyuges por más de seis meses ininterrumpidos": "Abandono injustificado",
  "El estado habitual de falta de armonía de las dos voluntades en la vida matrimonial": "Falta de armonía",
  "Los tratos crueles o violencia contra la mujer o miembros del núcleo familiar": "Violencia intrafamiliar",
  "Las Amenazas graves de un cónyuge contra la vida del otro": "Amenazas graves",
  "La condena ejecutoriada a pena privativa de la libertad mayor a diez años": "Condena penal >10 años",
  "El adulterio de uno de los cónyuges": "Adulterio",
  "La tentativa de uno de los cónyuges contra la vida del otro": "Tentativa contra la vida",
  "Los actos ejecutados por uno de los cónyuges con el fin de involucrar al otro o a los hijos en actividades ilícitas": "Actividades ilícitas",
  "El que uno de los cónyuges sea ebrio consuetudinario o toxicómano": "Alcoholismo / drogas",
  "Sin Información": "Sin información",
};

const DUR_ORDER = ["<1", "1-5", "6-10", "11-20", "21-30", "30+"];
const DUR_LABELS: Record<string, string> = {
  "<1": "Menos de 1 año",
  "1-5": "1 a 5 años",
  "6-10": "6 a 10 años",
  "11-20": "11 a 20 años",
  "21-30": "21 a 30 años",
  "30+": "Más de 30 años",
};

// Datos reales de duración promedio por causal
const DUR_PROMEDIO: Array<{ clave: string; causa: string; duracion: string; anios: number }> = [
  { clave: "Por mutuo consentimiento vía notarial", causa: "Mutuo acuerdo notarial", duracion: "15,4 años", anios: 15.4 },
  { clave: "Por mutuo consentimiento vía judicial", causa: "Mutuo acuerdo judicial", duracion: "13,6 años", anios: 13.6 },
  { clave: "El abandono injustificado de cualquiera de los cónyuges por más de seis meses ininterrumpidos", causa: "Abandono injustificado", duracion: "16,6 años", anios: 16.6 },
  { clave: "El estado habitual de falta de armonía de las dos voluntades en la vida matrimonial", causa: "Falta de armonía", duracion: "14,4 años", anios: 14.4 },
  { clave: "Los tratos crueles o violencia contra la mujer o miembros del núcleo familiar", causa: "Violencia intrafamiliar", duracion: "15,0 años", anios: 15.0 },
  { clave: "Las Amenazas graves de un cónyuge contra la vida del otro", causa: "Amenazas graves", duracion: "16,0 años", anios: 16.0 },
  { clave: "La condena ejecutoriada a pena privativa de la libertad mayor a diez años", causa: "Condena penal >10 años", duracion: "18,6 años", anios: 18.6 },
  { clave: "El adulterio de uno de los cónyuges", causa: "Adulterio", duracion: "14,3 años", anios: 14.3 },
  { clave: "El que uno de los cónyuges sea ebrio consuetudinario o toxicómano", causa: "Alcoholismo / drogas", duracion: "16,6 años", anios: 16.6 },
  { clave: "Los actos ejecutados por uno de los cónyuges con el fin de involucrar al otro o a los hijos en actividades ilícitas", causa: "Actividades ilícitas", duracion: "29,0 años", anios: 29.0 },
];

const MAX_DUR = Math.max(...DUR_PROMEDIO.map((r) => r.anios));

const CAUSE_INSIGHTS = {
  priority: ["cause", "duration"] as const,
  overviewText:
    "Más del 71% de los divorcios de 2020 fueron por mutuo consentimiento, lo que sugiere que la mayoría de separaciones se resolvieron de forma acordada, incluso durante la pandemia.",
  details: {
    "Por mutuo consentimiento vía judicial": {
      label: "Mutuo consentimiento vía judicial",
      interpretiveText:
        "Divorcio acordado por ambos cónyuges, tramitado ante un juez cuando hay hijos menores de edad o bienes en disputa.",
      avgDuration: "13,6 años",
    },
    "Por mutuo consentimiento vía notarial": {
      label: "Mutuo consentimiento vía notarial",
      interpretiveText:
        "Divorcio acordado por ambos cónyuges, sin hijos menores de edad, tramitado directamente en una notaría.",
      avgDuration: "15,4 años",
    },
    "El abandono injustificado de cualquiera de los cónyuges por más de seis meses ininterrumpidos": {
      label: "Abandono injustificado",
      interpretiveText:
        "Causal unilateral: uno de los cónyuges demanda porque el otro abandonó el hogar sin justificación por más de seis meses seguidos.",
      avgDuration: "16,6 años",
    },
    "El estado habitual de falta de armonía de las dos voluntades en la vida matrimonial": {
      label: "Falta de armonía",
      interpretiveText:
        "Causal por incompatibilidad de caracteres o convivencia insostenible, sin una falta grave específica.",
      avgDuration: "14,4 años",
    },
    "Los tratos crueles o violencia contra la mujer o miembros del núcleo familiar": {
      label: "Violencia intrafamiliar",
      interpretiveText: "Causal directamente vinculada a violencia intrafamiliar.",
      avgDuration: "15,0 años",
    },
    "Las Amenazas graves de un cónyuge contra la vida del otro": {
      label: "Amenazas graves",
      interpretiveText: "Causal por amenazas graves contra la vida del otro cónyuge.",
      avgDuration: "16,0 años",
    },
    "La condena ejecutoriada a pena privativa de la libertad mayor a diez años": {
      label: "Condena penal >10 años",
      interpretiveText: "Causal por condena ejecutoriada a pena privativa de la libertad mayor a diez años.",
      avgDuration: "18,6 años",
    },
    "El adulterio de uno de los cónyuges": {
      label: "Adulterio",
      interpretiveText: "Causal por adulterio de uno de los cónyuges.",
      avgDuration: "14,3 años",
    },
    "La tentativa de uno de los cónyuges contra la vida del otro": {
      label: "Tentativa contra la vida",
      interpretiveText: "Causal por tentativa de uno de los cónyuges contra la vida del otro.",
    },
    "Los actos ejecutados por uno de los cónyuges con el fin de involucrar al otro o a los hijos en actividades ilícitas": {
      label: "Actividades ilícitas",
      interpretiveText: "Causal por actos para involucrar al otro o a los hijos en actividades ilícitas.",
      avgDuration: "29,0 años",
    },
    "El que uno de los cónyuges sea ebrio consuetudinario o toxicómano": {
      label: "Alcoholismo / drogas",
      interpretiveText: "Causal por ebriedad consuetudinaria o toxicomanía.",
      avgDuration: "16,6 años",
    },
    "Sin Información": {
      label: "Sin información",
      interpretiveText: "Registro sin causal declarada.",
    },
    "<1": { label: "Menos de 1 año", interpretiveText: "Matrimonios disueltos con menos de un año de duración." },
    "1-5": { label: "1 a 5 años", interpretiveText: "Separaciones tempranas dentro de la trayectoria matrimonial." },
    "6-10": { label: "6 a 10 años", interpretiveText: "Duración intermedia, ya lejos del arranque del matrimonio." },
    "11-20": { label: "11 a 20 años", interpretiveText: "Tramo de matrimonios ya consolidados antes de la disolución." },
    "21-30": { label: "21 a 30 años", interpretiveText: "Matrimonios de larga duración al momento del divorcio." },
    "30+": { label: "Más de 30 años", interpretiveText: "Casos de trayectorias matrimoniales muy largas." },
  },
} satisfies InsightPanelConfig;

function CausaContextCard({ causa, count, total }: { causa: string; count: number; total: number }) {
  const row = DUR_PROMEDIO.find((r) => r.clave === causa);
  const corta = CAUSA_CORTA[causa] ?? causa;
  const detail = CAUSE_INSIGHTS.details[causa as keyof typeof CAUSE_INSIGHTS.details];
  if (!detail) return null;
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
    >
      {/* Header — dato real del dataset */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3 border-b border-primary/10 bg-primary/8">
        <div className="flex items-center gap-2.5">
          <span className="text-primary shrink-0">
            <IconScale className="w-4 h-4" />
          </span>
          <span className="text-sm font-semibold text-foreground">{corta}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold text-foreground tabular-nums">
            {count.toLocaleString("es-EC")} casos
          </span>
          <span className="text-xs text-muted-foreground">({pct}%)</span>
          {row && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
              <IconClock className="w-3 h-3" />
              {row.duracion} prom.
            </div>
          )}
        </div>
      </div>
      {/* Body — descripción legal corta */}
      <div className="px-4 py-3">
        <p className="text-sm text-foreground leading-relaxed">
          {detail.interpretiveText}
        </p>
      </div>
    </motion.div>
  );
}

function DurationTable({ selectedCause }: { selectedCause: string | null }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-secondary/40 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Duración promedio del matrimonio por causal
        </span>
        <span className="text-[11px] text-muted-foreground">Fuente: INEC 2020</span>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border">
          {DUR_PROMEDIO.map((row, i) => {
            const isActive = selectedCause === row.clave;
            const barPct = (row.anios / MAX_DUR) * 100;
            return (
              <tr
                key={row.clave}
                className={`transition-colors ${isActive ? "bg-primary/8" : i % 2 === 0 ? "bg-card" : "bg-secondary/10"}`}
              >
                <td className="px-4 py-2.5">
                  <span className={`text-sm ${isActive ? "font-semibold text-primary" : "text-foreground"}`}>
                    {row.causa}
                  </span>
                </td>
                <td className="px-4 py-2.5 w-40">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isActive ? "bg-primary" : "bg-primary/40"}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className={`text-xs tabular-nums font-semibold w-14 text-right ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {row.duracion}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Causas() {
  const [topN, setTopN] = useState(5);
  const [excluirSinInfo, setExcluirSinInfo] = useState(true);
  const { filteredData, getAggregatesExcluding, isLoading, selectedProvince, selectedCause, setSelectedCause, selectedDuration, setSelectedDuration } = useFilters();

  const aggCause = useMemo(() => getAggregatesExcluding(["cause"]), [getAggregatesExcluding]);
  const aggDuration = useMemo(() => getAggregatesExcluding(["duration"]), [getAggregatesExcluding]);

  const setInsightConfig = useSetInsightPanelConfig();
  useEffect(() => {
    if (setInsightConfig) {
      setInsightConfig(CAUSE_INSIGHTS);
      return () => setInsightConfig(null);
    }
  }, [setInsightConfig]);

  const causas = useMemo(() => {
    if (!aggCause) return [];
    const entries = Object.entries(aggCause.causa).sort((a, b) => b[1] - a[1]);
    return excluirSinInfo ? entries.filter(([k]) => k !== "Sin Información") : entries;
  }, [aggCause, excluirSinInfo]);

  if (isLoading || !filteredData) {
    return <div className="h-96 flex items-center justify-center text-muted-foreground">Cargando datos...</div>;
  }

  // Calcular el porcentaje de mutuo consentimiento real
  const mutualNotarial = filteredData.causa["Por mutuo consentimiento vía notarial"] ?? 0;
  const mutualJudicial = filteredData.causa["Por mutuo consentimiento vía judicial"] ?? 0;
  const totalMutual = mutualNotarial + mutualJudicial;
  const pctMutual = filteredData.total > 0 ? ((totalMutual / filteredData.total) * 100).toFixed(1) : "71.0";

  const top = causas.slice(0, topN);
  const otros = causas.slice(topN).reduce((s, [, v]) => s + v, 0);

  const durVals = DUR_ORDER.map((k) => aggDuration?.duracion[k] ?? 0);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          {selectedProvince ? `Causas y duración en ${selectedProvince}` : "Causas del divorcio y duración del matrimonio"}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Motivos legales invocados y cuánto duraron los matrimonios antes de disolverse.
        </p>
      </header>

      {/* Hero badge — siempre visible, prominente */}
      <HeroBadge
        value={`${pctMutual}%`}
        label="de los divorcios fueron por mutuo consentimiento"
        sublabel={`${totalMutual.toLocaleString("es-EC")} casos acordados entre ambos cónyuges — vía notarial (${mutualNotarial.toLocaleString("es-EC")}) + judicial (${mutualJudicial.toLocaleString("es-EC")})`}
        color="primary"
      />

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Top causas:</span>
          <input
            type="range"
            min={2}
            max={Math.min(10, causas.length)}
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="accent-primary"
          />
          <span className="font-medium text-foreground w-6 text-center">{topN}</span>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={excluirSinInfo}
            onChange={(e) => setExcluirSinInfo(e.target.checked)}
            className="accent-primary"
          />
          Excluir "Sin información"
        </label>
      </div>

      {/* Tarjeta contextual de la causa seleccionada */}
      <AnimatePresence mode="wait">
        {selectedCause && (
          <CausaContextCard
            key={selectedCause}
            causa={selectedCause}
            count={filteredData.causa[selectedCause] ?? 0}
            total={filteredData.total}
          />
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Motivos legales del divorcio" description="Clic en una barra para ver su definición legal." height={440}>
          <Bar
            key={`causas-${excluirSinInfo}`}
            data={{
              labels: causas.map(([k]) => CAUSA_CORTA[k] ?? k),
              datasets: [
                {
                  label: "Casos",
                  data: causas.map(([, v]) => v),
                  backgroundColor: causas.map(([k]) => 
                    selectedCause 
                      ? k === selectedCause ? palette[4] : palette[4] + "44"
                      : palette[4]
                  ),
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              onClick: (_event, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  const clickedCause = causas[idx][0];
                  setSelectedCause(selectedCause === clickedCause ? null : clickedCause);
                }
              },
            }}
          />
        </ChartCard>

        <ChartCard title={`Peso de las ${topN} causas principales`} description="Concentración de motivos en los principales grupos." height={440}>
          <Pie
            key={`pie-${topN}-${excluirSinInfo}`}
            data={{
              labels: [...top.map(([k]) => CAUSA_CORTA[k] ?? k), "Otras causas"],
              datasets: [
                {
                  data: [...top.map(([, v]) => v), otros],
                  backgroundColor: palette.slice(0, top.length + 1).map((col, i) => {
                    if (!selectedCause) return col;
                    const isOtras = i === top.length;
                    if (isOtras) return col + "44";
                    const causeKey = top[i][0];
                    return causeKey === selectedCause ? col : col + "44";
                  }),
                  borderWidth: 0,
                },
              ],
            }}
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              onClick: (_event, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  if (idx < top.length) {
                    const clickedCause = top[idx][0];
                    setSelectedCause(selectedCause === clickedCause ? null : clickedCause);
                  }
                }
              },
            }}
          />
        </ChartCard>
      </div>

      {/* Glosario legal — siempre visible, interactivo */}
      <div className="rounded-2xl border border-border bg-card/80 p-5">
        <LegalGlossary />
      </div>

      {/* Gráfico duración + tabla de promedios */}
      <div className="space-y-6">
        <ContextNote title="Promedio nacional:" variant="info">
          Los matrimonios que se divorciaron en 2020 duraron en promedio{" "}
          <span className="font-semibold">15 años</span> antes de disolverse.
          La causal con matrimonios más cortos es{" "}
          <span className="font-semibold">mutuo acuerdo judicial (13,6 años)</span> y la más larga
          {" "}<span className="font-semibold">actividades ilícitas (29,0 años)</span>.
          Clic en el gráfico o en la tabla para filtrar.
        </ContextNote>

        <ChartCard title="Años transcurridos hasta el divorcio" description="Distribución por rango de duración del matrimonio." height={360}>
          <Line
            data={{
              labels: DUR_ORDER.map((k) => DUR_LABELS[k]),
              datasets: [
                {
                  label: "Matrimonios disueltos",
                  data: durVals,
                  borderColor: palette[1],
                  backgroundColor: palette[1] + "33",
                  borderWidth: 2,
                  pointBackgroundColor: DUR_ORDER.map(k => 
                    selectedDuration 
                      ? k === selectedDuration ? palette[1] : palette[1] + "44"
                      : palette[1]
                  ),
                  pointRadius: DUR_ORDER.map(k => k === selectedDuration ? 6 : 4),
                  fill: true,
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
              onClick: (_event, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  const clickedDur = DUR_ORDER[idx];
                  setSelectedDuration(selectedDuration === clickedDur ? null : clickedDur);
                }
              },
            }}
          />
        </ChartCard>

        {/* Tabla de duración por causal — siempre visible */}
        <DurationTable selectedCause={selectedCause} />
      </div>
    </motion.div>
    </>
  );
}
