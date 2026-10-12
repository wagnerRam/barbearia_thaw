
"use client";

import { useEffect, useState } from "react";

export default function ObservacoesPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  const [servico, setServico] = useState("");
  const [profissional, setProfissional] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");

  useEffect(() => {
    const isDark = localStorage.getItem("thawblack-theme") === "dark";

    setDarkMode(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";

    setServico(sessionStorage.getItem("thawblack-selected-service") || "");
    setProfissional(
      sessionStorage.getItem("thawblack-selected-professional") || "",
    );
    setData(sessionStorage.getItem("thawblack-selected-date") || "");
    setHorario(sessionStorage.getItem("thawblack-selected-time") || "");
    setObservacoes(
      sessionStorage.getItem("thawblack-observacoes") || "",
    );
  }, []);

  function toggleTheme() {
    const next = !darkMode;

    setDarkMode(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("thawblack-theme", next ? "dark" : "light");
  }

  function continuar() {
    sessionStorage.setItem("thawblack-observacoes", observacoes.trim());
    window.location.href = "/agendamento/cliente";
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

  const dataFormatada = data
    ? new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Data não selecionada";

  return (
    <main className="app-shell observacoes-page">
      <section className="app-frame observacoes-frame">
        <header className="services-header">
          <button
            className="back-button"
            type="button"
            onClick={() => {
              window.location.href = "/agendamento/data";
            }}
            aria-label="Voltar para data e horário"
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

        <section className="observacoes-content">
          <div className="observacoes-heading">
            <span className="observacoes-eyebrow">
              THAWBLACK · BARBEARIA & ESCOLA
            </span>

            <h1>Quase lá!</h1>

            <p className="observacoes-subtitle">
              Confira seu agendamento e conte como prefere seu atendimento.
            </p>
          </div>

          <div className="observacoes-layout">
            <section className="booking-summary">
              <h2>Resumo do agendamento</h2>

              <div className="booking-summary-row">
                <span>Serviço</span>
                <strong>
                  {nomesServicos[servico] || "Não selecionado"}
                </strong>
              </div>

              <div className="booking-summary-row">
                <span>Profissional</span>
                <strong>
                  {nomesProfissionais[profissional] || "Não selecionado"}
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
            </section>

            <section className="observacoes-form-card">
              <div className="observacoes-field">
                <label htmlFor="observacoes">
                  Alguma preferência ou observação?
                </label>

                <p>
                  Ex.: máquina na lateral, manter o comprimento em cima...
                </p>

                <textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(event) => setObservacoes(event.target.value)}
                  placeholder="Escreva aqui suas preferências (opcional)"
                  maxLength={500}
                  rows={5}
                />

                <span className="character-count">
                  {observacoes.length}/500 caracteres
                </span>
              </div>

              <button
                className="btn-primary observacoes-continue"
                type="button"
                onClick={continuar}
              >
                Continuar →
              </button>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
