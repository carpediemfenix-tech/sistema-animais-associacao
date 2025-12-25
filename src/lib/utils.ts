import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte URL do Google Drive para formato de imagem direta
 * @param url - URL original do Google Drive ou qualquer outro URL de imagem
 * @param size - Tamanho da imagem em pixels (padrão: 1000). Use 200 para thumbnails, 1000 para imagens grandes
 * @returns URL convertido para exibição direta de imagem
 * 
 * Suporta múltiplos formatos:
 * - https://drive.google.com/file/d/ID/view?usp=drive_link
 * - https://drive.google.com/file/d/ID/view
 * - https://drive.google.com/open?id=ID
 * 
 * Converte para:
 * - https://drive.google.com/thumbnail?id=ID&sz=w200 (thumbnails leves para listas)
 * - https://drive.google.com/thumbnail?id=ID&sz=w1000 (imagens grandes para fichas)
 */
export function convertGoogleDriveUrl(url: string, size: number = 1000): string {
  if (!url) return url;
  
  // Padrão 1: /file/d/ID/
  const driveRegex1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match1 = url.match(driveRegex1);
  
  if (match1 && match1[1]) {
    // Usa thumbnail API que funciona melhor para imagens
    return `https://drive.google.com/thumbnail?id=${match1[1]}&sz=w${size}`;
  }
  
  // Padrão 2: open?id=ID
  const driveRegex2 = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const match2 = url.match(driveRegex2);
  
  if (match2 && match2[1]) {
    return `https://drive.google.com/thumbnail?id=${match2[1]}&sz=w${size}`;
  }
  
  // Se não for Google Drive, retorna o URL original
  return url;
}
