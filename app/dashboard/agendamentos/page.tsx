
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Status =
  | "Agendado"
  | "Em andamento"
  | "Concluído"
  | "Cancelado"
  | "Não compareceu";

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

type AppointmentRow = {
  id: string;
  status: string;
  start_at: string;
  end_at: string;
  notes: string | null;
  clients: { name: string; phone: string } | null;
  professionals: { name: string } | null;
  appointment_items: {
    service_name: string;
    price_snapshot: number;
  }[];
};

type PaymentRow = {
  amount: number;
  paid_at: string | null;
};

const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function dateParts(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function statusFromDatabase(status: string): Status {
  const statuses: Record<string, Status> = {
    confirmed: "Agendado",
    in_progress: "Em andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
    no_show: "Não compareceu",
  };

  return statuses[status] ?? "Agendado";
}

function statusToDatabase(status: Status) {
  const statuses: Record<Status, string> = {
    Agendado: "confirmed",
    "Em andamento": "in_progress",
    Concluído: "completed",
    Cancelado: "cancelled",
    "Não compareceu": "no_show",
  };

  return statuses[status];
}

const statusClass: Record<Status, string> = {
  Agendado: "status-scheduled",
  "Em andamento": "status-scheduled",
  Concluído: "status-done",
  Cancelado: "status-cancelled",
  "Não compareceu": "status-cancelled",
};

export default function AgendamentosPage() {
  const supabase = useMemo(() => createClient(), []);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [ready, setReady] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [selectedDate, setSelectedDate] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [revenueToday, setRevenueToday] = useState(0);
  const [paymentAppointment, setPaymentAppointment] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "pix" | "debit" | "credit">("pix");

  const loadAppointments = useCallback(async () => {
    setReady(false);
    setLoadingError("");

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        status,
        start_at,
        end_at,
        notes,
        clients (
          name,
          phone
        ),
        professionals (
          name
        ),
        appointment_items (
          service_name,
          price_snapshot
        )
      `)
      .order("start_at", { ascending: true });

    if (error) {
      console.error("Erro ao carregar agendamentos:", error);
      setLoadingError(
        "Não foi possível carregar os agendamentos. Verifique a conexão com o Supabase."
      );
      setReady(true);
      return;
    }

    const rows = (data ?? []) as unknown as AppointmentRow[];

    const mapped: Appointment[] = rows.map((row) => {
      const dateTime = dateParts(row.start_at);

      return {
        id: row.id,
        customer: row.clients?.name ?? "Cliente não identificado",
        phone: row.clients?.phone ?? "",
        service:
          row.appointment_items
            ?.map((item) => item.service_name)
            .join(" + ") || "Serviço não informado",
        professional: row.professionals?.name ?? "Não informado",
        date: dateTime.date,
        time: dateTime.time,
        price:
          row.appointment_items?.reduce(
            (total, item) => total + Number(item.price_snapshot || 0),
            0
          ) ?? 0,
        status: statusFromDatabase(row.status),
        notes: row.notes ?? "",
      };
    });

    setAppointments(mapped);

    // O faturamento considera somente pagamentos efetivamente recebidos.
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("amount, paid_at")
      .eq("status", "paid")
      .not("paid_at", "is", null);

    if (paymentsError) {
      console.error("Erro ao carregar pagamentos:", paymentsError);
      setRevenueToday(0);
    } else {
      const paidToday = ((payments ?? []) as PaymentRow[]).filter(
        (payment) =>
          payment.paid_at &&
          dateParts(payment.paid_at).date === today()
      );

      setRevenueToday(
        paidToday.reduce(
          (total, payment) => total + Number(payment.amount || 0),
          0
        )
      );
    }

    setReady(true);
  }, [supabase]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

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

  async function changeStatus(id: string, status: Status) {
    setUpdatingId(id);
    setLoadingError("");

    const { error } = await supabase
      .from("appointments")
      .update({ status: statusToDatabase(status) })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar status:", error);
      setLoadingError("Não foi possível atualizar o status do agendamento.");
      setUpdatingId(null);
      return;
    }

    // Atualiza somente o agendamento alterado, sem recarregar a página inteira.
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status }
          : appointment
      )
    );

    setUpdatingId(null);
  }

  async function confirmPaymentAndComplete() {
    if (!paymentAppointment) return;

    const appointment = paymentAppointment;
    setUpdatingId(appointment.id);
    setLoadingError("");

    const { data, error } = await supabase.rpc(
      "record_appointment_payment_and_complete",
      {
        p_appointment_id: appointment.id,
        p_method: paymentMethod,
      }
    );

    if (error || !data?.success) {
      console.error("Erro ao registrar pagamento e concluir atendimento:", error ?? data);
      setLoadingError(
        data?.message ||
          error?.message ||
          "Não foi possível registrar o pagamento. O atendimento continua em andamento."
      );
      setUpdatingId(null);
      return;
    }

    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id
          ? { ...item, status: "Concluído" }
          : item
      )
    );

    setRevenueToday((current) => current + Number(data.amount ?? appointment.price));
    setPaymentAppointment(null);
    setUpdatingId(null);
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
          --muted: color-mix(in srgb, var(--dashboard-text, #f1eee3) 60%, transparent);
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
        .appointments-page *::after { box-sizing: border-box; }
        .appointments-page .loading { color: var(--muted); padding: 24px; }
        .appointments-page .topbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; margin-bottom: 28px;
        }
        .appointments-page h1 {
          font-size: clamp(26px, 3vw, 34px);
          letter-spacing: -1px; margin: 0 0 8px;
        }
        .appointments-page p { margin-top: 0; }
        .appointments-page .muted { color: var(--muted); font-size: 14px; }
        .appointments-page button,
        .appointments-page input,
        .appointments-page select { font: inherit; }
        .appointments-page button { cursor: pointer; }
        .appointments-page button:disabled { opacity: .5; cursor: wait; }
        .appointments-page .primary {
          border: 1px solid var(--accent); border-radius: 9px;
          padding: 12px 17px; background: var(--accent);
          color: #171716; font-weight: 700;
        }
        .appointments-page .secondary {
          border: 1px solid var(--border); border-radius: 8px;
          padding: 8px 10px; background: transparent;
          color: var(--text); font-size: 13px;
        }
        .appointments-page .metrics {
          display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px; margin-bottom: 26px;
        }
        .appointments-page .metric,
        .appointments-page .panel {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 13px;
        }
        .appointments-page .metric { padding: 20px; }
        .appointments-page .metric-label { color: var(--muted); font-size: 13px; }
        .appointments-page .metric-value {
          font-size: 27px; font-weight: 700; margin-top: 12px;
        }
        .appointments-page .panel { overflow: hidden; }
        .appointments-page .filters {
          display: flex; align-items: center; flex-wrap: wrap;
          gap: 12px; padding: 18px; border-bottom: 1px solid var(--border);
        }
        .appointments-page .control {
          width: 100%; min-width: 0; border: 1px solid var(--border);
          border-radius: 8px; padding: 11px 12px;
          background: var(--input); color: var(--text);
        }
        .appointments-page .control::placeholder { color: var(--muted); }
        .appointments-page .search { flex: 1 1 230px; }
        .appointments-page .filter-select { flex: 0 1 180px; }
        .appointments-page .date-filter { flex: 0 1 170px; }
        .appointments-page .table-wrap { overflow-x: auto; }
        .appointments-page table {
          width: 100%;
          min-width: 1160px;
          table-layout: fixed;
          border-collapse: collapse;
          text-align: left;
        }
        .appointments-page th {
          color: var(--muted); font-size: 12px; font-weight: 600;
          text-transform: uppercase; letter-spacing: .5px;
          background: var(--surface);
        }
        .appointments-page th,
        .appointments-page td {
          padding: 16px 18px; border-bottom: 1px solid var(--border);
        }
        .appointments-page td { font-size: 13px; }
        .appointments-page tbody tr:hover { background: var(--surface-hover); }
        .appointments-page .customer-name { font-weight: 700; margin-bottom: 5px; }
        .appointments-page .subtext { color: var(--muted); font-size: 12px; }
        .appointments-page .status {
          display: inline-block; border-radius: 20px; padding: 6px 9px;
          font-size: 11px; font-weight: 700; white-space: nowrap;
        }
        .appointments-page .status-scheduled { color: #f4d779; background: #5b491b; }
        .appointments-page .status-done { color: #a7f3d0; background: #174b3b; }
        .appointments-page .status-cancelled { color: #fecaca; background: #542626; }
        .appointments-page .actions {
          display: flex;
          flex-wrap: wrap;
          align-content: flex-start;
          align-items: flex-start;
          gap: 6px;
          height: 80px;
          min-height: 80px;
          overflow: hidden;
        }
        .appointments-page .actions button {
          white-space: nowrap;
          flex: 0 0 auto;
        }
        .appointments-page .empty {
          text-align: center; padding: 48px 20px; color: var(--muted);
        }
        .appointments-page .error {
          margin: 0 0 16px; padding: 12px 16px;
          border: 1px solid #8b3333; border-radius: 8px;
          color: #fca5a5; background: #542626;
        }
        .appointments-page .notice {
          margin-top: 16px; color: var(--muted); font-size: 12px;
        }
        .appointments-page .modal-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          display: grid; place-items: center; padding: 18px;
          background: rgba(0, 0, 0, .72);
        }
        .appointments-page .payment-modal {
          width: min(100%, 460px); padding: 24px;
          border: 1px solid var(--border); border-radius: 14px;
          background: var(--surface); color: var(--text);
          box-shadow: 0 24px 80px rgba(0, 0, 0, .4);
        }
        .appointments-page .payment-modal h2 {
          margin: 0 0 8px; font-size: 22px;
        }
        .appointments-page .payment-modal .modal-field {
          display: grid; gap: 8px; margin-top: 18px;
        }
        .appointments-page .payment-modal .modal-label {
          color: var(--muted); font-size: 13px; font-weight: 600;
        }
        .appointments-page .payment-modal .payment-value {
          font-size: 26px; font-weight: 700; color: var(--accent);
        }
        .appointments-page .payment-modal .modal-actions {
          display: flex; justify-content: flex-end; flex-wrap: wrap;
          gap: 10px; margin-top: 24px;
        }
        .appointments-page .payment-modal .primary:disabled {
          opacity: .55; cursor: wait;
        }
        @media (max-width: 700px) {
          .appointments-page { padding: 22px 14px; }
          .appointments-page .topbar {
            align-items: flex-start; flex-direction: column;
          }
          .appointments-page .metrics { grid-template-columns: 1fr; gap: 10px; }
          .appointments-page .metric { padding: 16px; }
          .appointments-page .metric-value { font-size: 23px; }
          .appointments-page .filters { align-items: stretch; }
          .appointments-page .search,
          .appointments-page .filter-select,
          .appointments-page .date-filter { flex: 1 1 100%; }
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

        <button
          type="button"
          className="primary"
          onClick={() => void loadAppointments()}
          disabled={updatingId !== null}
        >
          Atualizar agendamentos
        </button>
      </header>

      {loadingError && <p className="error">{loadingError}</p>}

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
          <div className="metric-label">Recebimentos de hoje</div>
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
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluídos</option>
              <option value="Cancelado">Cancelados</option>
              <option value="Não compareceu">Não compareceu</option>
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
            <button className="secondary" onClick={() => setSelectedDate("")}>
              Limpar data
            </button>
          )}
        </div>

        <div className="table-wrap">
          <table>
            <colgroup>
              <col style={{ width: "220px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "220px" }} />
            </colgroup>
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
                      {item.status === "Agendado" && (
                        <>
                          <button
                            type="button"
                            className="secondary"
                            disabled={updatingId === item.id}
                            onClick={() =>
                              void changeStatus(item.id, "Em andamento")
                            }
                          >
                            Iniciar
                          </button>

                          <button
                            type="button"
                            className="secondary"
                            disabled={updatingId === item.id}
                            onClick={() =>
                              void changeStatus(item.id, "Cancelado")
                            }
                          >
                            Cancelar
                          </button>

                          <button
                            type="button"
                            className="secondary"
                            disabled={updatingId === item.id}
                            onClick={() =>
                              void changeStatus(item.id, "Não compareceu")
                            }
                          >
                            Não compareceu
                          </button>
                        </>
                      )}

                      {item.status === "Em andamento" && (
                        <button
                          type="button"
                          className="secondary"
                          disabled={updatingId === item.id}
                          onClick={() => {
                            alert("O botão Concluir foi acionado!");
                            setPaymentMethod("pix");
                            setPaymentAppointment(item);
                          }}
                        >
                          Concluir
                        </button>
                      )}
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
                Tente alterar os filtros ou atualizar os agendamentos.
              </p>
            </div>
          )}
        </div>
      </section>

      {paymentAppointment && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && updatingId === null) {
              setPaymentAppointment(null);
            }
          }}
        >
          <section
            className="payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
          >
            <h2 id="payment-modal-title">Registrar pagamento</h2>
            <p className="muted">
              Confirme o recebimento para concluir este atendimento.
            </p>

            <div className="modal-field">
              <span className="modal-label">Cliente</span>
              <strong>{paymentAppointment.customer}</strong>
            </div>

            <div className="modal-field">
              <span className="modal-label">Serviço</span>
              <strong>{paymentAppointment.service}</strong>
            </div>

            <div className="modal-field">
              <span className="modal-label">Valor a receber</span>
              <div className="payment-value">{money(paymentAppointment.price)}</div>
            </div>

            <label className="modal-field">
              <span className="modal-label">Forma de pagamento</span>
              <select
                className="control"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as "cash" | "pix" | "debit" | "credit")
                }
                disabled={updatingId === paymentAppointment.id}
              >
                <option value="cash">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="debit">Cartão de débito</option>
                <option value="credit">Cartão de crédito</option>
              </select>
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setPaymentAppointment(null)}
                disabled={updatingId === paymentAppointment.id}
              >
                Voltar
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => void confirmPaymentAndComplete()}
                disabled={updatingId === paymentAppointment.id}
              >
                {updatingId === paymentAppointment.id
                  ? "Registrando..."
                  : "Confirmar pagamento"}
              </button>
            </div>
          </section>
        </div>
      )}

      <p className="notice">
        Os agendamentos são carregados diretamente do banco de dados.
        Os recebimentos consideram somente pagamentos confirmados.
      </p>
    </main>
  );
}
