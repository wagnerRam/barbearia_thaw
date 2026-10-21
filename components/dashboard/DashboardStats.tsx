type Props = {
  lightMode: boolean;
};

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

export default function DashboardStats({ lightMode }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.title}
          className={`rounded-xl border p-5 transition hover:-translate-y-0.5 ${
            lightMode
              ? "border-[#D8D3C7] bg-white"
              : "border-[#3B3B3F] bg-[#171716]"
          }`}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm opacity-70">{stat.title}</p>

            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                lightMode
                  ? "bg-[#E9E5DC] text-[#171716]"
                  : "bg-[#2B2B2E] text-[#F1EEE3]"
              }`}
            >
              {stat.icon}
            </span>
          </div>

          <p className="text-2xl font-semibold">{stat.value}</p>

          <p className="mt-2 text-xs opacity-50">{stat.detail}</p>
        </article>
      ))}
    </div>
  );
}