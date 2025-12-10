import { useEffect } from 'react';
import { updateSectionMeta, type SectionId } from '../utils/seo';

export const useSectionSEO = () => {
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    let currentSection: SectionId = 'home';

    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id as SectionId;

          if (sectionId === 'pradzia') {
            currentSection = 'home';
          } else if (['apie', 'paslaugos', 'galerija', 'tinklarastis', 'atsiliepimai', 'kontaktai'].includes(sectionId)) {
            currentSection = sectionId as SectionId;
          }

          updateSectionMeta(currentSection);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);
};
