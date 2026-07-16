import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, Radar, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import "@/lib/chart-setup";
import { palette } from "@/lib/chart-setup";
import { ChartCard } from "@/components/ChartCard";
import { useFilters, SexFocus } from "@/contexts/FilterContext";
import { InsightPanelProvider } from "@/contexts/InsightPanelContext";

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

const DEMOGRAFIA_INSIGHTS = {
  priority: ["age", "education", "ethnicity", "children"],
  overviewText:
    "La estructura demográfica se concentra en edades medias, educación media/bachillerato, residencia urbana y autoidentificación mestiza. El panel permite revisar cada dimensión sin perder el contexto general.",
  details: {
    "<25": { label: "Menos de 25", interpretiveText: "Rango muy temprano dentro de la trayectoria marital." },
    "25-34": { label: "25 a 34", interpretiveText: "Edad de divorcio relativamente temprana dentro de la serie." },
    "35-44": { label: "35 a 44", interpretiveText: "Tramo central de la distribución por edad." },
    "45-54": { label: "45 a 54", interpretiveText: "Edad madura, todavía muy representada en la serie." },
    "55-64": { label: "55 a 64", interpretiveText: "Grupo de trayectorias matrimoniales más largas." },
    "65+": { label: "65 o más", interpretiveText: "Casos menos frecuentes pero aún presentes en la distribución." },
    Ninguno: { label: "Sin nivel educativo", interpretiveText: "Casos sin nivel educativo declarado." },
    Primaria: { label: "Primaria", interpretiveText: "Nivel básico con peso relevante en la serie." },
    "Educación básica": { label: "Educación básica", interpretiveText: "Nivel intermedio de instrucción." },
    Secundaria: { label: "Secundaria", interpretiveText: "Tramo importante dentro del perfil educativo." },
    "Educación media / Bachillerato": { label: "Bachillerato", interpretiveText: "Nivel más frecuente en la serie." },
    "Superior no Universitario": { label: "Superior no universitario", interpretiveText: "Formación técnica o terciaria no universitaria." },
    "Superior Universitario": { label: "Superior universitario", interpretiveText: "Nivel universitario con presencia alta en la serie." },
    Posgrado: { label: "Posgrado", interpretiveText: "Nivel de posgrado, menos frecuente pero visible." },
    Indigena: { label: "Indígena", interpretiveText: "Autoidentificación minoritaria dentro del total nacional." },
    Mestiza: { label: "Mestiza", interpretiveText: "Categoría dominante, consistente con la composición del país." },
    Montubia: { label: "Montubia", interpretiveText: "Presencia menor, pero relevante en el registro." },
    Blanca: { label: "Blanca", interpretiveText: "Grupo minoritario dentro del conjunto." },
    Mulata: { label: "Mulata", interpretiveText: "Grupo minoritario en la serie." },
    Negra: { label: "Negra", interpretiveText: "Autoidentificación poco frecuente en el total." },
    "Afroecuatoriana /afrodescendiente": { label: "Afroecuatoriana", interpretiveText: "Categoría minoritaria en la distribución." },
    Otro: { label: "Otro", interpretiveText: "Categoría residual de autoidentificación." },
    "Sin Información": { label: "Sin información", interpretiveText: "Registro sin dato de autoidentificación." },
    "0": { label: "Sin hijos", interpretiveText: "La mayoría de parejas no reporta hijos a cargo." },
    "1": { label: "1 hijo", interpretiveText: "Casos con un hijo a cargo." },
    "2": { label: "2 hijos", interpretiveText: "Casos con dos hijos a cargo." },
    "3": { label: "3 hijos", interpretiveText: "Casos con tres hijos a cargo." },
    "4": { label: "4 hijos", interpretiveText: "Casos con cuatro hijos a cargo." },
  },
} satisfies Parameters<typeof InsightPanelProvider>[0]["value"];

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
  const [escala, setEscala] = useState<Escala>("log");
  const [incluirSinHijos, setIncluirSinHijos] = useState(true);
  
  const { 
    filteredData, isLoading, selectedProvince, 
    selectedSexFocus, setSelectedSexFocus,
    selectedAge, setSelectedAge,
    selectedEdu, setSelectedEdu,
    selectedEthnicity, setSelectedEthnicity,
    selectedChildren, setSelectedChildren
  } = useFilters();

  if (isLoading || !filteredData) {
    return <div className="h-96 flex items-center justify-center text-muted-foreground">Cargando datos...</div>;
  }

  const edadH = EDAD_ORDER.map((k) => filteredData.edad_h[k] ?? 0);
  const edadM = EDAD_ORDER.map((k) => filteredData.edad_m[k] ?? 0);
  const nivelH = NIVEL_ORDER.map((k) => filteredData.nivel_h[k] ?? 0);
  const nivelM = NIVEL_ORDER.map((k) => filteredData.nivel_m[k] ?? 0);

  const isSexHombres = selectedSexFocus !== "mujeres";
  const isSexMujeres = selectedSexFocus !== "hombres";

  const edadDatasets = [
    isSexHombres && {
      label: "Hombres",
      data: edadH,
      backgroundColor: EDAD_ORDER.map(k => 
        selectedAge ? (k === selectedAge ? palette[0] : palette[0] + "44") : palette[0]
      ),
      borderRadius: 6,
    },
    isSexMujeres && {
      label: "Mujeres",
      data: edadM,
      backgroundColor: EDAD_ORDER.map(k => 
        selectedAge ? (k === selectedAge ? palette[1] : palette[1] + "44") : palette[1]
      ),
      borderRadius: 6,
    },
  ].filter(Boolean) as { label: string; data: number[]; backgroundColor: string[]; borderRadius: number }[];

  const nivelDatasets = [
    isSexHombres && {
      label: "Hombres",
      data: nivelH,
      borderColor: palette[0],
      backgroundColor: palette[0] + "40",
      pointBackgroundColor: NIVEL_ORDER.map(k => 
        selectedEdu ? (k === selectedEdu ? palette[0] : palette[0] + "44") : palette[0]
      ),
      pointRadius: NIVEL_ORDER.map(k => k === selectedEdu ? 6 : 4),
    },
    isSexMujeres && {
      label: "Mujeres",
      data: nivelM,
      borderColor: palette[1],
      backgroundColor: palette[1] + "40",
      pointBackgroundColor: NIVEL_ORDER.map(k => 
        selectedEdu ? (k === selectedEdu ? palette[1] : palette[1] + "44") : palette[1]
      ),
      pointRadius: NIVEL_ORDER.map(k => k === selectedEdu ? 6 : 4),
    },
  ].filter(Boolean) as never[];

  const etnia = Object.entries(filteredData.etnia).sort((a, b) => b[1] - a[1]);

  const hijosOrdered = Object.entries(filteredData.hijos)
    .filter(([k]) => k !== "99")
    .filter(([k]) => incluirSinHijos || k !== "0")
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  const sexoOpts: { value: SexFocus; label: string }[] = [
    { value: "ambos", label: "Ambos" },
    { value: "hombres", label: "Hombres" },
    { value: "mujeres", label: "Mujeres" },
  ];

  return (
    <InsightPanelProvider value={DEMOGRAFIA_INSIGHTS}>
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
        <Chips value={selectedSexFocus} onChange={setSelectedSexFocus} options={sexoOpts} />
      </div>

      <ChartCard
        title="Edad al momento del divorcio"
        description="Comparativo por rangos de edad · usa el filtro superior para cambiar."
        height={380}
      >
        <Bar
          data={{ labels: EDAD_ORDER.map((k) => EDAD_LABEL[k]), datasets: edadDatasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            onClick: (_event, elements) => {
              if (elements.length > 0) {
                const idx = elements[0].index;
                const clickedAge = EDAD_ORDER[idx];
                setSelectedAge(selectedAge === clickedAge ? null : clickedAge);
              }
            },
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
            data={{ labels: NIVEL_ORDER, datasets: nivelDatasets }}
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              onClick: (_event, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  const clickedEdu = NIVEL_ORDER[idx];
                  setSelectedEdu(selectedEdu === clickedEdu ? null : clickedEdu);
                }
              },
            }}
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
                  backgroundColor: etnia.map(([k], i) => 
                    selectedEthnicity 
                      ? k === selectedEthnicity ? palette[i % palette.length] : palette[i % palette.length] + "44"
                      : palette[i % palette.length]
                  ),
                  borderWidth: 0,
                },
              ],
            }}
            options={{ 
              responsive: true, 
              maintainAspectRatio: false, 
              cutout: "55%",
              onClick: (_event, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  const clickedEtnia = etnia[idx][0];
                  setSelectedEthnicity(selectedEthnicity === clickedEtnia ? null : clickedEtnia);
                }
              },
            }}
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
                  backgroundColor: hijosOrdered.map(([k]) => 
                    selectedChildren 
                      ? k === selectedChildren ? palette[2] : palette[2] + "44"
                      : palette[2]
                  ),
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: escala === "log" ? { y: { type: "logarithmic" } } : { y: { beginAtZero: true } },
              onClick: (_event, elements) => {
                if (elements.length > 0) {
                  const idx = elements[0].index;
                  const clickedChild = hijosOrdered[idx][0];
                  setSelectedChildren(selectedChildren === clickedChild ? null : clickedChild);
                }
              },
            }}
          />
        </div>
      </ChartCard>
    </motion.div>
    </InsightPanelProvider>
  );
}
