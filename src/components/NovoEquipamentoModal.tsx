import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface NovoEquipamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  novoEquipamento: any;
  setNovoEquipamento: (equipamento: any) => void;
  tiposEquipamentos: any[];
  onSubmit: () => void;
  isLoading: boolean;
}

const NovoEquipamentoModal: React.FC<NovoEquipamentoModalProps> = ({
  isOpen,
  onClose,
  novoEquipamento,
  setNovoEquipamento,
  tiposEquipamentos,
  onSubmit,
  isLoading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Equipamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="codigo">Código Interno *</Label>
                <Input 
                  id="codigo" 
                  placeholder="Ex: EQ001"
                  value={novoEquipamento.codigo_interno}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, codigo_interno: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="serie">Número de Série</Label>
                <Input 
                  id="serie" 
                  placeholder="Ex: ABC123"
                  value={novoEquipamento.numero_serie}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, numero_serie: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="qr_code">Código QR</Label>
                <Input 
                  id="qr_code" 
                  placeholder="Código QR"
                  value={novoEquipamento.qr_code}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, qr_code: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Especificações do Produto */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-green-600">Especificações do Produto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo de Equipamento *</Label>
                <Select 
                  value={novoEquipamento.tipo_equipamento_id}
                  onValueChange={(value) => setNovoEquipamento({...novoEquipamento, tipo_equipamento_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEquipamentos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input 
                  id="marca" 
                  placeholder="Ex: Dell, HP, Canon"
                  value={novoEquipamento.marca}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, marca: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input 
                  id="modelo" 
                  placeholder="Ex: Latitude 5520"
                  value={novoEquipamento.modelo}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, modelo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cor">Cor</Label>
                <Input 
                  id="cor" 
                  placeholder="Ex: Preto, Branco"
                  value={novoEquipamento.cor}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, cor: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input 
                  id="peso" 
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={novoEquipamento.peso}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, peso: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="dimensoes">Dimensões</Label>
                <Input 
                  id="dimensoes" 
                  placeholder="Ex: 30x20x5 cm"
                  value={novoEquipamento.dimensoes}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, dimensoes: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Estado e Localização */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-purple-600">Estado e Localização</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={novoEquipamento.estado}
                  onValueChange={(value) => setNovoEquipamento({...novoEquipamento, estado: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="atribuido">Atribuído</SelectItem>
                    <SelectItem value="manutencao">Em Manutenção</SelectItem>
                    <SelectItem value="danificado">Danificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condicao">Condição</Label>
                <Select 
                  value={novoEquipamento.condicao}
                  onValueChange={(value) => setNovoEquipamento({...novoEquipamento, condicao: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excelente">Excelente</SelectItem>
                    <SelectItem value="bom">Bom</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="ruim">Ruim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="localizacao">Localização</Label>
                <Input 
                  id="localizacao" 
                  placeholder="Ex: Sala 1, Armazém A"
                  value={novoEquipamento.localizacao}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, localizacao: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-orange-600">Informações Financeiras</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="valor">Valor de Aquisição (€)</Label>
                <Input 
                  id="valor" 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={novoEquipamento.valor_aquisicao}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, valor_aquisicao: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="data_aquisicao">Data de Aquisição</Label>
                <Input 
                  id="data_aquisicao" 
                  type="date"
                  value={novoEquipamento.data_aquisicao}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, data_aquisicao: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="centro_custo">Centro de Custo</Label>
                <Input 
                  id="centro_custo" 
                  placeholder="Ex: TI, Administração"
                  value={novoEquipamento.centro_custo}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, centro_custo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="categoria_fiscal">Categoria Fiscal</Label>
                <Input 
                  id="categoria_fiscal" 
                  placeholder="Ex: Equipamento TI"
                  value={novoEquipamento.categoria_fiscal}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, categoria_fiscal: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Garantia e Validade */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-red-600">Garantia e Validade</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="garantia_ate">Garantia Até</Label>
                <Input 
                  id="garantia_ate" 
                  type="date"
                  value={novoEquipamento.garantia_ate}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, garantia_ate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="data_validade">Data de Validade</Label>
                <Input 
                  id="data_validade" 
                  type="date"
                  value={novoEquipamento.data_validade}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, data_validade: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="vida_util">Vida Útil (anos)</Label>
                <Input 
                  id="vida_util" 
                  type="number"
                  placeholder="5"
                  value={novoEquipamento.vida_util_anos}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, vida_util_anos: parseInt(e.target.value) || 5})}
                />
              </div>
              <div>
                <Label htmlFor="depreciacao">Depreciação Anual (%)</Label>
                <Input 
                  id="depreciacao" 
                  type="number"
                  step="0.1"
                  placeholder="20.0"
                  value={novoEquipamento.depreciacao_anual}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, depreciacao_anual: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Fornecedor e Documentação */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-teal-600">Fornecedor e Documentação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input 
                  id="fornecedor" 
                  placeholder="Nome do fornecedor"
                  value={novoEquipamento.fornecedor}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, fornecedor: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="manual_url">URL do Manual</Label>
                <Input 
                  id="manual_url" 
                  placeholder="https://..."
                  value={novoEquipamento.manual_url}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, manual_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="foto_url">URL da Foto</Label>
                <Input 
                  id="foto_url" 
                  placeholder="https://..."
                  value={novoEquipamento.foto_url}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, foto_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="responsavel_id">Responsável</Label>
                <Input 
                  id="responsavel_id" 
                  placeholder="ID do responsável"
                  value={novoEquipamento.responsavel_id}
                  onChange={(e) => setNovoEquipamento({...novoEquipamento, responsavel_id: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-600">Observações</h3>
            <div>
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea 
                id="observacoes" 
                placeholder="Observações, notas especiais, histórico..."
                rows={4}
                value={novoEquipamento.observacoes}
                onChange={(e) => setNovoEquipamento({...novoEquipamento, observacoes: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Equipamento'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NovoEquipamentoModal;