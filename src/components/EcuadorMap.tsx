import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { useFilters } from "@/contexts/FilterContext";
import type { FeatureCollection, Geometry } from "geojson";
import geoData from "@/data/ecuador-provincias.json";

// Map GeoJSON province name → dataset province name
// Also corrects the swapped Napo / Tungurahua names
const NAME_MAP: Record<string, string> = {
  Sucumbios: "Sucumbíos",
  Manabi: "Manabí",
  Bolivar: "Bolívar",
  "Los Rios": "Los Ríos",
  // Fix swapped names in GeoJSON
  Napo: "Tungurahua",
  Tungurahua: "Napo",
};

function normalize(name: string) {
  return NAME_MAP[name] ?? name;
}

function colorFor(value: number, max: number) {
  if (!value) return "#c8d6e5"; // light grey-blue for zero
  const t = Math.pow(value / max, 0.55);
  const c1 = [219, 234, 254]; // #dbeafe
  const c2 = [30, 64, 175];   // #1e40af
  const rgb = c1.map((a, i) => Math.round(a + (c2[i] - a) * t));
  return `rgb(${rgb.join(",")})`;
}

// Galápagos province key in dataset
const GALAPAGOS_NAME = "Galápagos";

export function EcuadorMap({
  data,
}: {
  data: Record<string, number>;
}) {
  const [hover, setHover] = useState<{ name: string; value: number; x: number; y: number } | null>(null);
  const { selectedProvince, setSelectedProvince } = useFilters();

  const fc = geoData as unknown as FeatureCollection<Geometry, { name: string }>;
  const max = useMemo(() => Math.max(...Object.values(data), 1), [data]);

  const CONT_W = 560;
  const CONT_H = 540;
  const GAL_SIZE = 100; // box for Galápagos inset
  const totalWidth = CONT_W + GAL_SIZE + 12;
  const totalHeight = CONT_H;

  // Separate continental and Galápagos features
  const continentalFeatures = useMemo(
    () => fc.features.filter((f) => normalize(f.properties.name) !== GALAPAGOS_NAME),
    [fc]
  );
  const galaFeatures = useMemo(
    () => fc.features.filter((f) => normalize(f.properties.name) === GALAPAGOS_NAME),
    [fc]
  );

  const continentalFC: FeatureCollection<Geometry, { name: string }> = useMemo(
    () => ({ type: "FeatureCollection", features: continentalFeatures }),
    [continentalFeatures]
  );
  const galaFC: FeatureCollection<Geometry, { name: string }> = useMemo(
    () => ({ type: "FeatureCollection", features: galaFeatures }),
    [galaFeatures]
  );

  const contProjection = useMemo(
    () => geoMercator().fitSize([CONT_W, CONT_H], continentalFC),
    [continentalFC]
  );
  const galaProjection = useMemo(
    () => geoMercator().fitSize([GAL_SIZE, GAL_SIZE], galaFC),
    [galaFC]
  );

  const contPathGen = useMemo(() => geoPath(contProjection), [contProjection]);
  const galaPathGen = useMemo(() => geoPath(galaProjection), [galaProjection]);

  const legendStops = [0, 0.25, 0.5, 0.75, 1];

  function renderPath(
    f: (typeof fc.features)[number],
    i: number,
    pathGen: ReturnType<typeof geoPath>,
    offsetX = 0,
    offsetY = 0
  ) {
    const name = normalize(f.properties.name);
    const value = data[name] ?? 0;
    const rawD = pathGen(f as never) ?? "";
    // Apply offset by wrapping in a <g> transform
    const active = hover?.name === name;
    const isSelected = selectedProvince === name;
    const isFaded = selectedProvince !== null && !isSelected;

    const fillColor = isFaded ? "#6b7280" : colorFor(value, max);
    const strokeColor = active || isSelected ? "#0f172a" : "#ffffff";

    return (
      <g key={i} transform={`translate(${offsetX},${offsetY})`}>
        <path
          d={rawD}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={active || isSelected ? 2 : 0.7}
          style={{
            cursor: "pointer",
            transition: "fill 200ms, opacity 200ms",
            opacity: isFaded ? 0.75 : 1,
            filter: active ? "brightness(1.15)" : undefined,
          }}
          onMouseEnter={(e) => {
            const rect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
            setHover({ name, value, x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseMove={(e) => {
            const rect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
            setHover((h) => h ? { ...h, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
          }}
          onMouseLeave={() => setHover(null)}
          onClick={() => setSelectedProvince(isSelected ? null : name)}
        />
      </g>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex-1 min-h-0 w-full relative">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="w-full h-full"
          role="img"
          aria-label="Mapa coroplético del Ecuador"
          style={{ overflow: "visible" }}
        >
          {/* Continental Ecuador */}
          {continentalFeatures.map((f, i) => renderPath(f, i, contPathGen))}

          {/* Galápagos inset – top-right corner, offset from continental */}
          <g transform={`translate(${CONT_W + 12}, 20)`}>
            <rect x={0} y={0} width={GAL_SIZE} height={GAL_SIZE} rx={6} fill="none" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 3" />
            <text x={GAL_SIZE / 2} y={GAL_SIZE + 14} textAnchor="middle" fontSize={9} fill="#64748b">Galápagos</text>
            {galaFeatures.map((f, i) => renderPath(f, i, galaPathGen))}
          </g>
        </svg>

        {/* Custom tooltip rendered outside SVG as HTML overlay for better mobile support */}
        {hover && (() => {
          const pct = max > 0 ? ((hover.value / max) * 100).toFixed(1) : "0";
          
          // Container dimensions roughly match totalWidth and totalHeight but in CSS px
          const tipW = 190;
          const tipH = 60;
          let tx = hover.x + 12;
          let ty = hover.y - tipH - 8;
          
          // Simple boundary checks based on viewBox dimensions
          if (tx + tipW > totalWidth) tx = hover.x - tipW - 12;
          if (ty < 0) ty = hover.y + 14;

          return (
            <div 
              style={{ 
                position: 'absolute', 
                left: `${(tx / totalWidth) * 100}%`, 
                top: `${(ty / totalHeight) * 100}%`,
                width: `${(tipW / totalWidth) * 100}%`,
                minWidth: '170px',
                pointerEvents: 'none',
                transform: 'translate(0, 0)' // use left/top for positioning relative to container %
              }}
              className="bg-slate-900/90 backdrop-blur-sm p-3 rounded-lg text-slate-50 border border-slate-700/50 shadow-xl"
            >
              <div className="text-xs font-bold">{hover.name}</div>
              <div className="text-sm font-semibold text-blue-300 mt-1">
                {hover.value.toLocaleString("es-EC")} divorcios
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {pct}% del máximo provincial
              </div>
            </div>
          );
        })()}
      </div>

      <div className="mt-3 flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground">Menos</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden flex">
          {legendStops.map((t, i) => (
            <div key={i} style={{ background: colorFor(t * max, max), flex: 1 }} />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Más ({max.toLocaleString("es-EC")})</span>
      </div>
    </div>
  );
}
