
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SupabaseTestPage() {
    const [status, setStatus] = useState("Testando conexão...");

    useEffect(() => {
        async function testConnection() {
            try {
                const supabase = createClient();

                // Consulta uma tabela de teste que ainda não existe.
                const { error } = await supabase
                    .from("__thawblack_connection_probe__")
                    .select("*")
                    .limit(1);

                if (error?.code === "PGRST205" || error?.code === "42P01") {
                    setStatus(
                        "Conexão com Supabase estabelecida! A tabela de teste ainda não existe, como esperado."
                    );
                    return;
                }

                if (error) {
                    throw new Error(
                        `Erro ${error.code ?? ""}: ${error.message}`
                    );
                }

                setStatus("Conexão com o Supabase estabelecida!");
            } catch (error) {
                setStatus(
                    error instanceof Error ? error.message : "Erro na conexão."
                );
            }
        }

        testConnection();
    }, []);

    return (
        <main className="flex min-h-screen items-center justify-center p-8">
            <div className="rounded-xl border p-8 text-center">
                <h1 className="mb-4 text-2xl font-bold">Teste Supabase</h1>
                <p>{status}</p>
            </div>
        </main>
    );
}
