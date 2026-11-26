

"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/utils/supabase/client";

type Appointment = {
    id: string | number;
    customer: string;
    service: string;
    professional: string;
    date: string;
    price: number;
    status: string;
};

type TransactionType = "receita" | "despesa";
type TransactionOrigin = "automático" | "manual";
type Transaction = {
    id: string;
    description: string;
    category: string;
    type: TransactionType;
    origin: TransactionOrigin;
    amount: number;
    date: string;
};

const supabase = createClient();

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const currency = (value: number) =>

    value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

export default function FinanceiroPage() {

    const today = getToday();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
    const [ready, setReady] = useState(false);
    const [typeFilter, setTypeFilter] = useState("todos");
    const [periodFilter, setPeriodFilter] = useState("todos");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [newType, setNewType] = useState<TransactionType>("despesa");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Materiais");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(today);

    // Carrega os dados financeiros do Supabase.

    useEffect(() => {

        async function loadData() {

            try {
                const { data: { session }, error: sessionError } =
                    await supabase.auth.getSession();

                console.log("[ThawBlack] Verificação de sessão:", {
                    autenticado: !!session,
                    usuario: session?.user?.id ?? null,
                    erro: sessionError?.message ?? null,
                });
                const [paymentsResult, expensesResult, revenuesResult] =
                    await Promise.all([
                        supabase
                            .from("payments")
                            .select("id, appointment_id, amount, status, paid_at, created_at")
                            .eq("status", "paid"),
                        supabase
                            .from("expenses")
                            .select("id, description, category, amount, expense_date"),
                        supabase
                            .from("manual_revenues")
                            .select("id, description, category, amount, revenue_date"),
                    ]);

                if (paymentsResult.error) throw paymentsResult.error;
                if (expensesResult.error) throw expensesResult.error;
                if (revenuesResult.error) throw revenuesResult.error;
                const payments = (paymentsResult.data || []).map((item) => ({
                    id: item.id,
                    customer: "Agendamento",
                    service: "Serviço",
                    professional: "",
                    date: item.paid_at || item.created_at,
                    price: Number(item.amount),
                    status: "Concluído",
                }));

                const expenses: Transaction[] = (expensesResult.data || []).map(
                    (item) => ({
                        id: `expense-${item.id}`,
                        description: item.description,
                        category: item.category || "Outros",
                        type: "despesa",
                        origin: "manual",
                        amount: Number(item.amount),
                        date: item.expense_date,
                    })
                );

                const revenues: Transaction[] = (revenuesResult.data || []).map(
                    (item) => ({
                        id: `revenue-${item.id}`,
                        description: item.description,
                        category: item.category || "Produtos",
                        type: "receita",
                        origin: "manual",
                        amount: Number(item.amount),
                        date: item.revenue_date,
                    })
                );

                setAppointments(payments);
                setManualTransactions([...revenues, ...expenses]);
                console.log("[ThawBlack Financeiro] Dados carregados:", {
                    payments,
                    expenses,
                    revenues,
                });

            } catch (error) {
                console.error("Erro ao carregar dados financeiros:", error);
                setAppointments([]);
                setManualTransactions([]);
            } finally {
                setReady(true);
            }
        }
        loadData();
    }, []);

    // Converte atendimentos concluídos em receitas automáticas.
    const transactions = useMemo<Transaction[]>(() => {
        const automaticTransactions: Transaction[] = appointments
            .filter((item) => item.status === "Concluído")
            .map((item) => ({
                id: `appointment-${item.id}`,
                description: `${item.service} - ${item.customer}`,
                category: "Serviços",
                type: "receita",
                origin: "automático",
                amount: Number(item.price) || 0,
                date: String(item.date).slice(0, 10),
            }));
        return [
            ...automaticTransactions,
            ...manualTransactions,
        ];
    }, [appointments, manualTransactions]);

    // Filtra os lançamentos.
    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {
            const matchesType =
                typeFilter === "todos" || item.type === typeFilter;
            const matchesSearch =
                item.description.toLowerCase().includes(search.toLowerCase()) ||
                item.category.toLowerCase().includes(search.toLowerCase());
            const itemDate = new Date(`${item.date}T12:00:00`);
            const now = new Date();
            let matchesPeriod = true;
            if (periodFilter === "mes") {
                matchesPeriod =
                    itemDate.getMonth() === now.getMonth() &&
                    itemDate.getFullYear() === now.getFullYear();
            }

            if (periodFilter === "hoje") {
                matchesPeriod = item.date === today;
            }

            if (periodFilter === "ano") {
                matchesPeriod = itemDate.getFullYear() === now.getFullYear();
            }
            return matchesType && matchesSearch && matchesPeriod;
        });
    }, [transactions, typeFilter, periodFilter, search, today]);

    // Calcula os indicadores financeiros.
    const totals = useMemo(() => {
        const receitas = filteredTransactions
            .filter((item) => item.type === "receita")
            .reduce((total, item) => total + item.amount, 0);
        const despesas = filteredTransactions
            .filter((item) => item.type === "despesa")
            .reduce((total, item) => total + item.amount, 0);
        const services = filteredTransactions.filter(
            (item) =>
                item.type === "receita" &&
                item.category === "Serviços"
        );

        const ticket =
            services.length > 0
                ? services.reduce((total, item) => total + item.amount, 0) /
                services.length
                : 0;
        return {
            receitas,
            despesas,
            lucro: receitas - despesas,
            ticket,
        };
    }, [filteredTransactions]);

    // Dados do gráfico por dia da semana.
    const chartData = useMemo(() => {
        const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
        return days.map((day, index) => {
            const weekday = (index + 1) % 7;
            const receita = filteredTransactions
                .filter((item) => {
                    const itemDate = new Date(`${item.date}T12:00:00`);
                    return (
                        itemDate.getDay() === weekday &&
                        item.type === "receita"
                    );
                })
                .reduce((total, item) => total + item.amount, 0);
            const despesa = filteredTransactions
                .filter((item) => {
                    const itemDate = new Date(`${item.date}T12:00:00`);
                    return (
                        itemDate.getDay() === weekday &&
                        item.type === "despesa"
                    );
                })
                .reduce((total, item) => total + item.amount, 0);
            return { day, receita, despesa };
        });
    }, [filteredTransactions]);
    
    const maxChartValue = Math.max(
        ...chartData.flatMap((item) => [
            item.receita,
            item.despesa,
        ]),
        100
    );

    // Cadastra receitas e despesas diretamente no Supabase.
    async function handleAddTransaction(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const numericAmount = Number(amount.replace(",", "."));

        if (
            !description.trim() ||
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0 ||
            !date
        ) {
            return;
        }

        try {
            const table = newType === "receita" ? "manual_revenues" : "expenses";
            const dateColumn = newType === "receita" ? "revenue_date" : "expense_date";

            const { data, error } = await supabase
                .from(table)
                .insert({
                    description: description.trim(),
                    category,
                    amount: numericAmount,
                    [dateColumn]: date,
                })
                .select("id, description, category, amount")
                .single();

            if (error) throw error;

            const newTransaction: Transaction = {
                id: `${newType === "receita" ? "revenue" : "expense"}-${data.id}`,
                description: data.description,
                category: data.category || (newType === "receita" ? "Produtos" : "Outros"),
                type: newType,
                origin: "manual",
                amount: Number(data.amount),
                date,
            };

            setManualTransactions((current) => [newTransaction, ...current]);
            setDescription("");
            setAmount("");
            setCategory(newType === "receita" ? "Produtos" : "Materiais");
            setDate(today);
            setShowForm(false);
        } catch (error) {
            console.error("Erro ao salvar lançamento financeiro:", error);
            alert("Não foi possível salvar o lançamento. Verifique sua conexão e se você está logado como administrador.");
        }
    }

    function formatDate(value: string) {
        if (!value) return "-";
        const dateValue = new Date(`${value.slice(0, 10)}T12:00:00`);
        if (Number.isNaN(dateValue.getTime())) return "-";
        return dateValue.toLocaleDateString("pt-BR");
    }
    if (!ready) {
        return (
            <div className="min-h-screen bg-[var(--dashboard-bg)] p-8 text-[var(--dashboard-text)]">
                Carregando informações financeiras...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--dashboard-bg)] p-4 text-[var(--dashboard-text)] transition-colors sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-7">

                {/* Cabeçalho */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="mb-1 text-sm opacity-50">
                            Gestão financeira
                        </p>
                        <h1 className="text-2xl font-semibold sm:text-3xl">
                            Financeiro
                        </h1>
                        <p className="mt-2 text-sm opacity-60">
                            Acompanhe receitas, despesas e resultados da barbearia.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-lg bg-[#C9A227] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#dfb52e]"
                    >
                        + Novo lançamento
                    </button>
                </div>

                {/* Indicadores */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Receitas"
                        value={currency(totals.receitas)}
                        detail="Total de entradas"
                        icon="↗"
                        color="text-emerald-500"
                    />

                    <StatCard
                        title="Despesas"
                        value={currency(totals.despesas)}
                        detail="Total de saídas"
                        icon="↘"
                        color="text-red-400"
                    />

                    <StatCard
                        title="Lucro líquido"
                        value={currency(totals.lucro)}
                        detail="Receitas menos despesas"
                        icon="R$"
                        color={
                            totals.lucro >= 0
                                ? "text-emerald-500"
                                : "text-red-400"
                        }
                    />

                    <StatCard
                        title="Ticket médio"
                        value={currency(totals.ticket)}
                        detail="Média dos serviços"
                        icon="◎"
                        color="text-[#C9A227]"
                    />
                </div>

                {/* Formulário */}
                {showForm && (
                    <section className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Novo lançamento
                                </h2>

                                <p className="mt-1 text-xs opacity-50">
                                    Registre uma entrada ou saída financeira.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowForm(false)}
                                className="text-xl opacity-60 hover:opacity-100"
                                aria-label="Fechar formulário"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleAddTransaction}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            <div>
                                <label className="mb-2 block text-sm opacity-70">
                                    Tipo de lançamento
                                </label>
                                <select
                                    value={newType}
                                    onChange={(e) => {
                                        const value = e.target.value as TransactionType;
                                        setNewType(value);
                                        setCategory(
                                            value === "receita" ? "Produtos" : "Materiais"
                                        );
                                    }}
                                    className="w-full rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] p-3 text-sm outline-none"
                                >
                                    <option value="receita">Receita</option>
                                    <option value="despesa">Despesa</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm opacity-70">
                                    Descrição
                                </label>

                                <input
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ex: Compra de materiais"
                                    className="w-full rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] p-3 text-sm outline-none focus:border-[#C9A227]"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm opacity-70">
                                    Categoria
                                </label>

                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] p-3 text-sm outline-none"
                                >
                                    {newType === "receita" ? (
                                        <>
                                            <option>Produtos</option>
                                            <option>Serviços</option>
                                            <option>Outros</option>
                                        </>
                                    ) : (
                                        <>
                                            <option>Materiais</option>
                                            <option>Contas</option>
                                            <option>Estrutura</option>
                                            <option>Salários</option>
                                            <option>Marketing</option>
                                            <option>Outros</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm opacity-70">
                                    Valor (R$)
                                </label>

                                <input
                                    required
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] p-3 text-sm outline-none focus:border-[#C9A227]"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm opacity-70">
                                    Data
                                </label>
                                <input
                                    required
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] p-3 text-sm outline-none"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-[#C9A227] p-3 text-sm font-semibold text-black transition hover:bg-[#dfb52e]"
                                >
                                    Salvar lançamento
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {/* Gráfico */}
                <section className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-5 sm:p-6">
                    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Movimentação financeira
                            </h2>
                            <p className="mt-1 text-xs opacity-50">
                                Comparativo de receitas e despesas por dia da semana.
                            </p>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                Receitas
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-red-400" />
                                Despesas
                            </span>
                        </div>
                    </div>

                    <div className="flex h-56 items-end justify-between gap-2 sm:gap-5">
                        {chartData.map((item) => (
                            <div
                                key={item.day}
                                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                            >
                                <div className="flex h-full w-full items-end justify-center gap-1">
                                    <div
                                        title={`Receitas: ${currency(item.receita)}`}
                                        className="w-3 rounded-t-sm bg-emerald-500 transition-all sm:w-6"
                                        style={{
                                            height: `${Math.max(
                                                (item.receita / maxChartValue) * 100,
                                                item.receita ? 4 : 0
                                            )}%`,
                                        }}
                                    />
                                    <div
                                        title={`Despesas: ${currency(item.despesa)}`}
                                        className="w-3 rounded-t-sm bg-red-400 transition-all sm:w-6"
                                        style={{
                                            height: `${Math.max(
                                                (item.despesa / maxChartValue) * 100,
                                                item.despesa ? 4 : 0
                                            )}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-xs opacity-50">
                                    {item.day}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Histórico */}
                <section className="overflow-hidden rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)]">
                    <div className="flex flex-col justify-between gap-4 border-b border-[var(--dashboard-border)] p-5 lg:flex-row lg:items-center">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Histórico financeiro
                            </h2>
                            <p className="mt-1 text-xs opacity-50">
                                Consulte todas as movimentações da barbearia.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar lançamento..."
                                className="rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-3 py-2 text-sm outline-none focus:border-[#C9A227]"
                            />
                            <select
                                value={periodFilter}
                                onChange={(e) => setPeriodFilter(e.target.value)}
                                className="rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-3 py-2 text-sm outline-none"
                            >
                                <option value="hoje">Hoje</option>
                                <option value="mes">Este mês</option>
                                <option value="ano">Este ano</option>
                                <option value="todos">Todo o período</option>
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="rounded-lg border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-3 py-2 text-sm outline-none"
                            >
                                <option value="todos">Todos</option>
                                <option value="receita">Receitas</option>
                                <option value="despesa">Despesas</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                            <thead className="bg-[var(--dashboard-muted)] text-xs uppercase opacity-70">
                                <tr>
                                    <th className="px-5 py-4 font-medium">Descrição</th>
                                    <th className="px-5 py-4 font-medium">Categoria</th>
                                    <th className="px-5 py-4 font-medium">Data</th>
                                    <th className="px-5 py-4 font-medium">Origem</th>
                                    <th className="px-5 py-4 text-right font-medium">Valor</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTransactions.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-[var(--dashboard-border)] transition hover:bg-[var(--dashboard-hover)]"
                                    >
                                        <td className="px-5 py-4 font-medium">
                                            {item.description}
                                        </td>
                                        <td className="px-5 py-4 opacity-70">
                                            {item.category}
                                        </td>
                                        <td className="px-5 py-4 opacity-70">
                                            {formatDate(item.date)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs ${item.origin === "automático"
                                                    ? "bg-blue-500/10 text-blue-400"
                                                    : "bg-[#C9A227]/10 text-[#C9A227]"
                                                    }`}
                                            >
                                                {item.origin === "automático"
                                                    ? "Automático"
                                                    : "Manual"}
                                            </span>
                                        </td>
                                        <td
                                            className={`px-5 py-4 text-right font-semibold ${item.type === "receita"
                                                ? "text-emerald-500"
                                                : "text-red-400"
                                                }`}
                                        >
                                            {item.type === "receita" ? "+" : "-"}
                                            {currency(item.amount)}
                                        </td>
                                    </tr>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-12 text-center opacity-50"
                                        >
                                            Nenhuma movimentação encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-[var(--dashboard-border)] p-4 text-xs opacity-50">
                        {filteredTransactions.length} movimentação(ões) encontrada(s).
                    </div>
                </section>
                <p className="text-center text-xs opacity-40">
                    ThawBlack • Gestão financeira
                </p>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    detail,
    icon,
    color,
}: {
    title: string;
    value: string;
    detail: string;
    icon: string;
    color: string;
}) {
    return (
        <article className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-panel)] p-5 transition duration-200 hover:-translate-y-0.5">
            <div className="mb-5 flex items-center justify-between gap-3">
                <p className="text-sm opacity-70">{title}</p>
                <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--dashboard-muted)] text-sm font-semibold ${color}`}
                >
                    {icon}
                </span>
            </div>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="mt-2 text-xs opacity-50">{detail}</p>
        </article>
    );
}
