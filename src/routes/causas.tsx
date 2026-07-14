import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import data from "@/data/divorcios.json";

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

function Causas() {
  const [topN, setTopN] = useState(5);
  const [excluirSinInfo, setExcluirSinInfo] = useState(true);

  const causas = useMemo(() => {
    const entries = Object.entries(data.causa).sort((a, b) => b[1] - a[1]);
    return excluirSinInfo ? entries.filter(([k]) => k !== "Sin Información") : entries;
  }, [excluirSinInfo]);

  const top = causas.slice(0, topN);
  const otros = causas.slice(topN).reduce((s, [, v]) => s + v, 0);

  const durVals = DUR_ORDER.map((k) => (data.duracion as Record<string, number>)[k] ?? 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">Causas del divorcio y duración del matrimonio</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Motivos legales invocados y cuánto duraron los matrimonios antes de disolverse.
        </p>
      </header>

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
          Excluir “Sin información”
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Motivos legales del divorcio" description="Ranking completo de las causales invocadas." height={440}>
          <Bar
            key={`causas-${excluirSinInfo}`}
            data={{
              labels: causas.map(([k]) => CAUSA_CORTA[k] ?? k),
              datasets: [
                {
                  label: "Casos",
                  data: causas.map(([, v]) => v),
                  backgroundColor: palette[4],
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
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
                  backgroundColor: palette.slice(0, top.length + 1),
                  borderWidth: 0,
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </ChartCard>
      </div>

      <ChartCard title="Años transcurridos hasta el divorcio" description="Duración del matrimonio al momento de disolverse." height={360}>
        <Line
          data={{
            labels: DUR_ORDER.map((k) => DUR_LABELS[k]),
            datasets: [
              {
                label: "Divorcios",
                data: durVals,
                borderColor: palette[0],
                backgroundColor: palette[0] + "33",
                fill: true,
                tension: 0.35,
                pointRadius: 5,
                pointBackgroundColor: palette[0],
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </ChartCard>
    </div>
  );
}
