import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import DesktopDashboard from "./pages/DesktopDashboard";
import NotFound from "./pages/NotFound";
import AnimaisList from "./pages/AnimaisList";
import AnimalDetail from "./pages/AnimalDetail";
import NovoAnimal from "./pages/NovoAnimal";
import EditarAnimal from "./pages/EditarAnimal";
import IntervencoesPage from "./pages/IntervencoesPage";
import EventosPage from "./pages/EventosPage";
import GestaoVoluntarios from "./pages/GestaoVoluntarios";
import GestaoFinanceira from "./pages/GestaoFinanceira";
import DashboardAvancado from "./pages/DashboardAvancado";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import GestaoAnimaisDesktop from "./pages/GestaoAnimaisDesktop";
import RelatoriosDesktop from "./pages/RelatoriosDesktop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<DesktopDashboard />} />
          <Route path="/animais" element={<GestaoAnimaisDesktop />} />
          <Route path="/animal/:id" element={<AnimalDetail />} />
          <Route path="/animal/:id/editar" element={<EditarAnimal />} />
          <Route path="/novo-animal" element={<NovoAnimal />} />
          <Route path="/intervencoes" element={<IntervencoesPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/voluntarios" element={<GestaoVoluntarios />} />
          <Route path="/financeiro" element={<GestaoFinanceira />} />
          <Route path="/dashboard" element={<DashboardAvancado />} />
          <Route path="/relatorios" element={<RelatoriosDesktop />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;