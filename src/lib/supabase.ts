/**
 * DEMO/CASE STUDY VERSION
 * This file provides a mock Supabase client that uses localStorage instead of a real database.
 * All connections to the actual Supabase service have been removed for privacy.
 *
 * Hardcoded admin credentials: admin@admin / admin
 */

// Mock data for the demo
const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Vyriškas kirpimas',
    price_eur: 20,
    duration_min: 30,
    description: 'Klasikinis vyriškas kirpimas su stilizavimu',
    is_active: true,
    sort_order: 1,
    slug: 'vyriskas-kirpimas'
  },
  {
    id: '2',
    name: 'Kirpimas + Barzda',
    price_eur: 35,
    duration_min: 60,
    description: 'Pilnas vyriškas kirpimas kartu su barzdos tvarkymu',
    is_active: true,
    sort_order: 2,
    slug: 'kirpimas-barzda'
  },
  {
    id: '3',
    name: 'Ilgų plaukų kirpimas',
    price_eur: 25,
    duration_min: 45,
    description: 'Profesionalus ilgų plaukų kirpimas ir stilizavimas',
    is_active: true,
    sort_order: 3,
    slug: 'ilgu-plauku-kirpimas'
  },
  {
    id: '4',
    name: 'Barzdos tvarkymas',
    price_eur: 15,
    duration_min: 20,
    description: 'Profesionalus barzdos formavimas ir tvarkymas',
    is_active: true,
    sort_order: 4,
    slug: 'barzdos-tvarkymas'
  }
];

const MOCK_REVIEWS = [
  {
    id: '1',
    name: 'Jonas',
    rating: 5,
    review: 'Puikus meistras! Labai profesionalus ir malonus aptarnavimas. Rekomenduoju visiems.',
    created_at: '2024-12-01T10:00:00Z',
    published: true,
    source: 'web'
  },
  {
    id: '2',
    name: 'Tomas',
    rating: 5,
    review: 'Geriausias kirpėjas mieste. Visada einu tik pas jį.',
    created_at: '2024-11-15T14:30:00Z',
    published: true,
    source: 'web'
  },
  {
    id: '3',
    name: 'Marius',
    rating: 5,
    review: 'Šauniai atrodau po kiekvieno vizito. Ačiū!',
    created_at: '2024-11-10T09:15:00Z',
    published: true,
    source: 'web'
  },
  {
    id: '4',
    name: 'Paulius',
    rating: 4,
    review: 'Labai patiko rezultatas. Geras kainos ir kokybės santykis.',
    created_at: '2024-10-28T16:45:00Z',
    published: true,
    source: 'web'
  },
  {
    id: '5',
    name: 'Andrius',
    rating: 5,
    review: 'Profesionalumas aukščiausio lygio. Rekomenduoju!',
    created_at: '2024-10-20T11:00:00Z',
    published: true,
    source: 'web'
  }
];

