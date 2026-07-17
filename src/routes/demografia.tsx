import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Bar, Radar, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import { useFilters, SexFocus } from "@/contexts/FilterContext";
import { type InsightPanelConfig, useSetInsightPanelConfig } from "@/contexts/InsightPanelContext";
import { ContextNote } from "@/components/ContextNote";
import { HeroBadge } from "@/components/HeroBadge";

export const Route = createFileRoute("/demografia")({
  head: () => ({ meta: [{ title: "Demografía · Divorcios Ecuador 2020" }] }),
  component: Demografia,
});

const EDAD_ORDER = ["<25", "25-34", "35-44", "45-54", "55-64", "65+"];
const EDAD_LABEL: Record<string, string> = {
  "<25": "Menos de 25",
  "25-34": "25 a 34",
  "35-44": "35 a 44",
  "45-54": "45 a 54",
  "55-64": "55 a 64",
  "65+": "65 o más",
};

const NIVEL_ORDER = [
  "Ninguno",
  "Centro de alfabetización",
  "Jardín de Infantes",
  "Primaria",
  "Educación básica",
  "Secundaria",
  "Educación media / Bachillerato",
  "Superior no Universitario",
  "Superior Universitario",
  "Posgrado",
];

// Fichas de detalle por rango de edad al seleccionar
const EDAD_DETALLE: Record<string, { titulo: string; interpretacion: string; dato?: string }> = {
  "<25": {
    titulo: "Menores de 25 años",
    interpretacion: "Rango muy temprano dentro de la trayectoria marital. Matrimonios jóvenes con poca duración acumulada.",
    dato: "Son los divorcios más tempranos en tiempo absoluto.",
  },
  "25-34": {
    titulo: "25 a 34 años",
    interpretacion: "Tramo de divorcios relativamente tempranos. Coincide con la fase de consolidación profesional y familiar, donde los conflictos de pareja son más frecuentes.",
    dato: "Grupo con mayor movilidad geográfica y educativa.",
  },
  "35-44": {
    titulo: "35 a 44 años",
    interpretacion: "Tramo central de la distribución. Corresponde a matrimonios de duración media, muchos con hijos a cargo.",
    dato: "Rango más representado en la serie total.",
  },
  "45-54": {
    titulo: "45 a 54 años",
    interpretacion: "Edad madura todavía muy representada. Los hijos ya pueden ser mayores de edad, lo que facilita el trámite notarial.",
    dato: "Alta proporción de mutuo consentimiento en este rango.",
  },
  "55-64": {
    titulo: "55 a 64 años",
    interpretacion: "Grupo de trayectorias matrimoniales largas. Muchos de estos matrimonios superan los 20-25 años de duración antes de la disolución.",
    dato: "Promedio de duración antes del divorcio: superior a 20 años.",
  },
  "65+": {
    titulo: "65 años o más",
    interpretacion: "Casos menos frecuentes pero presentes. Divorcios en etapa de retiro o vejez, generalmente de larga duración matrimonial.",
    dato: "Trayectorias matrimoniales muy largas, muchas veces 30+ años.",
  },
};

const ETNIA_DETALLE: Record<string, string> = {
  Mestiza: "Categoría dominante, consistente con la composición étnica del Ecuador (aprox. 71,9% según el censo).",
  Indigena: "Autoidentificación minoritaria dentro del total nacional de divorcios registrados.",
  "Afroecuatoriana /afrodescendiente": "Categoría con presencia en el registro, consistente con la distribución poblacional.",
  Montubia: "Presencia menor, relevante especialmente en zonas rurales de la Costa.",
  Blanca: "Grupo minoritario en el conjunto total de divorcios.",
  Mulata: "Categoría minoritaria en la distribución general.",
  Negra: "Autoidentificación poco frecuente en el total de la serie.",
  Otro: "Categoría residual de autoidentificación étnica.",
  "Sin Información": "Registros sin dato de autoidentificación declarado.",
};

