import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Download, Calendar, DollarSign, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

interface Movement {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  category: string;
  account: string;
  date: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  reference?: string;
  notes?: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
}

const EnhancedHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Sistema Financeiro</h1>
          </div>
          <nav className="flex space-x-8">
            <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Dashboard</a>
            <a href="#" className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">Movimentos</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Contas</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Relatórios</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

const EnhancedFooter: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-500">
          © 2024 Sistema Financeiro - Associação de Animais. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

const GestaoMovimentos: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'receita' | 'despesa'>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);

  // Mock data
  useEffect(() => {
    const mockAccounts: Account[] = [
      { id: '1', name: 'Conta Corrente Principal', type: 'corrente' },
      { id: '2', name: 'Conta Poupança', type: 'poupanca' },
      { id: '3', name: 'Caixa', type: 'caixa' }
    ];

    const mockCategories: Category[] = [
      { id: '1', name: 'Doações', type: 'receita' },
      { id: '2', name: 'Eventos', type: 'receita' },
      { id: '3', name: 'Veterinário', type: 'despesa' },
      { id: '4', name: 'Alimentação', type: 'despesa' },
      { id: '5', name: 'Medicamentos', type: 'despesa' }
    ];

    const mockMovements: Movement[] = [
      {
        id: '1',
        type: 'receita',
        description: 'Doação mensal - João Silva',
        amount: 500.00,
        category: 'Doações',
        account: 'Conta Corrente Principal',
        date: '2024-01-15',
        status: 'confirmado',
        reference: 'DOA001'
      },
      {
        id: '2',
        type: 'despesa',
        description: 'Consulta veterinária - Rex',
        amount: 150.00,
        category: 'Veterinário',
        account: 'Conta Corrente Principal',
        date: '2024-01-14',
        status: 'confirmado',
        reference: 'VET001'
      },
      {
        id: '3',
        type: 'receita',
        description: 'Evento beneficente',
        amount: 2500.00,
        category: 'Eventos',
        account: 'Conta Corrente Principal',
        date: '2024-01-13',
        status: 'pendente',
        reference: 'EVT001'
      },
      {
        id: '4',
        type: 'despesa',
        description: 'Ração premium 20kg',
        amount: 180.00,
        category: 'Alimentação',
        account: 'Caixa',
        date: '2024-01-12',
        status: 'confirmado',
        reference: 'ALI001'
      }
    ];

    setAccounts(mockAccounts);
    setCategories(mockCategories);
    setMovements(mockMovements);
    setFilteredMovements(mockMovements);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = movements.filter(movement => {
      const matchesSearch = movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          movement.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || movement.type === selectedType;
      const matchesAccount = selectedAccount === 'all' || movement.account === selectedAccount;
      const matchesCategory = selectedCategory === 'all' || movement.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || movement.status === selectedStatus;
      
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const movementDate = new Date(movement.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        matchesDate = movementDate >= startDate && movementDate <= endDate;
      }

      return matchesSearch && matchesType && matchesAccount && matchesCategory && matchesStatus && matchesDate;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredMovements(filtered);
  }, [movements, searchTerm, selectedType, selectedAccount, selectedCategory, selectedStatus, dateRange, sortBy, sortOrder]);

  const handleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectMovement = (movementId: string) => {
    setSelectedMovements(prev => 
      prev.includes(movementId) 
        ? prev.filter(id => id !== movementId)
        : [...prev, movementId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMovements.length === filteredMovements.length) {
      setSelectedMovements([]);
    } else {
      setSelectedMovements(filteredMovements.map(m => m.id));
    }
  };

  const getTotalReceitas = () => {
    return filteredMovements
      .filter(m => m.type === 'receita' && m.status === 'confirmado')
      .reduce((sum, m) => sum + m.amount, 0);
  };

  const getTotalDespesas = () => {
    return filteredMovements
      .filter(m => m.type === 'despesa' && m.status === 'confirmado')
      .reduce((sum, m) => sum + m.amount, 0);
  };

  const getSaldo = () => {
    return getTotalReceitas() - getTotalDespesas();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'receita' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Movimentos</h1>
          <p className="text-gray-600">Gerencie todas as receitas e despesas da associação</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalReceitas())}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(getTotalDespesas())}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo</p>
                <p className={`text-2xl font-bold ${getSaldo() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(getSaldo())}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Movimentos</p>
                <p className="text-2xl font-bold text-gray-900">{filteredMovements.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por descrição ou referência..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </button>
                
                <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
                
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Movimento
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as 'all' | 'receita' | 'despesa')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="receita">Receitas</option>
                    <option value="despesa">Despesas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.name}>{account.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Movements Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedMovements.length === filteredMovements.length && filteredMovements.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Data
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      Descrição
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conta
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Valor
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMovements.includes(movement.id)}
                        onChange={() => handleSelectMovement(movement.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(movement.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.type === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{movement.description}</div>
                        {movement.reference && (
                          <div className="text-gray-500 text-xs">Ref: {movement.reference}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.account}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={getTypeColor(movement.type)}>
                        {movement.type === 'receita' ? '+' : '-'}{formatCurrency(movement.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                        {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMovements.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">Nenhum movimento encontrado</div>
              <div className="text-gray-400">Tente ajustar os filtros ou adicionar um novo movimento</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredMovements.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Anterior
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredMovements.length}</span> de{' '}
                  <span className="font-medium">{filteredMovements.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Anterior
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default GestaoMovimentos;