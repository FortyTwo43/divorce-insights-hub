import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, Radar, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import { useFilters } from "@/contexts/FilterContext";

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

type Sexo = "ambos" | "hombres" | "mujeres";
type Escala = "lineal" | "log";

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
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            value === o.value
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

function Demografia() {
  const [sexo, setSexo] = useState<Sexo>("ambos");
  const [escala, setEscala] = useState<Escala>("log");
  const [incluirSinHijos, setIncluirSinHijos] = useState(true);
  const { filteredData, isLoading, selectedProvince } = useFilters();

  if (isLoading || !filteredData) {
    return <div className="h-96 flex items-center justify-center text-muted-foreground">Cargando datos...</div>;
  }

  const edadH = EDAD_ORDER.map((k) => filteredData.edad_h[k] ?? 0);
  const edadM = EDAD_ORDER.map((k) => filteredData.edad_m[k] ?? 0);
  const nivelH = NIVEL_ORDER.map((k) => filteredData.nivel_h[k] ?? 0);
  const nivelM = NIVEL_ORDER.map((k) => filteredData.nivel_m[k] ?? 0);

  const edadDatasets = [
    sexo !== "mujeres" && {
      label: "Hombres",
      data: edadH,
      backgroundColor: palette[0],
      borderRadius: 6,
    },
    sexo !== "hombres" && {
      label: "Mujeres",
      data: edadM,
      backgroundColor: palette[1],
      borderRadius: 6,
    },
  ].filter(Boolean) as { label: string; data: number[]; backgroundColor: string; borderRadius: number }[];

  const nivelDatasets = [
    sexo !== "mujeres" && {
      label: "Hombres",
      data: nivelH,
      borderColor: palette[0],
      backgroundColor: palette[0] + "40",
      pointBackgroundColor: palette[0],
    },
    sexo !== "hombres" && {
      label: "Mujeres",
      data: nivelM,
      borderColor: palette[1],
      backgroundColor: palette[1] + "40",
      pointBackgroundColor: palette[1],
    },
  ].filter(Boolean) as never[];

  const etnia = Object.entries(filteredData.etnia).sort((a, b) => b[1] - a[1]);

  const hijosOrdered = Object.entries(filteredData.hijos)
    .filter(([k]) => k !== "99")
    .filter(([k]) => incluirSinHijos || k !== "0")
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  const sexoOpts: { value: Sexo; label: string }[] = [
    { value: "ambos", label: "Ambos" },
    { value: "hombres", label: "Hombres" },
    { value: "mujeres", label: "Mujeres" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
          {selectedProvince ? `Perfil demográfico en ${selectedProvince}` : "Perfil demográfico"}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Edad, educación, autoidentificación étnica y número de hijos de las personas divorciadas.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Mostrar:</span>
        <Chips value={sexo} onChange={setSexo} options={sexoOpts} />
      </div>

      <ChartCard
        title="Edad al momento del divorcio"
        description="Comparativo por rangos de edad · usa el filtro superior para cambiar."
        height={380}
      >
        <Bar
          key={`edad-${sexo}`}
          data={{ labels: EDAD_ORDER.map((k) => EDAD_LABEL[k]), datasets: edadDatasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
          }}
        />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Nivel educativo alcanzado"
          description="Comparativo del nivel de instrucción."
          height={420}
        >
          <Radar
            key={`nivel-${sexo}`}
            data={{ labels: NIVEL_ORDER, datasets: nivelDatasets }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </ChartCard>

        <ChartCard
          title="Autoidentificación étnica"
          description="Distribución declarada por las personas divorciadas."
          height={420}
        >
          <Doughnut
            data={{
              labels: etnia.map(([k]) => k),
              datasets: [
                {
                  data: etnia.map(([, v]) => v),
                  backgroundColor: palette,
                  borderWidth: 0,
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false, cutout: "55%" }}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Hijos en común procreados"
        description="Número de hijos declarados por las parejas."
      >
        <div className="flex flex-wrap gap-3 mb-4">
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
        <div style={{ height: 300 }}>
          <Bar
            key={`hijos-${escala}-${incluirSinHijos}`}
            data={{
              labels: hijosOrdered.map(([k]) => (k === "0" ? "Sin hijos" : `${k} hijo${k === "1" ? "" : "s"}`)),
              datasets: [
                {
                  label: "Parejas",
                  data: hijosOrdered.map(([, v]) => v),
                  backgroundColor: palette[2],
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: escala === "log" ? { y: { type: "logarithmic" } } : { y: { beginAtZero: true } },
            }}
          />
        </div>
      </ChartCard>
    </motion.div>
  );
}
