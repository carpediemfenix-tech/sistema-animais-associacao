import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TabelaProfissionalProps {
  titulo: string;
  descricao?: string;
  colunas: string[];
  dados: any[];
  renderLinha: (item: any, index: number) => ReactNode[];
  mostrarTotal?: boolean;
  totalLabel?: string;
  className?: string;
}

const TabelaProfissional = ({ 
  titulo, 
  descricao, 
  colunas, 
  dados, 
  renderLinha, 
  mostrarTotal = false,
  totalLabel = "Total de registros",
  className = ""
}: TabelaProfissionalProps) => {
  
  return (
    <div className={`secao-relatorio ${className}`}>
      <div className="titulo-secao">{titulo}</div>
      
      {descricao && (
        <p className="text-sm text-gray-600 mb-4">{descricao}</p>
      )}
      
      <div className="overflow-x-auto">
        <table className="tabela-profissional">
          <thead>
            <tr>
              {colunas.map((coluna, index) => (
                <th key={index}>{coluna}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.length > 0 ? (
              dados.map((item, index) => (
                <tr key={index}>
                  {renderLinha(item, index).map((celula, cellIndex) => (
                    <td key={cellIndex}>{celula}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={colunas.length} className="text-center text-gray-500 py-8">
                  Nenhum registro encontrado para os critérios selecionados
                </td>
              </tr>
            )}
          </tbody>
          {mostrarTotal && dados.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold' }}>
                <td colSpan={colunas.length - 1} className="text-right">
                  {totalLabel}:
                </td>
                <td className="text-center">
                  {dados.length}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      
      {dados.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          {dados.length} registro{dados.length !== 1 ? 's' : ''} encontrado{dados.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default TabelaProfissional;