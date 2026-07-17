import { createContext, useContext, useState, type ReactNode } from "react";

export type InsightDimension =
  | "month"
  | "province"
  | "canton"
  | "cause"
  | "duration"
  | "age"
  | "education"
  | "ethnicity"
  | "children";

export type InsightDetail = {
  label: string;
  interpretiveText: string;
  avgDuration?: string;
};

export type InsightPanelConfig = {
  priority: InsightDimension[];
  overviewText: string;
  details: Record<string, InsightDetail>;
};

type InsightPanelContextType = {
  config: InsightPanelConfig | null;
  setConfig: (config: InsightPanelConfig | null) => void;
};

const InsightPanelContext = createContext<InsightPanelContextType | null>(null);

export function InsightPanelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [config, setConfig] = useState<InsightPanelConfig | null>(null);
  return <InsightPanelContext.Provider value={{ config, setConfig }}>{children}</InsightPanelContext.Provider>;
}

export function useInsightPanelConfig() {
  return useContext(InsightPanelContext)?.config ?? null;
}

export function useSetInsightPanelConfig() {
  return useContext(InsightPanelContext)?.setConfig;
}