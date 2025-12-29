import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageActionBar from '@/components/PageActionBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Shield,
  Target,
  Users,
  Stethoscope,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  Heart,
  Activity,
  Eye,
  EyeOff,
  Phone,
  Globe,
  User,
  Mail,
  Share2,
  HelpCircle,
  ArrowRight,
  Calendar,
  Briefcase
} from 'lucide-react';

interface Denuncia {
  id: string;
  codigo: string;
  data_denuncia: string;
  canal_denuncia: string;
  canal_denuncia_outro?: string;
  local_completo: string;
  descricao_situacao: string;
  denunciante_anonimo: boolean;
  denunciante_nome?: string;
  denunciante_contato?: string;
  denunciante_observacoes?: string;
  quantidade_animais: number;
  intervencao_policial: boolean;
  dados_intervencao_policial?: any;
  intervencao_veterinaria: boolean;
  dados_intervencao_veterinaria?: any;
  voluntario_responsavel_id?: string;
  voluntarios_participantes: string[];
  missao_id?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Animal {
  id: string;
  nome: string;
  especie: string;
  sexo: string;
  estado: string;
}

interface Missao {
  id: string;
  codigo: string;
  titulo: string;
  status: string;
}

interface Voluntario {
  id: string;
  nome: string;
}

const DenunciaDetail: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [denuncia, setDenuncia] = useState<Denuncia | null>(null);
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [missao, setMissao] = useState<Missao | null>(null);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);

  useEffect(() => {
    if (!hasPermission('admin')) {
      toast({
        title: "🚫 Acesso Negado",
        description: "Apenas administradores podem ver denúncias.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    if (codigo) {
      loadDenunciaData();
    }
  }, [codigo]);

  const loadDenunciaData = async () => {
    try {
      setLoading(true);

      // Carregar denúncia
      const { data: denunciaData, error: denunciaError } = await supabase
        .from('denuncias_2025_12_29_23_00')
        .select('*')
        .eq('codigo', codigo)
        .single();

      if (denunciaError) {
        throw new Error('Denúncia não encontrada');
      }

      setDenuncia(denunciaData);

      // Carregar animais da denúncia
      const { data: animaisData, error: animaisError } = await supabase
        .from('denuncias_animais_sequencia')
        .select(`
          animal_id,
          sequencia,
          nome_gerado,
          animais (
            id,
            nome,
            especie,
            sexo,
            estado
          )
        `)
        .eq('denuncia_codigo', codigo);

      if (!animaisError && animaisData) {
        const animaisFormatados = animaisData.map(item => ({
          id: item.animais.id,
          nome: item.animais.nome,
          especie: item.animais.especie,
          sexo: item.animais.sexo,
          estado: item.animais.estado
        }));
        setAnimais(animaisFormatados);
      }

      // Carregar missão se existir
      if (denunciaData.missao_id) {
        const { data: missaoData, error: missaoError } = await supabase
          .from('missoes_2025_12_29_07_00')
          .select('id, codigo, titulo, status')
          .eq('id', denunciaData.missao_id)
          .single();

        if (!missaoError && missaoData) {
          setMissao(missaoData);
        }
      }

      // Carregar voluntários
      if (denunciaData.voluntarios_participantes && denunciaData.voluntarios_participantes.length > 0) {
        const { data: voluntariosData, error: voluntariosError } = await supabase
          .from('voluntarios')
          .select('id, nome')
          .in('id', denunciaData.voluntarios_participantes);

        if (!voluntariosError && voluntariosData) {
          setVoluntarios(voluntariosData);
        }
      }

    } catch (error) {
      console.error('Erro ao carregar denúncia:', error);
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro ao carregar denúncia",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aberta':
        return <Badge className="bg-red-600">🚨 ABERTA</Badge>;
      case 'em_andamento':
        return <Badge className="bg-yellow-600">⚡ EM ANDAMENTO</Badge>;
      case 'concluida':
        return <Badge className="bg-green-600">✅ CONCLUÍDA</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case 'telefone':
        return <Phone className="h-4 w-4" />;
      case 'site':
        return <Globe className="h-4 w-4" />;
      case 'pessoalmente':
        return <User className="h-4 w-4" />;
      case 'autoridades':
        return <Shield className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'redes_sociais':
        return <Share2 className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getCanalLabel = (canal: string) => {
    switch (canal) {
      case 'telefone':
        return 'Telefone';
      case 'site':
        return 'Site/Online';
      case 'pessoalmente':
        return 'Pessoalmente';
      case 'autoridades':
        return 'A pedido das autoridades';
      case 'email':
        return 'Email';
      case 'redes_sociais':
        return 'Redes sociais';
      case 'outro':
        return 'Outro';
      default:
        return canal;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative">
            <Activity className="h-16 w-16 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 h-16 w-16 animate-ping mx-auto rounded-full bg-red-400 opacity-20"></div>
          </div>
          <p className="text-xl font-bold">CARREGANDO OPERAÇÃO...</p>
          <p className="text-red-200 mt-2">Acessando dados da denúncia</p>
        </div>
      </div>
    );
  }

  if (!denuncia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
          <p className="text-xl font-bold">OPERAÇÃO NÃO ENCONTRADA</p>
          <p className="text-red-200 mt-2">Denúncia {codigo} não existe</p>
          <Button onClick={() => navigate('/')} className="mt-4 bg-white text-red-800">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900">
      <PageActionBar
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Operação Resgate', icon: <AlertTriangle className="h-4 w-4" /> },
          { label: denuncia.codigo }
        ]}
        primaryActions={
          <div className="flex items-center space-x-2">
            {getStatusBadge(denuncia.status)}
            <Badge className="bg-blue-600 text-white">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(denuncia.data_denuncia).toLocaleDateString('pt-PT')}
            </Badge>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da Operação */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-red-400 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            OPERAÇÃO {denuncia.codigo}
          </h1>
          <p className="text-xl text-red-100">
            Sistema Tático de Resgate Animal
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Identificação da Operação */}
            <Card className="border-2 border-red-300">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center text-xl">
                  <AlertTriangle className="h-6 w-6 mr-3" />
                  IDENTIFICAÇÃO DA OPERAÇÃO
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Data e Hora
                    </Label>
                    <p className="text-lg">
                      {new Date(denuncia.data_denuncia).toLocaleString('pt-PT')}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="font-semibold flex items-center">
                      {getCanalIcon(denuncia.canal_denuncia)}
                      <span className="ml-2">Canal de Intel</span>
                    </Label>
                    <p className="text-lg">
                      {getCanalLabel(denuncia.canal_denuncia)}
                      {denuncia.canal_denuncia === 'outro' && denuncia.canal_denuncia_outro && (
                        <span className="text-gray-600"> - {denuncia.canal_denuncia_outro}</span>
                      )}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <Label className="font-semibold flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Coordenadas da Operação
                  </Label>
                  <p className="text-lg mt-1">{denuncia.local_completo}</p>
                </div>

                <Separator className="my-4" />

                <div>
                  <Label className="font-semibold flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório da Situação
                  </Label>
                  <p className="text-lg mt-1 whitespace-pre-wrap">{denuncia.descricao_situacao}</p>
                </div>
              </CardContent>
            </Card>

            {/* Informante */}
            <Card className="border-2 border-blue-300">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-xl">
                  <User className="h-6 w-6 mr-3" />
                  DADOS DO INFORMANTE
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {denuncia.denunciante_anonimo ? (
                  <div className="flex items-center p-4 bg-blue-900 text-white rounded-lg">
                    <EyeOff className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-bold">OPERAÇÃO CLASSIFICADA</p>
                      <p className="text-blue-200">Identidade do informante protegida</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {denuncia.denunciante_nome && (
                      <div>
                        <Label className="font-semibold">Nome</Label>
                        <p className="text-lg">{denuncia.denunciante_nome}</p>
                      </div>
                    )}
                    {denuncia.denunciante_contato && (
                      <div>
                        <Label className="font-semibold">Contacto</Label>
                        <p className="text-lg">{denuncia.denunciante_contato}</p>
                      </div>
                    )}
                    {denuncia.denunciante_observacoes && (
                      <div>
                        <Label className="font-semibold">Observações</Label>
                        <p className="text-lg">{denuncia.denunciante_observacoes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alvos da Operação */}
            <Card className="border-2 border-orange-300">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center text-xl">
                  <Target className="h-6 w-6 mr-3" />
                  ALVOS DA OPERAÇÃO ({denuncia.quantidade_animais} ANIMAIS)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {animais.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {animais.map((animal, index) => (
                      <Link key={animal.id} to={`/animal/${animal.id}`}>
                        <Card className="border border-orange-200 hover:border-orange-400 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-orange-600">
                                ALVO #{String(index + 1).padStart(2, '0')}
                              </Badge>
                              <Badge variant="outline">{animal.estado}</Badge>
                            </div>
                            <h4 className="font-bold text-lg">{animal.nome}</h4>
                            <p className="text-gray-600">{animal.especie} • {animal.sexo}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum animal encontrado</p>
                )}
              </CardContent>
            </Card>

            {/* Intervenções */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Autoridades */}
              <Card className="border-2 border-blue-300">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    AUTORIDADES
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {denuncia.intervencao_policial ? (
                    <div className="space-y-2">
                      <Badge className="bg-blue-600">✅ INTERVENÇÃO REGISTRADA</Badge>
                      {denuncia.dados_intervencao_policial && (
                        <div className="text-sm space-y-1">
                          <p><strong>Tipo:</strong> {denuncia.dados_intervencao_policial.tipo_autoridade}</p>
                          {denuncia.dados_intervencao_policial.numero_ocorrencia && (
                            <p><strong>Ocorrência:</strong> {denuncia.dados_intervencao_policial.numero_ocorrencia}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline">❌ SEM INTERVENÇÃO</Badge>
                  )}
                </CardContent>
              </Card>

              {/* Veterinário */}
              <Card className="border-2 border-green-300">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    VETERINÁRIO
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {denuncia.intervencao_veterinaria ? (
                    <div className="space-y-2">
                      <Badge className="bg-green-600">✅ INTERVENÇÃO REGISTRADA</Badge>
                      {denuncia.dados_intervencao_veterinaria && (
                        <div className="text-sm space-y-1">
                          {denuncia.dados_intervencao_veterinaria.veterinario_nome && (
                            <p><strong>Veterinário:</strong> {denuncia.dados_intervencao_veterinaria.veterinario_nome}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline">❌ SEM INTERVENÇÃO</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Status da Operação */}
            <Card className="border-2 border-purple-300">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  STATUS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-center">
                {getStatusBadge(denuncia.status)}
                <p className="text-sm text-gray-600 mt-2">
                  Criada em {new Date(denuncia.created_at).toLocaleDateString('pt-PT')}
                </p>
                <p className="text-sm text-gray-600">
                  por {denuncia.created_by}
                </p>
              </CardContent>
            </Card>

            {/* Missão Associada */}
            {missao && (
              <Card className="border-2 border-green-300">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    MISSÃO
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Link to={`/missao/${missao.id}`}>
                    <Button variant="outline" className="w-full justify-start">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {missao.codigo}
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-600 mt-2">{missao.titulo}</p>
                  <Badge className="mt-2" variant={missao.status === 'ativa' ? 'default' : 'outline'}>
                    {missao.status}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Equipe Tática */}
            <Card className="border-2 border-purple-300">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  EQUIPE TÁTICA
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {voluntarios.length > 0 ? (
                  <div className="space-y-2">
                    {voluntarios.map(voluntario => (
                      <div key={voluntario.id} className="flex items-center justify-between">
                        <span className="text-sm">{voluntario.nome}</span>
                        {voluntario.id === denuncia.voluntario_responsavel_id && (
                          <Badge className="bg-purple-600 text-xs">COMANDANTE</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma equipe designada</p>
                )}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card className="border-2 border-gray-300">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  AÇÕES
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório Completo
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Calendar className="h-4 w-4 mr-2" />
                  Cronologia
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Label simples
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

export default DenunciaDetail;