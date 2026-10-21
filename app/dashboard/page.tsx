"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardStats from "../../components/dashboard/DashboardStats";

const appointments = [
  {
    time: "09:00",
    client: "Carlos Souza",
    service: "Corte Simples",
    professional: "Thaw",
    status: "Confirmado",
  },
  {
    time: "10:30",
    client: "Lucas Ferreira",
    service: "Corte e Barba",
    professional: "Otavio",
    status: "Confirmado",
  },
  {
    time: "13:00",
    client: "Rafael Lima",
    service: "Sobrancelha",
    professional: "Thaw",
    status: "Confirmado",
  },
  {
    time: "15:30",
    client: "Bruno Alves",
    service: "Corte Simples",
    professional: "Otavio",
    status: "Pendente",
  },
  {
    time: "17:00",
    client: "Matheus Costa",
    service: "Corte e Barba",
    professional: "Thaw",
    status: "Confirmado",
  },
];

const revenue = [
  { day: "15/10", height: 40 },
  { day: "16/10", height: 55 },
  { day: "17/10", height: 48 },
  { day: "18/10", height: 62 },
  { day: "19/10", height: 56 },
  { day: "20/10", height: 74 },
  { day: "21/10", height: 88 },
];

const services = [
  { name: "Corte Simples", percentage: 45 },
  { name: "Corte e Barba", percentage: 30 },
  { name: "Sobrancelha", percentage: 12 },
  { name: "Hidratação", percentage: 8 },
  { name: "Outros", percentage: 5 },
];

