
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
};

type ProfessionalServiceRow = {
  service_id: string;
  price: number;
  services: {
    id: string;
    name: string;
    description: string | null;
  };
};

export default function ServicesPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const isDark = localStorage.getItem("thawblack-theme") === "dark";
    setDarkMode(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";

    async function loadServices() {
      try {
        const supabase = createClient();

        const { data, error: queryError } = await supabase
          .from("professional_services")
          .select(
            "service_id, price, services!inner(id, name, description)",
          )
          .eq("active", true)
          .eq("services.active", true);

        if (queryError) {
          throw queryError;
        }

        const rows = (data ?? []) as unknown as ProfessionalServiceRow[];

        // Um serviço pode estar associado a vários profissionais.
        // Na listagem, mostramos o menor preço disponível.
        const servicesMap = new Map<string, Service>();

        for (const row of rows) {
          const service = row.services;

          if (!service?.id) continue;

          const current = servicesMap.get(service.id);

          if (!current || Number(row.price) < current.price) {
            servicesMap.set(service.id, {
              id: service.id,
              name: service.name,
              description: service.description,
              price: Number(row.price),
            });
          }
        }

        const result = Array.from(servicesMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name, "pt-BR"),
        );

        setServices(result);
      } catch (err) {
        console.error("Erro ao carregar serviços:", err);
        setError("Não foi possível carregar os serviços. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadServices();
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

  function goBack() {
    window.location.href = "/";
  }

  function selectService(serviceId: string) {
    sessionStorage.setItem("thawblack-selected-service", serviceId);

    // Ao trocar de serviço, a escolha anterior de profissional deixa de valer.
    sessionStorage.removeItem("thawblack-selected-professional");
    sessionStorage.removeItem("thawblack-selected-date");
    sessionStorage.removeItem("thawblack-selected-time");

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

        <section className="services-content">
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
            {loading ? (
              <p>Carregando serviços...</p>
            ) : error ? (
              <p role="alert">{error}</p>
            ) : services.length === 0 ? (
              <p>Nenhum serviço está disponível para agendamento no momento.</p>
            ) : (
              services.map((service, index) => (
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
                    <span className="service-name">{service.name}</span>

                    <span className="service-price">
                      A partir de{" "}
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
              ))
            )}
          </div>

          <p className="services-footer-note">
            O próximo passo será escolher seu profissional.
          </p>
        </section>
      </section>
    </main>
  );
}
