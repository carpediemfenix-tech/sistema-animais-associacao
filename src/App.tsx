import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnimaisList from "./pages/AnimaisList";
import AnimalDetail from "./pages/AnimalDetail";
import NovoAnimal from "./pages/NovoAnimal";
import Relatorios from "./pages/Relatorios";
import GestaoAnimais from "./pages/GestaoAnimais";
import AlertasPage from "./pages/AlertasPage";
import GestaoVoluntarios from "./pages/GestaoVoluntarios";
import GestaoFinanceira from "./pages/GestaoFinanceira";
import DashboardAvancado from "./pages/DashboardAvancado";
import RelatoriosAvancados from "./pages/RelatoriosAvancados";
import ConfiguracoesSistema from "./pages/ConfiguracoesSistema";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/animais" element={<AnimaisList />} />
          <Route path="/animal/:id" element={<AnimalDetail />} />
          <Route path="/novo-animal" element={<NovoAnimal />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/gestao-animais" element={<GestaoAnimais />} />
          <Route path="/alertas" element={<AlertasPage />} />
          <Route path="/voluntarios" element={<GestaoVoluntarios />} />
          <Route path="/financeiro" element={<GestaoFinanceira />} />
          <Route path="/dashboard" element={<DashboardAvancado />} />
          <Route path="/relatorios-avancados" element={<RelatoriosAvancados />} />
          <Route path="/configuracoes" element={<ConfiguracoesSistema />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
