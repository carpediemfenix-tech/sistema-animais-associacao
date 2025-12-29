import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Componente QR Code usando QR Server API
 * Gera QR codes sem dependências externas
 */
export const QRCode: React.FC<QRCodeProps> = ({ 
  value, 
  size = 150, 
  className = "" 
}) => {
  // Usar serviço público para gerar QR code
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className={`inline-block ${className}`}>
      <img 
        src={qrUrl}
        alt="QR Code de Verificação"
        className="border border-gray-300 rounded"
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fallback se o serviço não funcionar
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement!.innerHTML = `
            <div style="width: ${size}px; height: ${size}px; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; text-align: center; background: #f9f9f9;">
              QR Code<br/>Verificação
            </div>
          `;
        }}
      />
    </div>
  );
};

export default QRCode;