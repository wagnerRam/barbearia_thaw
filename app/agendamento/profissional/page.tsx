
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Professional = {
  id: string;
  name: string;
  photo_url: string | null;
};

type ProfessionalServiceRow = {
  professional_id: string;
  professionals: Professional;
};

const fallbackImages: Record<string, string> = {
  "8b72b966-136c-43a7-9639-43850b4d97fd":
    "/assets/barbers/profissional-thaw.png",
  "363f4119-b553-490c-a4cb-533808ea6967":
    "/assets/barbers/profissional-otavio.png",
};

export default function ProfessionalPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const [serviceId, setServiceId] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("thawblack-theme");
    const isDark = savedTheme === "dark";

    setDarkMode(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";

    const selectedService =
      sessionStorage.getItem("thawblack-selected-service") || "";

    // setServiceId(selectedService);

    async function loadProfessionals() {
      if (!selectedService) {
        setError("Selecione um serviço antes de escolher o profissional.");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        const { data, error: queryError } = await supabase
          .from("professional_services")
          .select(
            "professional_id, professionals!inner(id, name, photo_url)",
          )
          .eq("service_id", selectedService)
          .eq("active", true)
          .eq("professionals.active", true);

        if (queryError) {
          throw queryError;
        }

        const rows = (data ?? []) as unknown as ProfessionalServiceRow[];

        const uniqueProfessionals = new Map<string, Professional>();

        for (const row of rows) {
          const professional = row.professionals;

          if (professional?.id) {
            uniqueProfessionals.set(professional.id, professional);
          }
        }

        const result = Array.from(uniqueProfessionals.values()).sort(
          (a, b) => a.name.localeCompare(b.name, "pt-BR"),
        );

        setProfessionals(result);
      } catch (err) {
        console.error("Erro ao carregar profissionais:", err);
        setError("Não foi possível carregar os profissionais. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadProfessionals();
  }, []);

  function toggleTheme() {
    const nextDarkMode = !darkMode;

    setDarkMode(nextDarkMode);
    document.documentElement.dataset.theme = nextDarkMode ? "dark" : "light";

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

    sessionStorage.removeItem("thawblack-selected-date");
    sessionStorage.removeItem("thawblack-selected-time");

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
              window.location.href = "/agendamento/servicos";
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
            {loading ? (
              <p>Carregando profissionais...</p>
            ) : error ? (
              <p role="alert">{error}</p>
            ) : professionals.length === 0 ? (
              <p>
                Nenhum profissional está disponível para esse serviço no
                momento.
              </p>
            ) : (
              professionals.map((professional, index) => (
                <button
                  key={professional.id}
                  type="button"
                  className="professional-photo-card"
                  onClick={() => selectProfessional(professional.id)}
                >
                  <img
                    src={
                      professional.photo_url ||
                      fallbackImages[professional.id] ||
                      "/assets/barbers/profissional-thaw.png"
                    }
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
                      Profissional
                    </span>
                  </span>

                  <span
                    className="professional-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              ))
            )}
          </div>

          <p className="professionals-footer-note">
            No próximo passo, escolha a data e o horário.
          </p>
        </section>
      </section>
    </main>
  );
}
