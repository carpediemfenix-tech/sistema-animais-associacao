import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  PawPrint,
  Loader2,
  Printer,
  Download,
  QrCode,
  MapPin,
  Calendar,
  Shield,
  Heart,
  Stethoscope,
  Users,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { useToast } from "@/hooks/use-toast";
import EnhancedHeader from "@/components/EnhancedHeader";
import { convertGoogleDriveUrl } from "@/lib/utils";

const AnimalBI = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarVerso, setMostrarVerso] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnimalData();
  }, [id]);

  const fetchAnimalData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      // Buscar dados do animal (mesma query do AnimalDetail que funciona)
      const { data: animalData, error: animalError } = await supabase
        .from('animais')
        .select(`
          *,
          grupos(nome, tipo)
        `)
        .eq('id', id)
        .single();

      if (animalError) throw animalError;

      console.log('🐾 Dados do animal carregados:', animalData);
      setAnimal(animalData);

      // Buscar localização atual (mesma lógica do AnimalDetail)
      const { data: localizacaoData, error: localizacaoError } = await supabase
        .from('localizacoes_animal')
        .select('*')
        .eq('animal_id', id)
        .eq('ativo', true)
        .single();
      
      if (localizacaoData && !localizacaoError) {
        // Buscar localização separadamente
        const { data: localizacaoInfo } = await supabase
          .from('localizacoes')
          .select('nome, descricao')
          .eq('id', localizacaoData.localizacao_id)
          .single();
        
        if (localizacaoInfo) {
          localizacaoData.localizacao = localizacaoInfo;
        }
        
        console.log('📍 Localização carregada:', localizacaoData);
        setLocalizacaoAtual(localizacaoData);
      } else {
        console.log('⚠️ Nenhuma localização ativa encontrada');
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 mb-4">Animal não encontrado</p>
          <Link to="/animais">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Animais
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const fotoUrl = animal.foto_url ? convertGoogleDriveUrl(animal.foto_url) : null;
  
  // Debug da foto
  console.log('🖼️ Foto URL original:', animal.foto_url);
  console.log('🖼️ Foto URL convertida:', fotoUrl);
  console.log('🔢 Chip/Transponder:', animal.chip, animal.transponder);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <div className="print:hidden">
        <EnhancedHeader />
      </div>

      {/* Barra de ações - oculta na impressão */}
      <div className="print:hidden bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/animal/${id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-800">Bilhete de Identidade</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setMostrarVerso(false)} 
                variant={!mostrarVerso ? "default" : "outline"} 
                size="sm"
              >
                Frente
              </Button>
              <Button 
                onClick={() => setMostrarVerso(true)} 
                variant={mostrarVerso ? "default" : "outline"} 
                size="sm"
              >
                Verso
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cartão de Identidade */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* FRENTE DO CARTÃO */}
        {!mostrarVerso && (
        <Card className="overflow-hidden shadow-2xl border-4 border-blue-900 bg-gradient-to-br from-blue-50 to-white">
          {/* Cabeçalho Institucional */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full">
                  <PawPrint className="h-8 w-8 text-blue-900" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-wide">ASSOCIAÇÃO VALENTÃO</h2>
                  <p className="text-blue-200 text-sm">Bilhete de Identidade Animal</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-200">Documento Oficial</p>
                <p className="text-lg font-bold">Nº {animal.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Corpo do Documento */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Coluna Esquerda - Foto */}
              <div className="md:col-span-1">
                <div className="relative">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-4 border-blue-900 shadow-lg">
                    {fotoUrl ? (
                      <img 
                        src={fotoUrl} 
                        alt={animal.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Erro ao carregar foto:', fotoUrl);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log('✅ Foto carregada com sucesso!')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <div className="text-center">
                          <PawPrint className="h-24 w-24 text-blue-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Sem foto</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Badge de Estado */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={`text-sm px-4 py-1.5 shadow-lg ${
                      animal.estado === 'Ativo' ? 'bg-green-600' :
                      animal.estado === 'Adotado' ? 'bg-blue-600' :
                      animal.estado === 'Óbito' ? 'bg-gray-600' :
                      'bg-yellow-600'
                    }`}>
                      {animal.estado}
                    </Badge>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="mt-6 bg-white p-4 rounded-lg border-2 border-blue-200 text-center">
                  <QrCode className="h-24 w-24 mx-auto text-blue-900 mb-2" />
                  <p className="text-xs text-gray-600">Código de Acesso Rápido</p>
                </div>
              </div>

              {/* Coluna Direita - Dados */}
              <div className="md:col-span-2 space-y-6">
                {/* Nome */}
                <div className="border-b-2 border-blue-200 pb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nome Completo</p>
                  <h3 className="text-3xl font-bold text-blue-900">{animal.nome}</h3>
                </div>

                {/* Dados Principais - Grid 2 colunas */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Espécie */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Espécie</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {animal.especie || 'N/A'}
                    </p>
                  </div>

                  {/* Raça */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Raça</p>
                    <p className="text-lg font-semibold text-gray-800">{animal.raca || 'N/A'}</p>
                  </div>

                  {/* Sexo */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sexo</p>
                    <p className="text-lg font-semibold text-gray-800">{animal.sexo || 'N/A'}</p>
                  </div>

                  {/* Cor */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cor/Pelagem</p>
                    <p className="text-lg font-semibold text-gray-800">{animal.cor || 'N/A'}</p>
                  </div>

                  {/* Data de Nascimento */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Data de Nascimento
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {animal.data_nascimento 
                        ? new Date(animal.data_nascimento).toLocaleDateString('pt-PT')
                        : 'N/A'
                      }
                    </p>
                  </div>

                  {/* Idade */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Idade</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {animal.data_nascimento 
                        ? `${calcularIdade(animal.data_nascimento)} anos`
                        : 'N/A'
                      }
                    </p>
                  </div>

                  {/* Porte */}
                  {animal.porte && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Porte</p>
                      <p className="text-lg font-semibold text-gray-800">{animal.porte}</p>
                    </div>
                  )}

                  {/* Chip/Transponder - SEMPRE MOSTRAR */}
                  <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Nº Chip / Transponder
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {animal.chip || animal.transponder || 'NÃO IDENTIFICADO'}
                    </p>
                  </div>
                </div>

                {/* Localização Atual */}
                {localizacaoAtual && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Localização Atual
                    </p>
                    <p className="text-xl font-bold text-green-800">
                      {localizacaoAtual.localizacao?.nome || 'N/A'}
                    </p>
                    {localizacaoAtual.observacoes && (
                      <p className="text-sm text-gray-600 mt-1">{localizacaoAtual.observacoes}</p>
                    )}
                  </div>
                )}

                {/* Data de Registo */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Data de Registo</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {animal.created_at 
                      ? new Date(animal.created_at).toLocaleDateString('pt-PT')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Observações */}
            {animal.observacoes && (
              <div className="mt-8 bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  Observações Médicas / Comportamentais
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{animal.observacoes}</p>
              </div>
            )}
          </div>

          {/* Rodapé Institucional */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white px-8 py-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Documento emitido pela Associação Valentão</span>
              </div>
              <div>
                <span>Emitido em: {new Date().toLocaleDateString('pt-PT')}</span>
              </div>
            </div>
          </div>
        </Card>
        )}

        {/* VERSO DO CARTÃO */}
        {mostrarVerso && (
        <Card className="overflow-hidden shadow-2xl border-4 border-blue-900 bg-gradient-to-br from-blue-50 to-white">
          {/* Cabeçalho Institucional */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full">
                  <PawPrint className="h-8 w-8 text-blue-900" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-wide">ASSOCIAÇÃO VALENTÃO</h2>
                  <p className="text-blue-200 text-sm">Bilhete de Identidade Animal - Verso</p>
                </div>
              </div>
            </div>
          </div>

          {/* Corpo do Verso */}
          <div className="p-8 space-y-6">
            {/* Informações Médicas e Históricas */}
            <div className="border-b-2 border-blue-200 pb-4">
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Informações Complementares</h3>
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Grupo */}
              {animal.grupos && (
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Grupo
                  </p>
                  <p className="text-lg font-semibold text-gray-800">{animal.grupos.nome}</p>
                  {animal.grupos.tipo && (
                    <p className="text-sm text-gray-600 mt-1">Tipo: {animal.grupos.tipo}</p>
                  )}
                </div>
              )}

              {/* Data de Registo */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Data de Registo no Sistema
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {animal.created_at 
                    ? new Date(animal.created_at).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>

              {/* Última Atualização */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Última Atualização
                </p>
                <p className="text-lg font-semibold text-gray-800">
                  {animal.updated_at 
                    ? new Date(animal.updated_at).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>

              {/* Estado Arquivado */}
              <div className={`p-4 rounded-lg border-2 ${
                animal.arquivado 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-green-50 border-green-300'
              }`}>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status no Sistema</p>
                <p className={`text-lg font-bold ${
                  animal.arquivado ? 'text-red-700' : 'text-green-700'
                }`}>
                  {animal.arquivado ? '📦 ARQUIVADO' : '✅ ATIVO NO SISTEMA'}
                </p>
              </div>
            </div>

            {/* Observações Médicas/Comportamentais */}
            {animal.observacoes && (
              <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Stethoscope className="h-4 w-4" />
                  Observações Médicas / Comportamentais
                </p>
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {animal.observacoes}
                </p>
              </div>
            )}

            {/* Localização Atual - Destaque */}
            {localizacaoAtual && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-400">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Localização Atual
                </p>
                <p className="text-2xl font-bold text-green-800 mb-2">
                  {localizacaoAtual.localizacao?.nome || 'N/A'}
                </p>
                {localizacaoAtual.localizacao?.descricao && (
                  <p className="text-sm text-gray-600 mb-2">
                    {localizacaoAtual.localizacao.descricao}
                  </p>
                )}
                {localizacaoAtual.observacoes && (
                  <p className="text-sm text-gray-700 mt-2 italic">
                    "{localizacaoAtual.observacoes}"
                  </p>
                )}
                {localizacaoAtual.data_inicio && (
                  <p className="text-xs text-gray-600 mt-2">
                    Desde: {new Date(localizacaoAtual.data_inicio).toLocaleDateString('pt-PT')}
                  </p>
                )}
              </div>
            )}

            {/* Informações Legais */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Informações Legais e de Identificação
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Este documento certifica que o animal identificado está registado na Associação Valentão</p>
                <p>• Número de identificação único: <strong>{animal.id.slice(0, 13).toUpperCase()}</strong></p>
                <p>• Chip/Transponder: <strong>{animal.chip || animal.transponder || 'NÃO IDENTIFICADO'}</strong></p>
                <p>• Este bilhete de identidade é válido para fins de identificação do animal</p>
              </div>
            </div>

            {/* Assinatura Digital */}
            <div className="text-center py-6 border-t-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Documento gerado eletronicamente</p>
              <p className="text-xs text-gray-500">
                Emitido em: {new Date().toLocaleDateString('pt-PT')} às {new Date().toLocaleTimeString('pt-PT')}
              </p>
            </div>
          </div>

          {/* Rodapé Institucional */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white px-8 py-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Associação Valentão - Proteção e Bem-Estar Animal</span>
              </div>
              <div>
                <span>Página 2/2</span>
              </div>
            </div>
          </div>
        </Card>
        )}

        {/* Nota de Impressão */}
        <div className="print:hidden mt-6 text-center text-sm text-gray-600">
          <p>💡 Dica: Use o botão "Imprimir" para gerar uma versão em PDF deste documento</p>
        </div>
      </div>
    </div>
  );
};

export default AnimalBI;