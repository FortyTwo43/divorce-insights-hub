import { createFileRoute } from "@tanstack/react-router";
import { Bar, Radar, Doughnut } from "react-chartjs-2";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import data from "@/data/divorcios.json";

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

function Demografia() {
  const edadH = EDAD_ORDER.map((k) => (data.edad_h as Record<string, number>)[k] ?? 0);
  const edadM = EDAD_ORDER.map((k) => (data.edad_m as Record<string, number>)[k] ?? 0);

  const nivelH = NIVEL_ORDER.map((k) => (data.nivel_h as Record<string, number>)[k] ?? 0);
  const nivelM = NIVEL_ORDER.map((k) => (data.nivel_m as Record<string, number>)[k] ?? 0);

  const etnia = Object.entries(data.etnia).sort((a, b) => b[1] - a[1]);

  const hijosOrdered = Object.entries(data.hijos)
    .filter(([k]) => k !== "99")
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">Perfil demográfico</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Edad, educación, autoidentificación étnica y número de hijos de las personas divorciadas.
        </p>
      </header>

      <ChartCard title="Edad al momento del divorcio · Hombres vs Mujeres" description="Comparativo por rangos de edad." height={380}>
        <Bar
          data={{
            labels: EDAD_ORDER.map((k) => EDAD_LABEL[k]),
            datasets: [
              { label: "Hombres", data: edadH, backgroundColor: palette[0], borderRadius: 6 },
              { label: "Mujeres", data: edadM, backgroundColor: palette[1], borderRadius: 6 },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
          }}
        />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Nivel educativo alcanzado" description="Comparativo del nivel de instrucción de ambos cónyuges." height={420}>
          <Radar
            data={{
              labels: NIVEL_ORDER,
              datasets: [
                {
                  label: "Hombres",
                  data: nivelH,
                  borderColor: palette[0],
                  backgroundColor: palette[0] + "40",
                  pointBackgroundColor: palette[0],
                },
                {
                  label: "Mujeres",
                  data: nivelM,
                  borderColor: palette[1],
                  backgroundColor: palette[1] + "40",
                  pointBackgroundColor: palette[1],
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </ChartCard>

        <ChartCard title="Autoidentificación étnica" description="Distribución declarada por las personas divorciadas." height={420}>
          <Doughnut
            data={{
              labels: etnia.map(([k]) => k),
              datasets: [{
                data: etnia.map(([, v]) => v),
                backgroundColor: palette,
                borderWidth: 0,
              }],
            }}
            options={{ responsive: true, maintainAspectRatio: false, cutout: "55%" }}
          />
        </ChartCard>
      </div>

      <ChartCard title="Hijos en común procreados" description="Número de hijos declarados por las parejas al momento del divorcio.">
        <Bar
          data={{
            labels: hijosOrdered.map(([k]) => (k === "0" ? "Sin hijos" : `${k} hijo${k === "1" ? "" : "s"}`)),
            datasets: [{
              label: "Parejas",
              data: hijosOrdered.map(([, v]) => v),
              backgroundColor: palette[2],
              borderRadius: 6,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { type: "logarithmic" } },
          }}
        />
      </ChartCard>
    </div>
  );
}