// Blog posts with copyright-free Unsplash images
const MOCK_POSTS = [
  {
    id: '1',
    title: 'Kaip prižiūrėti barzdą namie',
    slug: 'kaip-priziureti-barzda-namie',
    excerpt: 'Patarimai, kaip tinkamai prižiūrėti barzdą tarp vizitų pas kirpėją.',
    content: `<h2>Barzdos priežiūra namuose</h2>
<p>Barzdos priežiūra yra svarbi kasdienė rutina, kuri padeda išlaikyti sveiką ir tvarkingą barzdą.</p>
<h3>Pagrindiniai patarimai:</h3>
<ul>
<li>Plaukite barzdą 2-3 kartus per savaitę specialiu šampūnu</li>
<li>Naudokite barzdos aliejų kasdien</li>
<li>Šukuokite barzdą kiekvieną rytą</li>
<li>Reguliariai apkarpykite netvarkingus plaukelius</li>
</ul>
<p>Laikydamiesi šių paprastų taisyklių, jūsų barzda visada atrodys puikiai!</p>`,
    featured_image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    category: 'Patarimai',
    tags: ['barzda', 'priežiūra', 'patarimai'],
    is_published: true,
    featured: true,
    author: 'Hair Hype Junior',
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z'
  },
  {
    id: '2',
    title: '2024 metų vyriškų kirpimų tendencijos',
    slug: '2024-metu-vyrisku-kirpimu-tendencijos',
    excerpt: 'Populiariausios šukuosenos šiais metais - nuo klasikinių iki modernių stilių.',
    content: `<h2>Šių metų tendencijos</h2>
<p>2024 metai atnešė daug įdomių vyriškų šukuosenų tendencijų.</p>
<h3>Populiariausi stiliai:</h3>
<ul>
<li><strong>Fade kirpimas</strong> - klasika, kuri niekada neišeina iš mados</li>
<li><strong>Tekstūruotas crop</strong> - modernaus vyro pasirinkimas</li>
<li><strong>Pompadour</strong> - elegantiškas ir stilingas</li>
<li><strong>Undercut</strong> - drąsus ir išraiškingas</li>
</ul>
<p>Rinkitės stilių, kuris geriausiai atitinka jūsų gyvenimo būdą!</p>`,
    featured_image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    category: 'Tendencijos',
    tags: ['tendencijos', 'mada', 'kirpimas'],
    is_published: true,
    featured: true,
    author: 'Hair Hype Junior',
    created_at: '2024-11-15T14:00:00Z',
    updated_at: '2024-11-15T14:00:00Z'
  },
  {
    id: '3',
    title: 'Kaip išsirinkti tinkamą šukuoseną',
    slug: 'kaip-issirinkti-tinkama-sukuosena',
    excerpt: 'Vadovas, kaip išsirinkti šukuoseną pagal veido formą ir gyvenimo būdą.',
    content: `<h2>Šukuosenos pasirinkimas</h2>
<p>Tinkamos šukuosenos pasirinkimas priklauso nuo daugelio faktorių.</p>
<h3>Ką reikia įvertinti:</h3>
<ul>
<li><strong>Veido forma</strong> - ovali, apvali, kvadratinė ar pailga</li>
<li><strong>Plaukų tipas</strong> - tiesi, banguoti ar garbanoti</li>
<li><strong>Gyvenimo būdas</strong> - kiek laiko skiriate plaukų priežiūrai</li>
<li><strong>Profesija</strong> - formalus ar laisvas stilius</li>
</ul>
<p>Konsultuokitės su savo kirpėju - jis padės rasti geriausią variantą!</p>`,
    featured_image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    category: 'Patarimai',
    tags: ['patarimai', 'šukuosena', 'veido forma'],
    is_published: true,
    featured: false,
    author: 'Hair Hype Junior',
    created_at: '2024-11-10T09:00:00Z',
    updated_at: '2024-11-10T09:00:00Z'
  },
  {
    id: '4',
    title: 'Plaukų priežiūros pagrindai vyrams',
    slug: 'plauku-prieziuros-pagrindai-vyrams',
    excerpt: 'Svarbiausi patarimai, kaip tinkamai prižiūrėti plaukus kasdien.',
    content: `<h2>Plaukų priežiūra</h2>
<p>Sveiki ir gražūs plaukai prasideda nuo tinkamos priežiūros.</p>
<h3>Kasdienė rutina:</h3>
<ul>
<li>Plaukite plaukus 2-3 kartus per savaitę</li>
<li>Naudokite kondicionierių po plovimo</li>
<li>Venkite per karšto vandens</li>
<li>Reguliariai lankykitės pas kirpėją</li>
</ul>`,
    featured_image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    category: 'Patarimai',
    tags: ['plaukai', 'priežiūra', 'patarimai'],
    is_published: true,
    featured: false,
    author: 'Hair Hype Junior',
    created_at: '2024-11-05T11:00:00Z',
    updated_at: '2024-11-05T11:00:00Z'
  }
];

