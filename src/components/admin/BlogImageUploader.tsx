import { useState, useCallback } from 'react';
import { Image as ImageIcon, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { ImageUploadZone } from './ImageUploadZone';
import { ImageCropModal } from './ImageCropModal';
import { Button } from '../../admin/ui/primitives/Button';
import { Input } from '../../admin/ui/primitives/Input';
import { useTheme } from '../../admin/ui/AppShell';
import { showToast } from '../../admin/ui/primitives/Toast';
import { processAndUploadBlogImage, deleteBlogImageFromStorage, type UploadedBlogImage } from '../../lib/blogImageUpload';
import type { CroppedArea } from '../../lib/imageUpload';

interface BlogImageUploaderProps {
  uploadedImages: UploadedBlogImage[];
  onImageUploaded: (image: UploadedBlogImage) => void;
  onImageDeleted: (image: UploadedBlogImage) => void;
  onInsertImage: (markdown: string) => void;
}

export function BlogImageUploader({
  uploadedImages,
  onImageUploaded,
  onImageDeleted,
  onInsertImage
}: BlogImageUploaderProps) {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setShowCropModal(true);
    setAltText('');
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
    setSelectedFile(null);
    setAltText('');
  };

  const handleCropSave = async (croppedAreaPixels: CroppedArea) => {
    if (!selectedFile || !imageSrc) return;

    setIsUploading(true);
    try {
      const uploadedImage = await processAndUploadBlogImage(
        selectedFile,
        croppedAreaPixels,
        altText || 'Blog nuotrauka'
      );

      showToast('success', 'Nuotrauka sėkmingai įkelta');
      onImageUploaded(uploadedImage);
      handleCropCancel();
    } catch (error: any) {
      showToast('error', error.message || 'Nepavyko įkelti nuotraukos');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (image: UploadedBlogImage) => {
    if (!confirm('Ar tikrai norite ištrinti šią nuotrauką?')) return;

    try {
      await deleteBlogImageFromStorage(image.url);
      onImageDeleted(image);
      showToast('success', 'Nuotrauka ištrinta');
    } catch (error: any) {
      showToast('error', error.message || 'Nepavyko ištrinti nuotraukos');
      console.error(error);
    }
  };

  const handleCopyMarkdown = useCallback((markdown: string) => {
    navigator.clipboard.writeText(markdown);
    setCopiedMarkdown(markdown);
    showToast('success', 'Markdown nukopijuotas');
    setTimeout(() => setCopiedMarkdown(null), 2000);
  }, []);

  const handleInsert = useCallback((markdown: string) => {
    onInsertImage(markdown);
    showToast('success', 'Nuotrauka įterpta');
  }, [onInsertImage]);

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-[var(--ink)]/70'}`}>
          Įkelti nuotrauką į straipsnį
        </label>
        <ImageUploadZone
          onImageSelect={handleImageSelect}
          disabled={isUploading}
        />
      </div>

      {/* Alt Text Input */}
      {selectedFile && showCropModal && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-[var(--ink)]/70'}`}>
            Aprašymas (alt tekstas)
          </label>
          <Input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Trumpas nuotraukos aprašymas"
          />
        </div>
      )}

      {/* Uploaded Images List */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <div className={`flex items-center justify-between ${theme === 'dark' ? 'text-white/70' : 'text-[var(--ink)]/70'}`}>
            <label className="text-sm font-medium">
              Įkeltos nuotraukos ({uploadedImages.length})
            </label>
            <p className="text-xs">
              Spauskite pelės žymeklį tekste ir tada "Įterpti"
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {uploadedImages.map((image) => (
              <div
                key={image.timestamp}
                className={`rounded-lg border p-3 ${
                  theme === 'dark'
                    ? 'bg-[var(--navy)] border-white/[0.06]'
                    : 'bg-white border-[var(--line)]'
                }`}
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-24 h-14 object-cover rounded border border-white/10"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-[var(--ink)]'}`}>
                      {image.altText}
                    </p>
                    <code className={`text-xs font-mono block mt-1 truncate ${theme === 'dark' ? 'text-white/50' : 'text-[var(--ink)]/50'}`}>
                      {image.markdown}
                    </code>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 items-start">
                    <button
                      onClick={() => handleCopyMarkdown(image.markdown)}
                      className={`p-2 rounded-lg transition ${
                        copiedMarkdown === image.markdown
                          ? 'bg-green-500/20 text-green-400'
                          : theme === 'dark'
                          ? 'hover:bg-white/10 text-white/70 hover:text-white'
                          : 'hover:bg-[var(--ink)]/10 text-[var(--ink)]/70 hover:text-[var(--ink)]'
                      }`}
                      title="Kopijuoti Markdown"
                    >
                      {copiedMarkdown === image.markdown ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleInsert(image.markdown)}
                    >
                      Įterpti
                    </Button>
                    <button
                      onClick={() => handleDelete(image)}
                      className={`p-2 rounded-lg transition ${
                        theme === 'dark'
                          ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                          : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                      }`}
                      title="Ištrinti"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && imageSrc && (
        <ImageCropModal
          imageSrc={imageSrc}
          onCancel={handleCropCancel}
          onSave={handleCropSave}
          isProcessing={isUploading}
          aspect={16 / 9}
          title="Apkarpyti straipsnio nuotrauką"
          description="Nuvilkite ir priartinkite nuotrauką, kad pasirinktumėte 16:9 dalį"
        />
      )}
    </div>
  );
}
