import { createFileRoute } from "@tanstack/react-router";
import { Bar, PolarArea } from "react-chartjs-2";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import data from "@/data/divorcios.json";

export const Route = createFileRoute("/geografia")({
  head: () => ({ meta: [{ title: "Geografía · Divorcios Ecuador 2020" }] }),
  component: Geografia,
});

function Geografia() {
  const prov = Object.entries(data.provincia);
  const top10 = prov.slice(0, 10);
  const bottom10 = [...prov].slice(-10).reverse();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">Distribución geográfica</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Cómo se reparten los divorcios entre las 24 provincias del Ecuador.
        </p>
      </header>

      <ChartCard title="Divorcios por provincia (todas)" description="Ranking completo de las 24 provincias." height={520}>
        <Bar
          data={{
            labels: prov.map(([k]) => k),
            datasets: [{
              label: "Divorcios",
              data: prov.map(([, v]) => v),
              backgroundColor: palette[0],
              borderRadius: 4,
            }],
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

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Provincias con mayor concentración" description="Top 10 en volumen absoluto." height={380}>
          <PolarArea
            data={{
              labels: top10.map(([k]) => k),
              datasets: [{
                data: top10.map(([, v]) => v),
                backgroundColor: top10.map((_, i) => palette[i % palette.length] + "cc"),
                borderWidth: 1,
              }],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </ChartCard>

        <ChartCard title="Provincias con menor volumen" description="Las 10 provincias con menos divorcios registrados." height={380}>
          <Bar
            data={{
              labels: bottom10.map(([k]) => k),
              datasets: [{
                label: "Divorcios",
                data: bottom10.map(([, v]) => v),
                backgroundColor: palette[1],
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
      </div>
    </div>
  );
}
