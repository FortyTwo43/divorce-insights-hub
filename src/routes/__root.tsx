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
import { InsightPanelProvider } from "@/contexts/InsightPanelContext";


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
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.757.433l.018.008.006.003zM10 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" /></svg>
              {selectedProvince}
              <button onClick={() => setSelectedProvince(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedCanton && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.157 2.175a1.5 1.5 0 00-1.147 0l-4.084 1.69A1.5 1.5 0 002 5.251v10.877a.75.75 0 001.067.672l3.433-1.423 3.933 1.63a1.5 1.5 0 001.147 0l4.084-1.69A1.5 1.5 0 0018 13.75V2.873a.75.75 0 00-1.067-.672l-3.433 1.423-3.933-1.63zM7.25 4.416v9.616a7.353 7.353 0 00-.75-.065V4.352l.75.064zM8.75 13.96V4.345l2.5 1.037v9.615l-2.5-1.037zm4 1.672V6.016l.75-.31v9.607l-.75.319z" clipRule="evenodd" /></svg>
              {selectedCanton}
              <button onClick={() => setSelectedCanton(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedMonth && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
              {selectedMonth}
              <button onClick={() => setSelectedMonth(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedCause && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/30">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v.258a33.186 33.186 0 016.668.83.75.75 0 01-.336 1.461 31.28 31.28 0 00-1.103-.232l1.702 7.545a.75.75 0 01-.387.832A4.981 4.981 0 0115 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 01-.387-.832l1.77-7.849a31.743 31.743 0 00-3.339-.254V15h2.25a.75.75 0 010 1.5h-6a.75.75 0 010-1.5H9.25V4.509a31.742 31.742 0 00-3.34.254l1.771 7.85a.75.75 0 01-.387.831A4.98 4.98 0 015 14a4.98 4.98 0 01-2.294-.556.75.75 0 01-.387-.832L4.02 5.067c-.37.07-.738.148-1.103.232A.75.75 0 012.25 3.84a33.19 33.19 0 016.668-.831V2.75A.75.75 0 0110 2z" clipRule="evenodd" /></svg>
              {selectedCause.slice(0, 15)}...
              <button onClick={() => setSelectedCause(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedDuration && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/30">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
              {selectedDuration} años
              <button onClick={() => setSelectedDuration(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedAge && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/30">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>
              {selectedAge} años
              <button onClick={() => setSelectedAge(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedEdu && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/30">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.182l4.5-1.5a1 1 0 11.632 1.898L8.717 8.9l1.05.405A1 1 0 0011 10.175V11l4.25 1.623a1 1 0 00.75-.056l3.5-2a.999.999 0 000-1.736l-7-3.5A1 1 0 0012 5h-2zM6 10.5a1 1 0 011-1h6a1 1 0 011 1V14a1 1 0 01-1 1H7a1 1 0 01-1-1v-3.5z" /></svg>
              {selectedEdu}
              <button onClick={() => setSelectedEdu(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedEthnicity && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/30">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L1.5 10.53a.75.75 0 010-1.06l3.72-3.72a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l3.72 3.72a.75.75 0 010 1.06l-3.72 3.72a.75.75 0 11-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clipRule="evenodd" /></svg>
              {selectedEthnicity}
              <button onClick={() => setSelectedEthnicity(null)} className="hover:text-destructive ml-1">×</button>
            </span>
          )}
          {selectedChildren && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 border border-pink-500/30">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 17a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.575c.105.426-.07.868-.45 1.08A8.98 8.98 0 0114.5 16z" /></svg>
              {selectedChildren} hij(o/a/s)
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
      <InsightPanelProvider>
        <FilterProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-10">
              <Outlet />
            </main>
            <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
              Datos: Registro Estadístico de Matrimonios y Divorcios · INEC 2020
            </footer>
          </div>
        </FilterProvider>
      </InsightPanelProvider>
    </QueryClientProvider>
  );
}
