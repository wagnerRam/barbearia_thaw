
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

const menuItems = [
  { label: "Dashboard", icon: "⌂", path: "/dashboard" },
  { label: "Agendamentos", icon: "▦", path: "/dashboard/agendamentos" },
  { label: "Clientes", icon: "♙", path: "/dashboard/clientes" },
  { label: "Serviços", icon: "✂", path: "/dashboard/servicos" },
  { label: "Profissionais", icon: "♧", path: "/dashboard/profissionais" },
  { label: "Financeiro", icon: "R$", path: "/dashboard/financeiro" },
  { label: "Relatórios", icon: "▤", path: "/dashboard/relatorios" },
  { label: "Configurações", icon: "⚙", path: "/dashboard/configuracoes" },
];

type Props = {
  activeItem?: string;
  lightMode: boolean;
};

export default function DashboardSidebar({
  activeItem,
  lightMode,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setLogoutError("Não foi possível sair. Tente novamente.");
      setLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <aside
      className={`hidden min-h-screen w-64 shrink-0 flex-col border-r p-5 lg:flex ${
        lightMode
          ? "border-[#D8D3C7] bg-white text-[#171716]"
          : "border-[#3B3B3F] bg-[#0A0A0A] text-[#F1EEE3]"
      }`}
    >
      <div className="mb-10">
        <p className="text-2xl font-semibold tracking-widest">
          THAWBLACK
        </p>

        <p className="mt-1 text-[10px] tracking-[0.25em] opacity-60">
          BARBEARIA & ESCOLA
        </p>

        <div className="mt-4 h-px w-12 bg-current opacity-40" />
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const active =
            pathname === item.path ||
            (item.label === "Agendamentos" &&
              pathname.startsWith("/dashboard/agendamentos")) ||
            (activeItem === item.label && pathname === "/dashboard");

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => router.push(item.path)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
                active
                  ? lightMode
                    ? "bg-[#E9E5DC] font-semibold text-[#171716]"
                    : "bg-[#2B2B2E] font-semibold text-white"
                  : "opacity-70 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5"
              }`}
            >
              <span className="w-6 text-center text-base">
                {item.icon}
              </span>

              {item.label}
            </button>
          );
        })}
      </nav>

      <div
        className={`mt-auto border-t pt-5 ${
          lightMode ? "border-[#D8D3C7]" : "border-[#3B3B3F]"
        }`}
      >
        {logoutError && (
          <p className="mb-3 text-xs text-red-500">
            {logoutError}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mb-5 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="w-6 text-center text-base">↪</span>
          {loggingOut ? "Saindo..." : "Sair"}
        </button>

        <p className="text-xs opacity-50">
          ThawBlack © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
