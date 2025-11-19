import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Edit, 
  Key, 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Loader2, 
  Eye, 
  EyeOff,
  UserCheck,
  UserX,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  nome_completo: string;
  perfil_acesso: 'administrador' | 'tecnico' | 'consulta';
  ativo: boolean;
  ultimo_login?: string;
  tentativas_login: number;
  created_at: string;
  updated_at: string;
}

const GestaoUtilizadores = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nome_completo: '',
    perfil_acesso: 'consulta' as 'administrador' | 'tecnico' | 'consulta',
    ativo: true
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { user, hasPermission, logout } = useAuth();
  const { toast } = useToast();

  // Verificar se tem permissão de administrador
  if (!hasPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <ShieldX className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Apenas administradores podem gerir utilizadores.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Carregar utilizadores
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('👥 [USER_MGMT] Carregando utilizadores...');

      // SOLUÇÃO SIMPLES: Buscar diretamente da base de dados
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, email, nome_completo, perfil_acesso, ativo, ultimo_login, tentativas_login, created_at')
        .order('created_at', { ascending: false });
      
      // Simular resposta da Edge Function para compatibilidade
      const data = { success: true, users };

      if (error) {
        console.error('❌ [USER_MGMT] Erro na Edge Function:', error);
        throw new Error('Erro ao carregar utilizadores');
      }

      if (!data.success) {
        throw new Error(data.error);
      }

      console.log('✅ [USER_MGMT] Utilizadores carregados:', data.users.length);
      setUsers(data.users);
    } catch (error: any) {
      console.error('💥 [USER_MGMT] Erro:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Não foi possível carregar utilizadores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset do formulário
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      nome_completo: '',
      perfil_acesso: 'consulta',
      ativo: true
    });
    setEditingUser(null);
  };

  // Abrir edição
  const openEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      username: userToEdit.username,
      email: userToEdit.email,
      password: '',
      nome_completo: userToEdit.nome_completo,
      perfil_acesso: userToEdit.perfil_acesso,
      ativo: userToEdit.ativo
    });
    setDialogOpen(true);
  };

  // Validar formulário
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.username.trim()) {
      errors.push('Username é obrigatório');
    } else if (formData.username.length < 3) {
      errors.push('Username deve ter pelo menos 3 caracteres');
    }
    
    if (!formData.email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Email deve ter formato válido');
    }
    
    if (!formData.nome_completo.trim()) {
      errors.push('Nome completo é obrigatório');
    } else if (formData.nome_completo.length < 2) {
      errors.push('Nome completo deve ter pelo menos 2 caracteres');
    }
    
    if (!editingUser && !formData.password.trim()) {
      errors.push('Password é obrigatória');
    } else if (!editingUser && formData.password.length < 6) {
      errors.push('Password deve ter pelo menos 6 caracteres');
    }
    
    if (!formData.perfil_acesso) {
      errors.push('Perfil de acesso é obrigatório');
    }
    
    return errors;
  };

  // Criar/Atualizar utilizador
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário antes de enviar
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "❌ Erro de validação",
        description: validationErrors.join(', '),
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      console.log('📝 [USER_MGMT] Dados do formulário validados:', {
        username: formData.username,
        email: formData.email,
        nome_completo: formData.nome_completo,
        perfil_acesso: formData.perfil_acesso,
        ativo: formData.ativo,
        hasPassword: !!formData.password
      });
      
      if (editingUser) {
        // Atualizar utilizador
        console.log('✏️ [USER_MGMT] Atualizando utilizador:', editingUser.username);
        
        const { data, error } = await supabase.functions.invoke('user_management_simple_2025_11_19_05_00', {
          method: 'PUT',
          body: {
            id: editingUser.id,
            username: formData.username,
            email: formData.email,
            nome_completo: formData.nome_completo,
            perfil_acesso: formData.perfil_acesso,
            ativo: formData.ativo
          }
        });

        if (error || !data.success) {
          throw new Error(data?.error || 'Erro ao atualizar utilizador');
        }

        toast({
          title: "✅ Utilizador atualizado",
          description: `${formData.nome_completo} foi atualizado com sucesso`,
        });
      } else {
        // Criar novo utilizador
        console.log('➕ [USER_MGMT] Criando utilizador:', formData.username);
        console.log('📝 [USER_MGMT] Dados do formulário:', formData);
        
        // SOLUÇÃO SIMPLES: Inserção direta na base de dados
        console.log('💾 [USER_MGMT] Inserindo diretamente na base de dados...');
        
        // Verificar duplicados primeiro
        const { data: existingUsers, error: checkError } = await supabase
          .from('users')
          .select('id, username, email')
          .or(`username.eq.${formData.username},email.eq.${formData.email}`);
        
        if (checkError) {
          console.error('❌ [USER_MGMT] Erro ao verificar duplicados:', checkError);
          throw new Error('Erro ao verificar duplicados');
        }
        
        if (existingUsers && existingUsers.length > 0) {
          console.log('❌ [USER_MGMT] Duplicado encontrado:', existingUsers);
          const duplicateField = existingUsers[0].username === formData.username ? 'Username' : 'Email';
          throw new Error(`${duplicateField} já existe`);
        }
        
        console.log('✅ [USER_MGMT] Nenhum duplicado encontrado');
        
        // Gerar hash simples da password (temporário para teste)
        const passwordHash = `simple_hash_${formData.password}_${Date.now()}`;
        console.log('🔐 [USER_MGMT] Hash gerado:', passwordHash.substring(0, 20) + '...');
        
        // Inserir utilizador diretamente
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            username: formData.username,
            email: formData.email,
            password_hash: passwordHash,
            nome_completo: formData.nome_completo,
            perfil_acesso: formData.perfil_acesso,
            ativo: formData.ativo ?? true,
            tentativas_login: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id, username, email, nome_completo, perfil_acesso, ativo')
          .single();
        
        console.log('📊 [USER_MGMT] Resultado da inserção:', { newUser, insertError });
        
        if (insertError) {
          console.error('❌ [USER_MGMT] Erro ao inserir:', insertError);
          throw new Error(`Erro ao criar utilizador: ${insertError.message}`);
        }
        
        console.log('✅ [USER_MGMT] Utilizador criado com sucesso:', newUser.id);
        
        // Simular resposta da Edge Function para compatibilidade
        const data = { success: true, user: newUser };
        const error = null;
        
        console.log('📊 [USER_MGMT] Resposta simulada:', { data, error });

        if (error || !data.success) {
          throw new Error(data?.error || 'Erro ao criar utilizador');
        }

        toast({
          title: "✅ Utilizador criado",
          description: `${formData.nome_completo} foi criado com sucesso`,
        });
      }

      setDialogOpen(false);
      resetForm();
      await fetchUsers();
    } catch (error: any) {
      console.error('💥 [USER_MGMT] Erro no submit:', error);
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Reset de password
  const handleResetPassword = async () => {
    if (!selectedUserForReset || !newPassword.trim()) return;

    try {
      setSubmitting(true);
      console.log('🔑 [USER_MGMT] Resetando password para:', selectedUserForReset.username);

      const { data, error } = await supabase.functions.invoke('user_management_simple_2025_11_19_05_00', {
        method: 'PATCH',
        body: {
          user_id: selectedUserForReset.id,
          new_password: newPassword
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Erro ao resetar password');
      }

      toast({
        title: "✅ Password resetada",
        description: `Password de ${selectedUserForReset.nome_completo} foi resetada`,
      });

      setResetPasswordDialogOpen(false);
      setSelectedUserForReset(null);
      setNewPassword('');
    } catch (error: any) {
      console.error('💥 [USER_MGMT] Erro no reset:', error);
      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT');
  };

  // Badge do perfil
  const getPerfilBadge = (perfil: string) => {
    switch (perfil) {
      case 'administrador':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><ShieldCheck className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'tecnico':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Shield className="h-3 w-3 mr-1" />Técnico</Badge>;
      case 'consulta':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><Eye className="h-3 w-3 mr-1" />Consulta</Badge>;
      default:
        return <Badge variant="secondary">{perfil}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">A carregar utilizadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <img 
                  src="./images/BackgroundEraser_20250411_205630024.png" 
                  alt="Associação Valentão"
                  className="h-8 w-auto object-contain"
                />
                <Users className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Gestão de Utilizadores
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="hover:bg-red-100 text-red-600 hover:text-red-700"
                title="Terminar Sessão"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Utilizador
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Alterar dados do utilizador' : 'Criar novo utilizador no sistema'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="username"
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@exemplo.com"
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nome_completo">Nome Completo *</Label>
                    <Input
                      id="nome_completo"
                      value={formData.nome_completo}
                      onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                      placeholder="Nome completo"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Mínimo 6 caracteres"
                          disabled={submitting}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="perfil_acesso">Perfil de Acesso *</Label>
                      <Select 
                        value={formData.perfil_acesso} 
                        onValueChange={(value: any) => setFormData({...formData, perfil_acesso: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consulta">Consulta</SelectItem>
                          <SelectItem value="tecnico">Técnico</SelectItem>
                          <SelectItem value="administrador">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ativo">Status</Label>
                      <Select 
                        value={formData.ativo ? "true" : "false"} 
                        onValueChange={(value) => setFormData({...formData, ativo: value === "true"})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ativo</SelectItem>
                          <SelectItem value="false">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {editingUser ? 'A atualizar...' : 'A criar...'}
                        </>
                      ) : (
                        <>
                          {editingUser ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                          {editingUser ? 'Atualizar' : 'Criar'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Utilizadores</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.perfil_acesso === 'administrador').length}
                  </p>
                </div>
                <ShieldCheck className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Técnicos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.perfil_acesso === 'tecnico').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilizadores Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.ativo).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Utilizadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Lista de Utilizadores</span>
            </CardTitle>
            <CardDescription>
              Gerir utilizadores e permissões do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{userItem.nome_completo}</div>
                          <div className="text-sm text-gray-500">@{userItem.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>{getPerfilBadge(userItem.perfil_acesso)}</TableCell>
                      <TableCell>
                        {userItem.ativo ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <UserCheck className="h-3 w-3 mr-1" />Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <UserX className="h-3 w-3 mr-1" />Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {userItem.ultimo_login ? (
                          <span className="text-sm text-gray-600">
                            {formatDate(userItem.ultimo_login)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(userItem)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUserForReset(userItem);
                              setResetPasswordDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Reset Password */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resetar Password</DialogTitle>
            <DialogDescription>
              Definir nova password para {selectedUserForReset?.nome_completo}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_password">Nova Password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setResetPasswordDialogOpen(false);
                  setNewPassword('');
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleResetPassword} 
                disabled={submitting || newPassword.length < 6}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    A resetar...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Resetar Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestaoUtilizadores;
