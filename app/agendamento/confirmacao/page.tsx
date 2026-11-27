
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type BookingDetails = {
  serviceName: string;
  professionalName: string;
  price: number;
  duration: number;
};

export default function ConfirmacaoPage() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [servico, setServico] = useState("");
  const [profissional, setProfissional] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");

  const [details, setDetails] = useState<BookingDetails>({
    serviceName: "",
    professionalName: "",
    price: 0,
    duration: 0,
  });

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const isDark =
      localStorage.getItem("thawblack-theme") === "dark";

    setDarkMode(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";

    const selectedService =
      sessionStorage.getItem("thawblack-selected-service") || "";

    const selectedProfessional =
      sessionStorage.getItem("thawblack-selected-professional") || "";

    setServico(selectedService);
    setProfissional(selectedProfessional);

    setData(
      sessionStorage.getItem("thawblack-selected-date") || ""
    );

    setHorario(
      sessionStorage.getItem("thawblack-selected-time") || ""
    );

    setObservacoes(
      sessionStorage.getItem("thawblack-observacoes") || ""
    );

    setNomeCliente(
      sessionStorage.getItem("thawblack-cliente-nome") || ""
    );

    setTelefoneCliente(
      sessionStorage.getItem("thawblack-cliente-telefone") || ""
    );

    setEmailCliente(
      sessionStorage.getItem("thawblack-cliente-email") || ""
    );

    async function loadBookingDetails() {
      if (!selectedService || !selectedProfessional) {
        setLoadingDetails(false);
        return;
      }

      try {
        const supabase = createClient();

        const [serviceResult, professionalResult, relationResult] =
          await Promise.all([
            supabase
              .from("services")
              .select("name")
              .eq("id", selectedService)
              .maybeSingle(),

            supabase
              .from("professionals")
              .select("name")
              .eq("id", selectedProfessional)
              .maybeSingle(),

            supabase
              .from("professional_services")
              .select("price, duration_minutes")
              .eq("service_id", selectedService)
              .eq("professional_id", selectedProfessional)
              .eq("active", true)
              .maybeSingle(),
          ]);

        if (serviceResult.error) throw serviceResult.error;
        if (professionalResult.error) throw professionalResult.error;
        if (relationResult.error) throw relationResult.error;

        setDetails({
          serviceName: serviceResult.data?.name ?? "",
          professionalName: professionalResult.data?.name ?? "",
          price: Number(relationResult.data?.price ?? 0),
          duration: Number(
            relationResult.data?.duration_minutes ?? 0
          ),
        });
      } catch (error) {
        console.error("Erro ao carregar detalhes do agendamento:", error);
        setErrorMessage(
          "Não foi possível carregar os detalhes do serviço. Atualize a página e tente novamente."
        );
      } finally {
        setLoadingDetails(false);
      }
    }

    void loadBookingDetails();
  }, []);

  function toggleTheme() {
    const next = !darkMode;

    setDarkMode(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";

    localStorage.setItem(
      "thawblack-theme",
      next ? "dark" : "light"
    );
  }

  function voltarAoInicio() {
    const chavesDoAgendamento = [
      "thawblack-selected-service",
      "thawblack-selected-professional",
      "thawblack-selected-date",
      "thawblack-selected-time",
      "thawblack-observacoes",
      "thawblack-cliente-nome",
      "thawblack-cliente-telefone",
      "thawblack-cliente-email",
      "thawblack-last-appointment-id",
    ];

    chavesDoAgendamento.forEach((chave) => {
      sessionStorage.removeItem(chave);
    });

    router.push("/");
  }

  const dataFormatada = data
    ? new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "Não selecionada";

  const precoFormatado = details.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  async function confirmarAgendamento() {
    if (submitting) return;

    setErrorMessage("");

    if (
      !nomeCliente.trim() ||
      !telefoneCliente.trim()
    ) {
      setErrorMessage(
        "Seus dados não foram encontrados. Volte à etapa de dados do cliente e confira as informações."
      );
      return;
    }

    if (
      emailCliente.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente.trim())
    ) {
      setErrorMessage(
        "O e-mail informado não parece válido. Confira o endereço ou deixe o campo vazio."
      );
      return;
    }

    if (!servico || !profissional || !data || !horario) {
      setErrorMessage(
        "Confira as etapas anteriores e selecione todos os dados do agendamento."
      );
      return;
    }

    if (!details.serviceName || !details.professionalName || !details.duration) {
      setErrorMessage(
        "Não foi possível identificar o serviço ou profissional selecionado. Volte às etapas anteriores e selecione novamente."
      );
      return;
    }

    setSubmitting(true);

    try {
      // Os horários do projeto são tratados no fuso de São Paulo (UTC-3).
      const startAt = new Date(
        `${data}T${horario}:00-03:00`
      );

      if (Number.isNaN(startAt.getTime())) {
        throw new Error("A data ou o horário selecionado é inválido.");
      }

      if (startAt.getTime() <= Date.now()) {
        throw new Error(
          "Esse horário já passou. Volte e escolha uma data e horário futuros."
        );
      }

      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          professional_id: profissional,
          service_id: servico,
          start_at: startAt.toISOString(),
          client_name: nomeCliente.trim(),
          client_phone: telefoneCliente.trim(),
          client_email: emailCliente.trim() || null,
          notes: observacoes.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
          result.message ||
          "Não foi possível confirmar o agendamento."
        );
      }

      setConfirmado(true);

      // Guarda apenas a confirmação da tela, não o agendamento.
      sessionStorage.setItem(
        "thawblack-last-appointment-id",
        result.appointment?.id ?? result.appointment_id ?? ""
      );
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao confirmar o agendamento. Tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-shell confirmation-page">
      <section className="app-frame confirmation-frame">
        <header className="services-header">
          <button
            className="back-button"
            type="button"
            onClick={() => router.push("/agendamento/observacoes")}
            aria-label="Voltar para observações"
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

        <section className="confirmation-content">
          {confirmado ? (
            <div className="confirmation-success">
              <div className="success-icon">✓</div>

              <span className="confirmation-eyebrow">
                THAWBLACK · AGENDAMENTO
              </span>

              <h1>Agendamento confirmado!</h1>

              <p>
                Seu agendamento foi registrado com sucesso. A
                barbearia já recebeu seus dados.
              </p>

              <div className="success-summary">
                <span>Serviço</span>
                <strong>{details.serviceName}</strong>

                <span>Profissional</span>
                <strong>{details.professionalName}</strong>

                <span>Data e horário</span>
                <strong>
                  {dataFormatada} · {horario}
                </strong>

                <span>Valor</span>
                <strong>{precoFormatado}</strong>
              </div>

              <button
                type="button"
                className="btn-primary confirmation-button"
                onClick={() => router.push("/")}
              >
                Voltar ao início →
              </button>
            </div>
          ) : (
            <>
              <div className="confirmation-heading">
                <span className="confirmation-eyebrow">
                  ÚLTIMA ETAPA
                </span>

                <h1>Confirme seu agendamento</h1>

                <p className="confirmation-subtitle">
                  Confira os detalhes antes de finalizar.
                </p>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  style={{
                    marginBottom: "20px",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    background: darkMode ? "#542626" : "#fce8e8",
                    color: darkMode ? "#fecaca" : "#9b2525",
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <div className="confirmation-layout">
                <div className="confirmation-card">
                  <div className="confirmation-card-heading">
                    <div>
                      <span className="confirmation-label">
                        RESUMO DO AGENDAMENTO
                      </span>

                      <h2>
                        {loadingDetails
                          ? "Carregando serviço..."
                          : details.serviceName || "Serviço não selecionado"}
                      </h2>
                    </div>

                    <div className="confirmation-price">
                      {precoFormatado}
                    </div>
                  </div>

                  <div className="confirmation-divider" />

                  <div className="booking-summary-row">
                    <span>Cliente</span>
                    <strong>{nomeCliente || "Não informado"}</strong>
                  </div>

                  <div className="booking-summary-row">
                    <span>Profissional</span>
                    <strong>
                      {loadingDetails
                        ? "Carregando..."
                        : details.professionalName || "Não selecionado"}
                    </strong>
                  </div>

                  <div className="booking-summary-row">
                    <span>Data</span>
                    <strong>{dataFormatada}</strong>
                  </div>

                  <div className="booking-summary-row">
                    <span>Horário</span>
                    <strong>{horario || "Não selecionado"}</strong>
                  </div>

                  {details.duration > 0 && (
                    <div className="booking-summary-row">
                      <span>Duração</span>
                      <strong>{details.duration} minutos</strong>
                    </div>
                  )}

                  <div className="booking-summary-row">
                    <span>Telefone</span>
                    <strong>{telefoneCliente || "Não informado"}</strong>
                  </div>

                  <div className="booking-summary-row">
                    <span>E-mail</span>
                    <strong className="confirmation-email">
                      {emailCliente || "Não informado"}
                    </strong>
                  </div>

                  {observacoes.trim() && (
                    <div className="confirmation-notes">
                      <span>Observações</span>
                      <p>{observacoes}</p>
                    </div>
                  )}
                </div>

                <aside className="confirmation-side">
                  <div className="confirmation-notice">
                    <span className="notice-icon">i</span>

                    <div>
                      <strong>Antes de confirmar</strong>
                      <p>
                        Confira os dados do seu agendamento.
                        O pagamento será realizado presencialmente
                        na barbearia.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary confirmation-button"
                    onClick={confirmarAgendamento}
                    disabled={submitting || loadingDetails}
                  >
                    {submitting
                      ? "Confirmando..."
                      : "Confirmar agendamento →"}
                  </button>

                  <button
                    type="button"
                    className="confirmation-back"
                    onClick={voltarAoInicio}
                    disabled={submitting}
                  >
                    ← Revisar meus dados
                  </button>
                </aside>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
