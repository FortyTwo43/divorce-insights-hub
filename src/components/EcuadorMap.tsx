import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import geoData from "@/data/ecuador-provincias.json";

// Map GeoJSON province name → dataset province name
const NAME_MAP: Record<string, string> = {
  Sucumbios: "Sucumbíos",
  Manabi: "Manabí",
  Bolivar: "Bolívar",
  "Los Rios": "Los Ríos",
};

function normalize(name: string) {
  return NAME_MAP[name] ?? name;
}

function colorFor(value: number, max: number) {
  if (!value) return "#eef2f7";
  const t = Math.pow(value / max, 0.55); // gamma for perceptual
  // interpolate #dbeafe → #1e40af
  const c1 = [219, 234, 254];
  const c2 = [30, 64, 175];
  const rgb = c1.map((a, i) => Math.round(a + (c2[i] - a) * t));
  return `rgb(${rgb.join(",")})`;
}

export function EcuadorMap({
  data,
  title = "Divorcios por provincia",
}: {
  data: Record<string, number>;
  title?: string;
}) {
  const [hover, setHover] = useState<{ name: string; value: number } | null>(null);

  const fc = geoData as unknown as FeatureCollection<Geometry, { name: string }>;
  const max = useMemo(() => Math.max(...Object.values(data)), [data]);

  const width = 640;
  const height = 520;

  const projection = useMemo(() => {
    return geoMercator().fitSize([width, height], fc);
  }, [fc]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const legendStops = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex items-start justify-between mb-2 shrink-0 min-h-[32px]">
        <p className="text-sm text-muted-foreground">{title}</p>
        {hover && (
          <div className="text-sm font-medium text-foreground bg-secondary/60 px-3 py-1 rounded-md z-10 absolute right-0 top-0">
            {hover.name}: <span className="text-primary">{hover.value.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          role="img"
          aria-label="Mapa coroplético del Ecuador"
        >
        {fc.features.map((f, i) => {
          const name = normalize(f.properties.name);
          const value = data[name] ?? 0;
          const d = pathGen(f as never) ?? "";
          const active = hover?.name === name;
          return (
            <path
              key={i}
              d={d}
              fill={colorFor(value, max)}
              stroke={active ? "#0f172a" : "#ffffff"}
              strokeWidth={active ? 1.5 : 0.7}
              style={{ cursor: "pointer", transition: "stroke 120ms" }}
              onMouseEnter={() => setHover({ name, value })}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${name}: ${value.toLocaleString()} divorcios`}</title>
            </path>
          );
        })}
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground">Menos</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden flex">
          {legendStops.map((t, i) => (
            <div key={i} style={{ background: colorFor(t * max, max), flex: 1 }} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Más ({max.toLocaleString()})</span>
      </div>
    </div>
  );
}
