import { useState, useEffect, useRef } from 'react';
import { FileText, Eye, EyeOff, Calendar, Plus, Trash2, Edit2, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AppShell } from '../../admin/ui/AppShell';
import { Card } from '../../admin/ui/primitives/Card';
import { SkeletonCard } from '../../admin/ui/primitives/Skeleton';
import { EmptyState } from '../../admin/ui/primitives/EmptyState';
import { Button } from '../../admin/ui/primitives/Button';
import { Modal } from '../../admin/ui/primitives/Modal';
import { Input } from '../../admin/ui/primitives/Input';
import { Textarea } from '../../admin/ui/primitives/Textarea';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { BlogImageUploader } from '../../components/admin/BlogImageUploader';
import type { UploadedBlogImage } from '../../lib/blogImageUpload';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  tags: string[];
  reading_time_minutes: number;
  is_published: boolean;
  updated_at: string;
}

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  tags: string[];
  reading_time_minutes: number;
  is_published: boolean;
}

const statusConfig = {
  published: {
    label: 'Paskelbta',
    icon: Eye,
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  },
  draft: {
    label: 'Juodraštis',
    icon: EyeOff,
    className: 'bg-white/10 text-white/50 border border-white/20'
  }
};

export function BlogsPage() {
  useDocumentTitle('Admin');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    category: '',
    tags: [],
    reading_time_minutes: 5,
    is_published: false
  });
  const [tagInput, setTagInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedBlogImage[]>([]);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const generateSlug = (title: string): string => {
    const lithuanianMap: { [key: string]: string } = {
      'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
      'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z'
    };

    return title
      .toLowerCase()
      .split('')
      .map(char => lithuanianMap[char] || char)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenCreate = () => {
    setSelectedPost(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      cover_image_url: '',
      category: '',
      tags: [],
      reading_time_minutes: 5,
      is_published: false
    });
    setTagInput('');
    setUploadedImages([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (post: Post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      cover_image_url: post.cover_image_url,
      category: post.category,
      tags: post.tags || [],
      reading_time_minutes: post.reading_time_minutes,
      is_published: post.is_published
    });
    setTagInput('');
    setUploadedImages([]);
    setModalOpen(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 3 && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImageUploaded = (image: UploadedBlogImage) => {
    setUploadedImages(prev => [...prev, image]);
  };

  const handleImageDeleted = (image: UploadedBlogImage) => {
    setUploadedImages(prev => prev.filter(img => img.timestamp !== image.timestamp));
  };

  const handleInsertImage = (markdown: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = formData.content;

    const beforeCursor = currentContent.substring(0, start);
    const afterCursor = currentContent.substring(end);

    const needsNewlineBefore = beforeCursor && !beforeCursor.endsWith('\n\n');
    const needsNewlineAfter = afterCursor && !afterCursor.startsWith('\n\n');

    const newContent =
      beforeCursor +
      (needsNewlineBefore ? '\n\n' : '') +
      markdown +
      (needsNewlineAfter ? '\n\n' : '') +
      afterCursor;

    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      const newCursorPos = start + (needsNewlineBefore ? 2 : 0) + markdown.length + (needsNewlineAfter ? 2 : 0);
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      alert('Prašome užpildyti visus privalomus laukelius');
      return;
    }

    setSaving(true);
    try {
      const slug = generateSlug(formData.title);
      const sessionToken = localStorage.getItem('admin_session_token');

      if (!sessionToken) {
        alert('Sesija baigėsi. Prašome prisijungti iš naujo.');
        window.location.href = '/admin/login';
        return;
      }

      if (selectedPost) {
        const { error } = await supabase.rpc('admin_update_post', {
          p_session_token: sessionToken,
          post_id: selectedPost.id,
          post_title: formData.title,
          post_slug: slug,
          post_excerpt: formData.excerpt,
          post_content: formData.content,
          post_cover_image_url: formData.cover_image_url,
          post_category: formData.category,
          post_tags: formData.tags,
          post_reading_time_minutes: formData.reading_time_minutes,
          post_is_published: formData.is_published
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('admin_create_post', {
          p_session_token: sessionToken,
          post_title: formData.title,
          post_slug: slug,
          post_excerpt: formData.excerpt,
          post_content: formData.content,
          post_cover_image_url: formData.cover_image_url,
          post_category: formData.category,
          post_tags: formData.tags,
          post_reading_time_minutes: formData.reading_time_minutes,
          post_is_published: formData.is_published
        });

        if (error) throw error;
      }

      await loadPosts();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Klaida išsaugant įrašą');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;

    setDeleting(true);
    try {
      const sessionToken = localStorage.getItem('admin_session_token');

      if (!sessionToken) {
        alert('Sesija baigėsi. Prašome prisijungti iš naujo.');
        window.location.href = '/admin/login';
        return;
      }

      const { error } = await supabase.rpc('admin_delete_post', {
        p_session_token: sessionToken,
        post_id: selectedPost.id
      });

      if (error) throw error;

      await loadPosts();
      setDeleteModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Klaida ištrinant įrašą');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (post: Post) => {
    setSelectedPost(post);
    setDeleteModalOpen(true);
  };

  return (
    <AppShell>
      <AppShell.Page
        title="Tinklaraščiai"
        subtitle="Tvarkykite tinklaraščio įrašus ir straipsnius"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus size={18} />
            Naujas įrašas
          </Button>
        }
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#0D1117] rounded-xl overflow-hidden border border-white/[0.06]">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Dar nėra sukurtų tinklaraščio įrašų"
            description="Sukurkite savo pirmąjį tinklaraščio įrašą paspausdami mygtuką viršuje"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const status = post.is_published ? statusConfig.published : statusConfig.draft;
              const StatusIcon = status.icon;

              return (
                <Card
                  key={post.id}
                  hover
                  className="bg-[#1C2128] border-white/[0.08] overflow-hidden group relative hover:border-[#B58E4C]/40"
                >
                  {/* Cover Image */}
                  {post.cover_image_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-transparent" />

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-2 bg-[#0D1117]/90 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-[#B58E4C]/20 hover:border-[#B58E4C]/40 transition-all"
                        >
                          <Edit2 size={16} className="text-white" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(post)}
                          className="p-2 bg-[#0D1117]/90 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gradient-to-br from-[#B58E4C]/20 to-[#B58E4C]/5 flex items-center justify-center">
                      <FileText size={48} className="text-[#B58E4C]/30" />

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-2 bg-[#0D1117]/90 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-[#B58E4C]/20 hover:border-[#B58E4C]/40 transition-all"
                        >
                          <Edit2 size={16} className="text-white" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(post)}
                          className="p-2 bg-[#0D1117]/90 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <Card.Body className="space-y-3">
                    <h3 className="text-lg font-semibold text-white line-clamp-2 min-h-[3.5rem]">
                      {post.title}
                    </h3>

                    <p className="text-sm text-white/60 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-[#B58E4C]/10 text-[#B58E4C] rounded-md border border-[#B58E4C]/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-white/50">
                        <Calendar size={12} />
                        <span>
                          {new Date(post.updated_at).toLocaleDateString('lt-LT')}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && posts.length > 0 && (
          <div className="mt-6 text-sm text-white/50 text-center">
            Rodoma {posts.length} {posts.length === 1 ? 'įrašas' : posts.length < 10 ? 'įrašai' : 'įrašų'}
          </div>
        )}
      </AppShell.Page>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedPost ? 'Redaguoti įrašą' : 'Naujas įrašas'}
        size="lg"
      >
        <Modal.Body>
          <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Pavadinimas <span className="text-red-400">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Įveskite įrašo pavadinimą"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Viršelio nuotraukos URL
            </label>
            <div className="space-y-2">
              <Input
                value={formData.cover_image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
              {formData.cover_image_url && (
                <div className="relative h-48 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={formData.cover_image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Kategorija
            </label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Pvz.: Priežiūra, Stilius, Patarimai"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Trumpas aprašymas <span className="text-red-400">*</span>
            </label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Trumpas įrašo aprašymas..."
              rows={3}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Turinys <span className="text-red-400">*</span>
            </label>
            <Textarea
              ref={contentTextareaRef}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Visas įrašo turinys..."
              rows={8}
            />
            <p className="text-xs text-white/50 mt-2">
              Palaikomas Markdown formatas. Nuotraukas galite įterpti spauskite pelės žymeklį tekste ir įkelkite nuotrauką žemiau.
            </p>
          </div>

          {/* Blog Image Uploader */}
          <BlogImageUploader
            uploadedImages={uploadedImages}
            onImageUploaded={handleImageUploaded}
            onImageDeleted={handleImageDeleted}
            onInsertImage={handleInsertImage}
          />

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Žymos (maksimaliai 3)
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Įveskite žymą"
                  disabled={formData.tags.length >= 3}
                />
                <Button
                  onClick={handleAddTag}
                  disabled={formData.tags.length >= 3 || !tagInput.trim()}
                  variant="secondary"
                >
                  Pridėti
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B58E4C]/10 text-[#B58E4C] rounded-lg border border-[#B58E4C]/20"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-[#B58E4C]/70 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reading Time */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Skaitymo laikas (minutėmis)
            </label>
            <Input
              type="number"
              min="1"
              value={formData.reading_time_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, reading_time_minutes: parseInt(e.target.value) || 5 }))}
            />
          </div>

          {/* Published Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 bg-[#161B22] text-[#B58E4C] focus:ring-[#B58E4C] focus:ring-offset-0"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-white/90 cursor-pointer">
              Paskelbti įrašą
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Atšaukti
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Išsaugoma...' : 'Išsaugoti'}
            </Button>
          </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Ištrinti įrašą"
        size="sm"
      >
        <Modal.Body>
          <p className="text-white/70">
            Ar tikrai norite ištrinti įrašą <span className="font-semibold text-white">"{selectedPost?.title}"</span>?
            Šis veiksmas negrįžtamas.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteModalOpen(false)}
            disabled={deleting}
          >
            Atšaukti
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {deleting ? 'Trinamas...' : 'Ištrinti'}
          </Button>
        </Modal.Footer>
      </Modal>
    </AppShell>
  );
}
