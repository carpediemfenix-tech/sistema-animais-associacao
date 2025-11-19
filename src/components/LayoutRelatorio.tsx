import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Printer,
  Download
} from "lucide-react";

interface LayoutRelatorioProps {
  titulo: string;
  subtitulo?: string;
  tipoRelatorio: string;
  periodo?: string;
  children: ReactNode;
  dadosEstatisticos?: {
    totalRegistros?: number;
    periodoAnalise?: string;
    dataGeracao?: string;
  };
}

const LayoutRelatorio = ({ 
  titulo, 
  subtitulo, 
  tipoRelatorio, 
  periodo, 
  children, 
  dadosEstatisticos 
}: LayoutRelatorioProps) => {
  
  const formatarDataHora = () => {
    return new Date().toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  const exportarPDF = () => {
    // Funcionalidade futura - preparar para implementação
    console.log('📄 Exportar PDF - Funcionalidade em desenvolvimento');
  };

  return (
    <div className="relatorio-container">
      {/* Estilos CSS para impressão profissional */}
      <style jsx>{`
        @media print {
          .relatorio-container {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #000;
            background: white;
          }
          
          .cabecalho-relatorio {
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .logo-area {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .titulo-principal {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .subtitulo-relatorio {
            font-size: 14pt;
            text-align: center;
            margin-bottom: 10px;
            color: #666;
          }
          
          .info-relatorio {
            display: flex;
            justify-content: space-between;
            font-size: 10pt;
            margin-top: 15px;
          }
          
          .conteudo-relatorio {
            margin: 20px 0;
          }
          
          .rodape-relatorio {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            border-top: 1px solid #333;
            padding-top: 10px;
            font-size: 9pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .tabela-profissional {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          
          .tabela-profissional th,
          .tabela-profissional td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          
          .tabela-profissional th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .tabela-profissional tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .secao-relatorio {
            margin: 25px 0;
            page-break-inside: avoid;
          }
          
          .titulo-secao {
            font-size: 14pt;
            font-weight: bold;
            margin: 20px 0 10px 0;
            border-bottom: 1px solid #666;
            padding-bottom: 5px;
          }
          
          .no-print {
            display: none !important;
          }
          
          .quebra-pagina {
            page-break-before: always;
          }
        }
        
        @media screen {
          .relatorio-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 297mm;
          }
        }
      `}</style>

      {/* Cabeçalho Profissional */}
      <div className="cabecalho-relatorio">
        <div className="logo-area">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">ASSOCIAÇÃO VALENTÃO</h1>
              <p className="text-sm text-gray-600">Sistema de Gestão de Animais</p>
            </div>
          </div>
        </div>
        
        <div className="titulo-principal">{titulo}</div>
        
        {subtitulo && (
          <div className="subtitulo-relatorio">{subtitulo}</div>
        )}
        
        <div className="info-relatorio grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span><strong>Tipo:</strong> {tipoRelatorio}</span>
          </div>
          
          {periodo && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span><strong>Período:</strong> {periodo}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span><strong>Gerado em:</strong> {formatarDataHora()}</span>
          </div>
        </div>

        {/* Dados Estatísticos do Relatório */}
        {dadosEstatisticos && (
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {dadosEstatisticos.totalRegistros !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dadosEstatisticos.totalRegistros}</div>
                  <div className="text-gray-600">Total de Registros</div>
                </div>
              )}
              
              {dadosEstatisticos.periodoAnalise && (
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{dadosEstatisticos.periodoAnalise}</div>
                  <div className="text-gray-600">Período de Análise</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">Oficial</div>
                <div className="text-gray-600">Status do Relatório</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação (apenas na tela) */}
      <div className="no-print flex justify-end space-x-2 mb-6">
        <Button onClick={imprimirRelatorio} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={exportarPDF} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Conteúdo do Relatório */}
      <div className="conteudo-relatorio">
        {children}
      </div>

      {/* Rodapé Profissional */}
      <div className="rodape-relatorio">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Building2 className="h-3 w-3" />
            <span>Associação Valentão</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>Portugal</span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone className="h-3 w-3" />
            <span>+351 XXX XXX XXX</span>
          </div>
          <div className="flex items-center space-x-1">
            <Mail className="h-3 w-3" />
            <span>info@valentao.pt</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-600">
          <span>Página 1 • Gerado em {formatarDataHora()}</span>
        </div>
      </div>
    </div>
  );
};

export default LayoutRelatorio;