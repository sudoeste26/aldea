import { z } from "zod";

const base = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  nro_andares: z.coerce.number().int().min(1, "Nro de andares inválido"),
  valor_aluguel_m2: z.coerce.number().nonnegative(),
  valor_venda_m2: z.coerce.number().nonnegative(),
  preco_medio: z.coerce.number().nonnegative().optional().nullable(),
  caracteristica_lazer: z.string().optional().nullable(),
  previsao_conclusao: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
});

export const createEmpreendimentoSchema = base;
export const updateEmpreendimentoSchema = base;

export type CreateEmpreendimentoInput = z.infer<typeof createEmpreendimentoSchema>;
export type UpdateEmpreendimentoInput = z.infer<typeof updateEmpreendimentoSchema>;
