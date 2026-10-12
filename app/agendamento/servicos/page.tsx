"use client";

import { useEffect, useState } from "react";

const services = [
  { id: "corte-simples", name: "Corte Simples", price: 40 },
  { id: "corte-barba", name: "Corte e Barba", price: 65 },
  { id: "corte-sobrancelha", name: "Corte e Sobrancelha", price: 40 },
  { id: "corte-hidratacao", name: "Corte e Hidratação", price: 55 },
  { id: "corte-progressiva", name: "Corte e Progressiva", price: 90 },
  { id: "corte-penteado", name: "Corte e Penteado", price: 65 },
  { id: "corte-platinado", name: "Corte e Platinado", price: 100 },
];

export default function ServicesPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("thawblack-theme") === "dark";

    setDarkMode(isDark);

    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const nextDarkMode = !darkMode;

    setDarkMode(nextDarkMode);

    document.documentElement.dataset.theme = nextDarkMode
      ? "dark"
      : "light";

    localStorage.setItem(
      "thawblack-theme",
      nextDarkMode ? "dark" : "light"
    );
  }

  function goBack() {
    window.location.href = "/";
  }

  function selectService(serviceId: string) {
    sessionStorage.setItem("thawblack-selected-service", serviceId);
    window.location.href = "/agendamento/profissional";
  }

  return (
    <main className="app-shell">
      <section className="app-frame">
        <header className="services-header">
          <button
            type="button"
            className="back-button"
            onClick={goBack}
            aria-label="Voltar"
          >
            <span>‹</span>
          </button>

          <a href="/" className="services-brand">
            <img
              src={
                darkMode
                  ? "/assets/home-logo-dark.png"
                  : "/assets/home-logo-light.png"
              }
              alt="ThawBlack"
            />
          </a>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {darkMode ? "☀" : "☾"}
          </button>
        </header>

        <main className="services-content">
          <div className="services-heading">
            <span className="services-eyebrow">
              THAWBLACK · BARBEARIA & ESCOLA
            </span>

            <h1>Selecione um serviço</h1>

            <p>
              Escolha o serviço ideal para você e continue seu agendamento.
            </p>
          </div>

          <div className="service-list">
            {services.map((service, index) => (
              <button
                type="button"
                key={service.id}
                className="service-card"
                onClick={() => selectService(service.id)}
              >
                <span className="service-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="service-info">
                  <span className="service-name">
                    {service.name}
                  </span>

                  <span className="service-price">
                    {service.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </span>

                <span className="service-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>

          <p className="services-footer-note">
            O próximo passo será escolher seu profissional.
          </p>
        </main>
      </section>
    </main>
  );
}