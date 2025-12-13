import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, CreditCard, Building, Wallet, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'caixa';
  bank: string;
  accountNumber: string;
  balance: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

interface AccountFormData {
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'caixa';
  bank: string;
  accountNumber: string;
  balance: number;
  description: string;
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
            <a href="#" className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">Contas</a>
            <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">Movimentos</a>
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

const GestaoContas: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showBalances, setShowBalances] = useState(true);
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: 'corrente',
    bank: '',
    accountNumber: '',
    balance: 0,
    description: ''
  });

  // Mock data
  useEffect(() => {
    const mockAccounts: Account[] = [
      {
        id: '1',
        name: 'Conta Corrente Principal',
        type: 'corrente',
        bank: 'Banco do Brasil',
        accountNumber: '12345-6',
        balance: 15750.50,
        isActive: true,
        description: 'Conta principal para movimentações diárias',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Poupança Reserva',
        type: 'poupanca',
        bank: 'Caixa Econômica',
        accountNumber: '98765-4',
        balance: 25000.00,
        isActive: true,
        description: 'Reserva de emergência da associação',
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        name: 'Caixa Eventos',
        type: 'caixa',
        bank: 'N/A',
        accountNumber: 'CAIXA-001',
        balance: 1250.75,
        isActive: true,
        description: 'Dinheiro em espécie para eventos',
        createdAt: '2024-02-01'
      },
      {
        id: '4',
        name: 'Investimento CDB',
        type: 'investimento',
        bank: 'Itaú',
        accountNumber: '55555-1',
        balance: 50000.00,
        isActive: true,
        description: 'Investimento em CDB para crescimento do patrimônio',
        createdAt: '2024-01-05'
      }
    ];
    setAccounts(mockAccounts);
    setFilteredAccounts(mockAccounts);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountNumber.includes(searchTerm)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(account => account.type === filterType);
    }

    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, filterType]);

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'corrente':
        return <CreditCard className="h-5 w-5" />;
      case 'poupanca':
        return <Building className="h-5 w-5" />;
      case 'investimento':
        return <TrendingUp className="h-5 w-5" />;
      case 'caixa':
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'corrente':
        return 'Conta Corrente';
      case 'poupanca':
        return 'Poupança';
      case 'investimento':
        return 'Investimento';
      case 'caixa':
        return 'Caixa';
      default:
        return type;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'corrente':
        return 'bg-blue-100 text-blue-800';
      case 'poupanca':
        return 'bg-green-100 text-green-800';
      case 'investimento':
        return 'bg-purple-100 text-purple-800';
      case 'caixa':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTotalBalance = () => {
    return accounts.filter(account => account.isActive).reduce((total, account) => total + account.balance, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAccount) {
      // Update existing account
      const updatedAccounts = accounts.map(account =>
        account.id === editingAccount.id
          ? { ...account, ...formData }
          : account
      );
      setAccounts(updatedAccounts);
    } else {
      // Create new account
      const newAccount: Account = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAccounts([...accounts, newAccount]);
    }

    // Reset form
    setFormData({
      name: '',
      type: 'corrente',
      bank: '',
      accountNumber: '',
      balance: 0,
      description: ''
    });
    setShowModal(false);
    setEditingAccount(null);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      bank: account.bank,
      accountNumber: account.accountNumber,
      balance: account.balance,
      description: account.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = (accountId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      setAccounts(accounts.filter(account => account.id !== accountId));
    }
  };

  const toggleAccountStatus = (accountId: string) => {
    const updatedAccounts = accounts.map(account =>
      account.id === accountId
        ? { ...account, isActive: !account.isActive }
        : account
    );
    setAccounts(updatedAccounts);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Contas</h1>
          <p className="text-gray-600">Gerencie todas as contas financeiras da associação</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total em Contas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {showBalances ? formatCurrency(getTotalBalance()) : '••••••'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.filter(account => account.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contas Correntes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.filter(account => account.type === 'corrente').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Investimentos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.filter(account => account.type === 'investimento').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Building className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar contas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Tipos</option>
                    <option value="corrente">Conta Corrente</option>
                    <option value="poupanca">Poupança</option>
                    <option value="investimento">Investimento</option>
                    <option value="caixa">Caixa</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBalances(!showBalances)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showBalances ? 'Ocultar Saldos' : 'Mostrar Saldos'}
                </button>
                
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Nova Conta
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getAccountTypeColor(account.type)}`}>
                            {getAccountTypeIcon(account.type)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{account.name}</div>
                          {account.description && (
                            <div className="text-sm text-gray-500">{account.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(account.type)}`}>
                        {getAccountTypeName(account.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.bank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.accountNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {showBalances ? formatCurrency(account.balance) : '••••••'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleAccountStatus(account.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          account.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {account.isActive ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma conta encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando uma nova conta.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAccount ? 'Editar Conta' : 'Nova Conta'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Conta
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Conta Corrente Principal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Conta
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="corrente">Conta Corrente</option>
                      <option value="poupanca">Poupança</option>
                      <option value="investimento">Investimento</option>
                      <option value="caixa">Caixa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banco
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bank}
                      onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Banco do Brasil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número da Conta
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 12345-6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saldo Inicial
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Descrição opcional da conta"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingAccount(null);
                        setFormData({
                          name: '',
                          type: 'corrente',
                          bank: '',
                          accountNumber: '',
                          balance: 0,
                          description: ''
                        });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      {editingAccount ? 'Atualizar' : 'Criar Conta'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default GestaoContas;