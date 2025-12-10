import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Gallery from './components/Gallery';
import Blog from './components/Blog';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import BlogPost from './components/BlogPost';
import ReservationModal from './components/reservation/ReservationModal';
import { resetMetaTags } from './utils/seo';
import { useSectionSEO } from './hooks/useSectionSEO';

function App() {
  const [currentPage, setCurrentPage] = useState<{ type: 'home' | 'blog' | 'privacy'; slug?: string }>({ type: 'home' });
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  useSectionSEO();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('tinklarastis/')) {
        const slug = hash.replace('tinklarastis/', '');
        setCurrentPage({ type: 'blog', slug });
      } else if (hash === 'privatumas') {
        setCurrentPage({ type: 'privacy' });
        resetMetaTags();
      } else if (hash === 'rezervacija') {
        setCurrentPage({ type: 'home' });
        setIsReservationOpen(true);
        resetMetaTags();
      } else if (hash === 'tinklarastis') {
        setCurrentPage({ type: 'home' });
        resetMetaTags();
        setTimeout(() => {
          const blogSection = document.getElementById("tinklarastis");
          if (blogSection) {
            const headerOffset = 100;
            const elementPosition = blogSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }
        }, 150);
      } else {
        setCurrentPage({ type: 'home' });
        resetMetaTags();
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen">
      <Header isHidden={isReservationOpen} />
      <main>
        {currentPage.type === 'home' ? (
          <>
            <Hero onReservationClick={() => setIsReservationOpen(true)} />
            <About />
            <Services onReservationClick={() => setIsReservationOpen(true)} />
            <Gallery />
            <Blog onNavigate={(slug) => {
              window.location.hash = `tinklarastis/${slug}`;
            }} />
            <Reviews />
          </>
        ) : currentPage.type === 'privacy' ? (
          <PrivacyPage />
        ) : (
          <BlogPost
            slug={currentPage.slug}
            onNavigate={(target) => {
              if (target === 'home') {
                window.location.hash = '';
              } else if (target.startsWith('tinklarastis/')) {
                window.location.hash = target;
              }
            }}
          />
        )}
      </main>
      <Footer onReservationClick={() => setIsReservationOpen(true)} />
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => {
          setIsReservationOpen(false);
          window.location.hash = '';
        }}
      />
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF5FF] py-24">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => window.location.hash = ''}
            className="text-[#9333EA] hover:text-[#0C0C0C] transition-colors text-sm font-medium"
          >
            ← Grįžti
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
          <h1 className="text-4xl md:text-5xl font-serif text-[#0C0C0C] mb-8">
            Privatumo politika
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-[#5A5A5A]">
            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">Bendroji informacija</h2>
              <p>
                Šiame dokumente aprašoma, kaip Hair Hype Junior („mes", „mūsų") renka,
                naudoja ir saugo jūsų asmens duomenis, kai naudojatės mūsų paslaugomis
                ir rezervacijos sistema.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">Kokie duomenys renkami</h2>
              <p>Rezervuodami vizitą, renkame šiuos duomenis:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vardas</li>
                <li>Telefono numeris</li>
                <li>Pasirinktos paslaugos informacija</li>
                <li>Vizito data ir laikas</li>
                <li>Papildomos pastabos (jei pateikiama)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">Kaip naudojami duomenys</h2>
              <p>Jūsų duomenys naudojami šiais tikslais:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vizitų administravimas ir patvirtinimas</li>
                <li>Susisiekimas su jumis dėl vizito detalių</li>
                <li>Paslaugų kokybės gerinimas</li>
                <li>Statistikos ir analizės tikslais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">Duomenų apsauga</h2>
              <p>
                Mes naudojame šiuolaikines saugumo priemones, kad apsaugotume jūsų asmens duomenis
                nuo neteisėtos prieigos, pakeitimo ar atskleidimo. Jūsų duomenys saugomi saugiame
                serveryje ir prieinami tik įgaliotiems darbuotojams.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">Jūsų teisės</h2>
              <p>Turite teisę:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Susipažinti su savo asmens duomenimis</li>
                <li>Reikalauti ištaisyti neteisingus duomenis</li>
                <li>Reikalauti ištrinti savo duomenis</li>
                <li>Atšaukti sutikimą bet kuriuo metu</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">Kontaktai</h2>
              <p>
                Jei turite klausimų dėl privatumo politikos ar savo duomenų tvarkymo,
                susisiekite su mumis:
              </p>
              <p className="mt-2">
                <strong>Telefonas:</strong> +370 631 72855<br />
                <strong>Instagram:</strong> @hairhypejr<br />
                <strong>Adresas:</strong> Sukilėlių pr. 72, Kaunas, 50108
              </p>
            </section>

            <section>
              <p className="text-sm text-[#5A5A5A] mt-8">
                Paskutinį kartą atnaujinta: 2025 m. sausio mėn.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
