
"use client";

import { useEffect, useState } from "react";

export default function ClientePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const isDark = localStorage.getItem("thawblack-theme") === "dark";

    setDarkMode(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";

    setNome(sessionStorage.getItem("thawblack-cliente-nome") || "");
    setTelefone(
      sessionStorage.getItem("thawblack-cliente-telefone") || "",
    );
    setEmail(sessionStorage.getItem("thawblack-cliente-email") || "");
  }, []);

  function toggleTheme() {
    const next = !darkMode;

    setDarkMode(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("thawblack-theme", next ? "dark" : "light");
  }

  function continuar() {
    if (!nome.trim() || !telefone.trim() || !email.trim()) {
      alert("Preencha seu nome, telefone e e-mail.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert("Informe um e-mail válido.");
      return;
    }

    sessionStorage.setItem("thawblack-cliente-nome", nome.trim());
    sessionStorage.setItem("thawblack-cliente-telefone", telefone.trim());
    sessionStorage.setItem("thawblack-cliente-email", email.trim());

    window.location.href = "/agendamento/confirmacao";
  }

  return (
    <main className="app-shell client-page">
      <section className="app-frame client-frame">
        <header className="services-header">
          <button
            className="back-button"
            type="button"
            onClick={() => {
              window.location.href = "/agendamento/observacoes";
            }}
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

        <section className="client-page-content">
          <div className="client-page-heading">
            <span className="client-page-eyebrow">
              THAWBLACK · BARBEARIA & ESCOLA
            </span>

            <h1>Seus dados</h1>

            <p className="client-page-subtitle">
              Só precisamos de algumas informações para identificar seu
              agendamento e entrar em contato com você.
            </p>
          </div>

          <div className="client-form">
            <div className="client-form-intro">
              <h2>Informações de contato</h2>
              <p>Preencha seus dados para continuar.</p>
            </div>

            <label htmlFor="nomeCliente">Nome completo</label>
            <input
              id="nomeCliente"
              type="text"
              autoComplete="name"
              placeholder="Digite seu nome completo"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              maxLength={120}
              required
            />

            <label htmlFor="telefoneCliente">Telefone / WhatsApp</label>
            <input
              id="telefoneCliente"
              type="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              maxLength={20}
              required
            />

            <label htmlFor="emailCliente">E-mail</label>
            <input
              id="emailCliente"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              required
            />

            <p className="client-page-privacy">
              Seus dados serão associados às informações do agendamento.
            </p>

            <button
              type="button"
              className="btn-primary client-page-continue"
              onClick={continuar}
            >
              Continuar para confirmação →
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
