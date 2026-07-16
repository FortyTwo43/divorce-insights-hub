import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, PolarArea } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import { EcuadorMap } from "@/components/EcuadorMap";
import { useFilters } from "@/contexts/FilterContext";
import { InsightPanelProvider } from "@/contexts/InsightPanelContext";
import { ContextNote } from "@/components/ContextNote";

export const Route = createFileRoute("/geografia")({
  head: () => ({ meta: [{ title: "Geografía · Divorcios Ecuador 2020" }] }),
  component: Geografia,
});

type Region = "todas" | "costa" | "sierra" | "amazonia" | "insular";

const REGIONES: Record<Exclude<Region, "todas">, string[]> = {
  costa: ["Guayas", "Manabí", "El Oro", "Los Ríos", "Esmeraldas", "Santa Elena", "Santo Domingo de los Tsáchilas"],
  sierra: ["Pichincha", "Azuay", "Imbabura", "Loja", "Chimborazo", "Cañar", "Tungurahua", "Cotopaxi", "Carchi", "Bolívar"],
  amazonia: ["Morona Santiago", "Pastaza", "Orellana", "Zamora Chinchipe", "Napo", "Sucumbíos"],
  insular: ["Galápagos"],
};

const REGION_OPTS: { value: Region; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "costa", label: "Costa" },
  { value: "sierra", label: "Sierra" },
  { value: "amazonia", label: "Amazonía" },
  { value: "insular", label: "Insular" },
];

// Ficha de detalle por provincia — información contextual específica
const PROVINCIA_DETALLE: Record<string, {
  nota: string;
  causaModal: string;
  tipoCausa: "notarial" | "judicial" | "otra";
  datoClave?: string;
}> = {
  Guayas: {
    nota: "La provincia más poblada del país lidera en volumen absoluto por razones demográficas, no por mayor conflicto matrimonial por habitante. El mismo patrón se repite en cualquier trámite civil.",
    causaModal: "Mutuo acuerdo vía notarial",
    tipoCausa: "notarial",
    datoClave: "Capital: Guayaquil — mayor ciudad del Ecuador",
  },
  Pichincha: {
    nota: "Segundo polo poblacional; su volumen responde principalmente al tamaño de la población urbana de Quito. No hay evidencia de una tasa de divorcio inusualmente alta respecto a su población.",
    causaModal: "Mutuo acuerdo vía notarial",
    tipoCausa: "notarial",
    datoClave: "Capital: Quito — capital del Ecuador",
  },
  Azuay: {
    nota: "Destaca porque el trámite judicial pesa más que el notarial, a diferencia del patrón nacional. Esto puede reflejar una mayor proporción de parejas con hijos menores o bienes a liquidar, o un distinto uso de las notarías en la región.",
    causaModal: "Mutuo acuerdo vía judicial (predomina sobre notarial)",
    tipoCausa: "judicial",
    datoClave: "Inversión notarial/judicial respecto al patrón nacional",
  },
  Chimborazo: {
    nota: "Provincia útil para comparar la concentración absoluta frente a su tamaño poblacional. Riobamba es la capital y concentra la mayoría de los casos provinciales.",
    causaModal: "Mutuo acuerdo vía notarial",
    tipoCausa: "notarial",
    datoClave: "Capital: Riobamba — polo regional del centro-sierra",
  },
  Manabí: {
    nota: "Tercera provincia por población; su volumen es consistente con el tamaño demográfico de la Costa ecuatoriana.",
    causaModal: "Mutuo acuerdo vía notarial",
    tipoCausa: "notarial",
    datoClave: "Capital: Portoviejo",
  },
  Cañar: {
    nota: "Caso interesante para revisar la concentración relativa: tiene una proporción de divorcios notable respecto a su población, parcialmente explicada por el fenómeno migratorio que genera mayor inestabilidad en los vínculos matrimoniales.",
    causaModal: "Mutuo acuerdo vía notarial",
    tipoCausa: "notarial",
    datoClave: "Alta emigración histórica — factor de riesgo matrimonial",
  },
  Loja: {
    nota: "Provincia del sur sierra con patrón estándar. Su capital concentra la mayor parte de los registros provinciales.",
    causaModal: "Mutuo acuerdo vía notarial",
    tipoCausa: "notarial",
    datoClave: "Capital: Loja",
  },
};

const TIPO_COLOR = {
  notarial: "text-primary bg-primary/10 border-primary/20",
  judicial: "text-violet-700 bg-violet-50 border-violet-200",
  otra: "text-muted-foreground bg-secondary/40 border-border",
};

