"use client";

import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type CSSProperties,
    type ReactNode,
} from "react";
import {
    Users,
    Plus,
    Search,
    Pencil,
    Power,
    Clock3,
    CalendarDays,
    CheckCircle2,
    X,
    UserRound,
    Phone,
    Scissors,
} from "lucide-react";

const STORAGE_KEY = "thawblack_professionals_v1";

const DAYS = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
];

const AVAILABLE_SERVICES = [
    "Corte Simples",
    "Corte e Barba",
    "Corte e Sobrancelha",
    "Corte e Hidratação",
    "Corte Progressiva",
    "Corte e Penteado",
];

type Professional = {
    id: string;
    name: string;
    phone: string;
    services: string[];
    workingDays: string[];
    startTime: string;
    endTime: string;
    active: boolean;
};

const INITIAL_PROFESSIONALS: Professional[] = [
    {
        id: "thaw",
        name: "Thaw",
        phone: "",
        services: [...AVAILABLE_SERVICES],
        workingDays: [
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado",
        ],
        startTime: "09:00",
        endTime: "19:00",
        active: true,
    },
    {
        id: "otavio",
        name: "Otávio",
        phone: "",
        services: [...AVAILABLE_SERVICES],
        workingDays: [
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado",
        ],
        startTime: "09:00",
        endTime: "19:00",
        active: true,
    },
];

