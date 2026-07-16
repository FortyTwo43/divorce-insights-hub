import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
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
const DATOS_REALES: Record<string, { casos: number; nota: string; tipo: "baja" | "rebote" | "normal" }> = {
  Enero:      { casos: 888,   nota: "Inicio del año con ritmo normal.",                                         tipo: "normal" },
  Febrero:    { casos: 818,   nota: "Mes corto, volumen estable previo a la pandemia.",                         tipo: "normal" },
  Marzo:      { casos: 399,   nota: "El 16 de marzo se declaró el Estado de Excepción (Decreto 1017). Al día siguiente se suspendieron todas las labores judiciales y notariales.", tipo: "baja" },
  Abril:      { casos: 1,     nota: "Prácticamente paralizado: solo 1 divorcio inscrito en todo el mes. Cierre total de juzgados y notarías por cuarentena obligatoria.", tipo: "baja" },
  Mayo:       { casos: 18,    nota: "Solo 18 inscripciones. La Resolución 031-2020 del Consejo de la Judicatura suspendió términos procesales y la Resolución 057-2020 mantuvo las restricciones.", tipo: "baja" },
  Junio:      { casos: 445,   nota: "Inicio de reactivación progresiva del sistema judicial.",                  tipo: "normal" },
  Julio:      { casos: 748,   nota: "Recuperación parcial conforme se habilitan más juzgados.",                 tipo: "normal" },
  Agosto:     { casos: 1204,  nota: "Aceleración visible a medida que se procesan casos represados.",           tipo: "normal" },
  Septiembre: { casos: 1671,  nota: "Máximo del año: absorbe el rezago acumulado durante el confinamiento. El sistema judicial procesa las solicitudes que no pudieron tramitarse entre abril y junio.", tipo: "rebote" },
  Octubre:    { casos: 1385,  nota: "Volumen alto, todavía por encima del promedio normal.",                    tipo: "normal" },
  Noviembre:  { casos: 1099,  nota: "Descenso gradual conforme se depura el rezago acumulado.",                 tipo: "normal" },
  Diciembre:  { casos: 652,   nota: "Fin de año con ritmo normalizado.",                                        tipo: "normal" },
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

/* ───────────── Icon SVG components (no emojis) ───────────── */
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
    </svg>
  );
}
function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}
function IconTrend({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
    </svg>
  );
}

function getMonthIcon(tipo: "baja" | "rebote" | "normal") {
  if (tipo === "baja") return <IconAlert className="w-5 h-5" />;
  if (tipo === "rebote") return <IconTrend className="w-5 h-5" />;
  return <IconCalendar className="w-5 h-5" />;
}

