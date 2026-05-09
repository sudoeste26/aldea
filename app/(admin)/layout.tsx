import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Busca dados do usuário na tabela pública
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("nome, email, perfil")
    .eq("auth_id", user.id)
    .single();

  const nome = usuario?.nome ?? user.email ?? "Usuário";
  const email = usuario?.email ?? user.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar userName={nome} userEmail={email} />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