export default function ProfissionaisPage() {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loaded, setLoaded] = useState(false);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"todos" | "ativos" | "inativos">("todos");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [services, setServices] = useState<string[]>([...AVAILABLE_SERVICES]);
    const [workingDays, setWorkingDays] = useState<string[]>([
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
    ]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("19:00");
    const [active, setActive] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored) {
                const parsed = JSON.parse(stored);

                if (Array.isArray(parsed)) {
                    setProfessionals(
                        parsed.map((item: Professional) => ({
                            ...item,
                            services: Array.isArray(item.services)
                                ? item.services
                                : [...AVAILABLE_SERVICES],
                            workingDays: Array.isArray(item.workingDays)
                                ? item.workingDays
                                : [],
                        }))
                    );
                } else {
                    setProfessionals(INITIAL_PROFESSIONALS);
                }
            } else {
                setProfessionals(INITIAL_PROFESSIONALS);
            }
        } catch {
            setProfessionals(INITIAL_PROFESSIONALS);
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!loaded) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(professionals));
    }, [professionals, loaded]);

    const filteredProfessionals = useMemo(() => {
        return professionals.filter((professional) => {
            const matchesSearch = professional.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesFilter =
                filter === "todos" ||
                (filter === "ativos" && professional.active) ||
                (filter === "inativos" && !professional.active);

            return matchesSearch && matchesFilter;
        });
    }, [professionals, search, filter]);

    const activeCount = professionals.filter((p) => p.active).length;
    const inactiveCount = professionals.length - activeCount;

    function resetForm() {
        setEditingId(null);
        setName("");
        setPhone("");
        setServices([...AVAILABLE_SERVICES]);
        setWorkingDays([
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado",
        ]);
        setStartTime("09:00");
        setEndTime("19:00");
        setActive(true);
        setError("");
    }

    function openNewProfessional() {
        resetForm();
        setModalOpen(true);
    }

    function openEditProfessional(professional: Professional) {
        setEditingId(professional.id);
        setName(professional.name);
        setPhone(professional.phone);
        setServices([...professional.services]);
        setWorkingDays([...professional.workingDays]);
        setStartTime(professional.startTime);
        setEndTime(professional.endTime);
        setActive(professional.active);
        setError("");
        setModalOpen(true);
    }

    function toggleService(service: string) {
        setServices((current) =>
            current.includes(service)
                ? current.filter((item) => item !== service)
                : [...current, service]
        );
    }

    function toggleDay(day: string) {
        setWorkingDays((current) =>
            current.includes(day)
                ? current.filter((item) => item !== day)
                : [...current, day]
        );
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!name.trim()) {
            setError("Informe o nome do profissional.");
            return;
        }

        if (workingDays.length === 0) {
            setError("Selecione pelo menos um dia de trabalho.");
            return;
        }

        if (services.length === 0) {
            setError("Selecione pelo menos um serviço.");
            return;
        }

        if (startTime >= endTime) {
            setError("O horário final precisa ser posterior ao horário inicial.");
            return;
        }

        const duplicate = professionals.some(
            (professional) =>
                professional.name.trim().toLowerCase() === name.trim().toLowerCase() &&
                professional.id !== editingId
        );

        if (duplicate) {
            setError("Já existe um profissional com esse nome.");
            return;
        }

        const professional: Professional = {
            id: editingId ?? crypto.randomUUID(),
            name: name.trim(),
            phone: phone.trim(),
            services,
            workingDays,
            startTime,
            endTime,
            active,
        };

        if (editingId) {
            setProfessionals((current) =>
                current.map((item) =>
                    item.id === editingId ? professional : item
                )
            );
        } else {
            setProfessionals((current) => [...current, professional]);
        }

        setModalOpen(false);
    }

    function toggleProfessional(id: string) {
        setProfessionals((current) =>
            current.map((professional) =>
                professional.id === id
                    ? { ...professional, active: !professional.active }
                    : professional
            )
        );
    }

    if (!loaded) {
        return (
            <div className="p-8" style={{ color: "var(--dashboard-text)" }}>
                Carregando profissionais...
            </div>
        );
    }

    return (
        <main
            className="min-h-screen p-4 sm:p-6 lg:p-8"
            style={{
                background: "var(--dashboard-bg)",
                color: "var(--dashboard-text)",
                ["--dashboard-muted" as string]:
                    "color-mix(in srgb, var(--dashboard-text) 68%, var(--dashboard-bg))",
            }}
        >
            <div className="mx-auto max-w-7xl space-y-7">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div
                            className="text-sm text-[var(--dashboard-text)] opacity-60"
                            
                        >
                            <span>Equipe ThawBlack</span>
                        </div>

                        <h1 className="text-2xl font-bold sm:text-3xl">
                            Profissionais
                        </h1>

                        <p
                            className="mt-2 text-sm"
                            style={{ color: "var(--dashboard-muted)" }}
                        >
                            Gerencie a equipe, os serviços atendidos e os horários de trabalho.
                        </p>
                    </div>

                    <button
                        onClick={openNewProfessional}
                        className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold hover:opacity-90"
                        style={{ background: "#C9A227", color: "#171716" }}
                    >
                        <Plus size={18} />
                        Novo profissional
                    </button>
                </header>

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatCard
                        icon={<Users size={21} />}
                        label="Total da equipe"
                        value={professionals.length}
                        description="Profissionais cadastrados"
                    />

                    <StatCard
                        icon={<CheckCircle2 size={21} />}
                        label="Profissionais ativos"
                        value={activeCount}
                        description="Disponíveis no cadastro"
                    />

                    <StatCard
                        icon={<UserRound size={21} />}
                        label="Profissionais inativos"
                        value={inactiveCount}
                        description="Desativados no cadastro"
                    />
                </section>

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
                            <h2 className="font-semibold">Equipe cadastrada</h2>
                            <p
                                className="mt-1 text-sm"
                                style={{ color: "var(--dashboard-muted)" }}
                            >
                                Consulte e gerencie os profissionais.
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
                                    placeholder="Buscar profissional..."
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
                                    setFilter(event.target.value as "todos" | "ativos" | "inativos")
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

                    {filteredProfessionals.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <Users
                                size={32}
                                className="mx-auto mb-3"
                                style={{ color: "var(--dashboard-muted)" }}
                            />

                            <p className="font-medium">
                                Nenhum profissional encontrado
                            </p>

                            <p
                                className="mt-1 text-sm"
                                style={{ color: "var(--dashboard-muted)" }}
                            >
                                Tente outra busca ou cadastre um profissional.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredProfessionals.map((professional) => (
                                <article
                                    key={professional.id}
                                    className="rounded-xl border p-5"
                                    style={{
                                        background: "var(--dashboard-bg)",
                                        borderColor: "var(--dashboard-border)",
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-full"
                                            style={{
                                                background: "rgba(201,162,39,0.14)",
                                                color: "#C9A227",
                                            }}
                                        >
                                            <UserRound size={24} />
                                        </div>

                                        <span
                                            className="rounded-full px-3 py-1 text-xs font-medium"
                                            style={{
                                                background: professional.active
                                                    ? "rgba(34,197,94,0.12)"
                                                    : "rgba(148,163,184,0.15)",
                                                color: professional.active
                                                    ? "#22C55E"
                                                    : "#94A3B8",
                                            }}
                                        >
                                            {professional.active ? "Ativo" : "Inativo"}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 text-lg font-semibold">
                                        {professional.name}
                                    </h3>

                                    {professional.phone && (
                                        <p
                                            className="mt-3 flex items-center gap-2 text-sm"
                                            style={{ color: "var(--dashboard-muted)" }}
                                        >
                                            <Phone size={15} />
                                            {professional.phone}
                                        </p>
                                    )}

                                    <div
                                        className="mt-4 space-y-3 border-t pt-4"
                                        style={{ borderColor: "var(--dashboard-border)" }}
                                    >
                                        <div className="flex items-start gap-2 text-sm">
                                            <CalendarDays
                                                size={16}
                                                className="mt-0.5 shrink-0"
                                                style={{ color: "#C9A227" }}
                                            />

                                            <span>
                                                {professional.workingDays.join(", ")}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock3
                                                size={16}
                                                style={{ color: "#C9A227" }}
                                            />
                                            {professional.startTime} – {professional.endTime}
                                        </div>

                                        <div className="flex items-start gap-2 text-sm">
                                            <Scissors
                                                size={16}
                                                className="mt-0.5 shrink-0"
                                                style={{ color: "#C9A227" }}
                                            />

                                            <span>
                                                {professional.services.length} serviço(s) habilitado(s)
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="mt-5 flex gap-2 border-t pt-4"
                                        style={{ borderColor: "var(--dashboard-border)" }}
                                    >
                                        <button
                                            onClick={() => openEditProfessional(professional)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:opacity-80"
                                            style={{
                                                borderColor: "var(--dashboard-border)",
                                                color: "var(--dashboard-text)",
                                            }}
                                        >
                                            <Pencil size={15} />
                                            Editar
                                        </button>

                                        <button
                                            onClick={() => toggleProfessional(professional.id)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80"
                                            style={{
                                                background: professional.active
                                                    ? "rgba(239,68,68,0.10)"
                                                    : "rgba(34,197,94,0.10)",
                                                color: professional.active
                                                    ? "#EF4444"
                                                    : "#22C55E",
                                            }}
                                        >
                                            <Power size={15} />
                                            {professional.active ? "Desativar" : "Ativar"}
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
                    Os dados ficam salvos neste navegador. Os horários e dias iniciais
                    são exemplos editáveis, não uma confirmação do horário real da barbearia.
                </p>
            </div>

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
                    style={{ background: "rgba(0,0,0,0.65)" }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setModalOpen(false);
                    }}
                >
                    <section
                        className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-6 shadow-2xl"
                        style={{
                            background: "var(--dashboard-panel)",
                            borderColor: "var(--dashboard-border)",
                            color: "var(--dashboard-text)",
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="professional-modal-title"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p
                                    className="mb-2 text-sm"
                                    style={{ color: "#C9A227" }}
                                >
                                    Equipe ThawBlack
                                </p>

                                <h2
                                    id="professional-modal-title"
                                    className="text-xl font-bold"
                                >
                                    {editingId ? "Editar profissional" : "Novo profissional"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                aria-label="Fechar"
                                className="rounded-lg p-2 hover:opacity-70"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Nome completo">
                                    <input
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="Nome do profissional"
                                        className={inputClass}
                                        style={inputStyle}
                                        required
                                    />
                                </Field>

                                <Field label="Telefone (opcional)">
                                    <input
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        placeholder="(11) 99999-9999"
                                        className={inputClass}
                                        style={inputStyle}
                                    />
                                </Field>

                                <Field label="Status">
                                    <select
                                        value={active ? "ativo" : "inativo"}
                                        onChange={(event) =>
                                            setActive(event.target.value === "ativo")
                                        }
                                        className={inputClass}
                                        style={inputStyle}
                                    >
                                        <option value="ativo">Ativo</option>
                                        <option value="inativo">Inativo</option>
                                    </select>
                                </Field>
                            </div>

                            <div>
                                <p className="mb-3 text-sm font-medium">
                                    Serviços atendidos
                                </p>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {AVAILABLE_SERVICES.map((service) => (
                                        <label
                                            key={service}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm"
                                            style={{
                                                borderColor: "var(--dashboard-border)",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={services.includes(service)}
                                                onChange={() => toggleService(service)}
                                                className="accent-yellow-500"
                                            />
                                            {service}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-3 text-sm font-medium">
                                    Dias de trabalho
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map((day) => {
                                        const selected = workingDays.includes(day);

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className="rounded-lg border px-3 py-2 text-sm"
                                                style={{
                                                    background: selected
                                                        ? "rgba(201,162,39,0.16)"
                                                        : "var(--dashboard-bg)",
                                                    color: selected
                                                        ? "#C9A227"
                                                        : "var(--dashboard-text)",
                                                    borderColor: selected
                                                        ? "#C9A227"
                                                        : "var(--dashboard-border)",
                                                }}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Horário de entrada">
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(event) => setStartTime(event.target.value)}
                                        className={inputClass}
                                        style={inputStyle}
                                        required
                                    />
                                </Field>

                                <Field label="Horário de saída">
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(event) => setEndTime(event.target.value)}
                                        className={inputClass}
                                        style={inputStyle}
                                        required
                                    />
                                </Field>
                            </div>

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
                                    className="rounded-xl border px-5 py-3 text-sm"
                                    style={{
                                        borderColor: "var(--dashboard-border)",
                                    }}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-xl px-5 py-3 text-sm font-semibold"
                                    style={{
                                        background: "#C9A227",
                                        color: "#171716",
                                    }}
                                >
                                    {editingId
                                        ? "Salvar alterações"
                                        : "Cadastrar profissional"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
}

const inputClass =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none";

const inputStyle: CSSProperties = {
    background: "var(--dashboard-bg)",
    color: "var(--dashboard-text)",
    borderColor: "var(--dashboard-border)",
};

function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium">{label}</span>
            {children}
        </label>
    );
}

function StatCard({
    icon,
    label,
    value,
    description,
}: {
    icon: ReactNode;
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