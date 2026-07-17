import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlossaryItem {
  id: string;
  shortName: string;
  legalName: string;
  definition: string;
  tip?: string;
  color: string;
  count?: number;
  pct?: number;
}

const CAUSALES: GlossaryItem[] = [
  {
    id: "notarial",
    shortName: "Mutuo acuerdo notarial",
    legalName: "Por mutuo consentimiento vía notarial",
    definition:
      "Ambos cónyuges acuerdan el divorcio sin hijos menores de edad y sin bienes en disputa. Se tramita directamente ante un notario, sin necesidad de intervención judicial. Es el trámite más rápido y menos costoso.",
    tip: "Solo posible cuando no hay hijos menores ni capitulaciones complejas.",
    color: "bg-primary/10 border-primary/25 text-primary",
    count: undefined,
    pct: undefined,
  },
  {
    id: "judicial",
    shortName: "Mutuo acuerdo judicial",
    legalName: "Por mutuo consentimiento vía judicial",
    definition:
      "Ambos cónyuges acuerdan el divorcio, pero el trámite debe pasar por un juez porque hay hijos menores de edad o bienes que requieren liquidación. El acuerdo es voluntario, el proceso es más largo.",
    tip: "La vía judicial es obligatoria cuando hay hijos menores independientemente del acuerdo.",
    color: "bg-violet-50 border-violet-200 text-violet-700",
  },
  {
    id: "abandono",
    shortName: "Abandono injustificado",
    legalName:
      "El abandono injustificado de cualquiera de los cónyuges por más de seis meses ininterrumpidos",
    definition:
      "Causal unilateral: uno de los cónyuges demanda porque el otro abandonó el hogar familiar sin justificación por más de seis meses consecutivos. No requiere acuerdo; el demandante debe probar el abandono.",
    tip: "Promedio de duración del matrimonio al divorciarse: 16,6 años.",
    color: "bg-amber-50 border-amber-200 text-amber-800",
  },
  {
    id: "armonia",
    shortName: "Falta de armonía",
    legalName:
      "El estado habitual de falta de armonía de las dos voluntades en la vida matrimonial",
    definition:
      "Causal por incompatibilidad de caracteres o convivencia insostenible, sin una falta grave o específica imputable a ninguno de los dos. Se acredita mostrando que la vida en común se ha vuelto intolerable.",
    tip: "Promedio de duración del matrimonio al divorciarse: 14,4 años.",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  {
    id: "violencia",
    shortName: "Violencia intrafamiliar",
    legalName:
      "Los tratos crueles o violencia contra la mujer o miembros del núcleo familiar",
    definition:
      "Causal directamente vinculada a violencia física, psicológica o sexual ejercida contra la cónyuge o los hijos. Puede complementarse con medidas de protección. Está tipificada también en el COIP.",
    tip: "Promedio de duración del matrimonio al divorciarse: 15,0 años.",
    color: "bg-rose-50 border-rose-200 text-rose-800",
  },
];

const DUR_TABLE = [
  { causa: "Mutuo acuerdo notarial", duracion: "15,4 años" },
  { causa: "Mutuo acuerdo judicial", duracion: "13,6 años" },
  { causa: "Abandono injustificado", duracion: "16,6 años" },
  { causa: "Falta de armonía", duracion: "14,4 años" },
  { causa: "Violencia intrafamiliar", duracion: "15,0 años" },
  { causa: "Amenazas graves", duracion: "16,0 años" },
  { causa: "Condena penal >10 años", duracion: "18,6 años" },
  { causa: "Adulterio", duracion: "14,3 años" },
  { causa: "Alcoholismo / drogas", duracion: "16,6 años" },
  { causa: "Actividades ilícitas", duracion: "29,0 años" },
];

/* ─── SVG Icons ─── */
function IconScale({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.258a33.186 33.186 0 016.668.83.75.75 0 01-.336 1.461 31.28 31.28 0 00-1.103-.232l1.702 7.545a.75.75 0 01-.387.832A4.981 4.981 0 0115 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 01-.387-.832l1.77-7.849a31.743 31.743 0 00-3.339-.254V15h2.25a.75.75 0 010 1.5h-6a.75.75 0 010-1.5H9.25V4.509a31.742 31.742 0 00-3.34.254l1.771 7.85a.75.75 0 01-.387.831A4.98 4.98 0 015 14a4.98 4.98 0 01-2.294-.556.75.75 0 01-.387-.832L4.02 5.067c-.37.07-.738.148-1.103.232A.75.75 0 012.25 3.84a33.19 33.19 0 016.668-.831V2.75A.75.75 0 0110 2z" clipRule="evenodd" />
    </svg>
  );
}
function IconTable({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M.99 5.24A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25l.01 9.5A2.25 2.25 0 0116.76 17H3.26A2.272 2.272 0 011 14.74l-.01-9.5zm8.26 9.52v-.625a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75v.615c0 .414.336.75.75.75h5.373a.75.75 0 00.627-.74zm1.5 0a.75.75 0 00.627.74h5.373a.75.75 0 00.75-.75v-.615a.75.75 0 00-.75-.75H11.5a.75.75 0 00-.75.75v.625zm6.75-3.63v-.625a.75.75 0 00-.75-.75H11.5a.75.75 0 00-.75.75v.625c0 .414.336.75.75.75h5.25a.75.75 0 00.75-.75zm-8.25 0v-.625a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75v.625c0 .414.336.75.75.75H8.5a.75.75 0 00.75-.75zM17.5 7.5v-.625a.75.75 0 00-.75-.75H11.5a.75.75 0 00-.75.75V7.5c0 .414.336.75.75.75h5.25a.75.75 0 00.75-.75zm-8.25 0v-.625a.75.75 0 00-.75-.75H3.25a.75.75 0 00-.75.75V7.5c0 .414.336.75.75.75H8.5a.75.75 0 00.75-.75z" clipRule="evenodd" />
    </svg>
  );
}
function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" />
    </svg>
  );
}
function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.153 2.396A1 1 0 0110 2a1 1 0 01.847.396l3.22 4.558a.75.75 0 01-.07.946L11 10.706v5.794a1 1 0 01-2 0v-5.794L6.003 7.9a.75.75 0 01-.07-.946l3.22-4.558z" />
    </svg>
  );
}
function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
    </svg>
  );
}

export function LegalGlossary() {
  const [open, setOpen] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wide">
          <span className="text-primary">
            <IconScale className="w-4 h-4" />
          </span>
          Definiciones legales
        </h3>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {showTable ? (
            <><IconList className="w-3 h-3" /> Ver causales</>
          ) : (
            <><IconTable className="w-3 h-3" /> Tabla duración</>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showTable ? (
          <motion.div
            key="glossary"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {CAUSALES.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden`}
              >
                {/* Header row — always visible, clickable */}
                <button
                  onClick={() =>
                    setOpen(open === item.id ? null : item.id)
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/30 ${
                    open === item.id ? "bg-secondary/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${item.color}`}
                    >
                      {item.id === "notarial" || item.id === "judicial"
                        ? "mutuo"
                        : item.id}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {item.shortName}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: open === item.id ? 90 : 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-muted-foreground shrink-0"
                  >
                    <IconChevronRight className="w-4 h-4" />
                  </motion.span>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {open === item.id && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-border bg-secondary/10">
                        <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-border pl-3 mt-2">
                          "{item.legalName}"
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {item.definition}
                        </p>
                        {item.tip && (
                          <div className="flex items-start gap-2 rounded-lg bg-background/80 border border-border px-3 py-2">
                            <span className="text-primary shrink-0 mt-0.5">
                              <IconPin className="w-3.5 h-3.5" />
                            </span>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {item.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-border overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Causal
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                    Duración prom.
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DUR_TABLE.map((row, i) => (
                  <tr
                    key={row.causa}
                    className={i % 2 === 0 ? "bg-card" : "bg-secondary/10"}
                  >
                    <td className="px-4 py-2 text-foreground text-sm">
                      {row.causa}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-primary text-sm tabular-nums">
                      {row.duracion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-secondary/20 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Fuente: cálculo propio sobre datos INEC 2020. Promedio por causal invocada.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
