import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import Papa from "papaparse";
import csvRaw from "@/data/inec_divorcios_2020_limpio.csv?raw";

type DivorceRecord = Record<string, string>;

export interface AggregatedData {
  total: number;
  provincia: Record<string, number>;
  mes: Record<string, number>;
  causa: Record<string, number>;
  nivel_h: Record<string, number>;
  nivel_m: Record<string, number>;
  etnia: Record<string, number>;
  area: Record<string, number>;
  duracion: Record<string, number>;
  edad_h: Record<string, number>;
  edad_m: Record<string, number>;
  hijos: Record<string, number>;
  capitulaciones: Record<string, number>;
}

interface FilterContextState {
  data: DivorceRecord[];
  filteredData: AggregatedData | null;
  selectedProvince: string | null;
  setSelectedProvince: (prov: string | null) => void;
  isLoading: boolean;
}

const FilterContext = createContext<FilterContextState | undefined>(undefined);

function binDuration(aniosStr: string): string {
  const a = parseInt(aniosStr, 10);
  if (isNaN(a)) return "Sin Información";
  if (a < 1) return "<1";
  if (a >= 1 && a <= 5) return "1-5";
  if (a >= 6 && a <= 10) return "6-10";
  if (a >= 11 && a <= 20) return "11-20";
  if (a >= 21 && a <= 30) return "21-30";
  return "30+";
}

function binAge(edadStr: string): string {
  const e = parseInt(edadStr, 10);
  if (isNaN(e) || e === 999) return "Sin Información";
  if (e < 25) return "<25";
  if (e >= 25 && e <= 34) return "25-34";
  if (e >= 35 && e <= 44) return "35-44";
  if (e >= 45 && e <= 54) return "45-54";
  if (e >= 55 && e <= 64) return "55-64";
  return "65+";
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DivorceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  useEffect(() => {
    Papa.parse<DivorceRecord>(csvRaw, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setIsLoading(false);
      },
    });
  }, []);

  const filteredData = useMemo(() => {
    if (data.length === 0) return null;

    // Si hay una provincia seleccionada, filtramos los datos primero
    const list = selectedProvince
      ? data.filter((d) => d.provincia_inscripcion === selectedProvince)
      : data;

    const agg: AggregatedData = {
      total: list.length,
      provincia: {},
      mes: {},
      causa: {},
      nivel_h: {},
      nivel_m: {},
      etnia: {},
      area: {},
      duracion: {},
      edad_h: {},
      edad_m: {},
      hijos: {},
      capitulaciones: {},
    };

    const inc = (obj: Record<string, number>, key: string) => {
      const k = key || "Sin Información";
      obj[k] = (obj[k] || 0) + 1;
    };

    for (const row of list) {
      inc(agg.provincia, row.provincia_inscripcion);
      inc(agg.mes, row.mes_inscripcion);
      inc(agg.causa, row.causa_divorcio);
      inc(agg.nivel_h, row.nivel_instruccion_conyuge1);
      inc(agg.nivel_m, row.nivel_instruccion_conyuge2);
      inc(agg.etnia, row.autoidentificacion_etnica_conyuge1);
      inc(agg.area, row.area_residencia_conyuge1);
      inc(agg.duracion, binDuration(row.duracion_matrimonio_anios));
      inc(agg.edad_h, binAge(row.edad_conyuge1));
      inc(agg.edad_m, binAge(row.edad_conyuge2));
      
      const hijos = row.hijos_a_cargo_conyuge1 || "0";
      inc(agg.hijos, hijos);
      
      inc(agg.capitulaciones, row.capitulaciones_bienes);
    }

    return agg;
  }, [data, selectedProvince]);

  return (
    <FilterContext.Provider value={{ data, filteredData, selectedProvince, setSelectedProvince, isLoading }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
