import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, PolarArea } from "react-chartjs-2";
import { motion } from "framer-motion";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import { EcuadorMap } from "@/components/EcuadorMap";
import { useFilters } from "@/contexts/FilterContext";

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

function Geografia() {
  const [region, setRegion] = useState<Region>("todas");
  const [orden, setOrden] = useState<"desc" | "asc">("desc");
  const { filteredData, isLoading, selectedProvince, data: allData } = useFilters();

  const filtered = useMemo(() => {
    if (!filteredData) return [];
    let entries: [string, number][] = [];
    
    if (selectedProvince) {
      // Si hay una provincia seleccionada, mostramos cantones
      entries = Object.entries(filteredData.canton);
    } else {
      // Si no, mostramos provincias y aplicamos filtro de región
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          {selectedProvince ? `Análisis geográfico: ${selectedProvince}` : "Distribución geográfica"}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Cómo se reparten los divorcios entre las provincias del Ecuador. Selecciona una provincia en el mapa para filtrar el resto de los gráficos en las otras pestañas.
        </p>
      </header>

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

      <ChartCard
        title={selectedProvince ? `Divorcios por cantón (${selectedProvince})` : "Divorcios por provincia"}
        description={`Ranking de ${filtered.length} ${selectedProvince ? "cantones" : "provincias"}${selectedProvince ? "" : " según el filtro."}`}
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
                backgroundColor: palette[0],
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
          }}
        />
      </ChartCard>

      <ChartCard
        title={selectedProvince ? "Cantones con mayor concentración" : "Provincias con mayor concentración"}
        description={`Top ${top10.length} en volumen absoluto.`}
        height={400}
      >
        <PolarArea
          key={`polar-${region}`}
          data={{
            labels: top10.map(([k]) => k),
            datasets: [
              {
                data: top10.map(([, v]) => v),
                backgroundColor: top10.map((_, i) => palette[i % palette.length] + "cc"),
                borderWidth: 1,
              },
            ],
          }}
          options={{ responsive: true, maintainAspectRatio: false }}
        />
      </ChartCard>
    </motion.div>
  );
}
