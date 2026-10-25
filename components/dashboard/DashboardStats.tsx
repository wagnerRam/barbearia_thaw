
const stats = [
  {
    title: "Agendamentos hoje",
    value: "08",
    detail: "Horários registrados",
    icon: "▦",
  },
  {
    title: "Clientes atendidos",
    value: "06",
    detail: "Atendimentos realizados",
    icon: "♙",
  },
  {
    title: "Faturamento hoje",
    value: "R$ 480,00",
    detail: "Receita demonstrativa",
    icon: "R$",
  },
  {
    title: "Ticket médio",
    value: "R$ 80,00",
    detail: "Por atendimento",
    icon: "↗",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.title}
          className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-5 transition-colors duration-200 hover:-translate-y-0.5"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm opacity-70">{stat.title}</p>

            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-muted)] text-sm font-semibold">
              {stat.icon}
            </span>
          </div>

          <p className="text-2xl font-semibold">{stat.value}</p>

          <p className="mt-2 text-xs opacity-50">
            {stat.detail}
          </p>
        </article>
      ))}
    </div>
  );
}
