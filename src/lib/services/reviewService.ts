import { supabase } from '../supabase';

export interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  created_at: string;
  published: boolean;
  source?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
}

export const reviewService = {
  async getLatestReviews(limit: number = 10): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest reviews:', error);
      return [];
    }

    return data || [];
  },

  async getOldestReviews(limit: number = 10): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching oldest reviews:', error);
      return [];
    }

    return data || [];
  },

  async getReviewStats(): Promise<ReviewStats> {
    const { data, error } = await supabase
      .rpc('get_review_stats');

    if (error) {
      console.error('Error fetching review stats:', error);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('published', true);

      if (fallbackError || !fallbackData) {
        return { average_rating: 0, total_reviews: 0 };
      }

      const total = fallbackData.length;
      const sum = fallbackData.reduce((acc, review) => acc + review.rating, 0);
      const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

      return {
        average_rating: average,
        total_reviews: total
      };
    }

    if (!data) {
      return { average_rating: 0, total_reviews: 0 };
    }

    return {
      average_rating: Number(data.average_rating) || 0,
      total_reviews: Number(data.total_reviews) || 0
    };
  },

  async submitReview(name: string, rating: number, reviewText: string, source: string = 'web'): Promise<boolean> {
    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          name: name.trim(),
          rating,
          review: reviewText.trim(),
          source,
          published: true
        }
      ]);

    if (error) {
      console.error('Error submitting review:', error);
      return false;
    }

    return true;
  }
};
