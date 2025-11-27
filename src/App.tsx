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
import NovoAnimal from "./pages/NovoAnimal";
import EditarAnimal from "./pages/EditarAnimal";
import IntervencoesPage from "./pages/IntervencoesPage";
import EventosPage from "./pages/EventosPage";
import GestaoVoluntarios from "./pages/GestaoVoluntarios";
import VoluntarioDetail from "./pages/VoluntarioDetail";
import GestaoFinanceira from "./pages/GestaoFinanceira";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import GestaoUtilizadores from "./pages/GestaoUtilizadores";
import AnimaisArquivados from "./pages/AnimaisArquivados";
import GestaoGrupos from "./pages/GestaoGrupos";
import GrupoDetail from "./pages/GrupoDetail";
import ManualUtilizador from "./pages/ManualUtilizador";
import Administracao from "./pages/Administracao";

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
            <Route path="/animais" element={<ProtectedRoute><AnimaisList /></ProtectedRoute>} />
            <Route path="/animal/:id" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
            <Route path="/animal/:id/editar" element={<ProtectedRoute><EditarAnimal /></ProtectedRoute>} />
            <Route path="/novo-animal" element={<ProtectedRoute><NovoAnimal /></ProtectedRoute>} />
            <Route path="/intervencoes" element={<ProtectedRoute><IntervencoesPage /></ProtectedRoute>} />
            <Route path="/eventos" element={<ProtectedRoute><EventosPage /></ProtectedRoute>} />
            <Route path="/voluntarios" element={<ProtectedRoute><GestaoVoluntarios /></ProtectedRoute>} />
            <Route path="/voluntario/:id" element={<ProtectedRoute><VoluntarioDetail /></ProtectedRoute>} />
            <Route path="/gestao-financeira" element={<ProtectedRoute><GestaoFinanceira /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
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