
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

const routes: Record<string, string> = {
  Dashboard: "/dashboard",
  Agendamentos: "/dashboard/agendamentos",
  Clientes: "/dashboard/clientes",
  Serviços: "/dashboard/servicos",
  Profissionais: "/dashboard/profissionais",
  Financeiro: "/dashboard/financeiro",
  Relatórios: "/dashboard/relatorios",
  Configurações: "/dashboard/configuracoes",
};

const labels: Record<string, string> = {
  clientes: "Clientes",
  servicos: "Serviços",
  agendamentos: "Agendamentos",
  profissionais: "Profissionais",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
};

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [lightMode, setLightMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("thawblack-theme");
    setLightMode(savedTheme === "light");
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;

    localStorage.setItem(
      "thawblack-theme",
      lightMode ? "light" : "dark"
    );
  }, [lightMode, themeLoaded]);

  const lastSegment =
    pathname.split("/").filter(Boolean).at(-1) ?? "dashboard";

  const activeItem =
    lastSegment === "dashboard"
      ? "Dashboard"
      : labels[lastSegment] ?? "Dashboard";

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        lightMode
          ? "[--dashboard-bg:#F1EEE3] [--dashboard-panel:#FFFFFF] [--dashboard-text:#171716] [--dashboard-border:#D8D3C7] [--dashboard-muted:#E9E5DC] [--dashboard-hover:#E9E5DC]"
          : "[--dashboard-bg:#0A0A0A] [--dashboard-panel:#171716] [--dashboard-text:#F1EEE3] [--dashboard-border:#3B3B3F] [--dashboard-muted:#2B2B2E] [--dashboard-hover:#2B2B2E]"
      } bg-[var(--dashboard-bg)] text-[var(--dashboard-text)]`}
    >
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <DashboardSidebar
          activeItem={activeItem}
          lightMode={lightMode}
          onNavigate={(item) =>
            router.push(routes[item] ?? "/dashboard")
          }
        />
      </aside>

      <div className="min-h-screen min-w-0 lg:ml-64">
        <DashboardHeader
          lightMode={lightMode}
          onToggleTheme={() =>
            setLightMode((current) => !current)
          }
        />

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
