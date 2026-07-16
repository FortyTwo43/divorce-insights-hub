import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { FilterProvider } from "../contexts/FilterContext";
import { useFilters } from "../contexts/FilterContext";
import { DetailPanel } from "@/components/DetailPanel";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Página no encontrada.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Reintentar
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Resumen · Divorcios Ecuador 2020" },
      { name: "description", content: "Visualización interactiva de los divorcios registrados en Ecuador durante 2020, según datos del INEC." },
      { property: "og:title", content: "Resumen · Divorcios Ecuador 2020" },
      { property: "og:description", content: "Visualización interactiva de los divorcios registrados en Ecuador durante 2020, según datos del INEC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Resumen · Divorcios Ecuador 2020" },
      { name: "twitter:description", content: "Visualización interactiva de los divorcios registrados en Ecuador durante 2020, según datos del INEC." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5dfeb77e-ff40-4e1e-af58-ef52bc23e034/id-preview-0e3f2198--13da8acf-a8fb-46c2-bea9-55d30da794d0.lovable.app-1784004815509.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5dfeb77e-ff40-4e1e-af58-ef52bc23e034/id-preview-0e3f2198--13da8acf-a8fb-46c2-bea9-55d30da794d0.lovable.app-1784004815509.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:wght@500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Resumen" },
  { to: "/geografia", label: "Geografía" },
  { to: "/causas", label: "Causas y duración" },
  { to: "/demografia", label: "Demografía" },
] as const;

function Header() {
  const {
    selectedProvince, setSelectedProvince,
    selectedCanton, setSelectedCanton,
    selectedMonth, setSelectedMonth,
    selectedCause, setSelectedCause,
    selectedDuration, setSelectedDuration,
    selectedAge, setSelectedAge,
    selectedEdu, setSelectedEdu,
    selectedEthnicity, setSelectedEthnicity,
    selectedChildren, setSelectedChildren,
  } = useFilters();

  return (
    <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex flex-col leading-tight">
          <span className="text-lg font-semibold text-foreground font-[var(--font-display)]">Divorcios Ecuador · 2020</span>
          <span className="text-xs text-muted-foreground">Panel interactivo · Fuente: INEC</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {selectedProvince && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
              📍 {selectedProvince}
              <button onClick={() => setSelectedProvince(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedCanton && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
              🗺️ {selectedCanton}
              <button onClick={() => setSelectedCanton(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedMonth && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
              📅 {selectedMonth}
              <button onClick={() => setSelectedMonth(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedCause && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/30">
              ⚖️ {selectedCause.slice(0, 15)}...
              <button onClick={() => setSelectedCause(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedDuration && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/30">
              ⏱️ {selectedDuration} años
              <button onClick={() => setSelectedDuration(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedAge && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/30">
              👤 {selectedAge} años
              <button onClick={() => setSelectedAge(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedEdu && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/30">
              🎓 {selectedEdu}
              <button onClick={() => setSelectedEdu(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedEthnicity && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/30">
              🧬 {selectedEthnicity}
              <button onClick={() => setSelectedEthnicity(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedChildren && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 border border-pink-500/30">
              👶 {selectedChildren} hij(o/a/s)
              <button onClick={() => setSelectedChildren(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          
          <nav className="flex flex-wrap gap-1 ml-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-secondary" }}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              {n.label}
            </Link>
          ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-10">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
              <div className="min-w-0">
                <Outlet />
              </div>
              <DetailPanel />
            </div>
          </main>
          <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
            Datos: Registro Estadístico de Matrimonios y Divorcios · INEC 2020
          </footer>
        </div>
      </FilterProvider>
    </QueryClientProvider>
  );
}
