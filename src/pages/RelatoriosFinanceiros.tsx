import React, { useState } from 'react';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, FileText, Eye } from 'lucide-react';

interface ReportFilter {
  startDate: string;
  endDate: string;
  accountType: string;
  category: string;
  reportType: string;
}

interface ReportData {
  id: string;
  name: string;
  type: 'receita' | 'despesa' | 'balanco';
  period: string;
  amount: number;
  status: 'gerado' | 'processando';
  createdAt: string;
}

const EnhancedHeader: React.FC = () => (
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">Sistema Financeiro</h1>
        </div>
        <nav className="flex space-x-8">
          <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Dashboard</a>
          <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Movimentos</a>
          <a href="#" className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">Relatórios</a>
          <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Configurações</a>
        </nav>
      </div>
    </div>
  </header>
);

const EnhancedFooter: React.FC = () => (
  <footer className="bg-gray-50 border-t border-gray-200">
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          © 2024 Sistema Financeiro - Associação de Animais
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Suporte</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Documentação</a>
        </div>
      </div>
    </div>
  </footer>
);

const RelatoriosFinanceiros: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: '',
    endDate: '',
    accountType: '',
    category: '',
    reportType: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const mockReports: ReportData[] = [
    {
      id: '1',
      name: 'Relatório Mensal - Janeiro 2024',
      type: 'balanco',
      period: 'Janeiro 2024',
      amount: 15420.50,
      status: 'gerado',
      createdAt: '2024-02-01'
    },
    {
      id: '2',
      name: 'Receitas por Categoria - Q1 2024',
      type: 'receita',
      period: 'Q1 2024',
      amount: 45230.80,
      status: 'gerado',
      createdAt: '2024-01-31'
    },
    {
      id: '3',
      name: 'Despesas Operacionais - Janeiro',
      type: 'despesa',
      period: 'Janeiro 2024',
      amount: 12850.30,
      status: 'processando',
      createdAt: '2024-01-30'
    }
  ];

  const summaryCards = [
    {
      title: 'Total de Receitas',
      value: 'R$ 125.430,50',
      change: '+12.5%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Total de Despesas',
      value: 'R$ 89.250,30',
      change: '-5.2%',
      trend: 'down' as const,
      icon: TrendingDown,
      color: 'red'
    },
    {
      title: 'Saldo Atual',
      value: 'R$ 36.180,20',
      change: '+8.3%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Relatórios Gerados',
      value: '24',
      change: '+3',
      trend: 'up' as const,
      icon: FileText,
      color: 'gray'
    }
  ];

  const handleFilterChange = (field: keyof ReportFilter, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const generateReport = () => {
    console.log('Gerando relatório com filtros:', filters);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      gerado: 'bg-green-100 text-green-800',
      processando: 'bg-yellow-100 text-yellow-800'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'receita':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'despesa':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'balanco':
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EnhancedHeader />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios Financeiros</h1>
          <p className="text-gray-600">Gere e visualize relatórios detalhados das movimentações financeiras</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${
                  card.color === 'green' ? 'bg-green-100' :
                  card.color === 'red' ? 'bg-red-100' :
                  card.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <card.icon className={`h-6 w-6 ${
                    card.color === 'green' ? 'text-green-600' :
                    card.color === 'red' ? 'text-red-600' :
                    card.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Generation Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Gerar Novo Relatório</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Relatório
                  </label>
                  <select
                    value={filters.reportType}
                    onChange={(e) => handleFilterChange('reportType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="receitas">Relatório de Receitas</option>
                    <option value="despesas">Relatório de Despesas</option>
                    <option value="balanco">Balanço Geral</option>
                    <option value="fluxo-caixa">Fluxo de Caixa</option>
                    <option value="categorias">Por Categorias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Conta
                  </label>
                  <select
                    value={filters.accountType}
                    onChange={(e) => handleFilterChange('accountType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas as contas</option>
                    <option value="corrente">Conta Corrente</option>
                    <option value="poupanca">Poupança</option>
                    <option value="caixa">Caixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    <option value="doacao">Doações</option>
                    <option value="veterinario">Veterinário</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="medicamentos">Medicamentos</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={generateReport}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Gerar Relatório
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <PieChart className="h-5 w-5 mr-2" />
                Relatório por Categorias
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <BarChart3 className="h-5 w-5 mr-2" />
                Balanço Mensal
              </button>
              <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <TrendingUp className="h-5 w-5 mr-2" />
                Fluxo de Caixa
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Relatórios Recentes</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relatório
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(report.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {report.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {report.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(report.status)}`}>
                        {report.status === 'gerado' ? 'Gerado' : 'Processando'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default RelatoriosFinanceiros;