function ProvinceDetailCard({ province }: { province: string }) {
  const detalle = PROVINCIA_DETALLE[province];
  if (!detalle) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl border border-border bg-secondary/20 px-4 py-3.5"
      >
        <div className="flex items-start gap-3">
          <span className="text-lg shrink-0">📍</span>
          <p className="text-sm text-muted-foreground">
            Provincia seleccionada: <span className="font-semibold text-foreground">{province}</span>.
            Selecciona un cantón en el gráfico inferior para ver el detalle.
          </p>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <span className="text-base font-semibold text-foreground">{province}</span>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${TIPO_COLOR[detalle.tipoCausa]}`}>
          {detalle.causaModal}
        </span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{detalle.nota}</p>
      {detalle.datoClave && (
        <div className="flex items-start gap-2 rounded-lg bg-background/80 border border-border px-3 py-2">
          <span className="text-xs mt-0.5">📌</span>
          <p className="text-xs text-muted-foreground">{detalle.datoClave}</p>
        </div>
      )}
    </motion.div>
  );
}

const GEOGRAFIA_INSIGHTS = {
  priority: ["canton", "province"] as const,
  overviewText:
    "Guayas y Pichincha concentran la mayor cantidad de divorcios porque son las provincias más pobladas del país, no porque ahí existan más conflictos matrimoniales por persona. El mismo patrón se repite en cualquier trámite civil.",
  details: {
    Guayas: {
      label: "Guayas",
      interpretiveText: "Lidera por volumen absoluto y refleja el peso demográfico de la provincia más poblada. Causa modal: mutuo consentimiento notarial.",
    },
    Pichincha: {
      label: "Pichincha",
      interpretiveText: "Segundo gran polo poblacional; su volumen responde principalmente al tamaño de la población de Quito.",
    },
    Azuay: {
      label: "Azuay",
      interpretiveText: "El trámite judicial pesa más que el notarial — inversión del patrón nacional. Posible mayor proporción de parejas con hijos menores.",
    },
    Chimborazo: {
      label: "Chimborazo",
      interpretiveText: "Provincia comparadora útil para entender la concentración relativa frente al tamaño poblacional.",
    },
    Cañar: {
      label: "Cañar",
      interpretiveText: "Alta emigración histórica como factor de inestabilidad matrimonial — concentración relativa notable.",
    },
    Manabí: {
      label: "Manabí",
      interpretiveText: "Tercera provincia costeña; volumen consistente con su peso demográfico.",
    },
  },
} satisfies Parameters<typeof InsightPanelProvider>[0]["value"];

function Geografia() {
  const [region, setRegion] = useState<Region>("todas");
  const [orden, setOrden] = useState<"desc" | "asc">("desc");
  const { filteredData, isLoading, selectedProvince, setSelectedProvince, selectedCanton, setSelectedCanton } = useFilters();

  const filtered = useMemo(() => {
    if (!filteredData) return [];
    let entries: [string, number][] = [];
    
    if (selectedProvince) {
      entries = Object.entries(filteredData.canton);
    } else {
      entries = Object.entries(filteredData.provincia);
      if (region !== "todas") {
        entries = entries.filter(([k]) => REGIONES[region].includes(k));
      }
    }
    
    return entries.sort((a, b) => (orden === "desc" ? b[1] - a[1] : a[1] - b[1]));
  }, [filteredData, region, orden, selectedProvince]);

  const mapData = useMemo(() => {
    if (!filteredData) return {};
    if (region === "todas") return filteredData.provincia;
    const allowed = new Set(REGIONES[region]);
    return Object.fromEntries(
      Object.entries(filteredData.provincia).filter(([k]) => allowed.has(k)),
    ) as Record<string, number>;
  }, [filteredData, region]);

  if (isLoading || !filteredData) {
    return <div className="h-96 flex items-center justify-center text-muted-foreground">Cargando datos...</div>;
  }

  const top10 = [...filtered].slice(0, Math.min(10, filtered.length));

  return (
    <InsightPanelProvider value={GEOGRAFIA_INSIGHTS}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          {selectedProvince ? `Análisis geográfico: ${selectedProvince}` : "Distribución geográfica"}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Cómo se reparten los divorcios entre las provincias del Ecuador. Selecciona una provincia en el mapa para filtrar el resto de los gráficos.
        </p>
      </header>

      {/* Nota de concentración — siempre visible, prominente */}
      {!selectedProvince && (
        <ContextNote icon="🗺️" title="Concentración poblacional, no conflicto:" variant="info">
          <span className="font-semibold">Guayas</span> y <span className="font-semibold">Pichincha</span> lideran
          en divorcios porque son las dos provincias más habitadas del Ecuador —{" "}
          no porque sus habitantes se divorcien más que el resto.
          El mismo patrón ocurre con cualquier trámite civil: matrimonios, nacimientos, defunciones.{" "}
          <span className="font-semibold">Azuay</span> es la excepción más interesante: ahí el trámite{" "}
          <span className="font-semibold">judicial supera al notarial</span>, inversión del patrón nacional.
        </ContextNote>
      )}

      {/* Ficha de provincia seleccionada — aparece al seleccionar */}
      <AnimatePresence mode="wait">
        {selectedProvince && (
          <ProvinceDetailCard key={selectedProvince} province={selectedProvince} />
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3">
        {!selectedProvince && (
          <>
            <span className="text-sm text-muted-foreground">Región:</span>
            <div className="inline-flex rounded-md border border-border bg-secondary/40 p-0.5">
              {REGION_OPTS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setRegion(o.value)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    region === o.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </>
        )}
        <span className="text-sm text-muted-foreground ml-2">Orden:</span>
        <div className="inline-flex rounded-md border border-border bg-secondary/40 p-0.5">
          {(["desc", "asc"] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOrden(o)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                orden === o
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o === "desc" ? "Mayor a menor" : "Menor a mayor"}
            </button>
          ))}
        </div>
      </div>

      <ChartCard
        title="Mapa coroplético del Ecuador"
        description="Pasa el cursor sobre una provincia para ver el detalle. El color se intensifica con más divorcios registrados."
        height={620}
      >
        <EcuadorMap data={mapData} />
      </ChartCard>

      {/* Nota bajo el mapa — fija */}
      <ContextNote icon="📊" variant="highlight">
        El color del mapa refleja el <span className="font-semibold">volumen absoluto</span>, no la tasa por habitante.
        Para comparar provincias de distinto tamaño, considera que Guayas tiene ~4,4 millones de habitantes
        y Galápagos apenas ~33.000. Clic en una barra del ranking para seleccionar esa provincia y ver su detalle.
      </ContextNote>

      <ChartCard
        title={selectedProvince ? `Divorcios por cantón (${selectedProvince})` : "Divorcios por provincia"}
        description={`Ranking de ${filtered.length} ${selectedProvince ? "cantones" : "provincias"}${selectedProvince ? "" : " según el filtro."}${!selectedProvince ? " · Clic para seleccionar" : ""}`}
        height={Math.max(320, filtered.length * 26 + 60)}
      >
        <Bar
          key={`prov-${region}-${orden}`}
          data={{
            labels: filtered.map(([k]) => k),
            datasets: [
              {
                label: "Divorcios",
                data: filtered.map(([, v]) => v),
                backgroundColor: filtered.map(([k]) =>
                  selectedProvince
                    ? selectedCanton === k
                      ? palette[0]
                      : selectedCanton
                      ? palette[0] + "44"
                      : palette[0]
                    : selectedProvince === null && k === selectedProvince
                    ? palette[0]
                    : palette[0]
                ),
                borderRadius: 4,
              },
            ],
          }}
          options={{
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } },
            onClick: (_event, elements) => {
              if (elements.length > 0) {
                const idx = elements[0].index;
                const clickedName = filtered[idx][0];
                if (selectedProvince) {
                  setSelectedCanton(selectedCanton === clickedName ? null : clickedName);
                } else {
                  setSelectedProvince(clickedName);
                }
              }
            },
          }}
        />
      </ChartCard>

      <ChartCard
        title={selectedProvince ? "Cantones con mayor concentración" : "Provincias con mayor concentración"}
        description={`Top ${top10.length} en volumen absoluto.`}
        height={400}
      >
        <PolarArea
          key={`polar-${region}-${selectedProvince ? "c" : "p"}`}
          data={{
            labels: top10.map(([k]) => k),
            datasets: [
              {
                data: top10.map(([, v]) => v),
                backgroundColor: top10.map(([k], i) => {
                  const baseCol = palette[i % palette.length];
                  if (selectedProvince && selectedCanton) {
                    return k === selectedCanton ? baseCol + "cc" : baseCol + "33";
                  }
                  if (!selectedProvince && selectedProvince) {
                    return k === selectedProvince ? baseCol + "cc" : baseCol + "33";
                  }
                  return baseCol + "cc";
                }),
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            onClick: (_event, elements) => {
              if (elements.length > 0) {
                const idx = elements[0].index;
                const clickedName = top10[idx][0];
                if (selectedProvince) {
                  setSelectedCanton(selectedCanton === clickedName ? null : clickedName);
                } else {
                  setSelectedProvince(selectedProvince === clickedName ? null : clickedName);
                }
              }
            },
          }}
        />
      </ChartCard>
    </motion.div>
    </InsightPanelProvider>
  );
}
