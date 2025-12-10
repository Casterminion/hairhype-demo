import { useCallback, useState, DragEvent, ChangeEvent } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useTheme } from '../../admin/ui/AppShell';
import { validateImageFile } from '../../lib/imageUpload';

interface ImageUploadZoneProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploadZone({ onImageSelect, disabled = false }: ImageUploadZoneProps) {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Netinkamas failas');
        return;
      }

      onImageSelect(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all
          ${isDragging
            ? 'border-[#9333EA] bg-[#9333EA]/10 scale-[1.02]'
            : theme === 'dark'
            ? 'border-white/20 hover:border-white/40'
            : 'border-[var(--ink)]/20 hover:border-[var(--ink)]/40'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="image-upload-input"
        />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDragging
                ? 'bg-[#9333EA]/20'
                : theme === 'dark'
                ? 'bg-white/5'
                : 'bg-[var(--ink)]/5'
            }`}
          >
            {isDragging ? (
              <ImageIcon
                size={32}
                className="text-[#9333EA]"
                strokeWidth={2}
              />
            ) : (
              <Upload
                size={32}
                className={theme === 'dark' ? 'text-white/60' : 'text-[var(--ink)]/60'}
                strokeWidth={2}
              />
            )}
          </div>

          <div>
            <p
              className={`text-base font-semibold mb-1 ${
                theme === 'dark' ? 'text-white' : 'text-[var(--ink)]'
              }`}
            >
              {isDragging
                ? 'Paleiskite nuotrauką čia'
                : 'Nuvilkite nuotrauką arba spauskite įkėlimui'}
            </p>
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-white/50' : 'text-[var(--ink)]/50'
              }`}
            >
              JPG, PNG, GIF arba WebP (maks. 10MB)
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <span className="px-2 py-1 bg-[#9333EA]/10 text-[#9333EA] rounded-md border border-[#9333EA]/20">
              Kvadratinis formatas
            </span>
            <span className="px-2 py-1 bg-[#9333EA]/10 text-[#9333EA] rounded-md border border-[#9333EA]/20">
              Automatinis apkarpymas
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
