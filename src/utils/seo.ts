export interface SEOMetadata {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
}

export type SectionId = 'home' | 'apie' | 'paslaugos' | 'galerija' | 'tinklarastis' | 'atsiliepimai' | 'kontaktai';

export const sectionMetadata: Record<SectionId, SEOMetadata> = {
  home: {
    title: 'Kirpykla Kaune - Modernus Vyriškų Kirpimų Stilius | Hair Hype Junior',
    description: 'Modernus ir tikslus — paliekantis įspūdį, gar prieš pasisvekinant. Rezervuok vizitą Kaune: +370 631 72855',
    canonical: 'https://hairhypejunior.lt/',
    ogImage: 'https://hairhypejunior.lt/og-cover.jpg',
    ogType: 'website'
  },
  apie: {
    title: 'Apie Mane - Profesionalus Kirpėjas Kaune | Hair Hype Junior',
    description: 'Esu Marius - profesionalus barberis Kaune. Tikslus kirpimas, šukuosenų pritaikymas ir veidrodžio atspindžio gerinimas.',
    canonical: 'https://hairhypejunior.lt/#apie',
    ogImage: 'https://hairhypejunior.lt/og-cover.jpg',
    ogType: 'website'
  },
  paslaugos: {
    title: 'Kainorštis - Vyriški Kirpimai Kaune | Hair Hype Junior',
    description: 'Paslaugos, pritaikytos tavo stiliui ir veido bruožams. Kirpimai nuo 20€, barzdos kirpimas, veido formų konsultacijos Kaune.',
    canonical: 'https://hairhypejunior.lt/#paslaugos',
    ogImage: 'https://hairhypejunior.lt/og-cover.jpg',
    ogType: 'website'
  },
  galerija: {
    title: 'Kirpimų Galerija - Stilingi Vyriški Kirpimai | Hair Hype Junior Kaunas',
    description: 'Apžiūrėk mūsų atliktus darbus - modernūs vyriški kirpimai, barzdų priežiūra ir stilingi rezultatai Kaune.',
    canonical: 'https://hairhypejunior.lt/#galerija',
    ogImage: 'https://hairhypejunior.lt/og-cover.jpg',
    ogType: 'website'
  },
  tinklarastis: {
    title: 'Tinklaraštis - Kirpimų Patarimai ir Naujienos | Hair Hype Junior Kaunas',
    description: 'Skaityk straipsnius apie vyriškų kirpimų tendencijas, plaukų priežiūros patarimus ir stilių įkvėpimą iš profesionalaus kirpėjo Kaune.',
    canonical: 'https://hairhypejunior.lt/#tinklarastis',
    ogImage: 'https://hairhypejunior.lt/og-cover.jpg',
    ogType: 'website'
  },
  atsiliepimai: {
    title: 'Atsiliepimai - Klientų Patirtys Kaune | Hair Hype Junior',
    description: 'Skaityk tikrus klientų atsiliepimus apie vyriškų kirpimų paslaugas Kaune. 5.0/5 įvertinimas iš 15+ patenkintų klientų.',
    canonical: 'https://hairhypejunior.lt/#atsiliepimai',
    ogImage: 'https://hairhypejunior.lt/og-cover.jpg',
    ogType: 'website'
  },
  kontaktai: {
    title: 'Kontaktai - Rezervuok Vizitą Kaune | Hair Hype Junior',
    description: 'Sukilėlių pr. 72, Kaunas. Tel: +370 631 72855. Darbo laikas: 15:00-20:00. Rezervuok apsilankymą pas profesionalų kirpėją.',
    canonical: 'https://hairhypejunior.lt/#kontaktai',
    ogImage: 'https://hairhypejunior.lt/og-cover.jpg',
    ogType: 'website'
  }
};

export const updateMetaTags = (metadata: SEOMetadata) => {
  const baseUrl = 'https://hairhypejunior.lt';

  if (metadata.title) {
    document.title = metadata.title;
    updateMetaTag('property', 'og:title', metadata.title);
    updateMetaTag('name', 'twitter:title', metadata.title);
  }

  if (metadata.description) {
    updateMetaTag('name', 'description', metadata.description);
    updateMetaTag('property', 'og:description', metadata.description);
    updateMetaTag('name', 'twitter:description', metadata.description);
  }

  if (metadata.canonical) {
    updateLinkTag('canonical', metadata.canonical);
    updateMetaTag('property', 'og:url', metadata.canonical);
  }

  if (metadata.ogImage) {
    const imageUrl = metadata.ogImage.startsWith('http')
      ? metadata.ogImage
      : `${baseUrl}${metadata.ogImage}`;
    updateMetaTag('property', 'og:image', imageUrl);
    updateMetaTag('name', 'twitter:image', imageUrl);
  }

  if (metadata.ogType) {
    updateMetaTag('property', 'og:type', metadata.ogType);
  }

  if (metadata.article) {
    if (metadata.article.publishedTime) {
      updateMetaTag('property', 'article:published_time', metadata.article.publishedTime);
    }
    if (metadata.article.modifiedTime) {
      updateMetaTag('property', 'article:modified_time', metadata.article.modifiedTime);
    }
    if (metadata.article.author) {
      updateMetaTag('property', 'article:author', metadata.article.author);
    }
    if (metadata.article.tags) {
      metadata.article.tags.forEach(tag => {
        addMetaTag('property', 'article:tag', tag);
      });
    }
  }
};

const updateMetaTag = (attribute: string, attributeValue: string, content: string) => {
  let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const addMetaTag = (attribute: string, attributeValue: string, content: string) => {
  const element = document.createElement('meta');
  element.setAttribute(attribute, attributeValue);
  element.setAttribute('content', content);
  document.head.appendChild(element);
};

const updateLinkTag = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.href = href;
};

export const updateSectionMeta = (sectionId: SectionId) => {
  const metadata = sectionMetadata[sectionId];
  if (metadata) {
    updateMetaTags(metadata);
  }
};

export const resetMetaTags = () => {
  updateSectionMeta('home');
};