export default function DashboardPage() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [lightMode, setLightMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("thawblack-theme");

    if (savedTheme === "light") {
      setLightMode(true);
    }

    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (themeLoaded) {
      localStorage.setItem(
        "thawblack-theme",
        lightMode ? "light" : "dark"
      );
    }
  }, [lightMode, themeLoaded]);

  const panel = lightMode
    ? "border-[#D8D3C7] bg-white"
    : "border-[#3B3B3F] bg-[#171716]";

  const mutedBorder = lightMode
    ? "border-[#D8D3C7]"
    : "border-[#3B3B3F]";

  return (
    <main
      className={`min-h-screen transition-colors duration-200 ${
        lightMode
          ? "bg-[#F1EEE3] text-[#171716]"
          : "bg-[#0A0A0A] text-[#F1EEE3]"
      }`}
    >
      <div className="flex min-h-screen">
        <DashboardSidebar
          activeItem={activeItem}
          onNavigate={setActiveItem}
          lightMode={lightMode}
        />

        <div className="min-w-0 flex-1">
          <DashboardHeader
            lightMode={lightMode}
            onToggleTheme={() =>
              setLightMode((current) => !current)
            }
          />

          <div className="p-5 md:p-8">
            <div className="mb-7">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] opacity-50">
                Visão geral
              </p>

              <h1 className="text-2xl font-semibold md:text-3xl">
                Olá, administrador!
              </h1>

              <p className="mt-2 text-sm opacity-60">
                Aqui está o resumo da sua barbearia.
              </p>
            </div>

            <DashboardStats lightMode={lightMode} />

            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
              <section className={`rounded-xl border p-5 md:p-6 ${panel}`}>
                <div className="mb-6">
                  <h2 className="font-semibold">Faturamento</h2>
                  <p className="mt-1 text-xs opacity-50">
                    Últimos sete dias
                  </p>
                </div>

                <div className="flex h-48 items-end justify-around gap-3 border-b border-current/10 pb-2">
                  {revenue.map((item) => (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div
                        className={`w-full max-w-12 rounded-t-md transition ${
                          lightMode ? "bg-[#777773]" : "bg-[#858580]"
                        }`}
                        style={{ height: `${item.height}%` }}
                        title={`Referência visual: ${item.day}`}
                      />

                      <span className="text-[10px] opacity-60">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs opacity-50">
                  Gráfico ilustrativo. Ainda sem integração financeira.
                </p>
              </section>

              <section className={`rounded-xl border p-5 md:p-6 ${panel}`}>
                <h2 className="font-semibold">Serviços mais realizados</h2>
                <p className="mt-1 text-xs opacity-50">
                  Distribuição demonstrativa
                </p>

                <div className="my-6 flex justify-center">
                  <div
                    className="flex size-36 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#777773 0% 45%, #999993 45% 75%, #B9B9B2 75% 87%, #D2D2CA 87% 95%, #555550 95% 100%)`,
                    }}
                  >
                    <div
                      className={`flex size-24 flex-col items-center justify-center rounded-full ${
                        lightMode ? "bg-white" : "bg-[#171716]"
                      }`}
                    >
                      <span className="text-xl font-semibold">100%</span>
                      <span className="text-[10px] opacity-50">
                        Serviços
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="opacity-70">{service.name}</span>
                      <span className="font-medium">
                        {service.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
              <section className={`overflow-hidden rounded-xl border ${panel}`}>
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <h2 className="font-semibold">Últimos agendamentos</h2>
                    <p className="mt-1 text-xs opacity-50">
                      Acompanhe os atendimentos
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveItem("Agendamentos")}
                    className="text-sm underline underline-offset-4 opacity-70 hover:opacity-100"
                  >
                    Ver todos
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className={`border-y ${mutedBorder} text-xs opacity-60`}>
                      <tr>
                        <th className="px-4 py-3 font-medium">Horário</th>
                        <th className="px-4 py-3 font-medium">Cliente</th>
                        <th className="px-4 py-3 font-medium">Serviço</th>
                        <th className="px-4 py-3 font-medium">Profissional</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {appointments.map((appointment) => (
                        <tr
                          key={appointment.time}
                          className={`border-b last:border-0 ${mutedBorder}`}
                        >
                          <td className="whitespace-nowrap px-4 py-4">
                            {appointment.time}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            {appointment.client}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            {appointment.service}
                          </td>
                          <td className="px-4 py-4">
                            {appointment.professional}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${
                                appointment.status === "Confirmado"
                                  ? lightMode
                                    ? "bg-[#E9E5DC] text-[#30302D]"
                                    : "bg-[#353532] text-[#F1EEE3]"
                                  : lightMode
                                    ? "bg-[#D8D3C7] text-[#171716]"
                                    : "bg-[#414144] text-white"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="space-y-5">
                <section className={`rounded-xl border p-5 ${panel}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold">Calendário</h2>
                    <span className="text-xs opacity-50">
                      Outubro 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-y-3 text-center text-xs">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map(
                      (day, index) => (
                        <span key={`${day}-${index}`} className="opacity-50">
                          {day}
                        </span>
                      )
                    )}

                    {Array.from({ length: 35 }, (_, index) => {
                      const day = index - 3;
                      const valid = day >= 1 && day <= 31;

                      return (
                        <span
                          key={index}
                          className={`mx-auto flex size-7 items-center justify-center rounded-full ${
                            day === 21
                              ? lightMode
                                ? "bg-[#2B2B2E] text-white"
                                : "bg-[#F1EEE3] text-[#171716]"
                              : valid
                                ? ""
                                : "opacity-0"
                          }`}
                        >
                          {valid ? day : ""}
                        </span>
                      );
                    })}
                  </div>
                </section>

                <section className={`rounded-xl border p-5 ${panel}`}>
                  <h2 className="mb-4 font-semibold">Ações rápidas</h2>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Novo agendamento",
                      "Cadastrar cliente",
                      "Adicionar serviço",
                      "Ver financeiro",
                    ].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => {
                          const destination = action.includes("agendamento")
                            ? "Agendamentos"
                            : action.includes("cliente")
                              ? "Clientes"
                              : action.includes("serviço")
                                ? "Serviços"
                                : "Financeiro";

                          setActiveItem(destination);
                        }}
                        className={`min-h-16 rounded-lg border p-3 text-xs transition ${
                          lightMode
                            ? "border-[#D8D3C7] hover:bg-[#F1EEE3]"
                            : "border-[#3B3B3F] hover:bg-[#2B2B2E]"
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <footer className="py-6 text-center text-xs opacity-40">
              ThawBlack · Barbearia & Escola
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}