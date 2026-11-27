
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type SelectionStyle = "clock" | "list";
type BusyInterval = {
  start_at: string;
  end_at: string;
};

function getStoredId(key: string): string {
  const stored = sessionStorage.getItem(key);
  if (!stored) return "";

  try {
    const parsed = JSON.parse(stored);

    if (typeof parsed === "string") return parsed;

    if (parsed && typeof parsed === "object") {
      return (
        parsed.id ??
        parsed.professional_id ??
        parsed.service_id ??
        parsed.uuid ??
        ""
      );
    }
  } catch {
    return stored;
  }

  return "";
}

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];

const times = [
  "09:00", "09:30",
  "10:00", "10:30",
  "11:00", "11:30",
  "13:00", "13:30",
  "14:00", "14:30",
  "15:00", "15:30",
  "16:00", "16:30",
  "17:00", "17:30",
  "18:00", "18:30",
  "19:00", "19:30",
  "20:00",
];

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours < 12 ? "AM" : "PM";
  const hour = hours % 12 || 12;

  return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function getDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function DatePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [style, setStyle] = useState<SelectionStyle>("clock");

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [professionalId, setProfessionalId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [busyIntervals, setBusyIntervals] = useState<BusyInterval[]>([]);
  const [serviceDuration, setServiceDuration] = useState(0);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const supabase = useMemo(() => createClient(), []);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const dark = localStorage.getItem("thawblack-theme") === "dark";

    setDarkMode(dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    setDate(getDateKey(new Date()));

    setProfessionalId(
      getStoredId("thawblack-selected-professional")
    );

    setServiceId(
      getStoredId("thawblack-selected-service")
    );
  }, []);

  useEffect(() => {
    if (!date || !professionalId || !serviceId) {
      setBusyIntervals([]);
      setServiceDuration(0);
      setAvailabilityError(
        date && (!professionalId || !serviceId)
          ? "Não foi possível identificar o profissional ou serviço selecionado. Volte uma etapa e selecione novamente."
          : ""
      );
      setLoadingAvailability(false);
      return;
    }

    let cancelled = false;

    async function loadAvailability() {
      setLoadingAvailability(true);
      setAvailabilityError("");
      setBusyIntervals([]);
      setServiceDuration(0);

      const [availabilityResult, serviceResult] = await Promise.all([
        supabase.rpc("get_public_professional_availability", {
          p_professional_id: professionalId,
          p_date: date,
        }),

        supabase
          .from("professional_services")
          .select("duration_minutes")
          .eq("professional_id", professionalId)
          .eq("service_id", serviceId)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      if (availabilityResult.error || serviceResult.error) {
        console.error(
          "Erro ao consultar disponibilidade:",
          availabilityResult.error ?? serviceResult.error
        );

        setAvailabilityError(
          "Não foi possível consultar os horários. Tente selecionar a data novamente."
        );
        setLoadingAvailability(false);
        return;
      }

      if (!serviceResult.data) {
        setAvailabilityError(
          "Não foi possível encontrar a duração deste serviço para o profissional selecionado."
        );
        setLoadingAvailability(false);
        return;
      }

      setBusyIntervals(availabilityResult.data ?? []);
      setServiceDuration(serviceResult.data.duration_minutes);
      setLoadingAvailability(false);
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [date, professionalId, serviceId]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = month.getDay();

  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  const selectedDate = date ? new Date(`${date}T12:00:00`) : null;

  const monthLabel = month.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  function isTimeUnavailable(value: string) {
    if (
      loadingAvailability ||
      !!availabilityError ||
      serviceDuration <= 0 ||
      !date
    ) {
      return true;
    }

    const start = new Date(`${date}T${value}:00-03:00`).getTime();
    const end = start + serviceDuration * 60 * 1000;

    // Impede selecionar horários que já passaram.
    if (start <= Date.now()) return true;

    return busyIntervals.some((appointment) => {
      const busyStart = new Date(appointment.start_at).getTime();
      const busyEnd = new Date(appointment.end_at).getTime();

      // Bloqueia qualquer sobreposição entre os atendimentos.
      return start < busyEnd && end > busyStart;
    });
  }

  function toggleTheme() {
    const next = !darkMode;

    setDarkMode(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";

    localStorage.setItem("thawblack-theme", next ? "dark" : "light");
  }

  function selectDate(day: number) {
    const selected = new Date(
      month.getFullYear(),
      month.getMonth(),
      day,
    );

    selected.setHours(0, 0, 0, 0);

    if (selected < today) return;

    setDate(getDateKey(selected));
    setTime("");
  }

  function changeMonth(offset: number) {
    setMonth(
      new Date(
        month.getFullYear(),
        month.getMonth() + offset,
        1,
      ),
    );

    setDate("");
    setTime("");
  }

  function selectTime(value: string) {
    setTime(value);
  }

  function continueBooking() {
    if (!date || !time) return;

    sessionStorage.setItem("thawblack-selected-date", date);
    sessionStorage.setItem("thawblack-selected-time", time);

    window.location.href = "/agendamento/observacoes";
  }

  return (
    <main className="app-shell date-page">
      <section className="app-frame date-frame">
        <header className="services-header">
          <button
            className="back-button"
            type="button"
            onClick={() => {
              window.location.href = "/agendamento/profissional";
            }}
            aria-label="Voltar para profissionais"
          >
            ‹
          </button>

          <a href="/" className="services-brand">
            <img
              src={
                darkMode
                  ? "/assets/home-logo-dark.png"
                  : "/assets/home-logo-light.png"
              }
              alt="ThawBlack — Barbearia & Escola"
            />
          </a>

          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {darkMode ? "☀" : "☾"}
          </button>
        </header>

        <section className="date-content">
          <div className="date-heading">
            <span className="date-eyebrow">
              THAWBLACK · BARBEARIA & ESCOLA
            </span>

            <h1>Agende seu horário</h1>

            <p className="date-subtitle">
              Escolha o melhor dia e horário para você.
            </p>
          </div>

          <div className="date-layout">
            <section className="calendar-card">
              <div className="calendar-header">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  disabled={
                    month.getFullYear() === today.getFullYear() &&
                    month.getMonth() === today.getMonth()
                  }
                  aria-label="Mês anterior"
                >
                  ‹
                </button>

                <span>{monthLabel}</span>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Próximo mês"
                >
                  ›
                </button>
              </div>

              <div className="calendar-grid">
                {weekdays.map((day, index) => (
                  <span key={`${day}-${index}`} className="dow">
                    {day}
                  </span>
                ))}

                {Array.from({ length: firstDay }, (_, index) => (
                  <span key={`empty-${index}`} />
                ))}

                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;

                  const currentDay = new Date(
                    month.getFullYear(),
                    month.getMonth(),
                    day,
                  );

                  currentDay.setHours(0, 0, 0, 0);

                  const key = getDateKey(currentDay);

                  return (
                    <button
                      key={day}
                      type="button"
                      className={`day ${date === key ? "selected" : ""}`}
                      disabled={currentDay < today}
                      onClick={() => selectDate(day)}
                      aria-pressed={date === key}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <p className="selected-date-label">
                {selectedDate
                  ? selectedDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })
                  : "Selecione uma data"}
              </p>
            </section>

            <section className="times-content">
              <div className="times-heading">
                <div>
                  <h2>Escolha um horário</h2>

                  <p className="desktop-time-description">
                    Selecione uma opção disponível.
                  </p>

                  <p className="mobile-time-description">
                    Escolha entre o relógio ou a lista.
                  </p>
                </div>

                <div className="time-style-toggle">
                  <button
                    type="button"
                    className={style === "clock" ? "active" : ""}
                    onClick={() => setStyle("clock")}
                    aria-pressed={style === "clock"}
                  >
                    ◷ Relógio
                  </button>

                  <button
                    type="button"
                    className={style === "list" ? "active" : ""}
                    onClick={() => setStyle("list")}
                    aria-pressed={style === "list"}
                  >
                    ▦ Lista
                  </button>
                </div>
              </div>

              {loadingAvailability && (
                <p className="clock-hint">
                  Consultando horários disponíveis...
                </p>
              )}

              {availabilityError && (
                <p className="clock-hint" role="alert">
                  {availabilityError}
                </p>
              )}

              {style === "clock" ? (
                <div className="clock-picker">
                  <div className="clock-face">
                    {times.map((value, index) => {
                      const angle =
                        (index / times.length) * 2 * Math.PI -
                        Math.PI / 2;

                      const x = 50 + 39 * Math.cos(angle);
                      const y = 50 + 39 * Math.sin(angle);

                      return (
                        <button
                          key={value}
                          type="button"
                          className={`clock-time ${time === value ? "selected" : ""
                            }`}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                          }}
                          onClick={() => selectTime(value)}
                          disabled={isTimeUnavailable(value)}
                          aria-pressed={time === value}
                          aria-label={`Selecionar ${formatTime(value)}`}
                        >
                          {value}
                        </button>
                      );
                    })}

                    <div className="clock-center">
                      <span>
                        {time ? formatTime(time) : "--:--"}
                      </span>

                      <small>
                        {time ? "Selecionado" : "Horário"}
                      </small>
                    </div>
                  </div>

                  <p className="clock-hint">
                    Os horários indisponíveis não podem ser selecionados.
                  </p>
                </div>
              ) : (
                <div className="time-grid">
                  {times.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`time-slot ${time === value ? "selected" : ""
                        }`}
                      onClick={() => selectTime(value)}
                      disabled={isTimeUnavailable(value)}
                      aria-pressed={time === value}
                    >
                      {formatTime(value)}
                    </button>
                  ))}
                </div>
              )}

              <div className="desktop-time-grid">
                {times.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`time-slot ${time === value ? "selected" : ""
                      }`}
                    onClick={() => selectTime(value)}
                    disabled={isTimeUnavailable(value)}
                    aria-pressed={time === value}
                  >
                    {formatTime(value)}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="date-selection-summary">
            <span>Seu horário</span>

            <strong>
              {date && time
                ? `${selectedDate?.toLocaleDateString("pt-BR")} · ${formatTime(time)}`
                : "Selecione a data e o horário"}
            </strong>
          </div>

          <button
            type="button"
            className="btn-primary date-continue"
            disabled={
              !date ||
              !time ||
              loadingAvailability ||
              !!availabilityError ||
              isTimeUnavailable(time)
            }
            onClick={continueBooking}
          >
            Continuar →
          </button>
        </section>
      </section>
    </main>
  );
}
