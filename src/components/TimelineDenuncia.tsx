import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  Clock, 
  User, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Archive, 
  RotateCcw,
  Plus,
  Send,
  Calendar,
  Activity
} from 'lucide-react';

interface TimelineEntry {
  id: string;
  tipo_acao: string;
  descricao: string;
  acao_anterior: string | null;
  acao_nova: string | null;
  usuario_nome: string | null;
  dados_extras: any;
  created_at: string;
}

interface TimelineDenunciaProps {
  denunciaId: string;
  denunciaCodigo: string;
}

const TimelineDenuncia: React.FC<TimelineDenunciaProps> = ({ denunciaId, denunciaCodigo }) => {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoComentario, setNovoComentario] = useState('');
  const [adicionandoComentario, setAdicionandoComentario] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, [denunciaId]);

  const loadTimeline = async () => {
    try {
      console.log('📅 [TIMELINE] Carregando timeline para denúncia:', denunciaId);
      
      const { data, error } = await supabase
        .from('timeline_denuncias_2025_12_31_23_00')
        .select('*')
        .eq('denuncia_id', denunciaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [TIMELINE] Erro ao carregar:', error);
        throw error;
      }

      console.log('✅ [TIMELINE] Timeline carregada:', data?.length || 0, 'entradas');
      setTimeline(data || []);
    } catch (error) {
      console.error('❌ [TIMELINE] Erro:', error);
      toast({
        title: "Erro ao carregar timeline",
        description: "Não foi possível carregar o histórico da denúncia.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarComentario = async () => {
    if (!novoComentario.trim()) {
      toast({
        title: "Comentário vazio",
        description: "Por favor, digite um comentário.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAdicionandoComentario(true);
      console.log('💬 [TIMELINE] Adicionando comentário...');

      const { error } = await supabase.rpc('criar_timeline_denuncia', {
        p_denuncia_id: denunciaId,
        p_tipo_acao: 'comentario',
        p_descricao: `Comentário adicionado: ${novoComentario}`,
        p_usuario_nome: 'Administrador',
        p_dados_extras: { comentario: novoComentario }
      });

      if (error) {
        console.error('❌ [TIMELINE] Erro ao adicionar comentário:', error);
        throw error;
      }

      console.log('✅ [TIMELINE] Comentário adicionado com sucesso');
      setNovoComentario('');
      await loadTimeline(); // Recarregar timeline
      
      toast({
        title: "Comentário adicionado",
        description: "O comentário foi adicionado ao histórico da denúncia.",
      });
    } catch (error) {
      console.error('❌ [TIMELINE] Erro:', error);
      toast({
        title: "Erro ao adicionar comentário",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    } finally {
      setAdicionandoComentario(false);
    }
  };

  const getIconeAcao = (tipoAcao: string) => {
    const icones = {
      'criacao': { icon: Plus, color: 'text-green-600', bg: 'bg-green-100' },
      'mudanca_status': { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
      'mudanca_prioridade': { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
      'edicao': { icon: Edit, color: 'text-purple-600', bg: 'bg-purple-100' },
      'conclusao': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      'arquivamento': { icon: Archive, color: 'text-gray-600', bg: 'bg-gray-100' },
      'restauracao': { icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-100' },
      'comentario': { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100' }
    };

    return icones[tipoAcao as keyof typeof icones] || icones.edicao;
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    return {
      data: date.toLocaleDateString('pt-PT'),
      hora: date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTituloAcao = (entry: TimelineEntry) => {
    const titulos = {
      'criacao': 'Denúncia Criada',
      'mudanca_status': 'Status Alterado',
      'mudanca_prioridade': 'Prioridade Alterada',
      'edicao': 'Denúncia Editada',
      'conclusao': 'Denúncia Concluída',
      'arquivamento': 'Denúncia Arquivada',
      'restauracao': 'Denúncia Restaurada',
      'comentario': 'Comentário Adicionado'
    };

    return titulos[entry.tipo_acao as keyof typeof titulos] || 'Ação Realizada';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline da Denúncia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline da Denúncia {denunciaCodigo}
        </CardTitle>
        <CardDescription>
          Histórico completo de ações e mudanças na denúncia
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Adicionar Comentário */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Adicionar Comentário
          </h4>
          <div className="flex gap-2">
            <Textarea
              placeholder="Digite um comentário sobre esta denúncia..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={adicionarComentario}
              disabled={adicionandoComentario || !novoComentario.trim()}
              className="self-end"
            >
              {adicionandoComentario ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Timeline */}
        {timeline.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum histórico disponível ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((entry, index) => {
              const { data, hora } = formatarData(entry.created_at);
              const { icon: Icon, color, bg } = getIconeAcao(entry.tipo_acao);
              const titulo = getTituloAcao(entry);

              return (
                <div key={entry.id} className="flex gap-4">
                  {/* Linha vertical */}
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${bg}`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-px h-12 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{titulo}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {data} às {hora}
                          {entry.usuario_nome && (
                            <>
                              <span>•</span>
                              <User className="h-3 w-3" />
                              {entry.usuario_nome}
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Badges de mudança */}
                      {entry.acao_anterior && entry.acao_nova && (
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            {entry.acao_anterior}
                          </Badge>
                          <span>→</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {entry.acao_nova}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed">
                      {entry.descricao}
                    </p>

                    {/* Dados extras */}
                    {entry.dados_extras && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        {entry.tipo_acao === 'comentario' && entry.dados_extras.comentario && (
                          <div className="italic">
                            "{entry.dados_extras.comentario}"
                          </div>
                        )}
                        {entry.dados_extras.origem && (
                          <div>
                            Origem: {entry.dados_extras.origem}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineDenuncia;