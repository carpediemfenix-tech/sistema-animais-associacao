import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AnimaisList from "./pages/AnimaisList";
import AnimalDetail from "./pages/AnimalDetail";
import AnimalDetailFuturistic from "./pages/AnimalDetailFuturistic";
import AnimalBI from "./pages/AnimalBI";
import AnimalIntervencoes from "./pages/AnimalIntervencoes";
import AnimalEventos from "./pages/AnimalEventos";
import AnimalLocalizacoes from "./pages/AnimalLocalizacoes";
import AnimalResponsabilidades from "./pages/AnimalResponsabilidades";
import AnimalFinanceiro from "./pages/AnimalFinanceiro";
import NovoAnimal from "./pages/NovoAnimal";
import EditarAnimal from "./pages/EditarAnimal";
import EditarAnimalFuturisticSimple from "./pages/EditarAnimalFuturisticSimple";
import EditarAnimalCompleto from "./pages/EditarAnimalCompleto";
import IntervencoesPage from "./pages/IntervencoesPage";
import EventosPage from "./pages/EventosPage";
import GestaoVoluntarios from "./pages/GestaoVoluntarios";
import VoluntarioDetail from "./pages/VoluntarioDetail";
import GestaoFinanceira from "./pages/GestaoFinanceira";
import DashboardFinanceiro from "./pages/DashboardFinanceiro";
import GestaoMovimentos from "./pages/GestaoMovimentos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import GestaoUtilizadores from "./pages/GestaoUtilizadores";
import AnimaisArquivados from "./pages/AnimaisArquivados";
import AnimaisAdotados from "./pages/AnimaisAdotados";
import GestaoGrupos from "./pages/GestaoGrupos";
import GrupoDetail from "./pages/GrupoDetail";
import ManualUtilizador from "./pages/ManualUtilizador";
import Dashboard from "./pages/Dashboard";
import VoluntariosDashboard from "./pages/VoluntariosDashboard";
import VoluntarioProfile from "./pages/VoluntarioProfile";
import NovoVoluntario from "./pages/NovoVoluntario";
import EditarVoluntario from "./pages/EditarVoluntario";
import SistemaFormacao from "@/pages/SistemaFormacao";
import FormacoesFrequentadas from "@/pages/FormacoesFrequentadas";
import RelatoriosVoluntarios from "./pages/RelatoriosVoluntarios";
import ModuloVoluntarios from "@/pages/ModuloVoluntarios";
import ModuloFormacao from "@/pages/ModuloFormacao";
import GestaoVoluntariosUnificada from "./pages/GestaoVoluntariosUnificada";
import ModuloAnimais from "./pages/ModuloAnimais";
import ModuloAdministrador from "./pages/ModuloAdministrador";
import GestaoEspecies from "./pages/GestaoEspecies";
import GestaoLocalizacoes from "./pages/GestaoLocalizacoes";
import GestaoCategorias from "./pages/GestaoCategorias";
import GestaoClinicas from "./pages/GestaoClinicas";
import GestaoResponsabilidades from "./pages/GestaoResponsabilidades";
import HistoricoNomesAnimais from "./pages/HistoricoNomesAnimais";
import IntervencoesAutoridades from "./pages/IntervencoesAutoridades";
import ModuloMissoesOtimizado from "./pages/ModuloMissoesOtimizado";
import MissaoDetailOtimizada from "./pages/MissaoDetailOtimizada";
import MissaoParticipacoes from "./pages/MissaoParticipacoes";
import MissaoAnimais from "./pages/MissaoAnimais";
import MissaoFinanceiro from "./pages/MissaoFinanceiro";
import MissaoEquipamentos from "./pages/MissaoEquipamentos";
import DashboardPontos from "./pages/DashboardPontos";
import MissoesArquivadas from "./pages/MissoesArquivadas";
import EditarMissao from "./pages/EditarMissao";
import ConfiguracaoEspecialidades from "./pages/ConfiguracaoEspecialidades";
import AgendaFuturistica from "./pages/AgendaFuturistica";
import ModuloEquipamentos from "./pages/ModuloEquipamentos";
import ModuloClinicas from "./pages/ModuloClinicas";
import EstatisticasAvancadas from "./pages/EstatisticasAvancadas";
import EstatisticasAvancadasFuturistic from "./pages/EstatisticasAvancadasFuturistic";
import VerificacaoBI from "./pages/VerificacaoBI";
import AnimalEstados from "./pages/AnimalEstados";
import GestaoEstados from "./pages/GestaoEstados";
// Páginas de Equipamentos
import EquipamentosNavigation from "./pages/equipamentos/EquipamentosNavigation";
import EquipamentosDashboard from "./pages/equipamentos/EquipamentosDashboard";
import EquipamentosInventario from "./pages/equipamentos/EquipamentosInventario";
import EquipamentosAtribuicoes from "./pages/equipamentos/EquipamentosAtribuicoes";
import EquipamentosManutencoes from "./pages/equipamentos/EquipamentosManutencoes";
import EquipamentosAlertas from "./pages/equipamentos/EquipamentosAlertas";
import EquipamentosRelatorios from "./pages/equipamentos/EquipamentosRelatorios";
import DashboardExecutivo from "./pages/DashboardExecutivo";

