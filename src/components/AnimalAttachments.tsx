import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  File, 
  Video, 
  FileText, 
  Eye,
  Trash2,
  Camera,
  Film,
  FileImage,
  AlertCircle,
  CheckCircle,
  Loader2,
  Star,
  StarOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AnexoFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress?: number;
  status: 'uploading' | 'completed' | 'error';
  category: 'photo' | 'video' | 'document';
  description?: string;
  isPrimary?: boolean;
}

interface AnimalAttachmentsProps {
  animalId?: string;
  onAttachmentsChange?: (attachments: AnexoFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  showUrlInput?: boolean;
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
}

const AnimalAttachments: React.FC<AnimalAttachmentsProps> = ({
  animalId,
  onAttachmentsChange,
  maxFiles = 10,
  maxFileSize = 50,
  showUrlInput = true,
  initialUrl = '',
  onUrlChange
}) => {
  const [attachments, setAttachments] = useState<AnexoFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptedTypes = {
    photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  };

  useEffect(() => {
    if (animalId) {
      loadExistingAttachments();
    }
  }, [animalId]);

  useEffect(() => {
    setUrlInput(initialUrl);
  }, [initialUrl]);

  const loadExistingAttachments = async () => {
    if (!animalId) return;
    
    setIsLoadingExisting(true);
    try {
      const { data, error } = await supabase
        .rpc('get_animal_attachments', { animal_uuid: animalId });

      if (error) throw error;

      if (data) {
        const existingAttachments: AnexoFile[] = data.map((item: any) => ({
          id: item.id,
          name: item.file_name,
          size: item.file_size,
          type: item.file_type,
          category: item.file_category as 'photo' | 'video' | 'document',
          url: item.public_url,
          status: 'completed' as const,
          description: item.description,
          isPrimary: item.is_primary
        }));
        
        setAttachments(existingAttachments);
        onAttachmentsChange?.(existingAttachments);
      }
    } catch (error) {
      console.error('Erro ao carregar anexos:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao carregar anexos existentes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingExisting(false);
    }
  };

  const getFileCategory = (type: string): 'photo' | 'video' | 'document' => {
    if (acceptedTypes.photo.includes(type)) return 'photo';
    if (acceptedTypes.video.includes(type)) return 'video';
    return 'document';
  };

  const getFileIcon = (category: 'photo' | 'video' | 'document') => {
    switch (category) {
      case 'photo': return <FileImage className="h-5 w-5 text-blue-500" />;
      case 'video': return <Film className="h-5 w-5 text-purple-500" />;
      case 'document': return <FileText className="h-5 w-5 text-green-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${maxFileSize}MB permitido.`;
    }

    const allAcceptedTypes = [...acceptedTypes.photo, ...acceptedTypes.video, ...acceptedTypes.document];
    if (!allAcceptedTypes.includes(file.type)) {
      return 'Tipo de arquivo não suportado.';
    }

    return null;
  };

  const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return url;
    
    const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    
    if (match) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    return url;
  };

  const uploadToSupabase = async (file: File, anexoId: string): Promise<{ url: string; path: string }> => {
    try {
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${animalId || 'temp'}_${timestamp}_${anexoId}.${fileExt}`;
      const filePath = `animal-attachments/${fileName}`;

      const { data, error } = await supabase.storage
        .from('animal-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('animal-files')
        .getPublicUrl(filePath);

      return { url: urlData.publicUrl, path: filePath };
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  };

  const saveAttachmentMetadata = async (attachment: AnexoFile, storagePath: string) => {
    if (!animalId) return;

    try {
      const { error } = await supabase
        .from('animal_attachments_2026_01_09_09_00')
        .insert({
          animal_id: animalId,
          file_name: attachment.name,
          file_size: attachment.size,
          file_type: attachment.type,
          file_category: attachment.category,
          storage_path: storagePath,
          public_url: attachment.url,
          description: attachment.description,
          is_primary: attachment.isPrimary || false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar metadados:', error);
      throw error;
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (attachments.length + files.length > maxFiles) {
      toast({
        title: "❌ Limite Excedido",
        description: `Máximo de ${maxFiles} arquivos permitido`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const newAttachments: AnexoFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);

      if (validationError) {
        toast({
          title: "❌ Arquivo Inválido",
          description: `${file.name}: ${validationError}`,
          variant: "destructive",
        });
        continue;
      }

      const anexoId = `anexo_${Date.now()}_${i}`;
      const category = getFileCategory(file.type);

      const anexo: AnexoFile = {
        id: anexoId,
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        status: 'uploading',
        uploadProgress: 0
      };

      newAttachments.push(anexo);
    }

    setAttachments(prev => [...prev, ...newAttachments]);

    for (let i = 0; i < newAttachments.length; i++) {
      const anexo = newAttachments[i];
      const file = files[i];

      try {
        const progressInterval = setInterval(() => {
          setAttachments(prev => prev.map(a => 
            a.id === anexo.id 
              ? { ...a, uploadProgress: Math.min((a.uploadProgress || 0) + 10, 90) }
              : a
          ));
        }, 200);

        const { url, path } = await uploadToSupabase(file, anexo.id);

        clearInterval(progressInterval);

        const updatedAttachment = { ...anexo, url, status: 'completed' as const, uploadProgress: 100 };
        
        setAttachments(prev => prev.map(a => 
          a.id === anexo.id ? updatedAttachment : a
        ));

        if (animalId) {
          await saveAttachmentMetadata(updatedAttachment, path);
        }

        toast({
          title: "✅ Upload Concluído",
          description: `${file.name} foi enviado com sucesso`,
        });

      } catch (error) {
        console.error('Erro no upload:', error);
        
        setAttachments(prev => prev.map(a => 
          a.id === anexo.id 
            ? { ...a, status: 'error', uploadProgress: 0 }
            : a
        ));

        toast({
          title: "❌ Erro no Upload",
          description: `Falha ao enviar ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
  };

  const removeAttachment = async (id: string) => {
    const attachment = attachments.find(a => a.id === id);
    if (!attachment) return;

    try {
      if (animalId && attachment.url?.includes('supabase')) {
        const { error: dbError } = await supabase
          .from('animal_attachments_2026_01_09_09_00')
          .delete()
          .eq('id', id);

        if (dbError) throw dbError;

        const urlParts = attachment.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const storagePath = `animal-attachments/${fileName}`;
        
        const { error: storageError } = await supabase.storage
          .from('animal-files')
          .remove([storagePath]);

        if (storageError) console.warn('Erro ao remover do storage:', storageError);
      }

      const updatedAttachments = attachments.filter(a => a.id !== id);
      setAttachments(updatedAttachments);
      onAttachmentsChange?.(updatedAttachments);
      
      toast({
        title: "🗑️ Anexo Removido",
        description: "Arquivo removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao remover arquivo",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    e.target.value = '';
  };

  const handleUrlChange = (newUrl: string) => {
    setUrlInput(newUrl);
    onUrlChange?.(newUrl);
  };

  const stats = {
    photos: attachments.filter(a => a.category === 'photo').length,
    videos: attachments.filter(a => a.category === 'video').length,
    documents: attachments.filter(a => a.category === 'document').length,
    totalSize: attachments.reduce((sum, a) => sum + a.size, 0)
  };

  if (isLoadingExisting) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600">Carregando anexos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showUrlInput && (
        <div>
          <Label htmlFor="url_fotografia">URL da Fotografia</Label>
          <Input
            id="url_fotografia"
            type="url"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Cole o URL do Google Drive ou link direto da imagem"
          />
          <p className="text-xs text-gray-500 mt-1">
            📸 Aceita URLs do Google Drive (serão convertidos automaticamente)
          </p>
          {urlInput && (
            <div className="mt-2 space-y-2">
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <strong>URL convertido:</strong>
                <br />
                <code className="text-xs break-all">{convertGoogleDriveUrl(urlInput)}</code>
              </div>
              <img 
                src={convertGoogleDriveUrl(urlInput)} 
                alt="Pré-visualização" 
                className="max-w-xs h-32 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Camera className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{stats.photos}</p>
                <p className="text-xs text-gray-500">Fotos</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">{stats.videos}</p>
                <p className="text-xs text-gray-500">Vídeos</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">{stats.documents}</p>
                <p className="text-xs text-gray-500">Documentos</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{formatFileSize(stats.totalSize)}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-600" />
            Upload de Anexos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${
              isDragging ? 'text-emerald-500' : 'text-gray-400'
            }`} />
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              Suporta fotos, vídeos e documentos (máx. {maxFileSize}MB cada)
            </p>
            
            <Button 
              onClick={openFileDialog}
              disabled={isUploading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivos
                </>
              )}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.avi,.mov,.wmv,.webm,.pdf,.doc,.docx,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
          
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p><strong>Fotos:</strong> JPG, PNG, GIF, WebP</p>
            <p><strong>Vídeos:</strong> MP4, AVI, MOV, WMV, WebM</p>
            <p><strong>Documentos:</strong> PDF, DOC, DOCX, TXT</p>
            <p><strong>Limite:</strong> {maxFiles} arquivos, {maxFileSize}MB por arquivo</p>
          </div>
        </CardContent>
      </Card>

      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5 text-emerald-600" />
              Anexos ({attachments.length}/{maxFiles})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attachments.map((anexo) => (
                <div key={anexo.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getFileIcon(anexo.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {anexo.name}
                      </p>
                      {anexo.isPrimary && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatFileSize(anexo.size)}</span>
                      <Badge variant="outline" className="text-xs">
                        {anexo.category === 'photo' ? 'Foto' : 
                         anexo.category === 'video' ? 'Vídeo' : 'Documento'}
                      </Badge>
                    </div>
                    
                    {anexo.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={anexo.uploadProgress || 0} className="h-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          Enviando... {anexo.uploadProgress || 0}%
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {anexo.status === 'completed' && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {anexo.url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(anexo.url, '_blank')}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    
                    {anexo.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    
                    {anexo.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(anexo.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.28 3l5.72 9.91L18.28 3H6.28zM21 14.5l-3.28-5.69-3.28 5.69H21zM3 14.5h6.56L12.84 21H3V14.5z"/>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">
                🚀 Integração com Google Drive (Em Desenvolvimento)
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                Os arquivos estão sendo salvos no Supabase Storage. A integração com Google Drive será implementada em breve com as seguintes funcionalidades:
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Upload direto para pasta específica do Google Drive</li>
                <li>• Organização automática por animal e data</li>
                <li>• Sincronização bidirecional</li>
                <li>• Compartilhamento controlado de arquivos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalAttachments;
