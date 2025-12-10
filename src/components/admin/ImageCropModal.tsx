import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../../admin/ui/primitives/Button';
import { useTheme } from '../../admin/ui/AppShell';
import type { CroppedArea } from '../../lib/imageUpload';

interface ImageCropModalProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (croppedAreaPixels: CroppedArea) => void;
  isProcessing?: boolean;
  aspect?: number;
  title?: string;
  description?: string;
}

export function ImageCropModal({
  imageSrc,
  onCancel,
  onSave,
  isProcessing = false,
  aspect = 1,
  title = 'Apkarpyti nuotrauką',
  description = 'Nuvilkite ir priartinkite nuotrauką, kad pasirinktumėte kvadratinę dalį'
}: ImageCropModalProps) {
  const theme = useTheme();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = () => {
    if (croppedAreaPixels) {
      onSave(croppedAreaPixels);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={isProcessing ? undefined : onCancel}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-4xl rounded-2xl overflow-hidden ${
          theme === 'dark'
            ? 'bg-[var(--navy)] border-white/[0.06]'
            : 'bg-white border-[var(--line)]'
        } border shadow-2xl flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            theme === 'dark' ? 'border-white/[0.06]' : 'border-[var(--line)]'
          }`}
        >
          <div>
            <h2
              className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-[var(--ink)]'
              }`}
            >
              {title}
            </h2>
            <p
              className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-white/60' : 'text-[var(--ink)]/60'
              }`}
            >
              {description}
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className={`p-2 rounded-lg transition ${
              theme === 'dark'
                ? 'hover:bg-white/10 text-white/70 hover:text-white'
                : 'hover:bg-[var(--ink)]/10 text-[var(--ink)]/70 hover:text-[var(--ink)]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 min-h-[400px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={true}
            style={{
              containerStyle: {
                backgroundColor: '#000'
              },
              cropAreaStyle: {
                border: '2px solid #9333EA',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
              }
            }}
          />
        </div>

        {/* Controls */}
        <div
          className={`px-6 py-4 border-t ${
            theme === 'dark' ? 'border-white/[0.06]' : 'border-[var(--line)]'
          }`}
        >
          {/* Zoom Controls */}
          <div className="flex items-center gap-4 mb-4">
            <ZoomOut size={20} className={theme === 'dark' ? 'text-white/60' : 'text-[var(--ink)]/60'} />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={isProcessing}
              className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#9333EA] [&::-webkit-slider-thumb]:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <ZoomIn size={20} className={theme === 'dark' ? 'text-white/60' : 'text-[var(--ink)]/60'} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="subtle"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Atšaukti
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isProcessing || !croppedAreaPixels}
              className="flex-1 bg-[#9333EA] hover:bg-[#7C3AED]"
            >
              {isProcessing ? 'Apdorojama...' : 'Išsaugoti'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
