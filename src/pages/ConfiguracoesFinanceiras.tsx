import React, { useState } from 'react';
import { Settings, Save, AlertCircle, DollarSign, Calendar, Percent, Target, Bell, Shield, Database } from 'lucide-react';

interface FinancialSettings {
  currency: string;
  decimalPlaces: number;
  dateFormat: string;
  fiscalYearStart: string;
  taxRate: number;
  budgetAlertThreshold: number;
  autoBackup: boolean;
  backupFrequency: string;
  notifications: {
    lowBalance: boolean;
    budgetExceeded: boolean;
    monthlyReports: boolean;
    paymentReminders: boolean;
  };
  categories: {
    receitas: string[];
    despesas: string[];
  };
}

const ConfiguracoesFinanceiras: React.FC = () => {
  const [settings, setSettings] = useState<FinancialSettings>({
    currency: 'BRL',
    decimalPlaces: 2,
    dateFormat: 'DD/MM/YYYY',
    fiscalYearStart: '01/01',
    taxRate: 0,
    budgetAlertThreshold: 80,
    autoBackup: true,
    backupFrequency: 'weekly',
    notifications: {
      lowBalance: true,
      budgetExceeded: true,
      monthlyReports: false,
      paymentReminders: true,
    },
    categories: {
      receitas: ['Doações', 'Eventos', 'Parcerias', 'Vendas'],
      despesas: ['Alimentação', 'Veterinário', 'Medicamentos', 'Infraestrutura', 'Pessoal'],
    },
  });

  const [newCategory, setNewCategory] = useState({ type: 'receitas', name: '' });
  const [activeTab, setActiveTab] = useState('geral');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Configurações salvas com sucesso!');
  };

  const addCategory = () => {
    if (newCategory.name.trim()) {
      setSettings(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [newCategory.type]: [...prev.categories[newCategory.type as keyof typeof prev.categories], newCategory.name.trim()]
        }
      }));
      setNewCategory({ ...newCategory, name: '' });
    }
  };

  const removeCategory = (type: 'receitas' | 'despesas', index: number) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [type]: prev.categories[type].filter((_, i) => i !== index)
      }
    }));
  };

  const tabs = [
    { id: 'geral', label: 'Configurações Gerais', icon: Settings },
    { id: 'categorias', label: 'Categorias', icon: Target },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'backup', label: 'Backup e Segurança', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Configurações Financeiras</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'geral' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Configurações Gerais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Moeda
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Casas Decimais
                  </label>
                  <select
                    value={settings.decimalPlaces}
                    onChange={(e) => setSettings(prev => ({ ...prev, decimalPlaces: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>0</option>
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Formato de Data
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Início do Ano Fiscal
                  </label>
                  <input
                    type="text"
                    value={settings.fiscalYearStart}
                    onChange={(e) => setSettings(prev => ({ ...prev, fiscalYearStart: e.target.value }))}
                    placeholder="DD/MM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Percent className="h-4 w-4 inline mr-1" />
                    Taxa de Imposto (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Alerta de Orçamento (%)
                  </label>
                  <input
                    type="number"
                    value={settings.budgetAlertThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, budgetAlertThreshold: parseInt(e.target.value) || 80 }))}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Receber alerta quando atingir esta porcentagem do orçamento</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categorias' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Gerenciar Categorias</h3>
              
              <div className="mb-6">
                <div className="flex gap-4 mb-4">
                  <select
                    value={newCategory.type}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="receitas">Receitas</option>
                    <option value="despesas">Despesas</option>
                  </select>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da categoria"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-green-700 mb-3">Categorias de Receitas</h4>
                  <div className="space-y-2">
                    {settings.categories.receitas.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <span className="text-sm text-gray-700">{category}</span>
                        <button
                          onClick={() => removeCategory('receitas', index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-red-700 mb-3">Categorias de Despesas</h4>
                  <div className="space-y-2">
                    {settings.categories.despesas.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                        <span className="text-sm text-gray-700">{category}</span>
                        <button
                          onClick={() => removeCategory('despesas', index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Configurações de Notificações</h3>
              
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => {
                  const labels = {
                    lowBalance: 'Saldo baixo em contas',
                    budgetExceeded: 'Orçamento excedido',
                    monthlyReports: 'Relatórios mensais',
                    paymentReminders: 'Lembretes de pagamento'
                  };
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {labels[key as keyof typeof labels]}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Receber notificações sobre {labels[key as keyof typeof labels].toLowerCase()}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [key]: e.target.checked
                            }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Backup e Segurança</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      Backup Automático
                    </h4>
                    <p className="text-xs text-gray-500">
                      Realizar backup automático dos dados financeiros
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.autoBackup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequência do Backup
                    </label>
                    <select
                      value={settings.backupFrequency}
                      onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Ações de Backup</h4>
                  <div className="flex gap-4">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Fazer Backup Agora
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      Restaurar Backup
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                      Exportar Dados
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sistema Financeiro</h3>
              <p className="text-gray-300 text-sm">
                Gestão financeira completa para associações de proteção animal.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3">Links Úteis</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Suporte</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3">Contato</h4>
              <p className="text-gray-300 text-sm">
                Email: suporte@sistemafinanceiro.com<br />
                Telefone: (11) 9999-9999
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Sistema Financeiro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConfiguracoesFinanceiras;