import { z } from "zod";

export const createUsuarioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  perfil: z.enum(["Administrador", "Gestor Comercial", "Investidor"]),
  senha: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

export const updateUsuarioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  perfil: z.enum(["Administrador", "Gestor Comercial", "Investidor"]),
  ativo: z.boolean(),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