// Gallery images with copyright-free Unsplash barber/haircut images
const MOCK_GALLERY_IMAGES = [
  {
    id: '1',
    image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
    alt_text: 'Profesionalus barzdos tvarkymas',
    sort_order: 1,
    created_at: '2024-11-01T10:00:00Z'
  },
  {
    id: '2',
    image_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
    alt_text: 'Modernaus stiliaus kirpimas',
    sort_order: 2,
    created_at: '2024-11-02T10:00:00Z'
  },
  {
    id: '3',
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    alt_text: 'Klasikinis vyriškas kirpimas',
    sort_order: 3,
    created_at: '2024-11-03T10:00:00Z'
  },
  {
    id: '4',
    image_url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
    alt_text: 'Fade kirpimo technika',
    sort_order: 4,
    created_at: '2024-11-04T10:00:00Z'
  },
  {
    id: '5',
    image_url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=600&q=80',
    alt_text: 'Barber shop aplinka',
    sort_order: 5,
    created_at: '2024-11-05T10:00:00Z'
  },
  {
    id: '6',
    image_url: 'https://images.unsplash.com/photo-1634302086887-13b5281d6f51?auto=format&fit=crop&w=600&q=80',
    alt_text: 'Plaukų stilizavimas',
    sort_order: 6,
    created_at: '2024-11-06T10:00:00Z'
  },
  {
    id: '7',
    image_url: 'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&w=600&q=80',
    alt_text: 'Barzdos formavimas',
    sort_order: 7,
    created_at: '2024-11-07T10:00:00Z'
  },
  {
    id: '8',
    image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
    alt_text: 'Profesionali kirpykla',
    sort_order: 8,
    created_at: '2024-11-08T10:00:00Z'
  }
];

const MOCK_WORKING_HOURS = [
  { weekday: 1, start_time: '09:00', end_time: '18:00', is_active: true },
  { weekday: 2, start_time: '09:00', end_time: '18:00', is_active: true },
  { weekday: 3, start_time: '09:00', end_time: '18:00', is_active: true },
  { weekday: 4, start_time: '09:00', end_time: '18:00', is_active: true },
  { weekday: 5, start_time: '09:00', end_time: '18:00', is_active: true },
  { weekday: 6, start_time: '10:00', end_time: '15:00', is_active: true },
  { weekday: 0, start_time: '00:00', end_time: '00:00', is_active: false }
];

const MOCK_SETTINGS = {
  business_name: 'Hair Hype Junior',
  phone: '+370 600 00000',
  email: 'info@hairhypejunior.lt',
  address: 'Vilnius, Lietuva'
};

// Helper to get/set data from localStorage with fallback to mock data
function getLocalData<T>(key: string, defaultData: T): T {
  try {
    const stored = localStorage.getItem(`demo_${key}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage`);
  }
  return defaultData;
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`demo_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage`);
  }
}

