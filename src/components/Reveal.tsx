"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMotion } from "@/lib/motion";

const HIDDEN = { opacity: 0, y: 70, rotateX: 16, scale: 0.94, transformPerspective: 1200 };
const SHOWN = { opacity: 1, y: 0, rotateX: 0, scale: 1, transformPerspective: 1200 };

/** Content tilts up out of depth the first time it enters the viewport. Shows it at once when motion is off. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const allowed = useMotion(true);
  return (
    <motion.div
      className={className}
      initial={HIDDEN}
      {...(allowed
        ? { whileInView: SHOWN, viewport: { once: true, margin: "0px 0px -10% 0px" } }
        : { animate: SHOWN })}
      transition={allowed ? { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}
