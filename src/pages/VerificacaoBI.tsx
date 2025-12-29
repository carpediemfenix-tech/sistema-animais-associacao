import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  PawPrint,
  Calendar,
  FileText,
  Heart,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Animal } from "@/types/animal";
import { verifyHash, getPublicVerificationData } from "@/lib/verification";
import { convertGoogleDriveUrl } from "@/lib/utils";

const VerificacaoBI: React.FC = () => {
  const { animalId, hash } = useParams<{ animalId: string; hash: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verificarAutenticidade = async () => {
      if (!animalId || !hash) {
        setError("Parâmetros de verificação inválidos");
        setLoading(false);
        return;
      }

      try {
        // Buscar animal pelo ID parcial
        const { data: animais, error: searchError } = await supabase
          .from('animais')
          .select('*')
          .ilike('id', `${animalId}%`)
          .limit(1);

        if (searchError) throw searchError;

        if (!animais || animais.length === 0) {
          setError("Animal não encontrado");
          setLoading(false);
          return;
        }

        const animalData = animais[0];
        setAnimal(animalData);

        // Verificar hash
        const hashValido = verifyHash(animalData, hash);
        setIsValid(hashValido);

        if (!hashValido) {
          setError("Hash de verificação inválido - Documento pode ser falsificado");
        }

      } catch (error: any) {
        console.error('Erro na verificação:', error);
        setError("Erro ao verificar documento");
      } finally {
        setLoading(false);
      }
    };

    verificarAutenticidade();
  }, [animalId, hash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticidade do documento...</p>
        </Card>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-red-50 to-pink-100 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">Documento Inválido</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Badge variant="destructive" className="text-sm">
            DOCUMENTO NÃO VERIFICADO
          </Badge>
        </Card>
      </div>
    );
  }

  const publicData = getPublicVerificationData(animal);
  const fotoUrl = animal.url_fotografia ? convertGoogleDriveUrl(animal.url_fotografia) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Cabeçalho de Verificação */}
        <Card className="mb-8 overflow-hidden">
          <div className={`p-6 text-white ${isValid ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
            <div className="flex items-center justify-center gap-4">
              {isValid ? (
                <CheckCircle className="h-12 w-12" />
              ) : (
                <XCircle className="h-12 w-12" />
              )}
              <div className="text-center">
                <h1 className="text-3xl font-bold">
                  {isValid ? 'DOCUMENTO AUTÊNTICO' : 'DOCUMENTO INVÁLIDO'}
                </h1>
                <p className="text-lg opacity-90">
                  Verificação de Bilhete de Identidade Animal
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Informações do Documento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Foto do Animal */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PawPrint className="h-5 w-5" />
                Fotografia
              </h3>
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
                {fotoUrl ? (
                  <img 
                    src={fotoUrl}
                    alt={`Foto de ${publicData.nome}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <PawPrint className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Sem fotografia</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Dados do Animal */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados de Identificação
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nome</p>
                  <p className="text-xl font-bold text-gray-800">{publicData.nome}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nº Processo</p>
                  <p className="text-lg font-semibold text-gray-800">{publicData.numero_processo}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Espécie</p>
                  <p className="text-lg font-semibold text-gray-800">{publicData.especie}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Raça</p>
                  <p className="text-lg font-semibold text-gray-800">{publicData.raca}</p>
                </div>
              </div>

              <div className="mt-6 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Data de Emissão
                </p>
                <p className="text-lg font-semibold text-gray-800">{publicData.data_emissao}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Informações da Associação */}
        <Card className="mt-8 p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="./images/BackgroundEraser_20250411_205630024.png" 
                alt="Logótipo Valentão" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h2 className="text-2xl font-bold text-blue-900">ASSOCIAÇÃO VALENTÃO AO RESGATE</h2>
                <p className="text-blue-600">Proteção e Bem-Estar Animal</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-gray-600">Documento emitido pela Associação Valentão ao Resgate</span>
            </div>

            <Badge 
              variant={isValid ? "default" : "destructive"} 
              className="text-sm px-4 py-2"
            >
              {isValid ? (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  DOCUMENTO VERIFICADO E AUTÊNTICO
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  DOCUMENTO NÃO VERIFICADO
                </>
              )}
            </Badge>
          </div>
        </Card>

        {/* Aviso de Segurança */}
        <Card className="mt-6 p-4 bg-gray-50">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Verificação de Autenticidade:</strong> Este documento foi verificado através do sistema oficial da Associação Valentão ao Resgate.
            </p>
            <p>
              Para mais informações, contacte a associação diretamente.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerificacaoBI;