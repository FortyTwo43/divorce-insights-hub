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

export function LegalGlossary() {
  const [open, setOpen] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          ⚖️ Definiciones legales
        </h3>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {showTable ? "← Ver causales" : "📊 Tabla duración →"}
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
                    className="text-muted-foreground text-xs shrink-0"
                  >
                    ▶
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
                      <div className="px-4 pb-4 pt-1 space-y-2.5">
                        <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-border pl-3">
                          "{item.legalName}"
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {item.definition}
                        </p>
                        {item.tip && (
                          <div className="flex items-start gap-2 rounded-lg bg-background/80 border border-border px-3 py-2">
                            <span className="text-xs mt-0.5">📌</span>
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