// Chainable query builder that mimics Supabase's API
class MockQueryBuilder {
  private tableName: string;
  private filters: Array<{ field: string; operator: string; value: any }> = [];
  private orderByField: string | null = null;
  private orderAscending: boolean = true;
  private limitCount: number | null = null;
  private selectFields: string = '*';
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private isCount: boolean = false;
  private isHead: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = '*', options?: { count?: string; head?: boolean }) {
    this.selectFields = fields;
    if (options?.count === 'exact') {
      this.isCount = true;
    }
    if (options?.head) {
      this.isHead = true;
    }
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, operator: 'eq', value });
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push({ field, operator: 'neq', value });
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push({ field, operator: 'gte', value });
    return this;
  }

  lte(field: string, value: any) {
    this.filters.push({ field, operator: 'lte', value });
    return this;
  }

  lt(field: string, value: any) {
    this.filters.push({ field, operator: 'lt', value });
    return this;
  }

  gt(field: string, value: any) {
    this.filters.push({ field, operator: 'gt', value });
    return this;
  }

  or(conditions: string) {
    // Simplified OR handling - just pass through for demo
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderByField = field;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  private getData(): any[] {
    switch (this.tableName) {
      case 'services':
        return getLocalData('services', MOCK_SERVICES);
      case 'reviews':
        return getLocalData('reviews', MOCK_REVIEWS);
      case 'posts':
        return getLocalData('posts', MOCK_POSTS);
      case 'gallery_images':
        return getLocalData('gallery_images', MOCK_GALLERY_IMAGES);
      case 'working_hours':
        return getLocalData('working_hours', MOCK_WORKING_HOURS);
      case 'bookings':
        return getLocalData('bookings', []);
      case 'customers':
        return getLocalData('customers', []);
      case 'comments':
        return getLocalData('comments', []);
      case 'post_likes':
        return getLocalData('post_likes', []);
      case 'date_overrides':
        return getLocalData('date_overrides', []);
      case 'settings':
        return [getLocalData('settings', MOCK_SETTINGS)];
      case 'booking_logs':
        return getLocalData('booking_logs', []);
      default:
        return [];
    }
  }

  private applyFilters(data: any[]): any[] {
    return data.filter(item => {
      return this.filters.every(filter => {
        const fieldValue = item[filter.field];
        switch (filter.operator) {
          case 'eq':
            return fieldValue === filter.value;
          case 'neq':
            return fieldValue !== filter.value;
          case 'gte':
            return fieldValue >= filter.value;
          case 'lte':
            return fieldValue <= filter.value;
          case 'lt':
            return fieldValue < filter.value;
          case 'gt':
            return fieldValue > filter.value;
          default:
            return true;
        }
      });
    });
  }

  async then(resolve: (result: any) => void) {
    let data = this.getData();
    data = this.applyFilters(data);

    if (this.orderByField) {
      data = [...data].sort((a, b) => {
        const aVal = a[this.orderByField!];
        const bVal = b[this.orderByField!];
        if (aVal < bVal) return this.orderAscending ? -1 : 1;
        if (aVal > bVal) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount) {
      data = data.slice(0, this.limitCount);
    }

    if (this.isCount && this.isHead) {
      resolve({ count: data.length, error: null });
      return;
    }

    if (this.isSingle) {
      resolve({ data: data[0] || null, error: null });
      return;
    }

    if (this.isMaybeSingle) {
      resolve({ data: data[0] || null, error: null });
      return;
    }

    resolve({ data, error: null });
  }

  insert(records: any | any[]) {
    const data = this.getData();
    const newRecords = Array.isArray(records) ? records : [records];

    const recordsWithIds = newRecords.map(record => ({
      ...record,
      id: record.id || crypto.randomUUID(),
      created_at: record.created_at || new Date().toISOString()
    }));

    const updatedData = [...data, ...recordsWithIds];
    setLocalData(this.tableName, updatedData);

    return {
      select: (fields?: string) => ({
        single: () => Promise.resolve({ data: recordsWithIds[0], error: null }),
        then: (resolve: (result: any) => void) => resolve({ data: recordsWithIds, error: null })
      }),
      then: (resolve: (result: any) => void) => resolve({ data: recordsWithIds, error: null })
    };
  }

  update(updates: any) {
    const data = this.getData();
    let updated: any = null;

    const newData = data.map(item => {
      const matches = this.filters.every(filter => {
        if (filter.operator === 'eq') {
          return item[filter.field] === filter.value;
        }
        return true;
      });

      if (matches) {
        updated = { ...item, ...updates, updated_at: new Date().toISOString() };
        return updated;
      }
      return item;
    });

    setLocalData(this.tableName, newData);

    return {
      select: (fields?: string) => ({
        single: () => Promise.resolve({ data: updated, error: null }),
        then: (resolve: (result: any) => void) => resolve({ data: updated ? [updated] : [], error: null })
      }),
      eq: (field: string, value: any) => this,
      then: (resolve: (result: any) => void) => resolve({ data: updated, error: null })
    };
  }

  delete() {
    const data = this.getData();

    const newData = data.filter(item => {
      return !this.filters.every(filter => {
        if (filter.operator === 'eq') {
          return item[filter.field] === filter.value;
        }
        return true;
      });
    });

    setLocalData(this.tableName, newData);

    return {
      eq: (field: string, value: any) => {
        this.filters.push({ field, operator: 'eq', value });
        return this;
      },
      then: (resolve: (result: any) => void) => resolve({ data: null, error: null })
    };
  }

  upsert(records: any | any[]) {
    return this.insert(records);
  }
}

// Admin credentials: admin@admin / admin
const ADMIN_USER = {
  id: 'demo-admin-id',
  email: 'admin@admin',
  full_name: 'Demo Admin'
};

const DEMO_SESSION_TOKEN = 'demo-session-token-12345';

// Mock RPC functions
const rpcFunctions: Record<string, (params: any) => any> = {
  admin_login: (params: { p_email: string; p_password: string }) => {
    // Hardcoded credentials: admin@admin / admin
    if (params.p_email === 'admin@admin' && params.p_password === 'admin') {
      return {
        token: DEMO_SESSION_TOKEN,
        user_id: ADMIN_USER.id,
        email: ADMIN_USER.email,
        full_name: ADMIN_USER.full_name
      };
    }
    throw new Error('Neteisingas el. paštas arba slaptažodis');
  },

  verify_admin_session: (params: { p_token: string }) => {
    if (params.p_token === DEMO_SESSION_TOKEN) {
      return {
        user_id: ADMIN_USER.id,
        email: ADMIN_USER.email,
        full_name: ADMIN_USER.full_name,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    }
    return null;
  },

  admin_logout: () => {
    return { success: true };
  },

  get_review_stats: () => {
    const reviews = getLocalData('reviews', MOCK_REVIEWS);
    const publishedReviews = reviews.filter((r: any) => r.published);
    const totalReviews = publishedReviews.length;
    const sum = publishedReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    const averageRating = totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 0;

    return {
      average_rating: averageRating,
      total_reviews: totalReviews
    };
  },

  admin_add_gallery_image: (params: any) => {
    const images = getLocalData('gallery_images', MOCK_GALLERY_IMAGES);
    const newImage = {
      id: crypto.randomUUID(),
      image_url: params.p_image_url,
      alt_text: params.p_alt_text,
      sort_order: params.p_sort_order || images.length + 1,
      created_at: new Date().toISOString()
    };
    images.push(newImage);
    setLocalData('gallery_images', images);
    return { success: true };
  },

  admin_delete_gallery_image: (params: any) => {
    const images = getLocalData('gallery_images', MOCK_GALLERY_IMAGES);
    const filtered = images.filter((img: any) => img.id !== params.p_image_id);
    setLocalData('gallery_images', filtered);
    return { success: true };
  },

  admin_reorder_gallery_images: (params: any) => {
    return { success: true };
  },

  admin_update_service: (params: any) => {
    return { success: true };
  },

  admin_create_post: (params: any) => {
    return { success: true, post_id: crypto.randomUUID() };
  },

  admin_update_post: (params: any) => {
    return { success: true };
  },

  admin_delete_post: (params: any) => {
    return { success: true };
  },

  admin_cancel_booking: (params: any) => {
    return { success: true };
  },

  admin_reschedule_booking: (params: any) => {
    return { success: true };
  }
};

// Mock Supabase client - NEVER connects to real database
const supabase = {
  from: (tableName: string) => new MockQueryBuilder(tableName),

  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },

  storage: {
    from: (bucketName: string) => ({
      upload: async (path: string, file: Blob, options?: any) => {
        // Demo mode: pretend upload succeeded but don't actually store
        console.warn('[DEMO] Storage upload disabled in demo mode');
        return {
          data: null,
          error: { message: 'Nuotraukų įkėlimas išjungtas demo versijoje' }
        };
      },
      remove: async (paths: string[]) => {
        console.warn('[DEMO] Storage remove disabled in demo mode');
        return { data: null, error: null };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://placeholder.com/${path}` }
      }),
    }),
  },

  rpc: async (functionName: string, params?: any) => {
    const fn = rpcFunctions[functionName];
    if (fn) {
      try {
        const result = fn(params || {});
        return { data: result, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    }
    console.warn(`[DEMO] Unknown RPC function: ${functionName}`);
    return { data: null, error: { message: `Unknown RPC function: ${functionName}` } };
  },
};

console.log('🎭 DEMO MODE: Using mock Supabase client with localStorage');
console.log('📝 Admin credentials: admin@admin / admin');

export { supabase };
