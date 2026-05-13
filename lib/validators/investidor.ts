import { z } from "zod";

export const createInvestidorSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone inválido"),
  perfil: z.string().optional().nullable(),
});

export const updateInvestidorSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone inválido"),
  perfil: z.string().optional().nullable(),
});

export type CreateInvestidorInput = z.infer<typeof createInvestidorSchema>;
export type UpdateInvestidorInput = z.infer<typeof updateInvestidorSchema>;
