"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

type Investidor = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  perfil: string | null;
  criado_em: string;
  unidades?: { count: number }[];
};

export function InvestidoresClient({ inicial }: { inicial: Investidor[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Investidor | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", perfil: "" });

  const filtrados = inicial.filter((i) => {
    const q = busca.toLowerCase();
    return !q || i.nome.toLowerCase().includes(q) || i.email.toLowerCase().includes(q);
  });

  function abrirCriar() {
    setEditando(null);
    setForm({ nome: "", email: "", telefone: "", perfil: "" });
    setModalAberto(true);
  }

  function abrirEditar(inv: Investidor) {
    setEditando(inv);
    setForm({ nome: inv.nome, email: inv.email, telefone: inv.telefone, perfil: inv.perfil ?? "" });
    setModalAberto(true);
  }

  async function salvar() {
    const url = editando ? `/api/investidores/${editando.id}` : "/api/investidores";
    const method = editando ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    if (!res.ok) { toast({ title: "Erro", description: json.error ?? "Falha", variant: "destructive" }); return; }
    toast({ title: editando ? "Investidor atualizado" : "Investidor criado" });
    setModalAberto(false);
    start(() => router.refresh());
  }

  async function excluir(inv: Investidor) {
    if (!confirm(`Remover ${inv.nome}?`)) return;
    const res = await fetch(`/api/investidores/${inv.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) { toast({ title: "Erro", description: json.error ?? "Falha", variant: "destructive" }); return; }
    toast({ title: "Investidor removido" });
    start(() => router.refresh());
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investidores</h1>
          <p className="text-sm text-muted-foreground">Gestão de cadastro de investidores</p>
        </div>
        <Button onClick={abrirCriar} className="bg-pink-500 hover:bg-pink-600"><Plus className="w-4 h-4 mr-2"/>Novo Investidor</Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
        <Input className="pl-9" placeholder="Buscar por nome ou e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      <div className="bg-white rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 font-medium">Nome</th>
              <th className="p-3 font-medium">E-mail</th>
              <th className="p-3 font-medium">Telefone</th>
              <th className="p-3 font-medium">Unidades</th>
              <th className="p-3 font-medium">Cadastro</th>
              <th className="p-3 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhum investidor encontrado</td></tr>)}
            {filtrados.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{inv.nome}</td>
                <td className="p-3">{inv.email}</td>
                <td className="p-3">{inv.telefone}</td>
                <td className="p-3">{inv.unidades?.[0]?.count ?? 0}</td>
                <td className="p-3">{new Date(inv.criado_em).toLocaleDateString("pt-BR")}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => abrirEditar(inv)} className="p-1.5 hover:bg-gray-200 rounded"><Pencil className="w-4 h-4"/></button>
                  <button onClick={() => excluir(inv)} className="p-1.5 hover:bg-red-100 text-red-600 rounded"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editando ? "Editar investidor" : "Novo investidor"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}/></div>
            <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></div>
            <div><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })}/></div>
            <div><Label>Perfil</Label><Input value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })} placeholder="ex: Herdou capital, busca alocacao em ativos reais"/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={pending} className="bg-pink-500 hover:bg-pink-600">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
