import { createContext, useContext, type ReactNode } from "react";

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

const InsightPanelContext = createContext<InsightPanelConfig | null>(null);

export function InsightPanelProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: InsightPanelConfig;
}) {
  return <InsightPanelContext.Provider value={value}>{children}</InsightPanelContext.Provider>;
}

export function useInsightPanelConfig() {
  return useContext(InsightPanelContext);
}