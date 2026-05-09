import { PageHeader } from "@/components/layout/page-header";
import { UsuariosClient } from "./usuarios-client";

export const metadata = { title: "Usuários — ALDEA" };

export default function UsuariosPage() {
  return (
    <>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários com acesso ao sistema"
      />
      <UsuariosClient />
    </>
  );
}
