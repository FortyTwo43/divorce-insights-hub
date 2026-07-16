import { createFileRoute } from "@tanstack/react-router";
import { Bar, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import { useFilters } from "@/contexts/FilterContext";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { InsightPanelProvider } from "@/contexts/InsightPanelContext";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Resumen · Divorcios Ecuador 2020" }] }),
  component: Resumen,
});

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const INDEX_INSIGHTS = {
  priority: ["month", "canton", "province"],
  overviewText:
    "La serie mensual muestra una caída abrupta entre marzo y mayo por el cierre judicial de la pandemia y un rebote en septiembre por el rezago acumulado. En el mapa y en el ranking, Guayas y Pichincha lideran por tamaño poblacional, no por mayor conflicto por persona.",
  details: {
    Marzo: {
      label: "Marzo",
      interpretiveText:
        "La caída empieza aquí: el 16 de marzo se declaró el Estado de Excepción y al día siguiente se suspendieron todas las labores judiciales.",
    },
    Abril: {
      label: "Abril",
      interpretiveText: "Abril de 2020 queda prácticamente detenido por el cierre judicial nacional durante la pandemia.",
    },
    Mayo: {
      label: "Mayo",
      interpretiveText: "Mayo sigue en mínimos, con apenas reanudación parcial de trámites hasta la reapertura progresiva.",
    },
    Junio: {
      label: "Junio",
      interpretiveText: "Junio marca la reactivación progresiva previa a la reapertura total del sistema judicial.",
    },
    Septiembre: {
      label: "Septiembre",
      interpretiveText: "Septiembre concentra el mayor número de divorcios del año porque absorbe los trámites represados durante el confinamiento.",
    },
    Guayas: {
      label: "Guayas",
      interpretiveText: "Guayas concentra más casos porque es la provincia más poblada; eso no implica más divorcios por persona.",
    },
    Pichincha: {
      label: "Pichincha",
      interpretiveText: "Pichincha sigue el mismo patrón de concentración poblacional que Guayas.",
    },
    Azuay: {
      label: "Azuay",
      interpretiveText: "Azuay destaca por una carga relativamente mayor del trámite judicial frente al notarial.",
    },
  },
} satisfies Parameters<typeof InsightPanelProvider>[0]["value"];

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold text-foreground mt-2">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </motion.div>
  );
}

function Resumen() {
  const { filteredData, isLoading, selectedProvince, setSelectedProvince, selectedCanton, setSelectedCanton, selectedMonth, setSelectedMonth } = useFilters();

  if (isLoading || !filteredData) {
    return <div className="h-96 flex items-center justify-center text-muted-foreground">Cargando datos...</div>;
  }

  const mesData = MESES.map((m) => filteredData.mes[m] ?? 0);
  const topProvObj = selectedProvince ? filteredData.canton : filteredData.provincia;
  const topProv = Object.entries(topProvObj).sort((a,b) => b[1] - a[1]).slice(0, 8);
  const areaLabels = Object.keys(filteredData.area);
  const areaVals = Object.values(filteredData.area);

  const urbanoPct = filteredData.total > 0 ? ((filteredData.area.Urbana / filteredData.total) * 100).toFixed(1) : "0";

  return (
    <InsightPanelProvider value={INDEX_INSIGHTS}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Ecuador · INEC</p>
        <h1 className="text-4xl md:text-5xl font-semibold mt-2 text-foreground">
          {selectedProvince ? `Divorcios en ${selectedProvince} (2020)` : "Divorcios registrados en 2020"}
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Exploración interactiva de {filteredData.total.toLocaleString("es-EC")} divorcios inscritos
          {selectedProvince ? ` en la provincia de ${selectedProvince}` : " en Ecuador"}
          {selectedMonth ? ` durante ${selectedMonth} de 2020` : " durante 2020"}.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total de divorcios" value={<AnimatedNumber value={filteredData.total} />} sub="Registrados en 2020" />
        <Stat label="Zona urbana" value={`${urbanoPct}%`} sub={`${(filteredData.area.Urbana || 0).toLocaleString("es-EC")} casos`} />
        <Stat label="Vía notarial" value={<AnimatedNumber value={filteredData.causa["Por mutuo consentimiento vía notarial"] || 0} />} sub="Mutuo acuerdo" />
        <Stat label="Líder (por total)" value={topProv.length > 0 ? topProv[0][0] : "-"} sub={topProv.length > 0 ? `${topProv[0][1].toLocaleString("es-EC")} divorcios` : ""} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard 
          title="Ritmo mensual de inscripciones" 
          description={selectedMonth ? `Filtrado por ${selectedMonth} · Clic para deseleccionar` : "Clic en un mes para filtrar todos los gráficos."}
        >
          <Bar
            data={{
              labels: MESES,
              datasets: [{
                label: "Divorcios inscritos",
                data: mesData,
                backgroundColor: MESES.map((m) =>
                  selectedMonth
                    ? m === selectedMonth
                      ? palette[0]
                      : palette[0] + "44"
                    : palette[0]
                ),
                borderRadius: 6,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              onClick: (_event, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  const clickedMonth = MESES[idx];
                  setSelectedMonth(selectedMonth === clickedMonth ? null : clickedMonth);
                }
              },
              scales: {
                x: { ticks: { font: { size: 11 } } },
              },
            }}
          />
        </ChartCard>

        <ChartCard title="Entorno de residencia" description="Distribución entre zonas urbanas y rurales.">
          <Doughnut
            data={{
              labels: areaLabels,
              datasets: [{
                data: areaVals,
                backgroundColor: [palette[0], palette[1]],
                borderWidth: 0,
              }],
            }}
            options={{ responsive: true, maintainAspectRatio: false, cutout: "60%" }}
          />
        </ChartCard>

        <ChartCard 
          title={selectedProvince ? `Top cantones en ${selectedProvince}` : "Top provincias con más divorcios"} 
          description={selectedProvince ? "Los cantones con mayor número de divorcios." : "Las 8 provincias con mayor número de divorcios registrados."} 
          height={380}
        >
          <Bar
            data={{
              labels: topProv.map(([k]) => k),
              datasets: [{
                label: "Divorcios",
                data: topProv.map(([, v]) => v),
                backgroundColor: topProv.map(([k]) => 
                  selectedProvince 
                    ? (selectedCanton && k !== selectedCanton ? palette[2] + "44" : palette[2]) 
                    : (selectedProvince === k ? palette[2] : palette[2])
                ),
                borderRadius: 6,
              }],
            }}
            options={{
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              onClick: (_event, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  const clickedName = topProv[idx][0];
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

        <ChartCard title="Régimen de bienes" description="Parejas con o sin capitulaciones matrimoniales.">
          <Doughnut
            data={{
              labels: Object.keys(filteredData.capitulaciones),
              datasets: [{
                data: Object.values(filteredData.capitulaciones),
                backgroundColor: [palette[3], palette[4], palette[5]],
                borderWidth: 0,
              }],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </ChartCard>
      </div>
    </motion.div>
    </InsightPanelProvider>
  );
}
