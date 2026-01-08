# REGRAS OBRIGATÓRIAS DO PROJETO SISTEMA VALENTÃO

## 🚨 REGRA CRÍTICA: FOCO E RESOLUÇÃO SEQUENCIAL

### 1. **NÃO AVANÇAR SEM RESOLVER PROBLEMAS ANTERIORES**
- ❌ **PROIBIDO**: Implementar novas funcionalidades com bugs pendentes
- ✅ **OBRIGATÓRIO**: Resolver 100% dos problemas antes de avançar
- ✅ **OBRIGATÓRIO**: Confirmar funcionamento antes de nova fase

### 2. **ESTUDO DE IMPACTO OBRIGATÓRIO**
- ✅ **ANTES de qualquer alteração**: Identificar módulos afetados
- ✅ **TESTAR módulos alterados**: Verificar se não quebraram
- ✅ **VALIDAR funcionalidades críticas**: Login, navegação, core features
- ✅ **DOCUMENTAR impacto**: Listar o que pode ser afetado

### 3. **CONTROLO DE FASES**
- ✅ **Estado atual documentado**: Sempre saber em que fase estamos
- ✅ **Checklist de conclusão**: Cada fase tem critérios claros
- ✅ **Validação completa**: Testar tudo antes de marcar como "concluído"

### 4. **GESTÃO DE ERROS**
- ✅ **Lista de erros ativos**: Manter registo de problemas pendentes
- ✅ **Priorização**: Resolver erros críticos primeiro
- ✅ **Não acumular**: Máximo 2 erros pendentes por vez

## 📊 ESTADO ATUAL DO PROJETO

### MÓDULO APROVISIONAMENTO - FASE ATUAL: **CORREÇÃO DE BUGS**

#### ❌ PROBLEMAS PENDENTES:
1. **CRÍTICO**: Função `processar_devolucao_parcial_v2` não existe (404)
2. **IMPACTO**: Devolução parcial não funciona
3. **CENÁRIO AFETADO**: 10 Canecas → devolver 5 → erro

#### ✅ PRÓXIMOS PASSOS (ORDEM OBRIGATÓRIA):
1. **RESOLVER**: Criar função SQL que existe realmente
2. **TESTAR**: Cenário completo de devolução parcial
3. **VALIDAR**: Não quebrar outros módulos
4. **CONFIRMAR**: Funcionamento 100% antes de avançar

### FASES DO MÓDULO APROVISIONAMENTO:
- ✅ **Fase 1**: Estrutura Base e Categorias (CONCLUÍDA)
- ✅ **Fase 2**: Sistema de Stock Inteligente (CONCLUÍDA)  
- ✅ **Fase 3**: Atribuições Avançadas (CONCLUÍDA)
- 🔄 **Fase 4**: Devolução Parcial (EM CORREÇÃO - BUG ATIVO)
- ⏸️ **Fase 5**: Relatórios e Analytics (PAUSADA até Fase 4 100%)

## 🛡️ CHECKLIST PRÉ-IMPLEMENTAÇÃO

### ANTES DE QUALQUER ALTERAÇÃO:
- [ ] Identificar módulos que serão alterados
- [ ] Listar funcionalidades que podem ser afetadas  
- [ ] Verificar se existem bugs pendentes (resolver primeiro)
- [ ] Confirmar que Edge Functions/SQL existem antes de usar
- [ ] Testar em ambiente local se possível

### APÓS QUALQUER ALTERAÇÃO:
- [ ] Testar funcionalidade alterada
- [ ] Testar login (admin/admin)
- [ ] Testar navegação principal
- [ ] Verificar console por erros
- [ ] Confirmar que outros módulos não quebraram
- [ ] Documentar o que foi alterado

## 🎯 FOCO ATUAL: RESOLVER DEVOLUÇÃO PARCIAL

**OBJETIVO**: Fazer funcionar o cenário "10 Canecas → devolver 5 → ficar 5 restantes"
**BLOQUEADOR**: Função SQL não existe
**AÇÃO**: Criar função correta no Supabase
**TESTE**: Validar cenário completo
**CRITÉRIO**: 100% funcional antes de qualquer nova feature