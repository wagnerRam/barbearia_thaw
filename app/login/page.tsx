
"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("id, name")
        .eq("id", data.user.id)
        .maybeSingle();

      if (adminError) {
        throw new Error(
          `Erro ao verificar administrador: ${adminError.message}`
        );
      }

      if (!admin) {
        await supabase.auth.signOut();
        throw new Error(
          "Consulta realizada, mas nenhum administrador foi encontrado."
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Erro no login:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível realizar o login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101510] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#191f19] p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold text-white">
          ThawBlack
        </h1>

        <p className="mb-8 text-sm text-gray-400">
          Acesso administrativo
        </p>

        {searchParams.get("erro") === "sem-permissao" && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            Você não possui permissão para acessar o painel.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-[#101510] px-4 py-3 text-white outline-none focus:border-green-600"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Senha
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-[#101510] px-4 py-3 text-white outline-none focus:border-green-600"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#101510] text-white">
          Carregando...
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
