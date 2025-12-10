import {
  Heart,
  Clock,
  Calendar,
  ArrowLeft,
  Home,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Send,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { blogService } from "../lib/services/blogService";
import { getSessionId } from "../lib/utils/sessionUtils";
import * as marked from "marked";
import { updateMetaTags, resetMetaTags } from "../utils/seo";

interface BlogPostProps {
  slug?: string;
  onNavigate: (target: string) => void;
}

export default function BlogPost({ slug, onNavigate }: BlogPostProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [similarPosts, setSimilarPosts] = useState<any[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [similarIndex, setSimilarIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: "",
    email: "",
    body: "",
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  const getVisibleSimilar = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 640) return 2;
    }
    return 1;
  };
  const [visibleSimilar, setVisibleSimilar] = useState(getVisibleSimilar());

  const htmlContent = useMemo(() => {
    if (!post?.content) return "";

    // Configure marked for proper paragraph spacing and formatting
    marked.marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
      sanitize: false
    });

    // Custom renderer for enhanced blog elements
    const renderer = new marked.Renderer();

    renderer.image = function({ href, title, text }: any) {
      return `
        <figure class="blog-image-wrapper">
          <img
            src="${href}"
            alt="${text}"
            ${title ? `title="${title}"` : ''}
            loading="lazy"
            class="blog-inline-image"
          />
          ${text ? `<figcaption class="blog-image-caption">${text}</figcaption>` : ''}
        </figure>
      `;
    };

    renderer.blockquote = function({ tokens }: any) {
      const text = this.parser.parse(tokens);

      // Check if it's a special blockquote (TOC, key takeaway, etc)
      if (text.includes('Šiame straipsnyje') || text.includes('šiame straipsnyje')) {
        return `<div class="blog-toc">${text}</div>`;
      }
      if (text.includes('💡') || text.includes('Pagrindinė išvada')) {
        return `<div class="blog-key-takeaway">${text.replace('💡', '').trim()}</div>`;
      }
      if (text.includes('ℹ️') || text.toLowerCase().includes('pastaba:')) {
        return `<div class="blog-info-box">${text.replace('ℹ️', '').trim()}</div>`;
      }
      if (text.includes('⚠️') || text.toLowerCase().includes('dėmesio:')) {
        return `<div class="blog-warning-box">${text.replace('⚠️', '').trim()}</div>`;
      }
      if (text.includes('💡') || text.toLowerCase().includes('patarimas:')) {
        return `<div class="blog-tip-box">${text.replace('💡', '').trim()}</div>`;
      }
      // Default pull quote style
      return `<div class="blog-pull-quote">${text}</div>`;
    };

    renderer.hr = function() {
      return '<div class="blog-section-divider"></div>';
    };

    renderer.paragraph = function({ tokens }: any) {
      const text = this.parser.parseInline(tokens);

      // Check for highlight markers in the final HTML
      if (text.includes('==') && text.includes('==')) {
        const highlighted = text.replace(/==(.*?)==/g, '<span class="blog-highlight">$1</span>');
        return `<p>${highlighted}</p>`;
      }
      return `<p>${text}</p>`;
    };

    marked.marked.use({ renderer });

    return marked.marked(post.content);
  }, [post?.content]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    loadPostData();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setVisibleSimilar(getVisibleSimilar());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadPostData = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const fetchedPost = await blogService.getPostBySlug(slug);
      if (fetchedPost) {
        setPost(fetchedPost);
        setLikes(fetchedPost.like_count);

        updateMetaTags({
          title: `${fetchedPost.title} | Hair Hype Junior Blog`,
          description: fetchedPost.excerpt || fetchedPost.title,
          canonical: `https://hairhypejunior.lt/#tinklarastis/${fetchedPost.slug}`,
          ogImage: fetchedPost.header_image_url || 'https://hairhypejunior.lt/og-cover.jpg',
          ogType: 'article',
          article: {
            publishedTime: fetchedPost.created_at,
            modifiedTime: fetchedPost.updated_at,
            author: 'Hair Hype Junior',
            tags: fetchedPost.tags || []
          }
        });

        const sessionId = getSessionId();
        const hasLiked = await blogService.hasUserLikedPost(
          fetchedPost.id,
          sessionId
        );
        setLiked(hasLiked);

        const similar = await blogService.getSimilarPosts(
          fetchedPost.id,
          fetchedPost.tags || [],
          6
        );
        setSimilarPosts(similar);

        const postComments = await blogService.getCommentsByPostId(
          fetchedPost.id
        );
        setComments(
          postComments.map((c) => ({
            name: c.author_name,
            date: c.created_at,
            text: c.body,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading post data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100">
        <div className="animate-pulse text-gray-900 text-xl font-serif">
          Kraunama...
        </div>
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-serif text-gray-900 mb-4">
            Straipsnis nerastas
          </h1>
          <button
            onClick={() => onNavigate("home")}
            className="text-gray-900 hover:text-gray-700 transition-colors"
          >
            Grįžti į pradžią
          </button>
        </div>
      </div>
    );

  const handleLike = async () => {
    if (!post) return;
    try {
      const sessionId = getSessionId();
      const result = await blogService.toggleLike(post.id, sessionId);
      setLiked(result.liked);
      setLikes(result.likeCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handlePrev = () => {
    if (isTransitioning || similarIndex === 0) return;
    setIsTransitioning(true);
    setSimilarIndex((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleNext = () => {
    if (isTransitioning || similarIndex >= similarPosts.length - visibleSimilar)
      return;
    setIsTransitioning(true);
    setSimilarIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const getOptimizedImage = (url: string, width = 1200) =>
    `${url}?width=${width}&quality=70&format=webp`;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");

    if (!commentForm.name.trim() || !commentForm.email.trim() || !commentForm.body.trim()) {
      setCommentError("Visi laukai yra privalomi");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commentForm.email)) {
      setCommentError("Neteisingas el. pašto formatas");
      return;
    }

    if (!post) return;

    setIsSubmittingComment(true);
    try {
      await blogService.addComment(post.id, {
        author_name: commentForm.name,
        author_email: commentForm.email,
        body: commentForm.body,
      });

      const updatedComments = await blogService.getCommentsByPostId(post.id);
      setComments(
        updatedComments.map((c) => ({
          name: c.author_name,
          date: c.created_at,
          text: c.body,
        }))
      );

      setCommentForm({ name: "", email: "", body: "" });
    } catch (error) {
      console.error("Error submitting comment:", error);
      setCommentError("Nepavyko pateikti komentaro. Bandykite dar kartą.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Scroll Progress */}
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[60]">
        <div
          className="h-full bg-gradient-to-r from-transparent via-gray-900 to-transparent transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-12 pt-24 pb-12">
        {/* Header */}
        <header className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            {post.title}
            <span className="block mx-auto mt-6 w-16 h-[2px] bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
          </h1>

          <div className="flex flex-wrap justify-center gap-6 text-gray-600 text-sm uppercase tracking-wider font-medium">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              {new Date(post.created_at).toLocaleDateString("lt-LT", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} />
              {post.reading_time_minutes} min
            </span>
            {post.tags && post.tags.length > 0 && post.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-4 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold tracking-widest"
              >
                {tag}
              </span>
            ))}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all ${
                liked
                  ? "text-gray-900 scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:scale-105"
              }`}
            >
              <Heart size={18} fill={liked ? "#1F2937" : "none"} />
              <span className="font-semibold">{likes}</span>
            </button>
          </div>
        </header>

        {/* Main Hero Image */}
        <div className="max-w-5xl mx-auto mb-20 relative">
          <div className="relative overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] aspect-[16/9]">
            <img
              src={getOptimizedImage(post.cover_image_url, 1200)}
              srcSet={`
                ${getOptimizedImage(post.cover_image_url, 480)} 480w,
                ${getOptimizedImage(post.cover_image_url, 768)} 768w,
                ${getOptimizedImage(post.cover_image_url, 1200)} 1200w
              `}
              sizes="(max-width: 640px) 480px, (max-width: 1024px) 768px, 1200px"
              alt={post.title}
              width="1200"
              height="675"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </div>
        </div>

        {/* Article Body */}
        <article className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-2xl md:text-3xl leading-[1.6] font-light text-gray-800 tracking-wide max-w-3xl mx-auto">
              {post.excerpt}
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-16" />

          <div
            className="prose prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-gray-900
              prose-h1:text-[40px] prose-h1:md:text-[44px] prose-h1:font-bold prose-h1:mt-24 prose-h1:mb-10 prose-h1:leading-[1.2] prose-h1:tracking-tighter
              prose-h2:text-[32px] prose-h2:md:text-[36px] prose-h2:font-semibold prose-h2:mt-20 prose-h2:mb-10 prose-h2:leading-[1.25] prose-h2:tracking-tight
              prose-h3:text-[24px] prose-h3:md:text-[26px] prose-h3:font-medium prose-h3:mt-16 prose-h3:mb-7 prose-h3:leading-[1.3] prose-h3:tracking-tight
              prose-p:text-gray-700 prose-p:leading-[1.85] prose-p:text-[19px] prose-p:md:text-[20px] prose-p:font-light prose-p:mb-10 prose-p:mt-0 prose-p:tracking-wide
              prose-p:first-of-type:text-[24px] prose-p:first-of-type:md:text-[26px] prose-p:first-of-type:leading-[1.7] prose-p:first-of-type:mb-14 prose-p:first-of-type:font-extralight prose-p:first-of-type:text-gray-800
              prose-strong:font-semibold prose-strong:text-gray-900 prose-strong:tracking-normal
              prose-ul:my-14 prose-ul:space-y-5
              prose-li:text-gray-700 prose-li:leading-[1.8] prose-li:text-[19px] prose-li:pl-3 prose-li:font-light prose-li:mb-4
              prose-ol:my-14 prose-ol:space-y-6
              prose-blockquote:border-l-4 prose-blockquote:border-gray-400 prose-blockquote:pl-8 prose-blockquote:py-6 prose-blockquote:my-16
              prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:text-[21px] prose-blockquote:leading-[1.75] prose-blockquote:font-light
              prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-16 prose-img:border prose-img:border-gray-200
              prose-a:text-gray-900 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:decoration-2 prose-a:underline-offset-4
              [&>*+*]:mt-0 [&>h1+*]:mt-10 [&>h2+*]:mt-10 [&>h3+*]:mt-7 [&>p+p]:mt-10 [&>p+h2]:mt-24 [&>p+h3]:mt-18 [&>ul+h2]:mt-24 [&>ol+h2]:mt-24"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>

        {/* Comments Section */}
        <section className="max-w-3xl mx-auto mt-20">
          <div className="border-t border-gray-200 pt-12">
            <h3 className="font-serif text-3xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
              <MessageCircle size={28} className="text-gray-900" />
              Komentarai ({comments.length})
            </h3>

            {/* Comment Form */}
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 mb-12">
              <h4 className="font-serif text-xl font-medium text-gray-900 mb-6">
                Palikite komentarą
              </h4>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Vardas *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={commentForm.name}
                      onChange={(e) =>
                        setCommentForm({ ...commentForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all"
                      placeholder="Jūsų vardas"
                      disabled={isSubmittingComment}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      El. paštas *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={commentForm.email}
                      onChange={(e) =>
                        setCommentForm({ ...commentForm, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all"
                      placeholder="jusu@email.com"
                      disabled={isSubmittingComment}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-[#2a2a2a] mb-2"
                  >
                    Komentaras *
                  </label>
                  <textarea
                    id="comment"
                    rows={5}
                    value={commentForm.body}
                    onChange={(e) =>
                      setCommentForm({ ...commentForm, body: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all resize-none"
                    placeholder="Parašykite savo komentarą..."
                    disabled={isSubmittingComment}
                  />
                </div>
                {commentError && (
                  <p className="text-red-600 text-sm">{commentError}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? (
                    <>Siunčiama...</>
                  ) : (
                    <>
                      <Send size={18} />
                      Paskelbti komentarą
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8 italic">
                  Kol kas nėra komentarų. Būkite pirmas!
                </p>
              ) : (
                comments.map((comment, index) => (
                  <div
                    key={index}
                    className="bg-white/40 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-[#1A1A1A] text-lg">
                          {comment.name}
                        </h5>
                        <p className="text-[#3A3A3A]/60 text-sm">
                          {new Date(comment.date).toLocaleDateString("lt-LT", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#2a2a2a] leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Similar Posts */}
        {similarPosts.length > 0 && (
          <section className="mt-32">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-gray-900 mb-8 text-center">
              Panašūs straipsniai
            </h3>
            <div className="relative w-full max-w-6xl mx-auto overflow-visible">
              {similarPosts.length > visibleSimilar && (
                <>
                  <button
                    onClick={handlePrev}
                    disabled={similarIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-gray-900 text-gray-900 hover:text-white rounded-full p-3 shadow-md transition-all disabled:opacity-30"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={
                      similarIndex >= similarPosts.length - visibleSimilar
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-gray-900 text-gray-900 hover:text-white rounded-full p-3 shadow-md transition-all disabled:opacity-30"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              <div className="overflow-hidden w-full relative">
                <div
                  className="flex transition-transform duration-[600ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
                  style={{
                    transform: `translateX(-${
                      similarIndex * (100 / visibleSimilar)
                    }%)`,
                  }}
                >
                  {similarPosts.map((s) => (
                    <article
                      key={s.id}
                      onClick={() => onNavigate(`tinklarastis/${s.slug}`)}
                      className="group rounded-[20px] overflow-hidden border border-gray-200 bg-white shadow-md hover:-translate-y-[6px] hover:border-gray-300 transition-all flex-shrink-0 cursor-pointer flex flex-col"
                      style={{
                        flex: `0 0 ${100 / visibleSimilar}%`,
                        maxWidth: `${100 / visibleSimilar}%`,
                      }}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                        <img
                          src={getOptimizedImage(s.cover_image_url, 800)}
                          srcSet={`
                            ${getOptimizedImage(s.cover_image_url, 480)} 480w,
                            ${getOptimizedImage(s.cover_image_url, 768)} 768w,
                            ${getOptimizedImage(s.cover_image_url, 1200)} 1200w
                          `}
                          sizes="(max-width: 640px) 480px, (max-width: 1024px) 768px, 1200px"
                          alt={s.title}
                          width="800"
                          height="600"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent" />
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <h4 className="font-serif text-lg md:text-xl text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                          {s.title}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
                          {s.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-gray-900 font-semibold text-sm uppercase tracking-wide">
                            Skaityti
                          </span>
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Heart size={15} className="text-gray-400" />
                            <span>{s.like_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
