
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    console.error("Erro na validação do administrador:", adminError);
    redirect("/login?erro=sem-permissao");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
