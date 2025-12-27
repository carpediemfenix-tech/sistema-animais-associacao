import React, { useState } from 'react';
import PageActionBar from '@/components/PageActionBar';
import { ArrowLeft, Save, Calculator, Calendar, DollarSign, FileText, Tag, Building2, CreditCard, AlertCircle } from 'lucide-react';
import EnhancedHeader from '@/components/EnhancedHeader';
import EnhancedFooter from '@/components/EnhancedFooter';

interface FormData {
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: string;
  data: string;
  categoria: string;
  conta: string;
  formaPagamento: string;
  observacoes: string;
  recorrente: boolean;
  frequencia: string;
}

interface ValidationErrors {
  descricao?: string;
  valor?: string;
  data?: string;
  categoria?: string;
  conta?: string;
  formaPagamento?: string;
}

const NovoMovimento: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    tipo: 'receita',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    conta: '',
    formaPagamento: '',
    observacoes: '',
    recorrente: false,
    frequencia: 'mensal'
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorias = {
    receita: [
      'Mensalidades',
      'Doações',
      'Eventos',
      'Vendas',
      'Patrocínios',
      'Rendimentos',
      'Outros'
    ],
    despesa: [
      'Alimentação Animal',
      'Veterinário',
      'Medicamentos',
      'Limpeza',
      'Transporte',
      'Funcionários',
      'Aluguel',
      'Energia',
      'Água',
      'Telefone',
      'Material de Escritório',
      'Marketing',
      'Outros'
    ]
  };

  const contas = [
    'Conta Corrente Principal',
    'Conta Poupança',
    'Caixa',
    'Conta Doações',
    'Conta Eventos'
  ];

  const formasPagamento = [
    'Dinheiro',
    'PIX',
    'Transferência Bancária',
    'Cartão de Débito',
    'Cartão de Crédito',
    'Boleto',
    'Cheque'
  ];

  const frequencias = [
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'bimestral', label: 'Bimestral' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.valor.trim()) {
      newErrors.valor = 'Valor é obrigatório';
    } else if (isNaN(parseFloat(formData.valor.replace(',', '.')))) {
      newErrors.valor = 'Valor deve ser um número válido';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (!formData.conta) {
      newErrors.conta = 'Conta é obrigatória';
    }

    if (!formData.formaPagamento) {
      newErrors.formaPagamento = 'Forma de pagamento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after successful submission
      setFormData({
        tipo: 'receita',
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        categoria: '',
        conta: '',
        formaPagamento: '',
        observacoes: '',
        recorrente: false,
        frequencia: 'mensal'
      });

      alert('Movimento cadastrado com sucesso!');
    } catch (error) {
      alert('Erro ao cadastrar movimento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseFloat(numericValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue === 'NaN' ? '' : formattedValue;
  };

  const handleValueChange = (value: string) => {
    const formatted = formatCurrency(value);
    handleInputChange('valor', formatted);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <header className="bg-white border-b border-gray-200">
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Novo Movimento</h1>
                <p className="text-sm text-gray-500">Cadastre uma nova receita ou despesa</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Sistema Financeiro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tipo de Movimento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="h-5 w-5 text-blue-600 mr-2" />
              Tipo de Movimento
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('tipo', 'receita')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.tipo === 'receita'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-medium">Receita</div>
                  <div className="text-sm text-gray-500">Entrada de dinheiro</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('tipo', 'despesa')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.tipo === 'despesa'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">💸</div>
                  <div className="font-medium">Despesa</div>
                  <div className="text-sm text-gray-500">Saída de dinheiro</div>
                </div>
              </button>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              Informações Básicas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Ex: Mensalidade de associado"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.descricao ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.descricao}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.valor}
                    onChange={(e) => handleValueChange(e.target.value)}
                    placeholder="0,00"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.valor ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.valor && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.valor}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleInputChange('data', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.data ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.data && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.data}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.categoria ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias[formData.tipo].map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.categoria}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 text-blue-600 mr-2" />
              Informações Financeiras
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conta *
                </label>
                <select
                  value={formData.conta}
                  onChange={(e) => handleInputChange('conta', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.conta ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione uma conta</option>
                  {contas.map((conta) => (
                    <option key={conta} value={conta}>
                      {conta}
                    </option>
                  ))}
                </select>
                {errors.conta && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.conta}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.formaPagamento}
                    onChange={(e) => handleInputChange('formaPagamento', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.formaPagamento ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione a forma de pagamento</option>
                    {formasPagamento.map((forma) => (
                      <option key={forma} value={forma}>
                        {forma}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.formaPagamento && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.formaPagamento}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recorrência */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="h-5 w-5 text-blue-600 mr-2" />
              Recorrência
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recorrente"
                  checked={formData.recorrente}
                  onChange={(e) => handleInputChange('recorrente', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="recorrente" className="ml-2 text-sm text-gray-700">
                  Este movimento se repete
                </label>
              </div>

              {formData.recorrente && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência
                  </label>
                  <select
                    value={formData.frequencia}
                    onChange={(e) => handleInputChange('frequencia', e.target.value)}
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {frequencias.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Observações
            </h2>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Informações adicionais sobre este movimento..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Salvar Movimento'}
            </button>
          </div>
        </form>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Sistema Financeiro</h3>
              <p className="text-sm text-gray-600">
                Gestão completa das finanças da associação de animais.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Recursos</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Controle de Receitas</li>
                <li>Gestão de Despesas</li>
                <li>Relatórios Financeiros</li>
                <li>Orçamentos</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Contato</li>
                <li>Treinamentos</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>suporte@sistema.com</li>
                <li>(11) 9999-9999</li>
                <li>Segunda à Sexta</li>
                <li>8h às 18h</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      
      <EnhancedFooter />
    </div>
  );
};

export default NovoMovimento;