import { createFileRoute } from "@tanstack/react-router";
import { Bar, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import { useFilters } from "@/contexts/FilterContext";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { InsightPanelProvider } from "@/contexts/InsightPanelContext";
import { ContextNote } from "@/components/ContextNote";

export const Route = createFileRoute("/")(  {
  head: () => ({ meta: [{ title: "Resumen · Divorcios Ecuador 2020" }] }),
  component: Resumen,
});

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// Datos reales de casos por mes — pandemia 2020
const DATOS_REALES: Record<string, { casos: number; nota: string; icono: string; tipo: "baja" | "rebote" | "normal" }> = {
  Enero:   { casos: 888,   nota: "Inicio del año con ritmo normal.",                                         icono: "📅", tipo: "normal" },
  Febrero: { casos: 818,   nota: "Mes corto, volumen estable previo a la pandemia.",                         icono: "📅", tipo: "normal" },
  Marzo:   { casos: 399,   nota: "El 16 de marzo se declaró el Estado de Excepción (Decreto 1017). Al día siguiente se suspendieron todas las labores judiciales y notariales.", icono: "🔴", tipo: "baja" },
  Abril:   { casos: 1,     nota: "Prácticamente paralizado: solo 1 divorcio inscrito en todo el mes. Cierre total de juzgados y notarías por cuarentena obligatoria.",           icono: "🔴", tipo: "baja" },
  Mayo:    { casos: 18,    nota: "Solo 18 inscripciones. La Resolución 031-2020 del Consejo de la Judicatura suspendió términos procesales y la Resolución 057-2020 mantuvo las restricciones.", icono: "🔴", tipo: "baja" },
  Junio:   { casos: 445,   nota: "Inicio de reactivación progresiva del sistema judicial.",                  icono: "🟡", tipo: "normal" },
  Julio:   { casos: 748,   nota: "Recuperación parcial conforme se habilitan más juzgados.",                 icono: "📅", tipo: "normal" },
  Agosto:  { casos: 1204,  nota: "Aceleración visible a medida que se procesan casos represados.",           icono: "📅", tipo: "normal" },
  Septiembre: { casos: 1671, nota: "Máximo del año: absorbe el rezago acumulado durante el confinamiento. El sistema judicial procesa las solicitudes que no pudieron tramitarse entre abril y junio.", icono: "📈", tipo: "rebote" },
  Octubre: { casos: 1385,  nota: "Volumen alto, todavía por encima del promedio normal.",                    icono: "📅", tipo: "normal" },
  Noviembre:{ casos: 1099, nota: "Descenso gradual conforme se depura el rezago acumulado.",                 icono: "📅", tipo: "normal" },
  Diciembre:{ casos: 652,  nota: "Fin de año con ritmo normalizado.",                                        icono: "📅", tipo: "normal" },
};

const INDEX_INSIGHTS = {
  priority: ["month", "canton", "province"] as const,
  overviewText:
    "La serie mensual muestra una caída abrupta entre marzo y mayo por el cierre judicial de la pandemia y un rebote en septiembre por el rezago acumulado. En el mapa y en el ranking, Guayas y Pichincha lideran por tamaño poblacional, no por mayor conflicto por persona.",
  details: {
    Marzo: {
      label: "Marzo (399 casos)",
      interpretiveText:
        "El 16 de marzo se declaró el Estado de Excepción (Decreto 1017). Al día siguiente se suspendieron todas las labores judiciales — de 888 casos en enero a 399 en marzo, la caída es inmediata.",
    },
    Abril: {
      label: "Abril (1 caso)",
      interpretiveText: "Solo 1 divorcio en todo el mes. Cuarentena obligatoria, juzgados y notarías completamente cerrados. El mínimo histórico del año.",
    },
    Mayo: {
      label: "Mayo (18 casos)",
      interpretiveText: "18 inscripciones. La Resolución 031-2020 del Consejo de la Judicatura suspendió términos procesales. La 057-2020 mantuvo las restricciones hasta la reapertura progresiva.",
    },
    Junio: {
      label: "Junio (445 casos)",
      interpretiveText: "Junio marca la reactivación progresiva previa a la reapertura total del sistema judicial.",
    },
    Septiembre: {
      label: "Septiembre (1.671 casos)",
      interpretiveText: "Máximo del año. Absorbe los trámites represados entre abril y junio: 1.671 divorcios en un solo mes, casi el doble del ritmo normal pre-pandemia.",
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

const PANDEMIA_MESES = new Set(["Marzo", "Abril", "Mayo"]);

function MonthContextCard({ month }: { month: string }) {
  const info = DATOS_REALES[month];
  if (!info) return null;
  const colorMap = {
    baja: "bg-rose-50 border-rose-200",
    rebote: "bg-emerald-50 border-emerald-200",
    normal: "bg-secondary/40 border-border",
  };
  const textMap = {
    baja: "text-rose-800",
    rebote: "text-emerald-800",
    normal: "text-foreground",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={`rounded-xl border px-4 py-3.5 ${colorMap[info.tipo]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 leading-6">{info.icono}</span>
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={`text-2xl font-bold tabular-nums ${textMap[info.tipo]}`}>
              {info.casos.toLocaleString("es-EC")}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              divorcios en {month} de 2020
            </span>
          </div>
          <p className={`mt-1.5 text-sm leading-relaxed ${textMap[info.tipo]}`}>
            {info.nota}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

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

  const showPandemiaNote = !selectedMonth || PANDEMIA_MESES.has(selectedMonth);

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
        {/* Gráfico de meses con contexto pandemia */}
        <div className="space-y-3">
          {/* Nota del decreto — siempre visible encima del gráfico */}
          {showPandemiaNote && (
            <ContextNote icon="🏛️" title="Impacto del Decreto 1017 (16 marzo 2020):">
              El Presidente declaró Estado de Excepción por la pandemia. Al día siguiente se suspendieron todas las labores judiciales y notariales.{" "}
              <span className="font-semibold">Resolución 031-2020</span> del Consejo de la Judicatura suspendió términos procesales.{" "}
              <span className="font-semibold">Resolución 057-2020</span> extendió las restricciones hasta junio.
              El resultado: de 888 casos en enero, solo <span className="font-semibold text-rose-700">1 caso en abril</span> y{" "}
              <span className="font-semibold text-rose-700">18 en mayo</span>. El rebote llegó en septiembre con{" "}
              <span className="font-semibold text-emerald-700">1.671 casos</span>.
            </ContextNote>
          )}

          {/* Tarjeta contextual del mes seleccionado */}
          <AnimatePresence mode="wait">
            {selectedMonth && (
              <MonthContextCard key={selectedMonth} month={selectedMonth} />
            )}
          </AnimatePresence>

          <ChartCard 
            title="Ritmo mensual de inscripciones" 
            description={selectedMonth ? `Filtrado por ${selectedMonth} · Clic para deseleccionar` : "Clic en un mes para ver el contexto completo."}
          >
            <Bar
              data={{
                labels: MESES,
                datasets: [{
                  label: "Divorcios inscritos",
                  data: mesData,
                  backgroundColor: MESES.map((m) => {
                    if (selectedMonth) {
                      return m === selectedMonth ? palette[0] : palette[0] + "44";
                    }
                    // Colorear meses pandemia en rojo, septiembre en verde
                    if (PANDEMIA_MESES.has(m)) return "#e05050";
                    if (m === "Septiembre") return "#3faa82";
                    return palette[0];
                  }),
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

          {/* Leyenda de colores del gráfico */}
          {!selectedMonth && (
            <div className="flex flex-wrap gap-4 px-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#e05050] inline-block" /> Mar–May: cierre pandemia</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#3faa82] inline-block" /> Sep: rebote máximo</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: palette[0] }} /> Resto del año</span>
            </div>
          )}
        </div>

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

        {/* Mapa de provincias con nota contextual */}
        <div className="space-y-3">
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
          {!selectedProvince && (
            <ContextNote icon="📍" variant="info">
              <span className="font-semibold">Guayas y Pichincha</span> lideran por{" "}
              <span className="font-semibold">concentración poblacional</span>, no por mayor tasa de divorcio.
              Son las dos provincias más habitadas del Ecuador. El mismo patrón ocurre en cualquier trámite civil.
            </ContextNote>
          )}
        </div>

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
