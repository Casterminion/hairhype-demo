import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AppShell, useTheme } from '../../admin/ui/AppShell';
import { Card } from '../../admin/ui/primitives/Card';
import { Button } from '../../admin/ui/primitives/Button';
import { Input } from '../../admin/ui/primitives/Input';
import { showToast } from '../../admin/ui/primitives/Toast';
import { EmptyState } from '../../admin/ui/primitives/EmptyState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ImageUploadZone } from '../../components/admin/ImageUploadZone';
import { ImageCropModal } from '../../components/admin/ImageCropModal';
import { processAndUploadImage, type CroppedArea } from '../../lib/imageUpload';

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface DragState {
  draggedIndex: number | null;
  draggedOverIndex: number | null;
}

export function GalleryPage() {
  useDocumentTitle('Admin');
  const theme = useTheme();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Upload & Crop states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [altText, setAltText] = useState('');

  // Drag and drop states
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    draggedOverIndex: null
  });
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      showToast('error', 'Nepavyko įkelti nuotraukų');
      console.error(error);
    } else if (data) {
      setImages(data);
    }
    setLoading(false);
  };

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

    setSaving(true);
    try {
      await processAndUploadImage(selectedFile, croppedAreaPixels, altText || 'Gallery image');
      showToast('success', 'Nuotrauka sėkmingai įkelta');
      handleCropCancel();
      await loadImages();
    } catch (error: any) {
      showToast('error', error.message || 'Nepavyko įkelti nuotraukos');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šią nuotrauką?')) return;

    try {
      const token = localStorage.getItem('admin_session_token');
      if (!token) {
        showToast('error', 'Sesija negaliojanti');
        return;
      }

      const { data, error } = await supabase.rpc('admin_delete_gallery_image', {
        p_token: token,
        p_image_id: id
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Nepavyko ištrinti nuotraukos');
      }

      showToast('success', 'Nuotrauka ištrinta');
      loadImages();
    } catch (error: any) {
      showToast('error', error.message || 'Nepavyko ištrinti nuotraukos');
      console.error(error);
    }
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragState(prev => ({ ...prev, draggedIndex: index }));
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    setDragState(prev => ({ ...prev, draggedOverIndex: index }));
  };

  const handleDragEnd = async () => {
    const draggedIdx = dragItem.current;
    const draggedOverIdx = dragOverItem.current;

    if (draggedIdx === null || draggedOverIdx === null || draggedIdx === draggedOverIdx) {
      setDragState({ draggedIndex: null, draggedOverIndex: null });
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    try {
      const newImages = [...images];
      const draggedImage = newImages[draggedIdx];
      newImages.splice(draggedIdx, 1);
      newImages.splice(draggedOverIdx, 0, draggedImage);

      setImages(newImages);

      const token = localStorage.getItem('admin_session_token');
      if (!token) {
        showToast('error', 'Sesija negaliojanti');
        loadImages();
        return;
      }

      const updates = newImages.map((img, idx) => ({
        image_id: img.id,
        new_order: idx
      }));

      const { data, error } = await supabase.rpc('admin_reorder_gallery_images', {
        p_token: token,
        p_updates: updates
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Nepavyko atnaujinti tvarkos');
      }

      showToast('success', 'Nuotraukų tvarka atnaujinta');
    } catch (error: any) {
      showToast('error', error.message || 'Nepavyko atnaujinti tvarkos');
      console.error(error);
      loadImages();
    } finally {
      setDragState({ draggedIndex: null, draggedOverIndex: null });
      dragItem.current = null;
      dragOverItem.current = null;
    }
  };

  return (
    <AppShell>
      <AppShell.Page
        title="Galerija"
        subtitle="Tvarkykite galerijos nuotraukas"
      >
        <div className="space-y-6">
          {/* Upload Zone */}
          <Card className={`${theme === 'dark' ? 'bg-[var(--navy)] border-white/[0.06]' : 'bg-white border-[var(--line)]'}`}>
            <Card.Body>
              <ImageUploadZone
                onImageSelect={handleImageSelect}
                disabled={saving}
              />
              {selectedFile && (
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-[var(--ink)]/70'}`}>
                    Alt tekstas (aprašymas) - galite pridėti po apkarpymo
                  </label>
                  <Input
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Trumpas nuotraukos aprašymas"
                  />
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Images Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`aspect-square rounded-lg animate-pulse ${theme === 'dark' ? 'bg-white/5' : 'bg-[var(--ink)]/5'}`} />
              ))}
            </div>
          ) : images.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Nėra nuotraukų"
              description="Pridėkite pirmąją nuotrauką į galeriją"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <Card
                  key={image.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`
                    overflow-hidden cursor-move transition-all duration-200
                    ${theme === 'dark' ? 'bg-[var(--navy)] border-white/[0.06]' : 'bg-white border-[var(--line)]'}
                    ${dragState.draggedIndex === index ? 'opacity-50 scale-95' : ''}
                    ${dragState.draggedOverIndex === index && dragState.draggedIndex !== index ? 'border-[var(--gold)] border-2' : ''}
                  `}
                >
                  <div className="aspect-square relative">
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENuotrauka nerasta%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <Card.Body className="p-3">
                    <button
                      onClick={() => handleDelete(image.id)}
                      className={`
                        group relative w-full px-4 py-3 rounded-xl font-semibold text-sm
                        transition-all duration-300 ease-out
                        ${theme === 'dark'
                          ? 'bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40'
                          : 'bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300'
                        }
                        shadow-sm hover:shadow-lg hover:shadow-red-500/20
                        active:scale-[0.98]
                        flex items-center justify-center gap-2.5
                      `}
                    >
                      <Trash2
                        size={18}
                        className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                        strokeWidth={2.5}
                      />
                      <span className="font-bold tracking-wide">Ištrinti</span>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    </button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppShell.Page>

      {/* Crop Modal */}
      {showCropModal && imageSrc && (
        <ImageCropModal
          imageSrc={imageSrc}
          onCancel={handleCropCancel}
          onSave={handleCropSave}
          isProcessing={saving}
        />
      )}
    </AppShell>
  );
}
