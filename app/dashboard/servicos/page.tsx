
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Scissors,
  Plus,
  Search,
  Pencil,
  Power,
  Clock3,
  CircleDollarSign,
  CheckCircle2,
  X,
  Sparkles,
  Tag,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  active: boolean;
};

const STORAGE_KEY = "thawblack_services_v1";

const INITIAL_SERVICES: Service[] = [
  { id: "1", name: "Corte Simples", price: 40, duration: 30, active: true },
  { id: "2", name: "Corte e Barba", price: 65, duration: 45, active: true },
  {
    id: "3",
    name: "Corte e Sobrancelha",
    price: 60,
    duration: 45,
    active: true,
  },
  {
    id: "4",
    name: "Corte e Hidratação",
    price: 55,
    duration: 45,
    active: true,
  },
  {
    id: "5",
    name: "Corte Progressiva",
    price: 80,
    duration: 60,
    active: true,
  },
  {
    id: "6",
    name: "Corte e Penteado",
    price: 85,
    duration: 60,
    active: true,
  },
];

const currency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "ativos" | "inativos">(
    "todos"
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("40");
  const [duration, setDuration] = useState("30");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: Service[] = JSON.parse(stored);
        setServices(parsed);
      } else {
        setServices(INITIAL_SERVICES);
      }
    } catch {
      setServices(INITIAL_SERVICES);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  }, [services, loaded]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "todos" ||
        (filter === "ativos" && service.active) ||
        (filter === "inativos" && !service.active);

      return matchesSearch && matchesFilter;
    });
  }, [services, search, filter]);

  const activeCount = services.filter((service) => service.active).length;
  const inactiveCount = services.length - activeCount;

  const averagePrice =
    activeCount > 0
      ? services
          .filter((service) => service.active)
          .reduce((sum, service) => sum + service.price, 0) / activeCount
      : 0;

  function openNewService() {
    setEditingId(null);
    setName("");
    setPrice("");
    setDuration("30");
    setActive(true);
    setError("");
    setModalOpen(true);
  }

  function openEditService(service: Service) {
    setEditingId(service.id);
    setName(service.name);
    setPrice(String(service.price));
    setDuration(String(service.duration));
    setActive(service.active);
    setError("");
    setModalOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPrice = Number(price.replace(",", "."));
    const parsedDuration = Number(duration);

    if (!name.trim()) {
      setError("Informe o nome do serviço.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Informe um preço válido.");
      return;
    }

    if (
      !Number.isInteger(parsedDuration) ||
      parsedDuration <= 0
    ) {
      setError("Informe uma duração válida em minutos.");
      return;
    }

    if (
      services.some(
        (service) =>
          service.name.trim().toLowerCase() ===
            name.trim().toLowerCase() &&
          service.id !== editingId
      )
    ) {
      setError("Já existe um serviço com esse nome.");
      return;
    }

    if (editingId) {
      setServices((current) =>
        current.map((service) =>
          service.id === editingId
            ? {
                ...service,
                name: name.trim(),
                price: parsedPrice,
                duration: parsedDuration,
                active,
              }
            : service
        )
      );
    } else {
      const newService: Service = {
        id: crypto.randomUUID(),
        name: name.trim(),
        price: parsedPrice,
        duration: parsedDuration,
        active,
      };

      setServices((current) => [...current, newService]);
    }

    setModalOpen(false);
  }

  function toggleService(id: string) {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? { ...service, active: !service.active }
          : service
      )
    );
  }

  if (!loaded) {
    return (
      <div className="p-8" style={{ color: "var(--dashboard-text)" }}>
        Carregando serviços...
      </div>
    );
  }

  return (
    <main
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{
        background: "var(--dashboard-bg)",
        color: "var(--dashboard-text)",
      }}
    >
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Cabeçalho */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div
              className="mb-2 flex items-center gap-2 text-sm"
              style={{ color: "#C9A227" }}
            >
              <Scissors size={17} />
              <span>Gerenciamento</span>
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Serviços
            </h1>

            <p
              className="mt-2 text-sm"
              style={{ color: "var(--dashboard-muted)" }}
            >
              Gerencie os serviços, preços e duração dos atendimentos.
            </p>
          </div>

          <button
            onClick={openNewService}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
            style={{ background: "#C9A227", color: "#171716" }}
          >
            <Plus size={18} />
            Novo serviço
          </button>
        </header>

        {/* Indicadores */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            icon={<Scissors size={21} />}
            label="Total de serviços"
            value={services.length}
            description="Cadastrados no catálogo"
          />

          <StatCard
            icon={<CheckCircle2 size={21} />}
            label="Serviços ativos"
            value={activeCount}
            description={`${inactiveCount} inativo(s)`}
          />

          <StatCard
            icon={<CircleDollarSign size={21} />}
            label="Preço médio"
            value={currency(averagePrice)}
            description="Considerando serviços ativos"
          />
        </section>

        {/* Lista de serviços */}
        <section
          className="overflow-hidden rounded-2xl border"
          style={{
            background: "var(--dashboard-panel)",
            borderColor: "var(--dashboard-border)",
          }}
        >
          <div
            className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between"
            style={{ borderColor: "var(--dashboard-border)" }}
          >
            <div>
              <h2 className="font-semibold">Catálogo de serviços</h2>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--dashboard-muted)" }}
              >
                {filteredServices.length} serviço(s) encontrado(s)
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--dashboard-muted)" }}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar serviço..."
                  className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm outline-none sm:w-64"
                  style={{
                    background: "var(--dashboard-bg)",
                    color: "var(--dashboard-text)",
                    borderColor: "var(--dashboard-border)",
                  }}
                />
              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(
                    event.target.value as
                      | "todos"
                      | "ativos"
                      | "inativos"
                  )
                }
                className="rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--dashboard-bg)",
                  color: "var(--dashboard-text)",
                  borderColor: "var(--dashboard-border)",
                }}
              >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Scissors
                size={32}
                className="mx-auto mb-3"
                style={{ color: "var(--dashboard-muted)" }}
              />
              <p className="font-medium">Nenhum serviço encontrado</p>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--dashboard-muted)" }}
              >
                Tente outra busca ou cadastre um novo serviço.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="rounded-xl border p-5 transition hover:opacity-90"
                  style={{
                    background: "var(--dashboard-bg)",
                    borderColor: "var(--dashboard-border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        background: "rgba(201,162,39,0.14)",
                        color: "#C9A227",
                      }}
                    >
                      <Scissors size={22} />
                    </div>

                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: service.active
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(148,163,184,0.15)",
                        color: service.active ? "#22C55E" : "#94A3B8",
                      }}
                    >
                      {service.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">
                    {service.name}
                  </h3>

                  <div
                    className="mt-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--dashboard-muted)" }}
                      >
                        Preço
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {currency(service.price)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className="flex items-center justify-end gap-1 text-xs"
                        style={{ color: "var(--dashboard-muted)" }}
                      >
                        <Clock3 size={14} />
                        Duração
                      </p>
                      <p className="mt-1 font-medium">
                        {service.duration} min
                      </p>
                    </div>
                  </div>

                  <div
                    className="mt-5 flex gap-2 border-t pt-4"
                    style={{ borderColor: "var(--dashboard-border)" }}
                  >
                    <button
                      onClick={() => openEditService(service)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:opacity-80"
                      style={{
                        borderColor: "var(--dashboard-border)",
                        color: "var(--dashboard-text)",
                      }}
                    >
                      <Pencil size={15} />
                      Editar
                    </button>

                    <button
                      onClick={() => toggleService(service.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:opacity-80"
                      style={{
                        background: service.active
                          ? "rgba(239,68,68,0.10)"
                          : "rgba(34,197,94,0.10)",
                        color: service.active ? "#EF4444" : "#22C55E",
                      }}
                    >
                      <Power size={15} />
                      {service.active ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p
          className="text-xs"
          style={{ color: "var(--dashboard-muted)" }}
        >
          <Sparkles size={14} className="mr-1 inline" />
          Os dados são armazenados neste navegador. As durações iniciais são
          sugestões e podem ser ajustadas conforme a rotina da barbearia.
        </p>
      </div>

      {/* Modal de cadastro/edição */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="my-auto w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
            style={{
              background: "var(--dashboard-panel)",
              borderColor: "var(--dashboard-border)",
              color: "var(--dashboard-text)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div
                  className="mb-2 flex items-center gap-2 text-sm"
                  style={{ color: "#C9A227" }}
                >
                  <Tag size={16} />
                  Catálogo
                </div>
                <h2 id="service-modal-title" className="text-xl font-bold">
                  {editingId ? "Editar serviço" : "Novo serviço"}
                </h2>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--dashboard-muted)" }}
                >
                  Preencha as informações abaixo.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label="Fechar modal"
                className="rounded-lg p-2 hover:opacity-70"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="service-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Nome do serviço
                </label>
                <input
                  id="service-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: Corte degradê"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{
                    background: "var(--dashboard-bg)",
                    color: "var(--dashboard-text)",
                    borderColor: "var(--dashboard-border)",
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="service-price"
                    className="mb-2 block text-sm font-medium"
                  >
                    Preço (R$)
                  </label>
                  <input
                    id="service-price"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="40,00"
                    inputMode="decimal"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{
                      background: "var(--dashboard-bg)",
                      color: "var(--dashboard-text)",
                      borderColor: "var(--dashboard-border)",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="service-duration"
                    className="mb-2 block text-sm font-medium"
                  >
                    Duração (minutos)
                  </label>
                  <input
                    id="service-duration"
                    type="number"
                    min="1"
                    step="1"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{
                      background: "var(--dashboard-bg)",
                      color: "var(--dashboard-text)",
                      borderColor: "var(--dashboard-border)",
                    }}
                    required
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  className="h-4 w-4 accent-yellow-500"
                />
                <span className="text-sm">Serviço ativo para agendamentos</span>
              </label>

              {error && (
                <p
                  className="rounded-lg p-3 text-sm"
                  style={{
                    background: "rgba(239,68,68,0.10)",
                    color: "#EF4444",
                  }}
                >
                  {error}
                </p>
              )}

              <div
                className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"
                style={{ borderColor: "var(--dashboard-border)" }}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border px-5 py-3 text-sm font-medium"
                  style={{
                    borderColor: "var(--dashboard-border)",
                    color: "var(--dashboard-text)",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-xl px-5 py-3 text-sm font-semibold"
                  style={{ background: "#C9A227", color: "#171716" }}
                >
                  {editingId ? "Salvar alterações" : "Cadastrar serviço"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <article
      className="rounded-2xl border p-5"
      style={{
        background: "var(--dashboard-panel)",
        borderColor: "var(--dashboard-border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-sm"
            style={{ color: "var(--dashboard-muted)" }}
          >
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--dashboard-muted)" }}
          >
            {description}
          </p>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(201,162,39,0.14)",
            color: "#C9A227",
          }}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}
