import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler,
);

ChartJS.defaults.font.family = "Inter, system-ui, sans-serif";
ChartJS.defaults.color = "#475569";
ChartJS.defaults.plugins.legend.position = "bottom";

ChartJS.defaults.plugins.tooltip.backgroundColor = "rgba(15, 23, 42, 0.9)";
ChartJS.defaults.plugins.tooltip.titleFont = { size: 14, weight: "bold", family: "Inter, system-ui, sans-serif" };
ChartJS.defaults.plugins.tooltip.bodyFont = { size: 13, family: "Inter, system-ui, sans-serif" };
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.plugins.tooltip.displayColors = true;
ChartJS.defaults.plugins.tooltip.callbacks.label = (context) => {
  let label = context.dataset.label || '';
  if (label) label += ': ';
  if (context.parsed.y !== null && context.parsed.y !== undefined) {
    label += new Intl.NumberFormat('es-EC').format(context.parsed.y);
  } else if (context.parsed !== null) {
    label += new Intl.NumberFormat('es-EC').format(context.parsed as unknown as number);
  }
  return label;
};

export const palette = [
  "#3a6bd6",
  "#e08a3c",
  "#3faa82",
  "#d4a537",
  "#8b5cf6",
  "#dc5a5a",
  "#4098b8",
  "#7fb96b",
];