const DEMOGRAFIA_INSIGHTS = {
  priority: ["age", "education", "ethnicity", "children"] as const,
  overviewText:
    "La estructura demográfica se concentra en edades medias (35-44), nivel bachillerato, residencia urbana (~80%) y autoidentificación mestiza. El promedio nacional de duración matrimonial antes del divorcio es de 15 años. Clic en cualquier segmento para ver el detalle.",
  details: {
    "<25": { label: "Menos de 25", interpretiveText: "Rango muy temprano dentro de la trayectoria marital." },
    "25-34": { label: "25 a 34", interpretiveText: "Edad de divorcio relativamente temprana dentro de la serie." },
    "35-44": { label: "35 a 44", interpretiveText: "Tramo central de la distribución por edad. El más representado." },
    "45-54": { label: "45 a 54", interpretiveText: "Edad madura, todavía muy representada en la serie." },
    "55-64": { label: "55 a 64", interpretiveText: "Grupo de trayectorias matrimoniales más largas." },
    "65+": { label: "65 o más", interpretiveText: "Casos menos frecuentes pero aún presentes en la distribución." },
    Ninguno: { label: "Sin nivel educativo", interpretiveText: "Casos sin nivel educativo declarado." },
    Primaria: { label: "Primaria", interpretiveText: "Nivel básico con peso relevante en la serie." },
    "Educación básica": { label: "Educación básica", interpretiveText: "Nivel intermedio de instrucción." },
    Secundaria: { label: "Secundaria", interpretiveText: "Tramo importante dentro del perfil educativo." },
    "Educación media / Bachillerato": { label: "Bachillerato", interpretiveText: "Nivel más frecuente en la serie de divorcios 2020." },
    "Superior no Universitario": { label: "Superior no universitario", interpretiveText: "Formación técnica o terciaria no universitaria." },
    "Superior Universitario": { label: "Superior universitario", interpretiveText: "Nivel universitario con presencia alta en la serie." },
    Posgrado: { label: "Posgrado", interpretiveText: "Nivel de posgrado, menos frecuente pero visible." },
    Indigena: { label: "Indígena", interpretiveText: "Autoidentificación minoritaria dentro del total nacional." },
    Mestiza: { label: "Mestiza", interpretiveText: "Categoría dominante, consistente con la composición del país (~71,9%)." },
    Montubia: { label: "Montubia", interpretiveText: "Presencia menor, relevante en zonas rurales de la Costa." },
    Blanca: { label: "Blanca", interpretiveText: "Grupo minoritario dentro del conjunto." },
    Mulata: { label: "Mulata", interpretiveText: "Grupo minoritario en la serie." },
    Negra: { label: "Negra", interpretiveText: "Autoidentificación poco frecuente en el total." },
    "Afroecuatoriana /afrodescendiente": { label: "Afroecuatoriana", interpretiveText: "Categoría minoritaria en la distribución." },
    Otro: { label: "Otro", interpretiveText: "Categoría residual de autoidentificación." },
    "Sin Información": { label: "Sin información", interpretiveText: "Registro sin dato de autoidentificación." },
    "0": { label: "Sin hijos", interpretiveText: "La mayoría de parejas no reporta hijos a cargo al momento del divorcio." },
    "1": { label: "1 hijo", interpretiveText: "Casos con un hijo a cargo." },
    "2": { label: "2 hijos", interpretiveText: "Casos con dos hijos a cargo." },
    "3": { label: "3 hijos", interpretiveText: "Casos con tres hijos a cargo." },
    "4": { label: "4 hijos", interpretiveText: "Casos con cuatro hijos a cargo." },
  },
} satisfies InsightPanelConfig;

type Escala = "lineal" | "log";

/* ─── SVG Icons ─── */
function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
  );
}
function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.757.433l.018.008.006.003zM10 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
    </svg>
  );
}
function IconDna({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L1.5 10.53a.75.75 0 010-1.06l3.72-3.72a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l3.72 3.72a.75.75 0 010 1.06l-3.72 3.72a.75.75 0 11-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clipRule="evenodd" />
    </svg>
  );
}
function IconInfo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
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

