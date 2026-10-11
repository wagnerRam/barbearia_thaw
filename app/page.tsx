
"use client";

import { useEffect, useState } from "react";

export default function Home() {
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

  return (
    <main className="app-shell">
      <section className="app-frame home-frame">
        <div className="topbar home-topbar">
          <span aria-hidden="true" />

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            type="button"
          >
            {darkMode ? "☀" : "☾"}
          </button>
        </div>

        <div className="home-screen">
          <div className="brand">
            <img
              src={
                darkMode
                  ? "/assets/home-logo-dark.png"
                  : "/assets/home-logo-ligth.png"
              }
              alt="ThawBlack — Barbearia & Escola"
              className="home-logo"
            />
          </div>

          <a href="/agendamento/servicos" className="btn-primary">
            Selecionar Serviço
          </a>

          <div className="quick-links">
            <a href="/galeria" className="quick-link">
              📸 Galeria
            </a>

            <a
              href="#"
              className="quick-link"
              onClick={(event) => event.preventDefault()}
            >
              📷 Instagram
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
