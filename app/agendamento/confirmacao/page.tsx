
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AgendamentoSalvo = {
  id: string;
  cliente: {
    nome: string;
    telefone: string;
    email: string;
  };
  servico: string;
  profissional: string;
  data: string;
  horario: string;
  observacoes: string;
  preco: number;
  status: string;
  criadoEm: string;
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

  useEffect(() => {
    const isDark =
      localStorage.getItem("thawblack-theme") === "dark";

    setDarkMode(isDark);
    document.documentElement.dataset.theme = isDark
      ? "dark"
      : "light";

    setServico(
      sessionStorage.getItem("thawblack-selected-service") || ""
    );
    setProfissional(
      sessionStorage.getItem("thawblack-selected-professional") || ""
    );
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
  }, []);

  function toggleTheme() {
    const next = !darkMode;

    setDarkMode(next);
    document.documentElement.dataset.theme = next
      ? "dark"
      : "light";

    localStorage.setItem(
      "thawblack-theme",
      next ? "dark" : "light"
    );
  }

  const nomesServicos: Record<string, string> = {
    "corte-simples": "Corte Simples",
    "corte-barba": "Corte e Barba",
    "corte-sobrancelha": "Corte e Sobrancelha",
    "corte-hidratacao": "Corte e Hidratação",
    "corte-progressiva": "Corte e Progressiva",
    "corte-penteado": "Corte e Penteado",
    "corte-platinado": "Corte e Platinado",
  };

  const nomesProfissionais: Record<string, string> = {
    thaw: "Thaw",
    otavio: "Otávio",
  };

  const precos: Record<string, number> = {
    "corte-simples": 40,
    "corte-barba": 65,
    "corte-sobrancelha": 40,
    "corte-hidratacao": 55,
    "corte-progressiva": 90,
    "corte-penteado": 65,
    "corte-platinado": 100,
  };

  const dataFormatada = data
    ? new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Não selecionada";

  const precoFormatado = (
    precos[servico] ?? 0
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function confirmarAgendamento() {
    if (!nomeCliente.trim() || !telefoneCliente.trim() || !emailCliente.trim()) {
      alert(
        "Seus dados não foram encontrados. Volte à etapa de dados do cliente e confira as informações."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente.trim())) {
      alert(
        "O e-mail salvo não parece válido. Volte à etapa de dados do cliente e confira."
      );
      return;
    }

    if (!servico || !profissional || !data || !horario) {
      alert(
        "Confira as etapas anteriores e selecione todos os dados do agendamento."
      );
      return;
    }

    try {
      const dadosSalvos = localStorage.getItem(
        "thawblack-agendamentos"
      );

      const agendamentosSalvos: AgendamentoSalvo[] =
        dadosSalvos ? JSON.parse(dadosSalvos) : [];

      if (!Array.isArray(agendamentosSalvos)) {
        throw new Error("Formato de agendamentos inválido.");
      }

      const agendamento: AgendamentoSalvo = {
        id: crypto.randomUUID(),
        cliente: {
          nome: nomeCliente.trim(),
          telefone: telefoneCliente.trim(),
          email: emailCliente.trim(),
        },
        servico,
        profissional,
        data,
        horario,
        observacoes: observacoes.trim(),
        preco: precos[servico] ?? 0,
        status: "pendente",
        criadoEm: new Date().toISOString(),
      };

      agendamentosSalvos.push(agendamento);

      localStorage.setItem(
        "thawblack-agendamentos",
        JSON.stringify(agendamentosSalvos)
      );

      setConfirmado(true);
    } catch {
      alert(
        "Não foi possível salvar o agendamento neste navegador."
      );
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

              <h1>Agendamento registrado!</h1>

              <p>
                Os detalhes foram salvos neste navegador. A
                barbearia ainda não recebeu o agendamento.
              </p>

              <div className="success-summary">
                <span>Serviço</span>
                <strong>{nomesServicos[servico] || servico}</strong>

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

              <div className="confirmation-layout">
                <div className="confirmation-card">
                  <div className="confirmation-card-heading">
                    <div>
                      <span className="confirmation-label">
                        RESUMO DO AGENDAMENTO
                      </span>
                      <h2>
                        {nomesServicos[servico] ||
                          "Serviço não selecionado"}
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
                      {nomesProfissionais[profissional] ||
                        "Não selecionado"}
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
                        Esta é uma versão de demonstração. O registro
                        será salvo somente neste navegador, sem envio
                        para a barbearia.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary confirmation-button"
                    onClick={confirmarAgendamento}
                  >
                    Confirmar agendamento →
                  </button>

                  <button
                    type="button"
                    className="confirmation-back"
                    onClick={() =>
                      router.push("/agendamento/cliente")
                    }
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
