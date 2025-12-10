export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  featured: boolean;
  tags?: string[];
  text_color?: string;
  heading_color?: string;
  accent_color?: string;
  background_style?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  body: string;
  created_at: string;
  is_approved: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  created_at: string;
  ip_address?: string | null;
}

export interface PostWithStats extends Post {
  like_count?: number;
  comment_count?: number;
}

export interface CreatePostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  reading_time_minutes: number;
  is_published?: boolean;
  featured?: boolean;
  tags?: string[];
}

export interface CreateCommentInput {
  post_id: string;
  author_name: string;
  author_email: string;
  body: string;
}

export interface CreateLikeInput {
  post_id: string;
  ip_address?: string;
}

export type PostCategory =
  | 'haircuts'
  | 'beard_care'
  | 'styling_tips'
  | 'product_reviews'
  | 'trends';
