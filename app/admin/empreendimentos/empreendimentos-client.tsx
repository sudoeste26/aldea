"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";

type Empreendimento = {
  id: string;
  nome: string;
  nro_andares: number;
  valor_aluguel_m2: number;
  valor_venda_m2: number;
  preco_medio: number | null;
  caracteristica_lazer: string | null;
  previsao_conclusao: string | null;
  ativo: boolean;
  unidades?: { count: number }[];
  tipos_unidade?: { count: number }[];
};

export function EmpreendimentosClient({ inicial }: { inicial: Empreendimento[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Empreendimento | null>(null);
  const [form, setForm] = useState({ nome: "", nro_andares: 1, valor_aluguel_m2: 0, valor_venda_m2: 0, caracteristica_lazer: "", previsao_conclusao: "" });

  const filtrados = inicial.filter((e) => !busca || e.nome.toLowerCase().includes(busca.toLowerCase()));

  function abrirCriar() {
    setEditando(null);
    setForm({ nome: "", nro_andares: 1, valor_aluguel_m2: 0, valor_venda_m2: 0, caracteristica_lazer: "", previsao_conclusao: "" });
    setModal(true);
  }

  function abrirEditar(e: Empreendimento) {
    setEditando(e);
    setForm({
      nome: e.nome,
      nro_andares: e.nro_andares,
      valor_aluguel_m2: e.valor_aluguel_m2,
      valor_venda_m2: e.valor_venda_m2,
      caracteristica_lazer: e.caracteristica_lazer ?? "",
      previsao_conclusao: e.previsao_conclusao ?? "",
    });
    setModal(true);
  }

  async function salvar() {
    const url = editando ? `/api/empreendimentos/${editando.id}` : "/api/empreendimentos";
    const method = editando ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    if (!res.ok) { toast({ title: "Erro", description: json.error ?? "Falha", variant: "destructive" }); return; }
    toast({ title: editando ? "Empreendimento atualizado" : "Empreendimento criado" });
    setModal(false);
    start(() => router.refresh());
  }

  async function excluir(e: Empreendimento) {
    if (!confirm(`Remover ${e.nome}?`)) return;
    const res = await fetch(`/api/empreendimentos/${e.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) { toast({ title: "Erro", description: json.error ?? "Falha", variant: "destructive" }); return; }
    toast({ title: "Empreendimento removido" });
    start(() => router.refresh());
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Empreendimentos</h1>
          <p className="text-sm text-muted-foreground">Cadastro e gestão de empreendimentos</p>
        </div>
        <Button onClick={abrirCriar} className="bg-pink-500 hover:bg-pink-600"><Plus className="w-4 h-4 mr-2"/>Novo Empreendimento</Button>
      </div>
      <Input className="mb-6 max-w-md" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      {filtrados.length === 0 ? (
        <div className="text-center text-muted-foreground p-12 border rounded-lg bg-white">Nenhum empreendimento cadastrado</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((e) => (
            <div key={e.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center"><Building2 className="w-16 h-16 text-pink-400"/></div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{e.nome}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${e.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{e.ativo ? "Ativo" : "Inativo"}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{e.nro_andares} andares · {e.tipos_unidade?.[0]?.count ?? 0} tipo(s)</p>
                <p className="text-sm text-muted-foreground">{e.unidades?.[0]?.count ?? 0} unidades · R$ {e.valor_aluguel_m2.toFixed(2)}/m²</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => abrirEditar(e)} className="flex-1"><Pencil className="w-3 h-3 mr-1"/>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => excluir(e)} className="text-red-600 border-red-200 hover:bg-red-50"><Trash2 className="w-3 h-3"/></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editando ? "Editar empreendimento" : "Novo empreendimento"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nome</Label><Input value={form.nome} onChange={(ev) => setForm({ ...form, nome: ev.target.value })}/></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Nº andares</Label><Input type="number" min={1} value={form.nro_andares} onChange={(ev) => setForm({ ...form, nro_andares: Number(ev.target.value) })}/></div>
              <div><Label>Aluguel/m²</Label><Input type="number" step="0.01" value={form.valor_aluguel_m2} onChange={(ev) => setForm({ ...form, valor_aluguel_m2: Number(ev.target.value) })}/></div>
              <div><Label>Venda/m²</Label><Input type="number" step="0.01" value={form.valor_venda_m2} onChange={(ev) => setForm({ ...form, valor_venda_m2: Number(ev.target.value) })}/></div>
            </div>
            <div><Label>Característica de lazer</Label><Input value={form.caracteristica_lazer} onChange={(ev) => setForm({ ...form, caracteristica_lazer: ev.target.value })}/></div>
            <div><Label>Previsão de conclusão</Label><Input type="date" value={form.previsao_conclusao} onChange={(ev) => setForm({ ...form, previsao_conclusao: ev.target.value })}/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={pending} className="bg-pink-500 hover:bg-pink-600">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
