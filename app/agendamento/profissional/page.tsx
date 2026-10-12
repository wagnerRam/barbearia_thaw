"use client";

import { useEffect, useState } from "react";

const professionals = [
  {
    id: "thaw",
    name: "Thaw",
    description: "Barbeira",
    image: "/assets/barbers/profissional-thaw.png",
  },
  {
    id: "otavio",
    name: "Otávio",
    description: "Barbeiro",
    image: "/assets/barbers/profissional-otavio.png",
  },
];

export default function ProfessionalPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("thawblack-theme");
    const isDark = savedTheme === "dark";

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
      nextDarkMode ? "dark" : "light",
    );
  }

  function selectProfessional(professionalId: string) {
    sessionStorage.setItem(
      "thawblack-selected-professional",
      professionalId,
    );

    window.location.href = "/agendamento/data";
  }

  return (
    <main className="app-shell professionals-page">
      <section className="app-frame professionals-frame">
        <header className="services-header">
          <button
            type="button"
            className="back-button"
            onClick={() => {
              window.location.href = "/agendamento/servico";
            }}
            aria-label="Voltar para serviços"
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
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {darkMode ? "☀" : "☾"}
          </button>
        </header>

        <section className="professionals-content">
          <div className="professionals-heading">
            <span className="professionals-eyebrow">
              THAWBLACK · BARBEARIA & ESCOLA
            </span>

            <h1>Escolha seu profissional</h1>

            <p>
              Selecione quem vai cuidar do seu visual.
            </p>
          </div>

          <div className="professionals-grid">
            {professionals.map((professional, index) => (
              <button
                key={professional.id}
                type="button"
                className="professional-photo-card"
                onClick={() => selectProfessional(professional.id)}
              >
                <img
                  src={professional.image}
                  alt={`Foto de ${professional.name}`}
                />

                <span className="professional-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="professional-overlay">
                  <span className="professional-name">
                    {professional.name}
                  </span>

                  <span className="professional-description">
                    {professional.description}
                  </span>
                </span>

                <span
                  className="professional-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            ))}
          </div>

          <p className="professionals-footer-note">
            No próximo passo, escolha a data e o horário.
          </p>
        </section>
      </section>
    </main>
  );
}