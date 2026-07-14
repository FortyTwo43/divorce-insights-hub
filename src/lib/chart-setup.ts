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
