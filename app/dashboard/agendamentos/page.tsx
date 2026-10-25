
"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "Agendado" | "Concluído" | "Cancelado";

type Appointment = {
  id: string;
  customer: string;
  phone: string;
  service: string;
  professional: string;
  date: string;
  time: string;
  price: number;
  status: Status;
  notes: string;
};

type AppointmentForm = Omit<Appointment, "id" | "status">;

const STORAGE_KEY = "thawblack_appointments_v1";

const emptyForm: AppointmentForm = {
  customer: "",
  phone: "",
  service: "Corte masculino",
  professional: "Thaw",
  date: "",
  time: "09:00",
  price: 45,
  notes: "",
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const dateOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initialAppointments = (): Appointment[] => [
  {
    id: "demo-1",
    customer: "Lucas Ferreira",
    phone: "",
    service: "Corte masculino",
    professional: "Thaw",
    date: today(),
    time: "09:00",
    price: 45,
    status: "Agendado",
    notes: "",
  },
  {
    id: "demo-2",
    customer: "Gabriel Santos",
    phone: "",
    service: "Corte + barba",
    professional: "Otávio",
    date: today(),
    time: "10:00",
    price: 70,
    status: "Agendado",
    notes: "",
  },
  {
    id: "demo-3",
    customer: "Matheus Oliveira",
    phone: "",
    service: "Barba",
    professional: "Thaw",
    date: dateOffset(1),
    time: "14:00",
    price: 30,
    status: "Agendado",
    notes: "",
  },
];

const statusClass: Record<Status, string> = {
  Agendado: "status-scheduled",
  Concluído: "status-done",
  Cancelado: "status-cancelled",
};

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [selectedDate, setSelectedDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AppointmentForm>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setAppointments(JSON.parse(saved) as Appointment[]);
      } else {
        setAppointments(initialAppointments());
      }
    } catch {
      setAppointments(initialAppointments());
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }
  }, [appointments, ready]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return appointments
      .filter((item) => {
        const matchesSearch = [
          item.customer,
          item.phone,
          item.service,
          item.professional,
        ].some((value) => value.toLowerCase().includes(term));

        const matchesStatus =
          filter === "Todos" || item.status === filter;

        const matchesDate =
          !selectedDate || item.date === selectedDate;

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      );
  }, [appointments, search, filter, selectedDate]);

  const todayAppointments = appointments.filter(
    (item) => item.date === today() && item.status !== "Cancelado"
  );

  const completedToday = appointments.filter(
    (item) => item.date === today() && item.status === "Concluído"
  );

  const revenueToday = completedToday.reduce(
    (total, item) => total + item.price,
    0
  );

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyForm, date: today() });
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: Appointment) {
    setEditingId(item.id);

    setForm({
      customer: item.customer,
      phone: item.phone,
      service: item.service,
      professional: item.professional,
      date: item.date,
      time: item.time,
      price: item.price,
      notes: item.notes,
    });

    setError("");
    setModalOpen(true);
  }

  function saveAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.customer.trim() ||
      !form.date ||
      !form.time ||
      !form.service ||
      !form.professional
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!Number.isFinite(form.price) || form.price < 0) {
      setError("Informe um preço válido.");
      return;
    }

    const conflict = appointments.some(
      (item) =>
        item.id !== editingId &&
        item.date === form.date &&
        item.time === form.time &&
        item.professional === form.professional &&
        item.status === "Agendado"
    );

    if (conflict) {
      setError(
        "Este profissional já tem um horário agendado nessa data e hora."
      );
      return;
    }

    if (editingId) {
      setAppointments((current) =>
        current.map((item) =>
          item.id === editingId ? { ...item, ...form } : item
        )
      );
    } else {
      const newAppointment: Appointment = {
        ...form,
        id: crypto.randomUUID(),
        status: "Agendado",
      };

      setAppointments((current) => [...current, newAppointment]);
    }

    setModalOpen(false);
  }

  function changeStatus(id: string, status: Status) {
    setAppointments((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  }

  function deleteAppointment(id: string) {
    if (
      !window.confirm(
        "Deseja excluir este agendamento definitivamente?"
      )
    ) {
      return;
    }

    setAppointments((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function updateField<K extends keyof AppointmentForm>(
    field: K,
    value: AppointmentForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  if (!ready) {
    return (
      <main className="appointments-page">
        <p className="loading">Carregando agendamentos...</p>

        <style jsx global>{`
          .appointments-page {
            min-height: 100vh;
            padding: 36px;
            background: var(--dashboard-bg, #0a0a0a);
            color: var(--dashboard-text, #f1eee3);
            font-family: Arial, Helvetica, sans-serif;
          }

          .appointments-page .loading {
            color: var(--dashboard-text, #f1eee3);
            opacity: 0.7;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="appointments-page">
      <style jsx global>{`
        .appointments-page {
          --page: var(--dashboard-bg, #0a0a0a);
          --surface: var(--dashboard-panel, #171716);
          --surface-hover: var(--dashboard-hover, #2b2b2e);
          --text: var(--dashboard-text, #f1eee3);
          --muted: color-mix(
            in srgb,
            var(--dashboard-text, #f1eee3) 60%,
            transparent
          );
          --border: var(--dashboard-border, #3b3b3f);
          --accent: #c9a227;
          --input: var(--dashboard-bg, #0a0a0a);

          min-height: 100vh;
          padding: 36px;
          background: var(--page);
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .appointments-page *,
        .appointments-page *::before,
        .appointments-page *::after {
          box-sizing: border-box;
        }

        .appointments-page .loading {
          color: var(--muted);
          padding: 24px;
        }

        .appointments-page .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .appointments-page h1 {
          font-size: clamp(26px, 3vw, 34px);
          letter-spacing: -1px;
          margin: 0 0 8px;
        }

        .appointments-page p {
          margin-top: 0;
        }

        .appointments-page .muted {
          color: var(--muted);
          font-size: 14px;
        }

        .appointments-page button,
        .appointments-page input,
        .appointments-page select,
        .appointments-page textarea {
          font: inherit;
        }

        .appointments-page button {
          cursor: pointer;
        }

        .appointments-page .primary {
          border: 1px solid var(--accent);
          border-radius: 9px;
          padding: 12px 17px;
          background: var(--accent);
          color: #171716;
          font-weight: 700;
        }

        .appointments-page .secondary {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 10px;
          background: transparent;
          color: var(--text);
          font-size: 13px;
        }

        .appointments-page .danger {
          color: #fca5a5;
        }

        .appointments-page .metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 26px;
        }

        .appointments-page .metric,
        .appointments-page .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 13px;
        }

        .appointments-page .metric {
          padding: 20px;
        }

        .appointments-page .metric-label {
          color: var(--muted);
          font-size: 13px;
        }

        .appointments-page .metric-value {
          font-size: 27px;
          font-weight: 700;
          margin-top: 12px;
        }

        .appointments-page .panel {
          overflow: hidden;
        }

        .appointments-page .filters {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding: 18px;
          border-bottom: 1px solid var(--border);
        }

        .appointments-page .control {
          width: 100%;
          min-width: 0;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 11px 12px;
          background: var(--input);
          color: var(--text);
        }

        .appointments-page .control::placeholder {
          color: var(--muted);
        }

        .appointments-page .search {
          flex: 1 1 230px;
        }

        .appointments-page .filter-select {
          flex: 0 1 160px;
        }

        .appointments-page .date-filter {
          flex: 0 1 170px;
        }

        .appointments-page .table-wrap {
          overflow-x: auto;
        }

        .appointments-page table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 850px;
        }

        .appointments-page th {
          color: var(--muted);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: var(--surface);
        }

        .appointments-page th,
        .appointments-page td {
          padding: 16px 18px;
          border-bottom: 1px solid var(--border);
        }

        .appointments-page td {
          font-size: 13px;
        }

        .appointments-page tbody tr:hover {
          background: var(--surface-hover);
        }

        .appointments-page .customer-name {
          font-weight: 700;
          margin-bottom: 5px;
        }

        .appointments-page .subtext {
          color: var(--muted);
          font-size: 12px;
        }

        .appointments-page .status {
          display: inline-block;
          border-radius: 20px;
          padding: 6px 9px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .appointments-page .status-scheduled {
          color: #f4d779;
          background: #5b491b;
        }

        .appointments-page .status-done {
          color: #a7f3d0;
          background: #174b3b;
        }

        .appointments-page .status-cancelled {
          color: #fecaca;
          background: #542626;
        }

        .appointments-page .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .appointments-page .empty {
          text-align: center;
          padding: 48px 20px;
          color: var(--muted);
        }

        .appointments-page .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: grid;
          place-items: center;
          padding: 18px;
          background: #000b;
          overflow-y: auto;
        }

        .appointments-page .modal {
          width: min(620px, 100%);
          max-height: calc(100vh - 36px);
          overflow-y: auto;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          background: var(--surface);
          color: var(--text);
        }

        .appointments-page .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .appointments-page .modal-header h2 {
          margin: 0;
          font-size: 22px;
        }

        .appointments-page .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .appointments-page .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 13px;
        }

        .appointments-page .field.full {
          grid-column: 1 / -1;
        }

        .appointments-page .field label {
          color: var(--muted);
        }

        .appointments-page .error {
          margin-top: 14px;
          color: #fca5a5;
          font-size: 13px;
        }

        .appointments-page .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
        }

        .appointments-page .notice {
          margin-top: 16px;
          color: var(--muted);
          font-size: 12px;
        }

        @media (max-width: 700px) {
          .appointments-page {
            padding: 22px 14px;
          }

          .appointments-page .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .appointments-page .metrics {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .appointments-page .metric {
            padding: 16px;
          }

          .appointments-page .metric-value {
            font-size: 23px;
          }

          .appointments-page .filters {
            align-items: stretch;
          }

          .appointments-page .search,
          .appointments-page .filter-select,
          .appointments-page .date-filter {
            flex: 1 1 100%;
          }

          .appointments-page .form-grid {
            grid-template-columns: 1fr;
          }

          .appointments-page .field.full {
            grid-column: auto;
          }
        }
      `}</style>

      <header className="topbar">
        <div>
          <p className="muted">THAWBLACK / GESTÃO</p>
          <h1>Agendamentos</h1>
          <p className="muted">
            Gerencie os horários e acompanhe os atendimentos da barbearia.
          </p>
        </div>

        <button className="primary" onClick={openNew}>
          + Novo agendamento
        </button>
      </header>

      <section className="metrics">
        <article className="metric">
          <div className="metric-label">Atendimentos de hoje</div>
          <div className="metric-value">{todayAppointments.length}</div>
        </article>

        <article className="metric">
          <div className="metric-label">Concluídos hoje</div>
          <div className="metric-value">{completedToday.length}</div>
        </article>

        <article className="metric">
          <div className="metric-label">Faturamento concluído hoje</div>
          <div className="metric-value">{money(revenueToday)}</div>
        </article>
      </section>

      <section className="panel">
        <div className="filters">
          <div className="search">
            <input
              className="control"
              placeholder="Buscar cliente, serviço ou profissional..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar agendamentos"
            />
          </div>

          <div className="filter-select">
            <select
              className="control"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filtrar por status"
            >
              <option value="Todos">Todos os status</option>
              <option value="Agendado">Agendados</option>
              <option value="Concluído">Concluídos</option>
              <option value="Cancelado">Cancelados</option>
            </select>
          </div>

          <div className="date-filter">
            <input
              className="control"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              aria-label="Filtrar por data"
            />
          </div>

          {selectedDate && (
            <button
              className="secondary"
              onClick={() => setSelectedDate("")}
            >
              Limpar data
            </button>
          )}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Data e hora</th>
                <th>Serviço</th>
                <th>Profissional</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="customer-name">{item.customer}</div>
                    {item.phone && (
                      <div className="subtext">{item.phone}</div>
                    )}
                  </td>

                  <td>
                    <div>{item.date.split("-").reverse().join("/")}</div>
                    <div className="subtext">{item.time}</div>
                  </td>

                  <td>{item.service}</td>
                  <td>{item.professional}</td>
                  <td>{money(item.price)}</td>

                  <td>
                    <span className={`status ${statusClass[item.status]}`}>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <div className="actions">
                      <button
                        className="secondary"
                        onClick={() => openEdit(item)}
                      >
                        Editar
                      </button>

                      {item.status === "Agendado" && (
                        <>
                          <button
                            className="secondary"
                            onClick={() =>
                              changeStatus(item.id, "Concluído")
                            }
                          >
                            Concluir
                          </button>

                          <button
                            className="secondary danger"
                            onClick={() =>
                              changeStatus(item.id, "Cancelado")
                            }
                          >
                            Cancelar
                          </button>
                        </>
                      )}

                      <button
                        className="secondary danger"
                        onClick={() => deleteAppointment(item.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty">
              <p>Nenhum agendamento encontrado.</p>
              <p className="muted">
                Tente alterar os filtros ou cadastre um novo horário.
              </p>
            </div>
          )}
        </div>
      </section>

      <p className="notice">
        Os dados iniciais são demonstrativos e ficam salvos neste navegador.
        O sistema ainda não está conectado a um banco de dados.
      </p>

      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-modal-title"
          >
            <div className="modal-header">
              <h2 id="appointment-modal-title">
                {editingId ? "Editar agendamento" : "Novo agendamento"}
              </h2>

              <button
                className="secondary"
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveAppointment}>
              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="customer">Nome do cliente *</label>
                  <input
                    id="customer"
                    className="control"
                    value={form.customer}
                    onChange={(event) =>
                      updateField("customer", event.target.value)
                    }
                    required
                    maxLength={100}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="field">
                  <label htmlFor="phone">Telefone</label>
                  <input
                    id="phone"
                    className="control"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    maxLength={30}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="field">
                  <label htmlFor="service">Serviço *</label>
                  <select
                    id="service"
                    className="control"
                    value={form.service}
                    onChange={(event) =>
                      updateField("service", event.target.value)
                    }
                  >
                    <option>Corte masculino</option>
                    <option>Barba</option>
                    <option>Corte + barba</option>
                    <option>Acabamento</option>
                    <option>Outro</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="professional">Profissional *</label>
                  <select
                    id="professional"
                    className="control"
                    value={form.professional}
                    onChange={(event) =>
                      updateField("professional", event.target.value)
                    }
                  >
                    <option>Thaw</option>
                    <option>Otávio</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="price">Valor (R$) *</label>
                  <input
                    id="price"
                    className="control"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateField("price", Number(event.target.value))
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="date">Data *</label>
                  <input
                    id="date"
                    className="control"
                    type="date"
                    min={today()}
                    value={form.date}
                    onChange={(event) =>
                      updateField("date", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="time">Horário *</label>
                  <input
                    id="time"
                    className="control"
                    type="time"
                    value={form.time}
                    onChange={(event) =>
                      updateField("time", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="field full">
                  <label htmlFor="notes">Observações</label>
                  <textarea
                    id="notes"
                    className="control"
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      updateField("notes", event.target.value)
                    }
                    maxLength={500}
                    placeholder="Observações sobre o atendimento..."
                  />
                </div>
              </div>

              {error && <p className="error">{error}</p>}

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Voltar
                </button>

                <button type="submit" className="primary">
                  {editingId ? "Salvar alterações" : "Cadastrar horário"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
