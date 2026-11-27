
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import DashboardShell from "../../components/dashboard/DashboardShell";
import { createClient } from "../../utils/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  // Verifica se existe uma sessão autenticada.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verifica se o usuário possui autorização de administrador.
  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    redirect("/login?erro=sem-permissao");
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
