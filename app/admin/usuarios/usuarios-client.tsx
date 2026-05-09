"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PerfilBadge, Ativobadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import type { Usuario, PerfilUsuario } from "@/types";

const createSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  perfil: z.enum(["Administrador", "Gestor Comercial", "Investidor"]),
  senha: z.string().min(8, "Mínimo 8 caracteres"),
});

const editSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  perfil: z.enum(["Administrador", "Gestor Comercial", "Investidor"]),
  ativo: z.boolean(),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

interface ListState {
  data: Usuario[];
  total: number;
  loading: boolean;
}

export function UsuariosClient() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [perfilFilter, setPerfilFilter] = useState("");
  const [ativoFilter, setAtivoFilter] = useState("");
  const [list, setList] = useState<ListState>({ data: [], total: 0, loading: true });
  const [modalCreate, setModalCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Usuario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsuarios = useCallback(async (p = page) => {
    setList((s) => ({ ...s, loading: true }));
    const params = new URLSearchParams({
      page: String(p),
      pageSize: "20",
      ...(search && { search }),
      ...(perfilFilter && perfilFilter !== "todos" && { perfil: perfilFilter }),
      ...(ativoFilter && ativoFilter !== "todos" && { ativo: ativoFilter }),
    });
    const res = await fetch(`/api/usuarios?${params}`);
    const json = await res.json();
    setList({ data: json.data ?? [], total: json.total ?? 0, loading: false });
  }, [page, search, perfilFilter, ativoFilter]);

  // Load on mount and filter changes
  useState(() => { fetchUsuarios(); });

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  async function handleCreate(data: CreateForm) {
    setSaving(true);
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json();
      toast({ variant: "destructive", title: "Erro", description: err.error ?? "Erro ao criar usuário." });
      return;
    }
    toast({ variant: "success" as never, title: "Usuário criado com sucesso." });
    setModalCreate(false);
    createForm.reset();
    fetchUsuarios(1);
    setPage(1);
  }

  async function handleEdit(data: EditForm) {
    if (!editTarget) return;
    setSaving(true);
    const res = await fetch(`/api/usuarios/${editTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json();
      toast({ variant: "destructive", title: "Erro", description: err.error ?? "Erro ao atualizar." });
      return;
    }
    toast({ title: "Usuário atualizado." });
    setEditTarget(null);
    fetchUsuarios();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    await fetch(`/api/usuarios/${deleteTarget.id}`, { method: "DELETE" });
    setSaving(false);
    toast({ title: "Usuário removido." });
    setDeleteTarget(null);
    fetchUsuarios();
  }

  function openEdit(u: Usuario) {
    editForm.reset({ nome: u.nome, email: u.email, perfil: u.perfil, ativo: u.ativo });
    setEditTarget(u);
  }

  const columns = [
    {
      key: "nome",
      header: "Nome",
      cell: (u: Usuario) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
            {u.nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
          </div>
          <span className="font-medium">{u.nome}</span>
        </div>
      ),
    },
    { key: "email", header: "E-mail", cell: (u: Usuario) => <span className="text-muted-foreground">{u.email}</span> },
    { key: "perfil", header: "Perfil", cell: (u: Usuario) => <PerfilBadge perfil={u.perfil} /> },
    { key: "ativo", header: "Status", cell: (u: Usuario) => <Ativobadge ativo={u.ativo} /> },
    {
      key: "ultimo_login",
      header: "Último login",
      cell: (u: Usuario) => (
        <span className="text-muted-foreground text-xs">{formatDateTime(u.ultimo_login)}</span>
      ),
    },
    {
      key: "acoes",
      header: "",
      className: "w-24",
      cell: (u: Usuario) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(u)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Filters + actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail…"
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); fetchUsuarios(1); }}
          />
        </div>
        <Select value={perfilFilter} onValueChange={(v) => { setPerfilFilter(v); setPage(1); fetchUsuarios(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os perfis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os perfis</SelectItem>
            <SelectItem value="Administrador">Administrador</SelectItem>
            <SelectItem value="Gestor Comercial">Gestor Comercial</SelectItem>
            <SelectItem value="Investidor">Investidor</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ativoFilter} onValueChange={(v) => { setAtivoFilter(v); setPage(1); fetchUsuarios(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="true">Ativos</SelectItem>
            <SelectItem value="false">Inativos</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setModalCreate(true)} className="ml-auto">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={list.data}
        total={list.total}
        page={page}
        pageSize={20}
        loading={list.loading}
        onPageChange={(p) => { setPage(p); fetchUsuarios(p); }}
        emptyMessage="Nenhum usuário encontrado."
      />

      {/* Modal: Criar usuário */}
      <Dialog open={modalCreate} onOpenChange={setModalCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input {...createForm.register("nome")} placeholder="Nome completo" />
              {createForm.formState.errors.nome && (
                <p className="text-xs text-destructive">{createForm.formState.errors.nome.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input {...createForm.register("email")} type="email" placeholder="email@exemplo.com" />
              {createForm.formState.errors.email && (
                <p className="text-xs text-destructive">{createForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select onValueChange={(v) => createForm.setValue("perfil", v as PerfilUsuario)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Gestor Comercial">Gestor Comercial</SelectItem>
                  <SelectItem value="Investidor">Investidor</SelectItem>
                </SelectContent>
              </Select>
              {createForm.formState.errors.perfil && (
                <p className="text-xs text-destructive">{createForm.formState.errors.perfil.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Senha inicial</Label>
              <Input {...createForm.register("senha")} type="password" placeholder="Mínimo 8 caracteres" />
              {createForm.formState.errors.senha && (
                <p className="text-xs text-destructive">{createForm.formState.errors.senha.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalCreate(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Criar usuário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar usuário */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input {...editForm.register("nome")} />
              {editForm.formState.errors.nome && (
                <p className="text-xs text-destructive">{editForm.formState.errors.nome.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input {...editForm.register("email")} type="email" />
              {editForm.formState.errors.email && (
                <p className="text-xs text-destructive">{editForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select
                value={editForm.watch("perfil")}
                onValueChange={(v) => editForm.setValue("perfil", v as PerfilUsuario)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Gestor Comercial">Gestor Comercial</SelectItem>
                  <SelectItem value="Investidor">Investidor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ativo"
                {...editForm.register("ativo")}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="ativo">Usuário ativo</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar exclusão */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover usuário?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O usuário <strong>{deleteTarget?.nome}</strong> será desativado e não poderá mais
            acessar o sistema. Esta ação pode ser revertida editando o usuário.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