// Módulo Financeiro - Componentes adicionais
import NovoMovimento from "./pages/NovoMovimento";
import GestaoContas from "./pages/GestaoContas";
import ConfiguracoesFinanceiras from "./pages/ConfiguracoesFinanceiras";
import RelatoriosFinanceiros from "./pages/RelatoriosFinanceiros";
import GestaoSocios from "./pages/GestaoSocios";
import ConfiguracaoIntervencoes from "./pages/ConfiguracaoIntervencoes";
import GruposArquivados from "./pages/GruposArquivados";
import LogsAcesso from "./pages/LogsAcesso";
import GestaoPontuacao from "./pages/GestaoPontuacao";

// Módulo de Aprovisionamento - Fase 1 e 2
import AprovisionamentoDashboard from "./pages/aprovisionamento/AprovisionamentoDashboard";
import CategoriasAprovisionamento from "./pages/aprovisionamento/CategoriasAprovisionamento";
import TiposAprovisionamento from "./pages/aprovisionamento/TiposAprovisionamento";
import ItensAprovisionamento from "./pages/aprovisionamento/ItensAprovisionamento";
import AtribuicoesAprovisionamento from "./pages/aprovisionamento/AtribuicoesAprovisionamentoOptimized";
import NovaAtribuicao from "./pages/aprovisionamento/NovaAtribuicao";
import ProcessarDevolucao from "./pages/aprovisionamento/ProcessarDevolucao";
import EditarAtribuicao from "./pages/aprovisionamento/EditarAtribuicao";
import ConfiguracoesAtribuicoes from "./pages/aprovisionamento/ConfiguracoesAtribuicoes";
import TestAprovisionamento from "./pages/aprovisionamento/TestAprovisionamento";

// Módulo de Denúncias - Fase 2
import WizardDenuncia from "./pages/WizardDenuncia";
import DenunciaDetail from "./pages/DenunciaDetail";
import ModuloDenuncias from "./pages/ModuloDenuncias";
import EditarDenuncia from "./pages/EditarDenuncia";
import ConcluirDenuncia from "./pages/ConcluirDenuncia";
import ConfiguracoesNotificacoes from "./pages/ConfiguracoesNotificacoes";
import AdministracaoAvancada from "./pages/AdministracaoAvancada";

const queryClient = new QueryClient();

// Componente de redirecionamento para voluntários perfil
const RedirectVoluntarioPerfil = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/voluntarios" replace />;
  }
  
  return <Navigate to={`/voluntario/${id}`} replace />;
};

// Componente de redirecionamento para voluntários editar
const RedirectVoluntarioEditar = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/voluntarios" replace />;
  }
  
  return <Navigate to={`/editar-voluntario/${id}`} replace />;
};

// Componente de redirecionamento para animais editar
const RedirectAnimalEditar = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/animais" replace />;
  }
  
  return <Navigate to={`/editar-animal/${id}`} replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AuthProvider>
            <NotificationsProvider>
            <Routes>
              {/* Rota pública de login */}
              <Route path="/login" element={<Login />} />
              
              {/* Rota pública de verificação de BI */}
              <Route path="/verificar/:shortId/:hash" element={<VerificacaoBI />} />
              
              {/* Rotas protegidas */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard-executivo" element={<ProtectedRoute><DashboardExecutivo /></ProtectedRoute>} />
              
              {/* Módulo de Animais */}
              <Route path="/modulo-animais" element={<ProtectedRoute><ModuloAnimais /></ProtectedRoute>} />
              <Route path="/animais" element={<ProtectedRoute><AnimaisList /></ProtectedRoute>} />
              <Route path="/animal/:id" element={<ProtectedRoute><AnimalDetailFuturistic /></ProtectedRoute>} />
              <Route path="/animal/:id/classic" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
              <Route path="/animal/:id/bi" element={<ProtectedRoute><AnimalBI /></ProtectedRoute>} />
              <Route path="/animal/:id/intervencoes" element={<ProtectedRoute><AnimalIntervencoes /></ProtectedRoute>} />
              <Route path="/animal/:id/eventos" element={<ProtectedRoute><AnimalEventos /></ProtectedRoute>} />
              <Route path="/animal/:id/localizacoes" element={<ProtectedRoute><AnimalLocalizacoes /></ProtectedRoute>} />
              <Route path="/animal/:id/responsabilidades" element={<ProtectedRoute><AnimalResponsabilidades /></ProtectedRoute>} />
              <Route path="/animal/:id/financeiro" element={<ProtectedRoute><AnimalFinanceiro /></ProtectedRoute>} />
              <Route path="/animal/:id/estados" element={<ProtectedRoute><AnimalEstados /></ProtectedRoute>} />
              <Route path="/animal/:id/intervencoes-autoridades" element={<ProtectedRoute><IntervencoesAutoridades /></ProtectedRoute>} />
              <Route path="/animal/:id/historico-nomes" element={<ProtectedRoute><HistoricoNomesAnimais /></ProtectedRoute>} />
              <Route path="/novo-animal" element={<ProtectedRoute><NovoAnimal /></ProtectedRoute>} />
              <Route path="/editar-animal/:id" element={<ProtectedRoute><EditarAnimalFuturisticSimple /></ProtectedRoute>} />
              <Route path="/editar-animal/:id/classic" element={<ProtectedRoute><EditarAnimal /></ProtectedRoute>} />
              <Route path="/editar-animal-completo/:id" element={<ProtectedRoute><EditarAnimalCompleto /></ProtectedRoute>} />
              <Route path="/animais-arquivados" element={<ProtectedRoute><AnimaisArquivados /></ProtectedRoute>} />
              <Route path="/animais-adotados" element={<ProtectedRoute><AnimaisAdotados /></ProtectedRoute>} />
              
              {/* Módulo de Voluntários */}
              <Route path="/modulo-voluntarios" element={<ProtectedRoute><ModuloVoluntarios /></ProtectedRoute>} />
              <Route path="/voluntarios" element={<ProtectedRoute><GestaoVoluntarios /></ProtectedRoute>} />
              {/* Redirecionamentos para rotas antigas de voluntários */}
              <Route path="/voluntarios/gestao" element={<Navigate to="/gestao-voluntarios-unificada" replace />} />
              <Route path="/voluntarios/relatorios" element={<Navigate to="/relatorios-voluntarios" replace />} />
              <Route path="/voluntarios/editar/:id" element={<RedirectVoluntarioEditar />} />
              <Route path="/voluntarios/perfil/:id" element={<RedirectVoluntarioPerfil />} />
              <Route path="/voluntarios/novo" element={<Navigate to="/novo-voluntario" replace />} />
              {/* Redirecionamentos para rotas antigas de animais */}
              <Route path="/animal/:id/editar" element={<RedirectAnimalEditar />} />
              <Route path="/animais/novo" element={<Navigate to="/novo-animal" replace />} />
              <Route path="/voluntarios-dashboard" element={<ProtectedRoute><VoluntariosDashboard /></ProtectedRoute>} />
              <Route path="/voluntario/:id" element={<ProtectedRoute><VoluntarioDetail /></ProtectedRoute>} />
              <Route path="/voluntario/:id/profile" element={<ProtectedRoute><VoluntarioProfile /></ProtectedRoute>} />
              <Route path="/novo-voluntario" element={<ProtectedRoute><NovoVoluntario /></ProtectedRoute>} />
              <Route path="/editar-voluntario/:id" element={<ProtectedRoute><EditarVoluntario /></ProtectedRoute>} />
              <Route path="/gestao-voluntarios-unificada" element={<ProtectedRoute><GestaoVoluntariosUnificada /></ProtectedRoute>} />
              <Route path="/relatorios-voluntarios" element={<ProtectedRoute><RelatoriosVoluntarios /></ProtectedRoute>} />
              <Route path="/dashboard-pontos" element={<ProtectedRoute><DashboardPontos /></ProtectedRoute>} />
              
              {/* Módulo de Formação */}
              <Route path="/modulo-formacao" element={<ProtectedRoute><ModuloFormacao /></ProtectedRoute>} />
              <Route path="/sistema-formacao" element={<ProtectedRoute><SistemaFormacao /></ProtectedRoute>} />
              <Route path="/formacoes-frequentadas" element={<ProtectedRoute><FormacoesFrequentadas /></ProtectedRoute>} />
              
              {/* Módulo de Missões */}
              <Route path="/modulo-missoes" element={<ProtectedRoute><ModuloMissoesOtimizado /></ProtectedRoute>} />
              <Route path="/missao/:id" element={<ProtectedRoute><MissaoDetailOtimizada /></ProtectedRoute>} />
              <Route path="/missao/:id/editar" element={<ProtectedRoute><EditarMissao /></ProtectedRoute>} />
              <Route path="/missao/:id/participacoes" element={<ProtectedRoute><MissaoParticipacoes /></ProtectedRoute>} />
              <Route path="/missao/:id/animais" element={<ProtectedRoute><MissaoAnimais /></ProtectedRoute>} />
              <Route path="/missao/:id/financeiro" element={<ProtectedRoute><MissaoFinanceiro /></ProtectedRoute>} />
              <Route path="/missao/:id/equipamentos" element={<ProtectedRoute><MissaoEquipamentos /></ProtectedRoute>} />
              <Route path="/editar-missao/:id" element={<ProtectedRoute><EditarMissao /></ProtectedRoute>} />
              <Route path="/missoes-arquivadas" element={<ProtectedRoute><MissoesArquivadas /></ProtectedRoute>} />
              
              {/* Módulo de Denúncias - Fase 2 */}
              <Route path="/modulo-denuncias" element={<ProtectedRoute><ModuloDenuncias /></ProtectedRoute>} />
              <Route path="/wizard-denuncia" element={<ProtectedRoute><WizardDenuncia /></ProtectedRoute>} />
              <Route path="/denuncia/:codigo" element={<ProtectedRoute><DenunciaDetail /></ProtectedRoute>} />
              <Route path="/denuncia/:codigo/editar" element={<ProtectedRoute><EditarDenuncia /></ProtectedRoute>} />
              <Route path="/denuncia/:codigo/concluir" element={<ProtectedRoute><ConcluirDenuncia /></ProtectedRoute>} />
              
              {/* Módulo Financeiro */}
              <Route path="/dashboard-financeiro" element={<ProtectedRoute><DashboardFinanceiro /></ProtectedRoute>} />
              <Route path="/gestao-financeira" element={<ProtectedRoute><GestaoFinanceira /></ProtectedRoute>} />
              <Route path="/gestao-movimentos" element={<ProtectedRoute><GestaoMovimentos /></ProtectedRoute>} />
              <Route path="/novo-movimento" element={<ProtectedRoute><NovoMovimento /></ProtectedRoute>} />
              <Route path="/gestao-contas" element={<ProtectedRoute><GestaoContas /></ProtectedRoute>} />
              <Route path="/configuracoes-financeiras" element={<ProtectedRoute><ConfiguracoesFinanceiras /></ProtectedRoute>} />
              <Route path="/relatorios-financeiros" element={<ProtectedRoute><RelatoriosFinanceiros /></ProtectedRoute>} />
              <Route path="/gestao-socios" element={<ProtectedRoute><GestaoSocios /></ProtectedRoute>} />
              
              {/* Módulo de Equipamentos */}
              <Route path="/modulo-equipamentos" element={<ProtectedRoute><ModuloEquipamentos /></ProtectedRoute>} />
              <Route path="/equipamentos" element={<ProtectedRoute><EquipamentosNavigation /></ProtectedRoute>} />
              <Route path="/equipamentos/dashboard" element={<ProtectedRoute><EquipamentosDashboard /></ProtectedRoute>} />
              <Route path="/equipamentos/inventario" element={<ProtectedRoute><EquipamentosInventario /></ProtectedRoute>} />
              <Route path="/equipamentos/atribuicoes" element={<ProtectedRoute><EquipamentosAtribuicoes /></ProtectedRoute>} />
              <Route path="/equipamentos/manutencoes" element={<ProtectedRoute><EquipamentosManutencoes /></ProtectedRoute>} />
              <Route path="/equipamentos/alertas" element={<ProtectedRoute><EquipamentosAlertas /></ProtectedRoute>} />
              <Route path="/equipamentos/relatorios" element={<ProtectedRoute><EquipamentosRelatorios /></ProtectedRoute>} />
              
              {/* Módulo de Aprovisionamento - Fase 1 e 2 */}
              <Route path="/aprovisionamento" element={<ProtectedRoute><AprovisionamentoDashboard /></ProtectedRoute>} />
              <Route path="/aprovisionamento/categorias" element={<ProtectedRoute><CategoriasAprovisionamento /></ProtectedRoute>} />
              <Route path="/aprovisionamento/tipos" element={<ProtectedRoute><TiposAprovisionamento /></ProtectedRoute>} />
              <Route path="/aprovisionamento/itens" element={<ProtectedRoute><ItensAprovisionamento /></ProtectedRoute>} />
              <Route path="/aprovisionamento/atribuicoes" element={<ProtectedRoute><AtribuicoesAprovisionamento /></ProtectedRoute>} />
              <Route path="/aprovisionamento/nova-atribuicao" element={<ProtectedRoute><NovaAtribuicao /></ProtectedRoute>} />
              <Route path="/aprovisionamento/editar-atribuicao/:id" element={<ProtectedRoute><EditarAtribuicao /></ProtectedRoute>} />
              <Route path="/aprovisionamento/configuracoes" element={<ProtectedRoute><ConfiguracoesAtribuicoes /></ProtectedRoute>} />
              <Route path="/aprovisionamento/devolucao/:id" element={<ProtectedRoute><ProcessarDevolucao /></ProtectedRoute>} />
              <Route path="/aprovisionamento/teste" element={<ProtectedRoute><TestAprovisionamento /></ProtectedRoute>} />
              
              {/* Sistema de Pontuação */}
              <Route path="/gestao-pontuacao" element={<ProtectedRoute><GestaoPontuacao /></ProtectedRoute>} />
              
              {/* Módulo de Clínicas */}
              <Route path="/modulo-clinicas" element={<ProtectedRoute><ModuloClinicas /></ProtectedRoute>} />
              
              {/* Módulo de Agenda */}
              <Route path="/modulo-agenda" element={<ProtectedRoute><AgendaFuturistica /></ProtectedRoute>} />
              
              {/* Módulo Administrador */}
              <Route path="/modulo-administrador" element={<ProtectedRoute><ModuloAdministrador /></ProtectedRoute>} />
              <Route path="/administracao-avancada" element={<ProtectedRoute><AdministracaoAvancada /></ProtectedRoute>} />
              <Route path="/gestao-utilizadores" element={<ProtectedRoute><GestaoUtilizadores /></ProtectedRoute>} />
              {/* Redirecionamento para rota antiga de utilizadores */}
              <Route path="/utilizadores" element={<Navigate to="/gestao-utilizadores" replace />} />
              <Route path="/gestao-grupos" element={<ProtectedRoute><GestaoGrupos /></ProtectedRoute>} />
              <Route path="/grupos" element={<Navigate to="/gestao-grupos" replace />} />
              <Route path="/grupo/:id" element={<ProtectedRoute><GrupoDetail /></ProtectedRoute>} />
              <Route path="/grupos-arquivados" element={<ProtectedRoute><GruposArquivados /></ProtectedRoute>} />
              <Route path="/logs-acesso" element={<ProtectedRoute><LogsAcesso /></ProtectedRoute>} />
              <Route path="/gestao-estados" element={<ProtectedRoute><GestaoEstados /></ProtectedRoute>} />
              
              {/* Configurações */}
              <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
              <Route path="/configuracoes/especies" element={<ProtectedRoute><GestaoEspecies /></ProtectedRoute>} />
              <Route path="/configuracoes/localizacoes" element={<ProtectedRoute><GestaoLocalizacoes /></ProtectedRoute>} />
              <Route path="/configuracoes/categorias" element={<ProtectedRoute><GestaoCategorias /></ProtectedRoute>} />
              <Route path="/configuracoes/clinicas" element={<ProtectedRoute><GestaoClinicas /></ProtectedRoute>} />
              <Route path="/configuracoes/responsabilidades" element={<ProtectedRoute><GestaoResponsabilidades /></ProtectedRoute>} />
              <Route path="/configuracao-especialidades" element={<ProtectedRoute><ConfiguracaoEspecialidades /></ProtectedRoute>} />
              <Route path="/configuracoes/intervencoes" element={<ProtectedRoute><ConfiguracaoIntervencoes /></ProtectedRoute>} />
              <Route path="/configuracoes-notificacoes" element={<ProtectedRoute><ConfiguracoesNotificacoes /></ProtectedRoute>} />
              
              {/* Intervenções e Eventos */}
              <Route path="/intervencoes" element={<ProtectedRoute><IntervencoesPage /></ProtectedRoute>} />
              <Route path="/eventos" element={<ProtectedRoute><EventosPage /></ProtectedRoute>} />
              <Route path="/intervencoes-autoridades" element={<ProtectedRoute><IntervencoesAutoridades /></ProtectedRoute>} />
              <Route path="/historico-nomes" element={<ProtectedRoute><HistoricoNomesAnimais /></ProtectedRoute>} />
              
              {/* Relatórios e Estatísticas */}
              <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
              <Route path="/estatisticas-avancadas" element={<ProtectedRoute><EstatisticasAvancadasFuturistic /></ProtectedRoute>} />
              <Route path="/estatisticas-avancadas/classic" element={<ProtectedRoute><EstatisticasAvancadas /></ProtectedRoute>} />
              
              {/* Manual */}
              <Route path="/manual" element={<ProtectedRoute><ManualUtilizador /></ProtectedRoute>} />
              
              {/* Administração Avançada */}
              <Route path="/administracao-avancada" element={<ProtectedRoute><AdministracaoAvancada /></ProtectedRoute>} />
              
              {/* Rota 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </NotificationsProvider>
          </AuthProvider>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;