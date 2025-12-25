import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte URL do Google Drive para formato de imagem direta
 * @param url - URL original do Google Drive ou qualquer outro URL de imagem
 * @returns URL convertido para exibição direta de imagem
 * 
 * Exemplo:
 * Input: https://drive.google.com/file/d/12CWD1g2NJZpu1XHSEpzQb0kDN_k53lEq/view?usp=drive_link
 * Output: https://drive.google.com/uc?export=view&id=12CWD1g2NJZpu1XHSEpzQb0kDN_k53lEq
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;
  
  // Verifica se é um URL do Google Drive
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    // Converte para formato de imagem direta
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  
  // Se não for Google Drive, retorna o URL original
  return url;
}
