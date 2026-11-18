
"use client";

import { useEffect, useMemo, useState } from "react";

type Appointment = {
  customer: string;
  phone: string;
  service: string;
  professional: string;
  date: string;
  time: string;
  price: number;
  status: string;
  notes?: string;
};

type Client = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
};

const APPOINTMENTS_KEY = "thawblack_appointments_v1";
const CLIENTS_KEY = "thawblack_clients_v1";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function formatPhone(phone: string) {
  const digits = normalizePhone(phone);

  if (digits.length === 11) {
    return digits.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  if (digits.length === 10) {
    return digits.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  return phone;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function readAppointments(): Appointment[] {
  try {
    const saved = localStorage.getItem(APPOINTMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function readClients(): Client[] {
  try {
    const saved = localStorage.getItem(CLIENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function ClientesPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [manualClients, setManualClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAppointments(readAppointments());
    setManualClients(readClients());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(manualClients));
    }
  }, [manualClients, ready]);

  const clients = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone: string;
        appointments: Appointment[];
        manual: boolean;
      }
    >();

    for (const client of manualClients) {
      const key = normalizePhone(client.phone);

      if (!key) continue;

      map.set(key, {
        name: client.name,
        phone: client.phone,
        appointments: [],
        manual: true,
      });
    }

    for (const appointment of appointments) {
      const key = normalizePhone(appointment.phone);

      if (!key) continue;

      const existing = map.get(key);

      if (existing) {
        existing.appointments.push(appointment);

        if (!existing.name && appointment.customer) {
          existing.name = appointment.customer;
        }
      } else {
        map.set(key, {
          name: appointment.customer || "Cliente sem nome",
          phone: appointment.phone,
          appointments: [appointment],
          manual: false,
        });
      }
    }

    return Array.from(map.entries())
      .map(([key, client]) => {
        const completed = client.appointments.filter(
          (item) => item.status === "Concluído"
        );

        const sorted = [...client.appointments].sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
          const dateB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
          return dateB - dateA;
        });

        return {
          id: key,
          name: client.name,
          phone: client.phone,
          totalAppointments: client.appointments.length,
          completedCount: completed.length,
          totalSpent: completed.reduce(
            (sum, item) => sum + Number(item.price || 0),
            0
          ),
          lastAppointment: sorted[0] ?? null,
          appointments: sorted,
          manual: client.manual,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [appointments, manualClients]);

  const filteredClients = clients.filter((client) => {
    const term = search.toLowerCase().trim();

    return (
      client.name.toLowerCase().includes(term) ||
      client.phone.includes(search) ||
      normalizePhone(client.phone).includes(normalizePhone(search))
    );
  });

  const selectedClient = clients.find(
    (client) => client.id === selectedPhone
  );

  const totalCompleted = clients.reduce(
    (sum, client) => sum + client.completedCount,
    0
  );

  const totalSpent = clients.reduce(
    (sum, client) => sum + client.totalSpent,
    0
  );

  function saveClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const key = normalizePhone(cleanPhone);

    if (!cleanName || !key) {
      setError("Preencha o nome e o telefone.");
      return;
    }

    if (key.length < 10 || key.length > 13) {
      setError("Informe um telefone válido com DDD.");
      return;
    }

    const existing = clients.find(
      (client) => client.id === key
    );

    if (existing) {
      setError(
        `Este telefone já está cadastrado para ${existing.name}.`
      );
      return;
    }

    const newClient: Client = {
      id: crypto.randomUUID(),
      name: cleanName,
      phone: cleanPhone,
      createdAt: new Date().toISOString(),
    };

    setManualClients((current) => [...current, newClient]);
    setModalOpen(false);
    setName("");
    setPhone("");
  }

  if (!ready) {
    return (
      <div className="p-8 text-sm text-[var(--dashboard-text)]">
        Carregando clientes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] p-4 text-[var(--dashboard-text)] sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-[var(--dashboard-text)] opacity-60">
              Dashboard / Clientes
            </p>
            <h1 className="mt-2 text-3xl font-bold">Clientes</h1>
            <p className="mt-2 text-sm opacity-60">
              Gerencie os clientes e acompanhe o histórico de atendimentos.
            </p>
          </div>

          <button
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#C9A227] px-5 py-3 font-semibold text-[#171716] transition hover:brightness-110"
          >
            <span className="text-xl">+</span>
            Novo cliente
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total de clientes",
              value: clients.length.toString(),
              icon: "♙",
            },
            {
              label: "Cortes concluídos",
              value: totalCompleted.toString(),
              icon: "✂",
            },
            {
              label: "Faturamento registrado",
              value: formatCurrency(totalSpent),
              icon: "R$",
            },
            {
              label: "Clientes cadastrados manualmente",
              value: manualClients.length.toString(),
              icon: "＋",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm opacity-60">{item.label}</p>
                <span className="text-lg text-[#C9A227]">{item.icon}</span>
              </div>
              <p className="mt-4 text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)]">
          <div className="flex flex-col gap-4 border-b border-[var(--dashboard-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Lista de clientes</h2>
              <p className="mt-1 text-sm opacity-60">
                {filteredClients.length} cliente(s) encontrado(s)
              </p>
            </div>

            <div className="flex w-full items-center gap-3 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-4 sm:max-w-sm">
              <span className="opacity-50">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar nome ou telefone..."
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--dashboard-muted)] text-2xl">
                ♙
              </div>
              <h3 className="mt-4 font-semibold">
                {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm opacity-60">
                {search
                  ? "Tente buscar por outro nome ou telefone."
                  : "Os clientes aparecerão aqui quando realizarem agendamentos ou forem cadastrados manualmente."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[var(--dashboard-muted)] text-xs uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="px-5 py-4 font-medium">Cliente</th>
                    <th className="px-5 py-4 font-medium">Telefone</th>
                    <th className="px-5 py-4 font-medium">Cortes</th>
                    <th className="px-5 py-4 font-medium">Total gasto</th>
                    <th className="px-5 py-4 font-medium">Último agendamento</th>
                    <th className="px-5 py-4 text-right font-medium">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-t border-[var(--dashboard-border)] transition hover:bg-[var(--dashboard-hover)]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-muted)] text-lg">
                            ♙
                          </div>
                          <div>
                            <p className="font-semibold">{client.name}</p>
                            <p className="mt-1 text-xs opacity-50">
                              {client.manual ? "Cadastro manual" : "Via agendamento"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 opacity-75">
                        {formatPhone(client.phone)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-[var(--dashboard-muted)] px-3 py-1.5">
                          {client.completedCount}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {formatCurrency(client.totalSpent)}
                      </td>

                      <td className="px-5 py-4 opacity-75">
                        {client.lastAppointment
                          ? new Date(
                              `${client.lastAppointment.date}T12:00:00`
                            ).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedPhone(client.id)}
                          className="rounded-lg border border-[var(--dashboard-border)] px-3 py-2 text-sm transition hover:border-[#C9A227] hover:text-[#C9A227]"
                        >
                          Histórico
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <form
            onSubmit={saveClient}
            className="w-full max-w-md rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Novo cliente</h2>
                <p className="mt-1 text-sm opacity-60">
                  Cadastro para clientes presenciais.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-xl opacity-60 hover:opacity-100"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nome completo
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  autoFocus
                  placeholder="Ex.: Carlos Oliveira"
                  className="w-full rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-4 py-3 outline-none focus:border-[#C9A227]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Telefone com DDD
                </label>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-4 py-3 outline-none focus:border-[#C9A227]"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-[var(--dashboard-border)] px-4 py-3 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#C9A227] px-5 py-3 text-sm font-semibold text-[#171716] hover:brightness-110"
              >
                Salvar cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedClient && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPhone(null);
            }
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--dashboard-border)] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dashboard-muted)] text-xl">
                  ♙
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selectedClient.name}</h2>
                  <p className="mt-1 text-sm opacity-60">
                    {formatPhone(selectedClient.phone)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhone(null)}
                className="text-2xl opacity-60 hover:opacity-100"
                aria-label="Fechar histórico"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5 sm:p-6">
              <div className="rounded-xl bg-[var(--dashboard-muted)] p-4">
                <p className="text-xs opacity-60">Cortes concluídos</p>
                <p className="mt-2 text-xl font-bold">
                  {selectedClient.completedCount}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--dashboard-muted)] p-4">
                <p className="text-xs opacity-60">Total gasto</p>
                <p className="mt-2 text-xl font-bold">
                  {formatCurrency(selectedClient.totalSpent)}
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
              <h3 className="mb-4 font-semibold">Histórico de agendamentos</h3>

              {selectedClient.appointments.length === 0 ? (
                <p className="rounded-xl border border-[var(--dashboard-border)] p-5 text-sm opacity-60">
                  Este cliente ainda não possui agendamentos registrados.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedClient.appointments.map((appointment, index) => (
                    <div
                      key={`${appointment.date}-${appointment.time}-${index}`}
                      className="rounded-xl border border-[var(--dashboard-border)] p-4"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row">
                        <div>
                          <p className="font-semibold">{appointment.service}</p>
                          <p className="mt-1 text-sm opacity-60">
                            {appointment.professional}
                          </p>
                          <p className="mt-1 text-sm opacity-60">
                            {new Date(
                              `${appointment.date}T12:00:00`
                            ).toLocaleDateString("pt-BR")}{" "}
                            {appointment.time}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="font-semibold">
                            {formatCurrency(Number(appointment.price || 0))}
                          </p>
                          <p className="mt-1 text-xs opacity-60">
                            {appointment.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
