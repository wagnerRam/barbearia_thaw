"use client";

const menuItems = [
  { label: "Dashboard", icon: "⌂" },
  { label: "Agendamentos", icon: "▦" },
  { label: "Clientes", icon: "♙" },
  { label: "Serviços", icon: "✂" },
  { label: "Profissionais", icon: "♧" },
  { label: "Financeiro", icon: "R$" },
  { label: "Relatórios", icon: "▤" },
  { label: "Configurações", icon: "⚙" },
];

type Props = {
  activeItem: string;
  onNavigate: (item: string) => void;
  lightMode: boolean;
};

export default function DashboardSidebar({
  activeItem,
  onNavigate,
  lightMode,
}: Props) {
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
          const active = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.label)}
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
        <p className="text-xs opacity-50">
          ThawBlack © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}