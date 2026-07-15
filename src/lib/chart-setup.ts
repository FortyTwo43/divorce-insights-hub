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

  let value: number | null = null;

  const parsed = context.parsed as unknown;

  if (typeof parsed === 'number') {
    // Arc charts (Pie, Doughnut, PolarArea)
    value = parsed;
  } else if (parsed !== null && typeof parsed === 'object') {
    const p = parsed as Record<string, number>;
    if (typeof p.r === 'number') {
      // Radar / PolarArea scaled
      value = p.r;
    } else if (context.chart.config.options && 'indexAxis' in (context.chart.config.options as Record<string, unknown>) && (context.chart.config.options as Record<string, unknown>).indexAxis === 'y') {
      // Horizontal bar chart
      value = typeof p.x === 'number' ? p.x : null;
    } else if (typeof p.y === 'number') {
      // Vertical bar / line
      value = p.y;
    }
  }

  if (value !== null && !isNaN(value)) {
    label += new Intl.NumberFormat('es-EC').format(value);
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
