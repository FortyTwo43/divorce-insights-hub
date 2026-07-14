import { createFileRoute } from "@tanstack/react-router";
import { Bar, Doughnut } from "react-chartjs-2";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import data from "@/data/divorcios.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Resumen · Divorcios Ecuador 2020" }] }),
  component: Resumen,
});

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-3xl font-semibold text-foreground mt-2">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function Resumen() {
  const mesData = MESES.map((m) => (data.mes as Record<string, number>)[m] ?? 0);
  const areaLabels = Object.keys(data.area);
  const areaVals = Object.values(data.area);

  const topProv = Object.entries(data.provincia).slice(0, 8);
  const urbanoPct = ((data.area.Urbana / data.total) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">Ecuador · INEC</p>
        <h1 className="text-4xl md:text-5xl font-semibold mt-2 text-foreground">Divorcios registrados en 2020</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Exploración interactiva de {data.total.toLocaleString("es-EC")} divorcios inscritos en Ecuador durante 2020. Navega entre las secciones para descubrir patrones geográficos, causas y perfiles demográficos.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total de divorcios" value={data.total.toLocaleString("es-EC")} sub="Registrados en 2020" />
        <Stat label="Zona urbana" value={`${urbanoPct}%`} sub={`${data.area.Urbana.toLocaleString("es-EC")} casos`} />
        <Stat label="Vía notarial" value={data.causa["Por mutuo consentimiento vía notarial"].toLocaleString("es-EC")} sub="Mutuo acuerdo" />
        <Stat label="Provincia líder" value="Guayas" sub={`${data.provincia.Guayas.toLocaleString("es-EC")} divorcios`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Ritmo mensual de inscripciones" description="Cuándo se registraron los divorcios durante 2020.">
          <Bar
            data={{
              labels: MESES,
              datasets: [{
                label: "Divorcios inscritos",
                data: mesData,
                backgroundColor: palette[0],
                borderRadius: 6,
              }],
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
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

        <ChartCard title="Top provincias con más divorcios" description="Las 8 provincias con mayor número de divorcios registrados." height={380}>
          <Bar
            data={{
              labels: topProv.map(([k]) => k),
              datasets: [{
                label: "Divorcios",
                data: topProv.map(([, v]) => v),
                backgroundColor: palette[2],
                borderRadius: 6,
              }],
            }}
            options={{
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            }}
          />
        </ChartCard>

        <ChartCard title="Régimen de bienes" description="Parejas con o sin capitulaciones matrimoniales.">
          <Doughnut
            data={{
              labels: Object.keys(data.capitulaciones),
              datasets: [{
                data: Object.values(data.capitulaciones),
                backgroundColor: [palette[3], palette[4], palette[5]],
                borderWidth: 0,
              }],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