function Chips<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-secondary/40 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${value === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Tarjeta de detalle de edad — número del dataset + descripción corta ─── */
function EdadContextCard({ edad, countH, countM }: { edad: string; countH: number; countM: number }) {
  const d = EDAD_DETALLE[edad];
  if (!d) return null;
  const total = countH + countM;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
    >
      {/* Header — dato real del dataset */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-primary/10 bg-primary/8">
        <div className="flex items-center gap-2.5">
          <span className="text-primary shrink-0">
            <IconUser className="w-4 h-4" />
          </span>
          <span className="text-sm font-semibold text-foreground">{d.titulo}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {countH > 0 && (
            <span className="text-xs font-semibold tabular-nums" style={{ color: palette[0] }}>
              H: {countH.toLocaleString("es-EC")}
            </span>
          )}
          {countM > 0 && (
            <span className="text-xs font-semibold tabular-nums" style={{ color: palette[1] }}>
              M: {countM.toLocaleString("es-EC")}
            </span>
          )}
          <span className="text-sm font-bold text-foreground tabular-nums">
            {total.toLocaleString("es-EC")} casos
          </span>
        </div>
      </div>
      {/* Body — layout horizontal */}
      <div className="flex gap-0 divide-x divide-primary/10">
        <div className="flex-1 px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{d.interpretacion}</p>
        </div>
        {d.dato && (
          <div className="w-56 shrink-0 px-4 py-3 flex items-start gap-2 bg-background/60">
            <span className="text-primary shrink-0 mt-0.5">
              <IconPin className="w-3.5 h-3.5" />
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">{d.dato}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Tarjeta de detalle de etnia — número del dataset + descripción corta ─── */
function EtniaContextCard({ etnia, count, total }: { etnia: string; count: number; total: number }) {
  const texto = ETNIA_DETALLE[etnia] ?? `Autoidentificación: ${etnia}.`;
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-accent/20 bg-accent/5 overflow-hidden"
    >
      {/* Header — dato real del dataset */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-accent/10 bg-accent/8">
        <div className="flex items-center gap-2.5">
          <span className="text-accent shrink-0">
            <IconDna className="w-4 h-4" />
          </span>
          <span className="text-sm font-semibold text-foreground">{etnia}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-foreground tabular-nums">
            {count.toLocaleString("es-EC")} casos
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">({pct}%)</span>
        </div>
      </div>
      {/* Body — descripción corta */}
      <div className="px-4 py-3">
        <p className="text-sm text-foreground leading-relaxed">{texto}</p>
      </div>
    </motion.div>
  );
}

function DurationContextCard({ filteredData }: { filteredData: NonNullable<ReturnType<typeof useFilters>["filteredData"]> }) {
  const duracion = filteredData.duracion;
  const cortos = (duracion["<1"] ?? 0) + (duracion["1-5"] ?? 0);
  const largos = (duracion["21-30"] ?? 0) + (duracion["30+"] ?? 0);
  const total = filteredData.total;
  const pctCortos = total > 0 ? ((cortos / total) * 100).toFixed(1) : "0";
  const pctLargos = total > 0 ? ((largos / total) * 100).toFixed(1) : "0";

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card px-4 py-3.5 text-center flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Matrimonios cortos</div>
        <div className="mt-1 text-2xl font-bold text-foreground">{pctCortos}%</div>
        <div className="text-xs text-muted-foreground mt-0.5">menos de 5 años</div>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5 text-center flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Promedio nacional</div>
        <div className="mt-1 text-2xl font-bold text-primary">~15 años</div>
        <div className="text-xs text-muted-foreground mt-0.5">duración antes del divorcio</div>
      </div>
      <div className="rounded-xl border border-border bg-card px-4 py-3.5 text-center flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Matrimonios largos</div>
        <div className="mt-1 text-2xl font-bold text-foreground">{pctLargos}%</div>
        <div className="text-xs text-muted-foreground mt-0.5">más de 20 años</div>
      </div>
    </div>
  );
}

/* ─── Tarjeta de hijos — diseño mejorado ─── */
function HijosContextCard({ children: count }: { children: string }) {
  const essinHijos = count === "0";
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-border bg-secondary/30 overflow-hidden"
    >
      <div className="flex items-start gap-4 px-4 py-3.5">
        <span className="text-primary shrink-0 mt-0.5">
          <IconInfo className="w-4 h-4" />
        </span>
        <div>
          <span className="text-sm font-semibold text-foreground">
            {essinHijos ? "Sin hijos" : `${count} hijo${count === "1" ? "" : "s"}`}:
          </span>{" "}
          <span className="text-sm text-muted-foreground">
            {essinHijos
              ? "La mayoría de parejas no reporta hijos a cargo al momento del divorcio — pueden tramitar notarialmente."
              : `Casos con ${count} hijo${count === "1" ? "" : "s"} a cargo. Con hijos menores de edad el trámite debe ser judicial.`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Demografia() {
  const [escala, setEscala] = useState<Escala>("log");
  const [incluirSinHijos, setIncluirSinHijos] = useState(true);

  const {
    filteredData, getAggregatesExcluding, isLoading, selectedProvince,
    selectedSexFocus, setSelectedSexFocus,
    selectedAge, setSelectedAge,
    selectedEdu, setSelectedEdu,
    selectedEthnicity, setSelectedEthnicity,
    selectedChildren, setSelectedChildren
  } = useFilters();

  const aggAge = useMemo(() => getAggregatesExcluding(["age"]), [getAggregatesExcluding]);
  const aggEdu = useMemo(() => getAggregatesExcluding(["edu"]), [getAggregatesExcluding]);
  const aggEtnia = useMemo(() => getAggregatesExcluding(["ethnicity"]), [getAggregatesExcluding]);
  const aggHijos = useMemo(() => getAggregatesExcluding(["children"]), [getAggregatesExcluding]);

  const setInsightConfig = useSetInsightPanelConfig();
  useEffect(() => {
    if (setInsightConfig) {
      setInsightConfig(DEMOGRAFIA_INSIGHTS);
      return () => setInsightConfig(null);
    }
  }, [setInsightConfig]);

  if (isLoading || !filteredData || !aggAge || !aggEdu || !aggEtnia || !aggHijos) {
    return <div className="h-96 flex items-center justify-center text-muted-foreground">Cargando datos...</div>;
  }

  const edadH = EDAD_ORDER.map((k) => aggAge.edad_h[k] ?? 0);
  const edadM = EDAD_ORDER.map((k) => aggAge.edad_m[k] ?? 0);
  const nivelH = NIVEL_ORDER.map((k) => aggEdu.nivel_h[k] ?? 0);
  const nivelM = NIVEL_ORDER.map((k) => aggEdu.nivel_m[k] ?? 0);

  const isSexHombres = selectedSexFocus !== "mujeres";
  const isSexMujeres = selectedSexFocus !== "hombres";

  const edadDatasets = [
    isSexHombres && {
      label: "Hombres",
      data: edadH,
      backgroundColor: EDAD_ORDER.map(k =>
        selectedAge ? (k === selectedAge ? palette[0] : palette[0] + "44") : palette[0]
      ),
      borderRadius: 6,
    },
    isSexMujeres && {
      label: "Mujeres",
      data: edadM,
      backgroundColor: EDAD_ORDER.map(k =>
        selectedAge ? (k === selectedAge ? palette[1] : palette[1] + "44") : palette[1]
      ),
      borderRadius: 6,
    },
  ].filter(Boolean) as { label: string; data: number[]; backgroundColor: string[]; borderRadius: number }[];

  const nivelDatasets = [
    isSexHombres && {
      label: "Hombres",
      data: nivelH,
      borderColor: palette[0],
      backgroundColor: palette[0] + "40",
      pointBackgroundColor: NIVEL_ORDER.map(k =>
        selectedEdu ? (k === selectedEdu ? palette[0] : palette[0] + "44") : palette[0]
      ),
      pointRadius: NIVEL_ORDER.map(k => k === selectedEdu ? 6 : 4),
    },
    isSexMujeres && {
      label: "Mujeres",
      data: nivelM,
      borderColor: palette[1],
      backgroundColor: palette[1] + "40",
      pointBackgroundColor: NIVEL_ORDER.map(k =>
        selectedEdu ? (k === selectedEdu ? palette[1] : palette[1] + "44") : palette[1]
      ),
      pointRadius: NIVEL_ORDER.map(k => k === selectedEdu ? 6 : 4),
    },
  ].filter(Boolean) as never[];

  const etnia = Object.entries(aggEtnia.etnia).sort((a, b) => b[1] - a[1]);

  const hijosOrdered = Object.entries(aggHijos.hijos)
    .filter(([k]) => k !== "99")
    .filter(([k]) => incluirSinHijos || k !== "0")
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  const sexoOpts: { value: SexFocus; label: string }[] = [
    { value: "ambos", label: "Ambos" },
    { value: "hombres", label: "Hombres" },
    { value: "mujeres", label: "Mujeres" },
  ];

  // Urbano/Rural — orden fijo para que los colores no cambien
  const urbanaCount = filteredData.area["Urbana"] ?? 0;
  const ruralCount = filteredData.area["Rural"] ?? 0;
  const urbanaPct = filteredData.total > 0 ? ((urbanaCount / filteredData.total) * 100).toFixed(1) : "0";

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            {selectedProvince ? `Perfil demográfico en ${selectedProvince}` : "Perfil demográfico"}
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Edad, educación, autoidentificación étnica y número de hijos de las personas divorciadas.
          </p>
        </header>

        {/* Tarjetas de resumen demográfico — siempre visibles */}
        {(() => {
          // Calcular rango de edad pico (sumando hombres + mujeres)
          const edadCombinada = EDAD_ORDER.map(k => ({
            k,
            v: (filteredData.edad_h[k] ?? 0) + (filteredData.edad_m[k] ?? 0),
          }));
          const edadPico = edadCombinada.reduce((best, cur) => cur.v > best.v ? cur : best, edadCombinada[0]);
          const edadPicoLabel = EDAD_LABEL[edadPico.k] ?? edadPico.k;

          // Calcular nivel educativo modal (sumando hombres + mujeres)
          const nivelCombinado = NIVEL_ORDER.map(k => ({
            k,
            v: (filteredData.nivel_h[k] ?? 0) + (filteredData.nivel_m[k] ?? 0),
          }));
          const nivelModal = nivelCombinado.reduce((best, cur) => cur.v > best.v ? cur : best, nivelCombinado[0]);
          const nivelModalLabel = nivelModal.k;

          // Calcular etnia más frecuente
          const etniaEntries = Object.entries(filteredData.etnia).filter(([k]) => k !== "Sin Información");
          const topEtnia = etniaEntries.reduce((best, cur) => cur[1] > best[1] ? cur : best, etniaEntries[0]);
          const topEtniaLabel = topEtnia ? topEtnia[0] : "—";
          const topEtniaPct = filteredData.total > 0 && topEtnia
            ? ((topEtnia[1] / filteredData.total) * 100).toFixed(1)
            : "0";

          return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <HeroBadge
                value={`${urbanaPct}%`}
                label="en zona urbana"
                sublabel={`${urbanaCount.toLocaleString("es-EC")} casos en ciudades`}
                color="primary"
              />
              <div className="rounded-2xl border border-border bg-card/80 px-5 py-4 text-center flex flex-col items-center justify-center">
                <div className="w-full text-center text-xs uppercase tracking-wide text-muted-foreground">Rango de edad pico</div>
                <div className="w-full text-center mt-1 text-2xl font-bold text-foreground">{edadPicoLabel}</div>
                <div className="w-full text-center text-xs text-muted-foreground mt-0.5">años · tramo más frecuente</div>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 px-5 py-4 text-center flex flex-col items-center justify-center">
                <div className="w-full text-center text-xs uppercase tracking-wide text-muted-foreground">Nivel educativo modal</div>
                <div className="w-full text-center mt-1 text-base font-bold text-foreground leading-tight">{nivelModalLabel}</div>
                <div className="w-full text-center text-xs text-muted-foreground mt-0.5">{nivelCombinado.find(n => n.k === nivelModal.k)?.v.toLocaleString("es-EC")} casos</div>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 px-5 py-4 text-center flex flex-col items-center justify-center">
                <div className="w-full text-center text-xs uppercase tracking-wide text-muted-foreground">Etnia más frecuente</div>
                <div className="w-full text-center mt-1 text-2xl font-bold text-foreground">{topEtniaLabel}</div>
                <div className="w-full text-center text-xs text-muted-foreground mt-0.5">{topEtniaPct}% del total</div>
              </div>
            </div>
          );
        })()}

        {/* Tarjeta de duración — siempre visible */}
        <div className="space-y-2">
          <DurationContextCard filteredData={filteredData} />
          <ContextNote variant="info" collapsible={true} title="Interpretación del patrón nacional">
            El <span className="font-semibold">promedio nacional es ~15 años</span>. Los matrimonios cortos (menos de 5 años)
            representan una minoría — la mayoría llega al divorcio tras al menos una década juntos.
            Los casos de <span className="font-semibold">30+ años</span> son trayectorias muy largas que terminan
            frecuentemente en etapa de madurez o vejez.
          </ContextNote>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Mostrar:</span>
          <Chips value={selectedSexFocus} onChange={setSelectedSexFocus} options={sexoOpts} />
        </div>

        {/* Gráfico de edad + tarjeta contextual al seleccionar */}
        <div className="space-y-3">
          <ChartCard
            title="Edad al momento del divorcio"
            description="Clic en un rango de edad para ver el detalle interpretativo."
            height={460}
          >
            <div className="flex flex-col h-full">
              <div className="shrink-0">
                <AnimatePresence>
                  {selectedAge && (
                    <motion.div
                      key="edad-context"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-3">
                        <EdadContextCard
                          key={selectedAge}
                          edad={selectedAge}
                          countH={filteredData.edad_h[selectedAge] ?? 0}
                          countM={filteredData.edad_m[selectedAge] ?? 0}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex-1 min-h-[200px]">
                <Bar
                  data={{ labels: EDAD_ORDER.map((k) => EDAD_LABEL[k]), datasets: edadDatasets }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } },
                    onClick: (_event, elements) => {
                      if (elements.length > 0) {
                        const idx = elements[0].index;
                        const clickedAge = EDAD_ORDER[idx];
                        setSelectedAge(selectedAge === clickedAge ? null : clickedAge);
                      }
                    },
                  }}
                />
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Nivel educativo alcanzado"
            description="Clic en un punto del radar para filtrar por educación."
            height={420}
          >
            <Radar
              data={{ labels: NIVEL_ORDER, datasets: nivelDatasets }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: (_event, elements) => {
                  if (elements.length > 0) {
                    const idx = elements[0].index;
                    const clickedEdu = NIVEL_ORDER[idx];
                    setSelectedEdu(selectedEdu === clickedEdu ? null : clickedEdu);
                  }
                },
              }}
            />
          </ChartCard>

          {/* Etnia + tarjeta contextual */}
          <div className="space-y-3">
            <ChartCard
              title="Autoidentificación étnica"
              description="Clic en un segmento para ver su contexto dentro de la serie."
              height={460}
            >
              <div className="flex flex-col h-full">
                <div className="shrink-0">
                  <AnimatePresence>
                    {selectedEthnicity && (
                      <motion.div
                        key="etnia-context"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pb-3">
                          <EtniaContextCard
                            key={selectedEthnicity}
                            etnia={selectedEthnicity}
                            count={filteredData.etnia[selectedEthnicity] ?? 0}
                            total={filteredData.total}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex-1 min-h-[200px]">
                  <Doughnut
                    data={{
                      labels: etnia.map(([k]) => k),
                      datasets: [
                        {
                          data: etnia.map(([, v]) => v),
                          backgroundColor: etnia.map(([k], i) =>
                            selectedEthnicity
                              ? k === selectedEthnicity ? palette[i % palette.length] : palette[i % palette.length] + "44"
                              : palette[i % palette.length]
                          ),
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "55%",
                      onClick: (_event, elements) => {
                        if (elements.length > 0) {
                          const idx = elements[0].index;
                          const clickedEtnia = etnia[idx][0];
                          setSelectedEthnicity(selectedEthnicity === clickedEtnia ? null : clickedEtnia);
                        }
                      },
                    }}
                  />
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Gráfico de zona urbana/rural — orden fijo para que los colores no cambien */}
        <ChartCard title="Entorno de residencia" description="Distribución entre zonas urbanas y rurales.">
          <Doughnut
            key="area-demo-donut"
            data={{
              labels: ["Urbana", "Rural"],
              datasets: [
                {
                  data: [urbanaCount, ruralCount],
                  backgroundColor: [palette[0], palette[1]],
                  borderWidth: 0,
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false, cutout: "60%" }}
          />
        </ChartCard>

        <ChartCard
          title="Hijos en común procreados"
          description="Número de hijos declarados por las parejas al momento del divorcio."
          height={480}
        >
          <div className="flex flex-col h-full">
            <div className="shrink-0">
              <AnimatePresence>
                {selectedChildren && (
                  <motion.div
                    key="hijos-context"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-3">
                      <HijosContextCard key={selectedChildren}>{selectedChildren}</HijosContextCard>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-wrap gap-3 mb-4 mt-1">
                <Chips
                  value={escala}
                  onChange={setEscala}
                  options={[
                    { value: "lineal", label: "Escala lineal" },
                    { value: "log", label: "Escala logarítmica" },
                  ]}
                />
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={incluirSinHijos}
                    onChange={(e) => setIncluirSinHijos(e.target.checked)}
                    className="accent-primary"
                  />
                  Incluir parejas sin hijos
                </label>
              </div>
            </div>
            <div className="flex-1 min-h-[200px]">
              <Bar
                key={`hijos-${escala}-${incluirSinHijos}`}
                data={{
                  labels: hijosOrdered.map(([k]) => (k === "0" ? "Sin hijos" : `${k} hijo${k === "1" ? "" : "s"}`)),
                  datasets: [
                    {
                      label: "Parejas",
                      data: hijosOrdered.map(([, v]) => v),
                      backgroundColor: hijosOrdered.map(([k]) =>
                        selectedChildren
                          ? k === selectedChildren ? palette[2] : palette[2] + "44"
                          : palette[2]
                      ),
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: escala === "log" ? { y: { type: "logarithmic" } } : { y: { beginAtZero: true } },
                  onClick: (_event, elements) => {
                    if (elements.length > 0) {
                      const idx = elements[0].index;
                      const clickedChild = hijosOrdered[idx][0];
                      setSelectedChildren(selectedChildren === clickedChild ? null : clickedChild);
                    }
                  },
                }}
              />
            </div>
          </div>
        </ChartCard>

        {/* Nota final de contexto */}
        <ContextNote variant="info">
          <span className="font-semibold">Área urbana vs. rural:</span> El{" "}
          <span className="font-semibold">{urbanaPct}% de los divorcios</span> corresponde a residentes en zona urbana,
          lo que refleja tanto la concentración poblacional en ciudades como el mayor acceso a trámites notariales y
          judiciales en entornos urbanos. Los datos de etnia, educación y área corresponden a la declaración de
          <span className="font-semibold"> cónyuge 1</span> en el registro INEC.
        </ContextNote>
      </motion.div>
    </>
  );
}
