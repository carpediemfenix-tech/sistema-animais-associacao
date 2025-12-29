// Utilitários para verificação de autenticidade do B.I. Animal

import { Animal } from "@/types/animal";

/**
 * Gera um hash de verificação único para o animal
 * Baseado em dados críticos que não podem ser alterados
 */
export function generateVerificationHash(animal: Animal): string {
  // Dados críticos para o hash
  const criticalData = [
    animal.id,
    animal.nome,
    animal.especie,
    animal.numero_processo,
    animal.data_registo || new Date().toISOString().split('T')[0],
    'VALENTAO_AO_RESGATE' // Salt da associação
  ].join('|');

  // Gerar hash simples mas eficaz
  let hash = 0;
  for (let i = 0; i < criticalData.length; i++) {
    const char = criticalData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Converter para string hexadecimal e garantir 8 caracteres
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Gera URL de verificação para o QR Code
 */
export function generateVerificationUrl(animal: Animal, baseUrl: string): string {
  const hash = generateVerificationHash(animal);
  const shortId = animal.id.slice(0, 8);
  // Usar hash routing para compatibilidade com hosting estático
  return `${baseUrl}/#/verificar/${shortId}/${hash}`;
}

/**
 * Verifica se o hash é válido para o animal
 */
export function verifyHash(animal: Animal, providedHash: string): boolean {
  const expectedHash = generateVerificationHash(animal);
  console.log('🔐 [HASH] Dados para verificação:', {
    animalId: animal.id,
    nome: animal.nome,
    especie: animal.especie,
    numero_processo: animal.numero_processo,
    expectedHash,
    providedHash: providedHash.toUpperCase(),
    match: expectedHash === providedHash.toUpperCase()
  });
  return expectedHash === providedHash.toUpperCase();
}

/**
 * Gera dados públicos para verificação (sem informações sensíveis)
 */
export function getPublicVerificationData(animal: Animal) {
  return {
    nome: animal.nome,
    especie: animal.especie,
    raca: animal.raca || 'N/A',
    numero_processo: animal.numero_processo,
    data_emissao: new Date().toLocaleDateString('pt-PT'),
    foto_url: animal.url_fotografia,
    associacao: 'Associação Valentão ao Resgate',
    documento: 'Bilhete de Identidade Animal',
    status: 'VÁLIDO'
  };
}