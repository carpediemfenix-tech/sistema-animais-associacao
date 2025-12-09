import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AnimaisList from "./pages/AnimaisList";
import AnimalDetail from "./pages/AnimalDetail";
import AnimalIntervencoes from "./pages/AnimalIntervencoes";
import AnimalEventos from "./pages/AnimalEventos";
import AnimalLocalizacoes from "./pages/AnimalLocalizacoes";
import AnimalResponsabilidades from "./pages/AnimalResponsabilidades";
import AnimalFinanceiro from "./pages/AnimalFinanceiro";
import NovoAnimal from "./pages/NovoAnimal";
import EditarAnimal from "./pages/EditarAnimal";
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
import GestaoGrupos from "./pages/GestaoGrupos";
import GrupoDetail from "./pages/GrupoDetail";
import ManualUtilizador from "./pages/ManualUtilizador";
import Administracao from "./pages/Administracao";
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
import GestaoEspecies from "./pages/GestaoEspecies";
import GestaoLocalizacoes from "./pages/GestaoLocalizacoes";
import GestaoCategorias from "./pages/GestaoCategorias";
import GestaoClinicas from "./pages/GestaoClinicas";
import ModuloAnimais from "./pages/ModuloAnimais";
import ModuloEquipamentos from "./pages/ModuloEquipamentos";
import ModuloClinicas from "./pages/ModuloClinicas";
import ModuloMissoes from "./pages/ModuloMissoes";
import ModuloAgenda from "./pages/ModuloAgenda";
import EstatisticasAvancadas from "./pages/EstatisticasAvancadas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            {/* Rota pública de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/animais" element={<ProtectedRoute><AnimaisList /></ProtectedRoute>} />
            <Route path="/animal/:id" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
            <Route path="/animal/:id/intervencoes" element={<ProtectedRoute><AnimalIntervencoes /></ProtectedRoute>} />
            <Route path="/animal/:id/eventos" element={<ProtectedRoute><AnimalEventos /></ProtectedRoute>} />
            <Route path="/animal/:id/localizacoes" element={<ProtectedRoute><AnimalLocalizacoes /></ProtectedRoute>} />
            <Route path="/animal/:id/responsabilidades" element={<ProtectedRoute><AnimalResponsabilidades /></ProtectedRoute>} />
            <Route path="/animal/:id/financeiro" element={<ProtectedRoute><AnimalFinanceiro /></ProtectedRoute>} />
            <Route path="/animal/:id/editar" element={<ProtectedRoute><EditarAnimal /></ProtectedRoute>} />
            <Route path="/novo-animal" element={<ProtectedRoute><NovoAnimal /></ProtectedRoute>} />
            <Route path="/intervencoes" element={<ProtectedRoute><IntervencoesPage /></ProtectedRoute>} />
            <Route path="/eventos" element={<ProtectedRoute><EventosPage /></ProtectedRoute>} />
            {/* Rotas do Sistema de Voluntários Valentão */}
            <Route path="/voluntarios" element={<ProtectedRoute><VoluntariosDashboard /></ProtectedRoute>} />
            <Route path="/voluntarios/dashboard" element={<ProtectedRoute><VoluntariosDashboard /></ProtectedRoute>} />
            <Route path="/voluntarios/gestao" element={<ProtectedRoute><GestaoVoluntarios /></ProtectedRoute>} />
            <Route path="/voluntarios/novo" element={<ProtectedRoute><NovoVoluntario /></ProtectedRoute>} />
            <Route path="/voluntarios/editar/:id" element={<ProtectedRoute><EditarVoluntario /></ProtectedRoute>} />
            <Route path="/voluntarios/perfil/:id" element={<ProtectedRoute><VoluntarioProfile /></ProtectedRoute>} />
            <Route path="/voluntarios/:id/formacoes" element={<ProtectedRoute><FormacoesFrequentadas /></ProtectedRoute>} />
            <Route path="/sistema-formacao" element={<ProtectedRoute><SistemaFormacao /></ProtectedRoute>} />
            <Route path="/voluntarios/relatorios" element={<ProtectedRoute><RelatoriosVoluntarios /></ProtectedRoute>} />
            {/* Novos Módulos Dedicados */}
            <Route path="/modulo-animais" element={<ProtectedRoute><ModuloAnimais /></ProtectedRoute>} />
            <Route path="/modulo-voluntarios" element={<ProtectedRoute><ModuloVoluntarios /></ProtectedRoute>} />
            <Route path="/modulo-formacao" element={<ProtectedRoute><ModuloFormacao /></ProtectedRoute>} />
            <Route path="/modulo-equipamentos" element={<ProtectedRoute><ModuloEquipamentos /></ProtectedRoute>} />
            <Route path="/modulo-clinicas" element={<ProtectedRoute><ModuloClinicas /></ProtectedRoute>} />
            <Route path="/modulo-missoes" element={<ProtectedRoute><ModuloMissoes /></ProtectedRoute>} />
            <Route path="/modulo-agenda" element={<ProtectedRoute><ModuloAgenda /></ProtectedRoute>} />
            <Route path="/estatisticas-avancadas" element={<ProtectedRoute><EstatisticasAvancadas /></ProtectedRoute>} />
            <Route path="/voluntario/:id" element={<ProtectedRoute><VoluntarioDetail /></ProtectedRoute>} />
            <Route path="/gestao-financeira" element={<ProtectedRoute><GestaoFinanceira /></ProtectedRoute>} />
            <Route path="/financeiro" element={<ProtectedRoute><DashboardFinanceiro /></ProtectedRoute>} />
            <Route path="/financeiro/movimentos" element={<ProtectedRoute><GestaoMovimentos /></ProtectedRoute>} />
            <Route path="/financeiro/movimentos/novo" element={<ProtectedRoute><GestaoMovimentos /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="/configuracoes/especies" element={<ProtectedRoute><GestaoEspecies /></ProtectedRoute>} />
            <Route path="/configuracoes/grupos" element={<ProtectedRoute><GestaoGrupos /></ProtectedRoute>} />
            <Route path="/configuracoes/localizacoes" element={<ProtectedRoute><GestaoLocalizacoes /></ProtectedRoute>} />
            <Route path="/configuracoes/categorias" element={<ProtectedRoute><GestaoCategorias /></ProtectedRoute>} />
            <Route path="/configuracoes/clinicas" element={<ProtectedRoute><GestaoClinicas /></ProtectedRoute>} />
            <Route path="/utilizadores" element={<ProtectedRoute><GestaoUtilizadores /></ProtectedRoute>} />
            <Route path="/animais-arquivados" element={<ProtectedRoute><AnimaisArquivados /></ProtectedRoute>} />
            <Route path="/grupos" element={<ProtectedRoute><GestaoGrupos /></ProtectedRoute>} />
            <Route path="/grupo/:id" element={<ProtectedRoute><GrupoDetail /></ProtectedRoute>} />
            <Route path="/manual" element={<ProtectedRoute><ManualUtilizador /></ProtectedRoute>} />
            <Route path="/administracao" element={<ProtectedRoute><Administracao /></ProtectedRoute>} />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;