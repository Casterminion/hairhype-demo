import { supabase } from '../supabase';
import type {
  Post,
  Comment,
  PostLike,
  PostWithStats,
  CreatePostInput,
  CreateCommentInput,
  CreateLikeInput,
} from '../types/blog';

export const blogService = {
  async getAllPosts(limit?: number): Promise<PostWithStats[]> {
    const query = supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (limit) {
      query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    const postsWithStats = await Promise.all(
      (data || []).map(async (post) => {
        const [likeCount, commentCount] = await Promise.all([
          this.getLikeCount(post.id),
          this.getCommentCount(post.id),
        ]);

        return {
          ...post,
          like_count: likeCount,
          comment_count: commentCount,
        };
      })
    );

    return postsWithStats;
  },

  async getFeaturedPosts(): Promise<PostWithStats[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;

    const postsWithStats = await Promise.all(
      (data || []).map(async (post) => {
        const [likeCount, commentCount] = await Promise.all([
          this.getLikeCount(post.id),
          this.getCommentCount(post.id),
        ]);

        return {
          ...post,
          like_count: likeCount,
          comment_count: commentCount,
        };
      })
    );

    return postsWithStats;
  },

  async getPostBySlug(slug: string): Promise<PostWithStats | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const [likeCount, commentCount] = await Promise.all([
      this.getLikeCount(data.id),
      this.getCommentCount(data.id),
    ]);

    return {
      ...data,
      like_count: likeCount,
      comment_count: commentCount,
    };
  },

  async getPostsByCategory(category: string, limit?: number): Promise<PostWithStats[]> {
    const query = supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (limit) {
      query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    const postsWithStats = await Promise.all(
      (data || []).map(async (post) => {
        const [likeCount, commentCount] = await Promise.all([
          this.getLikeCount(post.id),
          this.getCommentCount(post.id),
        ]);

        return {
          ...post,
          like_count: likeCount,
          comment_count: commentCount,
        };
      })
    );

    return postsWithStats;
  },

  async getSimilarPosts(postId: string, tags: string[], limit: number = 4): Promise<PostWithStats[]> {
    // Get all published posts except current one
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .neq('id', postId);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Score posts by number of shared tags
    const scoredPosts = data.map(post => {
      const postTags = post.tags || [];
      const sharedTags = postTags.filter((tag: string) => tags.includes(tag)).length;
      return { ...post, score: sharedTags };
    });

    // Sort by score (most shared tags first), then by date
    const sortedPosts = scoredPosts
      .filter(post => post.score > 0) // Only include posts with at least 1 shared tag
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, limit);

    // Add stats to similar posts
    const postsWithStats = await Promise.all(
      sortedPosts.map(async (post) => {
        const [likeCount, commentCount] = await Promise.all([
          this.getLikeCount(post.id),
          this.getCommentCount(post.id),
        ]);

        return {
          ...post,
          like_count: likeCount,
          comment_count: commentCount,
        };
      })
    );

    return postsWithStats;
  },

  async createPost(input: CreatePostInput): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePost(id: string, updates: Partial<CreatePostInput>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) throw error;
  },

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCommentCount(postId: string): Promise<number> {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('is_approved', true);

    if (error) throw error;
    return count || 0;
  },

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const commentData = { ...input, is_approved: true };

    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    if (!data || data.length === 0) {
      // If we can't read it back (RLS issue), return a constructed object
      return {
        id: '', // Will be generated by database
        ...commentData,
        created_at: new Date().toISOString()
      };
    }

    return data[0];
  },

  async addComment(postId: string, commentData: { author_name: string; author_email: string; body: string }): Promise<Comment> {
    return this.createComment({
      post_id: postId,
      ...commentData,
    });
  },

  async updateComment(
    id: string,
    updates: { body?: string; is_approved?: boolean }
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) throw error;
  },

  async getLikeCount(postId: string): Promise<number> {
    const { count, error } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count || 0;
  },

  async createLike(input: CreateLikeInput): Promise<PostLike> {
    const { data, error } = await supabase
      .from('post_likes')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLike(id: string): Promise<void> {
    const { error } = await supabase.from('post_likes').delete().eq('id', id);

    if (error) throw error;
  },

  async hasUserLikedPost(postId: string, ipAddress: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('ip_address', ipAddress)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async toggleLike(postId: string, ipAddress: string): Promise<{ liked: boolean; likeCount: number }> {
    const existingLike = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('ip_address', ipAddress)
      .maybeSingle();

    if (existingLike.data) {
      await supabase.from('post_likes').delete().eq('id', existingLike.data.id);
      const likeCount = await this.getLikeCount(postId);
      return { liked: false, likeCount };
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, ip_address: ipAddress }]);
      const likeCount = await this.getLikeCount(postId);
      return { liked: true, likeCount };
    }
  },

  async searchPosts(searchTerm: string): Promise<PostWithStats[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const postsWithStats = await Promise.all(
      (data || []).map(async (post) => {
        const [likeCount, commentCount] = await Promise.all([
          this.getLikeCount(post.id),
          this.getCommentCount(post.id),
        ]);

        return {
          ...post,
          like_count: likeCount,
          comment_count: commentCount,
        };
      })
    );

    return postsWithStats;
  },
};
