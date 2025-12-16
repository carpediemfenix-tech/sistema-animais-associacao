import { z } from 'zod';

// Esquemas de validação para equipamentos
export const equipamentoSchema = z.object({
  codigo_interno: z.string()
    .min(3, 'Código deve ter pelo menos 3 caracteres')
    .max(20, 'Código deve ter no máximo 20 caracteres')
    .regex(/^[A-Z0-9-_]+$/, 'Código deve conter apenas letras maiúsculas, números, hífens e underscores'),
  
  numero_serie: z.string()
    .optional()
    .refine(val => !val || val.length >= 3, 'Número de série deve ter pelo menos 3 caracteres'),
  
  tipo_equipamento_id: z.string()
    .min(1, 'Tipo de equipamento é obrigatório'),
  
  estado: z.enum(['disponivel', 'atribuido', 'manutencao', 'danificado'], {
    errorMap: () => ({ message: 'Estado deve ser: disponível, atribuído, manutenção ou danificado' })
  }),
  
  condicao: z.enum(['excelente', 'bom', 'regular', 'ruim'], {
    errorMap: () => ({ message: 'Condição deve ser: excelente, bom, regular ou ruim' })
  }),
  
  valor_aquisicao: z.number()
    .min(0, 'Valor deve ser positivo')
    .max(1000000, 'Valor muito alto'),
  
  data_aquisicao: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Data inválida'),
  
  data_validade: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Data inválida'),
  
  garantia_ate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Data inválida'),
  
  fornecedor: z.string()
    .optional()
    .refine(val => !val || val.length >= 2, 'Fornecedor deve ter pelo menos 2 caracteres'),
  
  modelo: z.string().optional(),
  marca: z.string().optional(),
  cor: z.string().optional(),
  
  peso: z.number()
    .optional()
    .refine(val => val === undefined || val >= 0, 'Peso deve ser positivo'),
  
  dimensoes: z.string().optional(),
  manual_url: z.string().url('URL inválida').optional().or(z.literal('')),
  foto_url: z.string().url('URL inválida').optional().or(z.literal('')),
  qr_code: z.string().optional(),
  responsavel_id: z.string().optional(),
  centro_custo: z.string().optional(),
  categoria_fiscal: z.string().optional(),
  
  depreciacao_anual: z.number()
    .min(0, 'Depreciação deve ser positiva')
    .max(100, 'Depreciação não pode ser maior que 100%')
    .optional(),
  
  vida_util_anos: z.number()
    .min(1, 'Vida útil deve ser pelo menos 1 ano')
    .max(50, 'Vida útil muito alta')
    .optional(),
  
  localizacao: z.string().optional(),
  observacoes: z.string().optional()
});

// Esquema para atribuições
export const atribuicaoSchema = z.object({
  equipamento_id: z.string().min(1, 'Equipamento é obrigatório'),
  voluntario_id: z.string().min(1, 'Voluntário é obrigatório'),
  data_atribuicao: z.string().refine(val => !isNaN(Date.parse(val)), 'Data inválida'),
  data_devolucao_prevista: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Data inválida'),
  observacoes: z.string().optional()
}).refine(data => {
  if (data.data_devolucao_prevista) {
    const dataAtribuicao = new Date(data.data_atribuicao);
    const dataDevolucao = new Date(data.data_devolucao_prevista);
    return dataDevolucao > dataAtribuicao;
  }
  return true;
}, {
  message: 'Data de devolução deve ser posterior à data de atribuição',
  path: ['data_devolucao_prevista']
});

// Esquema para manutenções
export const manutencaoSchema = z.object({
  equipamento_id: z.string().min(1, 'Equipamento é obrigatório'),
  tipo_manutencao: z.enum(['preventiva', 'corretiva', 'emergencia'], {
    errorMap: () => ({ message: 'Tipo deve ser: preventiva, corretiva ou emergência' })
  }),
  data_agendada: z.string().refine(val => !isNaN(Date.parse(val)), 'Data inválida'),
  descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  custo_estimado: z.number()
    .min(0, 'Custo deve ser positivo')
    .optional(),
  responsavel: z.string().optional(),
  observacoes: z.string().optional()
});

// Função de validação genérica
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Erro de validação desconhecido' } };
  }
};

// Hook para validação em tempo real
export const useValidation = <T>(schema: z.ZodSchema<T>) => {
  const validate = (data: unknown) => validateData(schema, data);
  
  const validateField = (fieldName: string, value: unknown) => {
    try {
      const fieldSchema = schema.shape[fieldName as keyof typeof schema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
        return { success: true };
      }
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0]?.message };
      }
      return { success: false, error: 'Erro de validação' };
    }
  };

  return { validate, validateField };
};

export type EquipamentoFormData = z.infer<typeof equipamentoSchema>;
export type AtribuicaoFormData = z.infer<typeof atribuicaoSchema>;
export type ManutencaoFormData = z.infer<typeof manutencaoSchema>;