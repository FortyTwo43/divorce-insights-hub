import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import { useFilters } from "@/contexts/FilterContext";
import { InsightPanelProvider } from "@/contexts/InsightPanelContext";
import { HeroBadge } from "@/components/HeroBadge";
import { LegalGlossary } from "@/components/LegalGlossary";
import { ContextNote } from "@/components/ContextNote";

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
} satisfies Parameters<typeof InsightPanelProvider>[0]["value"];

function CausaContextCard({ causa }: { causa: string }) {
  const row = DUR_PROMEDIO.find((r) => r.clave === causa);
  const corta = CAUSA_CORTA[causa] ?? causa;
  const detail = CAUSE_INSIGHTS.details[causa as keyof typeof CAUSE_INSIGHTS.details];
  if (!detail) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0">⚖️</span>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-foreground">{corta}</span>
            {row && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                ⏱ {row.duracion} promedio
              </span>
            )}
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {detail.interpretiveText}
          </p>
        </div>
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
  const { filteredData, isLoading, selectedProvince, selectedCause, setSelectedCause, selectedDuration, setSelectedDuration } = useFilters();

  const causas = useMemo(() => {
    if (!filteredData) return [];
    const entries = Object.entries(filteredData.causa).sort((a, b) => b[1] - a[1]);
    return excluirSinInfo ? entries.filter(([k]) => k !== "Sin Información") : entries;
  }, [filteredData, excluirSinInfo]);

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

  const durVals = DUR_ORDER.map((k) => filteredData.duracion[k] ?? 0);

  return (
    <InsightPanelProvider value={CAUSE_INSIGHTS}>
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
          <CausaContextCard key={selectedCause} causa={selectedCause} />
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
      <div className="space-y-4">
        <ContextNote icon="⏱️" title="Promedio nacional:" variant="info">
          Los matrimonios que se divorciaron en 2020 duraron en promedio{" "}
          <span className="font-semibold">15 años</span> antes de disolverse.
          La causal con matrimonios más cortos es{" "}
          <span className="font-semibold">mutuo acuerdo judicial (13,6 años)</span> y la más larga
          {" "}<span className="font-semibold">actividades ilícitas (29,0 años)</span>.
          Clic en el gráfico o en la tabla para filtrar.
        </ContextNote>

        <div className="grid gap-6 lg:grid-cols-2">
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
      </div>
    </motion.div>
    </InsightPanelProvider>
  );
}