function MonthContextCard({ month, count }: { month: string; count: number }) {
  const info = DATOS_REALES[month];
  if (!info) return null;
  const colorMap = {
    baja: { card: "bg-rose-50 border-rose-200", icon: "text-rose-600", num: "text-rose-700", txt: "text-rose-800" },
    rebote: { card: "bg-emerald-50 border-emerald-200", icon: "text-emerald-600", num: "text-emerald-700", txt: "text-emerald-800" },
    normal: { card: "bg-card border-border", icon: "text-primary", num: "text-foreground", txt: "text-muted-foreground" },
  };
  const c = colorMap[info.tipo];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={`rounded-xl border overflow-hidden ${c.card}`}
    >
      {/* Header — datos del dataset */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b ${
        info.tipo === "baja" ? "border-rose-200 bg-rose-100/50"
        : info.tipo === "rebote" ? "border-emerald-200 bg-emerald-100/50"
        : "border-border bg-secondary/30"
      }`}>
        <div className={`shrink-0 ${c.icon}`}>
          {getMonthIcon(info.tipo)}
        </div>
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className={`text-2xl font-bold tabular-nums leading-none ${c.num}`}>
            {count.toLocaleString("es-EC")}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">
            divorcios en {month} de 2020
          </span>
        </div>
      </div>
      {/* Body — nota contextual corta */}
      <div className="px-4 py-3">
        <p className={`text-sm leading-relaxed ${c.txt}`}>
          {info.nota}
        </p>
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
  const { filteredData, getAggregatesExcluding, isLoading, selectedProvince, setSelectedProvince, selectedCanton, setSelectedCanton, selectedMonth, setSelectedMonth } = useFilters();

  const aggSinMes = useMemo(() => getAggregatesExcluding(["month"]), [getAggregatesExcluding]);
  const aggGeo = useMemo(() => {
    return selectedProvince ? getAggregatesExcluding(["canton"]) : getAggregatesExcluding(["province"]);
  }, [getAggregatesExcluding, selectedProvince]);

  if (isLoading || !filteredData || !aggSinMes || !aggGeo) {
    return <div className="h-96 flex items-center justify-center text-muted-foreground">Cargando datos...</div>;
  }

  // Datos del dataset por mes — ignora el filtro de mes para que el gráfico no se vacíe al seleccionar uno
  const mesData = MESES.map((m) => aggSinMes.mes[m] ?? 0);

  // Top 8 provincias o cantones — ignora el filtro respectivo
  const topProvObj = selectedProvince ? aggGeo.canton : aggGeo.provincia;
  const topProv = Object.entries(topProvObj).sort((a,b) => b[1] - a[1]).slice(0, 8);

  // Urbano/Rural — orden fijo: siempre Urbana primero, Rural segundo
  const urbanaCount = filteredData.area["Urbana"] ?? 0;
  const ruralCount = filteredData.area["Rural"] ?? 0;
  const urbanoPct = filteredData.total > 0 ? ((urbanaCount / filteredData.total) * 100).toFixed(1) : "0";

  const showPandemiaNote = !selectedMonth;

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
        <Stat label="Zona urbana" value={`${urbanoPct}%`} sub={`${urbanaCount.toLocaleString("es-EC")} casos`} />
        <Stat label="Vía notarial" value={<AnimatedNumber value={filteredData.causa["Por mutuo consentimiento vía notarial"] || 0} />} sub="Mutuo acuerdo" />
        <Stat label="Líder (por total)" value={topProv.length > 0 ? topProv[0][0] : "-"} sub={topProv.length > 0 ? `${topProv[0][1].toLocaleString("es-EC")} divorcios` : ""} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de meses con contexto pandemia */}
        <div className="space-y-3">
          {/* Nota del decreto — siempre visible encima del gráfico */}
          {showPandemiaNote && (
            <ContextNote title="Impacto del Decreto 1017 (16 marzo 2020):" variant="warning">
              El Presidente declaró Estado de Excepción por la pandemia. Al día siguiente se suspendieron todas las labores judiciales y notariales.{" "}
              <span className="font-semibold">Resolución 031-2020</span> del Consejo de la Judicatura suspendió términos procesales.{" "}
              <span className="font-semibold">Resolución 057-2020</span> extendió las restricciones hasta junio.
              El resultado: de 888 casos en enero, solo <span className="font-semibold text-rose-700">1 caso en abril</span> y{" "}
              <span className="font-semibold text-rose-700">18 en mayo</span>. El rebote llegó en septiembre con{" "}
              <span className="font-semibold text-emerald-700">1.671 casos</span>.
            </ContextNote>
          )}

          {/* Tarjeta contextual del mes seleccionado — número del dataset + nota editorial */}
          <AnimatePresence mode="wait">
            {selectedMonth && (
              <MonthContextCard
                key={selectedMonth}
                month={selectedMonth}
                count={filteredData.mes[selectedMonth] ?? 0}
              />
            )}
          </AnimatePresence>

          <ChartCard 
            title="Ritmo mensual de inscripciones" 
            description={selectedMonth ? `${selectedMonth} seleccionado · Clic para deseleccionar` : "Clic en un mes para ver su dato y contexto."}
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

        {/* Gráfico donut Urbana/Rural — orden fijo para que los colores no cambien */}
        <ChartCard title="Entorno de residencia" description="Distribución entre zonas urbanas y rurales.">
          <Doughnut
            key="area-donut"
            data={{
              labels: ["Urbana", "Rural"],
              datasets: [{
                data: [urbanaCount, ruralCount],
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
                      : palette[2]
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
            <ContextNote variant="info">
              <span className="font-semibold">Guayas y Pichincha</span> lideran por{" "}
              <span className="font-semibold">concentración poblacional</span>, no por mayor tasa de divorcio.
              Son las dos provincias más habitadas del Ecuador. El mismo patrón ocurre en cualquier trámite civil.
            </ContextNote>
          )}
        </div>

        <ChartCard title="Régimen de bienes" description="Parejas con o sin capitulaciones matrimoniales.">
          <Doughnut
            key="capitulaciones-donut"
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
