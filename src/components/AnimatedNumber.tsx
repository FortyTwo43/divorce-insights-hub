import { useEffect, useState } from "react";
import { animate } from "framer-motion";

export function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate(v) {
        setDisplayValue(v);
      },
    });
    return controls.stop;
  }, [value]);

  return <>{Math.round(displayValue).toLocaleString("es-EC")}</>;
}
