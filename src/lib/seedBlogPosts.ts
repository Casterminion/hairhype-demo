import { createClient } from '@supabase/supabase-js';
import type { CreatePostInput } from './types/blog';

const supabaseUrl =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_URL
    : process.env.VITE_SUPABASE_URL;

const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(
  supabaseUrl!,
  supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY!
);

const blogPosts: CreatePostInput[] = [
  {
    slug: 'kaip-issirinkti-tinkama-kirpima-pagal-veido-forma',
    title: 'Kaip išsirinkti tinkamą kirpimą pagal veido formą',
    excerpt: 'Tinkamas kirpimas gali kardinaliai pakeisti jūsų įvaizdį ir pabrėžti geriausias veido formos ypatybes.',
    category: 'styling_tips',
    reading_time_minutes: 5,
    cover_image_url: '/assets/img1.jpg',
    is_published: true,
    featured: true,
    content: `# Kaip išsirinkti tinkamą kirpimą pagal veido formą

Tinkamas kirpimas gali kardinaliai pakeisti jūsų įvaizdį ir pabrėžti geriausias veido formos ypatybes. Šiame straipsnyje papasakosime, kaip išsirinkti idealų kirpimą pagal jūsų veido formą.

## Ovalus veidas

Ovalus veidas laikomas universalia forma – jums tiks beveik bet koks kirpimas. Tai suteikia didžiausią laisvę eksperimentuoti su įvairiais stiliais.

Tačiau norint išlaikyti proporcijas, rekomenduojama vengti per ilgų kirpimų viršuje, kurie gali vizualiai pailginti veidą.

**Rekomenduojami kirpimai:**
- Klasikinis fade su tekstūruotu viršumi
- Pompadour stilius
- Šoninė šukuosena
- Undercut variantai

## Apvalus veidas

Apvaliam veidui reikia vizualiai sukurti ilgesnes linijas. Kirpimas su tūriu viršuje ir trumpesniais šonais puikiai tinka šiam tikslui.

Venkite per apvalių formų ir horizontalių linijų, kurios dar labiau pabrėžtų veido apvalumą.

**Rekomenduojami kirpimai:**
- Quiff su aukštu viršumi
- Faux hawk
- Vertikalus tekstūruotas kirpimas
- Pusiau ilgas kirpimas su tūriu

## Kvadratinis veidas

Kvadratiniam veidui reikia švelninti kampus ir stiprią žandikaulio liniją. Rekomenduojami kirpimai su minkštesnėmis linijomis ir tekstūra.

> "Geriausia strategija – sukurti tūrį viršuje ir švelninti šonus, išlaikant natūralų minkštumą."

**Rekomenduojami kirpimai:**
- Vidutinio ilgio kirpimas su bangomis
- Tekstūruotas crop
- Šoninė šukuosena su švelniais perėjimais
- Laisvas, natūralus stilius

## Trikampis veidas

Trikampiam veidui (plati kakta, siauras smakras) reikia sukurti balansą tarp viršutinės ir apatinės veido dalies.

Trumpesnis viršus ir šiek tiek ilgesni šonai padeda vizualiai subalansuoti proporcijas.

**Rekomenduojami kirpimai:**
- Klasikinis side part
- Trumpas tekstūruotas kirpimas
- Caesar cut
- Crop su švelniais perėjimais

## Praktiški patarimai

Renkantis kirpimą svarbu atsižvelgti ne tik į veido formą, bet ir į:

- Plaukų tipą ir struktūrą
- Gyvenimo būdą ir darbo specifiką
- Asmeninį stilių ir preferencijas
- Kasdienės priežiūros laiko kiekį

Geriausias būdas rasti idealų kirpimą – pasikonsultuoti su profesionaliu barberiu, kuris galės įvertinti visus šiuos faktorius ir pasiūlyti tinkamiausią variantą būtent jums.

## Išvada

Tinkamas kirpimas pagal veido formą gali iš esmės pakeisti jūsų išvaizdą. Neskubėkite – skirkite laiko aptarti su barberiu, kas labiausiai jums tiks, ir nebijokite eksperimentuoti!`,
  },
  {
    slug: 'barzdos-prieziuros-pagrindai-pradedantiesiems',
    title: 'Barzdos priežiūros pagrindai pradedantiesiems',
    excerpt: 'Norite leisti barzdą, bet nežinote nuo ko pradėti? Šis vadovas padės jums išvengti pagrindinių klaidų.',
    category: 'beard_care',
    reading_time_minutes: 6,
    cover_image_url: '/assets/img2.jpg',
    is_published: true,
    featured: false,
    content: `# Barzdos priežiūros pagrindai pradedantiesiems

Norite leisti barzdą, bet nežinote nuo ko pradėti? Šis vadovas padės jums išvengti pagrindinių klaidų ir užsiauginti sveiką, gražią barzdą.

## Augimo fazė

Pirmosios kelios savaitės yra sunkiausios. Barzda gali niežėti, atrodyti netaisyklinga, ir gali kilti pagunda visko atsisakyti.

**Svarbiausi patarimai augimo fazėje:**
- Leiskite barzdai augti bent 4-6 savaites prieš pradėdami formuoti
- Drėkinkite odą ir barzdą kasdien
- Naudokite barzdos aliejų nuo pirmos dienos
- Būkite kantrus – nelygi augimo fazė yra normali

## Kasdienė priežiūra

Sveika barzda reikalauja reguliarios priežiūros, panašiai kaip ir plaukai ant galvos.

**Kasdienė rutina:**
- Plaukite barzdą 2-3 kartus per savaitę specialiu šampūnu
- Kasdien naudokite barzdos aliejų arba balzamą
- Šukuokite barzdą barzdos šukuote arba šepečiu
- Formuokite ir kirpkite reguliariai

> "Sveika barzda prasideda nuo sveikos odos. Niekada nepraleiskite drėkinimo žingsnio!"

## Formavimas ir kirpimas

Reguliarus formavimas padeda barzdai atrodyti tvarkingai ir profesionaliai.

**Kas reikėtų formuoti:**
- Kaklo linija – turėtų būti apie 2 pirštus virš Adomo obuolio
- Skruostų linija – palaikykite natūralią liniją arba šiek tiek pakoreguokite
- Ūsai – reguliariai kirpkite, kad netrukdytų valgant
- Bendrą ilgį – išlaikykite norimą formą

## Produktai

Investavimas į kokybiškus produktus atsipirks sveika ir gražia barzda.

**Būtini produktai:**
- Barzdos šampūnas (ne paprastas plaukų šampūnas)
- Barzdos aliejus arba balzamas
- Barzdos šukuotė arba šepetys
- Žirklės arba trimeris formavimui

## Dažnos klaidos

Išvenkite šių populiariausių klaidų:

- Per dažnas plovimas (išplauna natūralius aliejus)
- Barzdos kirpimas per anksti augimo fazėje
- Kaklo linijos formuojimas per aukštai
- Produktų nenaudojimas
- Nereguliari priežiūra

## Profesionali pagalba

Net jei prižiūrite barzdą namuose, reguliarios vizitos pas barberį yra būtinos.

Profesionalas gali:
- Suformuoti taisyklingą formą
- Pataisyti klaidas
- Suteikti asmeninių patarimų
- Padėti palaikyti sveiką barzdą

Rekomenduojama lankyti barberį kas 4-6 savaites.

## Išvada

Barzdos augimas ir priežiūra reikalauja laiko ir kantrybės, bet rezultatas verta pastangų. Laikykitės šių pagrindinių principų, ir greitai turėsite barzdą, kuria galėsite didžiuotis!`,
  },
  {
    slug: 'kaip-issirinkti-tinkamus-plauku-produktus',
    title: 'Kaip išsirinkti tinkamus plaukų produktus',
    excerpt: 'Plaukų produktų rinka siūlo neįtikėtiną pasirinkimą. Sužinokite, kaip rasti produktus, kurie tiks būtent jums.',
    category: 'product_reviews',
    reading_time_minutes: 7,
    cover_image_url: '/assets/img3.jpg',
    is_published: true,
    featured: true,
    content: `# Kaip išsirinkti tinkamus plaukų produktus

Plaukų produktų rinka siūlo neįtikėtiną pasirinkimą. Sužinokite, kaip rasti produktus, kurie tiks būtent jums ir padės pasiekti norimą stilių.

## Plaukų tipų supratimas

Prieš renkantis produktus, svarbu suprasti savo plaukų tipą.

**Pagrindiniai plaukų tipai:**
- Tiesi plaukai – lengvai susitvarko, bet gali būti riebūs
- Bangu plaukai – turi natūralų tūrį, bet gali pūstis
- Garbanoti plaukai – reikia drėkinimo ir apibrėžimo
- Kirti plaukai – reikia daug drėkinimo ir priežiūros

## Plaukų produktų kategorijos

### Pomada

Pomada puikiai tinka klasikiniams, glotniais stiliais.

**Privalumai:**
- Stiprus laikymas
- Blizgus finišas
- Lengva perpildyti
- Tinka retikliams stilių

**Rekomenduojama:**
- Klasikinėms šukuosenoms
- Šoninėms dalims
- Pompadour stiliui

### Vaškas (Wax)

Vaškas suteikia vidutinį laikymą ir matinį finišą.

**Privalumai:**
- Natūralus išvaizda
- Lankstus laikymas
- Nesunkina plaukų
- Tinka tekstūruotiems stiliams

**Rekomenduojama:**
- Kasdieniam stiliui
- Tekstūruotiems kirpimams
- Natūraliam look

### Gelis

Gelis suteikia stiprų laikymą ir blizgų finišą.

**Privalumai:**
- Labai stiprus laikymas
- Blizgesys
- Lengva naudoti
- Geras drėgniems plaukams

**Rekomenduojama:**
- Šlapiems stiliams
- Formaliems įvykiams
- Labai stipriam laikymui

### Pasta/Molis (Clay)

Molis suteikia stiprų laikymą ir matinį finišą.

**Privalumai:**
- Matinis finišas
- Stiprus laikymas
- Suteikia tūrį
- Tinka šiek tiek riebiems plaukams

**Rekomenduojama:**
- Trumpiems kirpimams
- Matiniam stiliui
- Tekstūrai ir tūriui

## Kaip pasirinkti

Renkantis produktą, atsižvelkite į:

**1. Plaukų tipą**
- Ploni plaukai → lengvi produktai (vaškas, purškikliai)
- Stori plaukai → stipresni produktai (pomada, molis)

**2. Norimą stilių**
- Klasikinis → pomada
- Natūralus → vaškas
- Tekstūruotas → molis
- Labai struktūruotas → gelis

**3. Finišą**
- Blizgus → pomada, gelis
- Matinis → molis, vaškas
- Natūralus → vaškas, lengva pomada

**4. Laiko kiekį**
- Greitas stilius → pasta, vaškas
- Preciziškas stilius → pomada, gelis

## Naudojimo patarimai

> "Mažiau yra daugiau – pradėkite nuo mažo kiekio ir pridėkite daugiau jei reikia."

**Bendrieji patarimai:**
- Naudokite produktus ant šiek tiek drėgnų plaukų
- Šildykite produktą tarp delnų prieš naudojimą
- Pradėkite nuo mažo kiekio
- Paskirstykite tolygiai
- Stilizuokite kaip norite

## Kokybė vs Kaina

Investavimas į kokybiškus produktus atsipirks:

**Kokybiškorodukto privalumai:**
- Geresnė konsistencija
- Efektyvesnis naudojimas
- Sveikesni ingredientai
- Ilgesnis galiojimas
- Geresni rezultatai

Nors kokybiškesni produktai kainuoja daugiau, jie paprastai užtenka ilgesniam laikui ir suteikia geresnius rezultatus.

## Dažniausios klaidos

Išvenkite šių klaidų:

- Per daug produkto naudojimas
- Produkto naudojimas ant sausų plaukų
- Netinkamo produkto pasirinkimas
- Nepakankamas paskirstymas
- Produktų naudojimas ant nešvarių plaukų

## Išvada

Tinkamo plaukų produkto pasirinkimas gali kardinaliai pakeisti jūsų kasdienę rutiną ir stilių. Eksperimentuokite, klauskite patarimo pas savo barberį, ir netrukus rasite idealų produktą būtent jums!`,
  },
  {
    slug: '2025-metu-vyru-sukukosu-tendencijos',
    title: '2025 metų vyrų šukuosenų tendencijos',
    excerpt: 'Sužinokite, kokie kirpimai ir stiliai bus populiariausi ateinančiais metais.',
    category: 'trends',
    reading_time_minutes: 5,
    cover_image_url: '/assets/img4.jpg',
    is_published: true,
    featured: false,
    content: `# 2025 metų vyrų šukuosenų tendencijos

Sužinokite, kokie kirpimai ir stiliai bus populiariausi ateinančiais metais ir kaip juos integruoti į savo asmeninį stilių.

## Klasikos grįžimas

2025-aisiais matome stiprią klasikinių stilių grįžimą su šiuolaikiniais akcentais.

**Populiarūs klasikiniai stiliai:**
- Modernizuotas side part su tekstūra
- Gentleman's cut su šiuolaikišku fade
- Pompadour su minkštesnėmis linijomis
- Slicked back su natūralesniu finišu

## Tekstūra ir natūralumas

Pernelyg struktūruoti stiliai užleidžia vietą natūralesniam, tekstūruotam look.

**Raktiniai elementai:**
- Natūrali plaukų tekstūra
- Matinis finišas
- "Netyčinis" stilius
- Mažiau produkto, daugiau natūralumo

> "2025-aisiais triumfuoja natūralumas – stilius, kuris atrodo tarsi jo net nebandėte padaryti."

## Ilgesni kirpimai

Trumpų kirpimų dominacija mažėja, populiarėja vidutin ilgio ir ilgesni stiliai.

**Populiarūs ilgesni stiliai:**
- Pusiau ilgas kirpimas su tūriu
- Shaggy cuts
- Mullet variantai (modernus požiūris)
- Layers su judesiu

## Fade evoliucija

Fade kirpimai išlieka, bet evoliucionuoja:

**Naujos fade tendencijos:**
- Švelnesni perėjimai
- Aukštesni fade (high fade)
- Burst fade popularumas
- Temple fade variantai
- Skin fade su ilgesniu viršumi

## Barzdų ir kirpimų deriniai

Harmoningas barzdos ir kirpimo derinys tampa dar svarbesnis.

**Populiarūs deriniai:**
- Trumpas kirpimas + pilna barzda
- Vidutinis kirpimas + formuota barzda
- Ilgesnis kirpimas + ūsai
- Fade kirpimas + fade barzda

## Spalvos ir akcentai

Subtilūs spalvos akcentai tampa priimtinesni ir populiaresni.

**2025-ų spalvų tendencijos:**
- Natūralus blondinimas
- Subtilūs highlight'ai
- Silver/pilkos toninimas
- Natūralių spalvų pabrėžimas

## Nišiniai stiliai

Drąsesni vyrai renkasi išskirtinesnius stilius:

**Atsirandantys stiliai:**
- Modernus mullet
- Curtains (nukarę priekiniai plaukai)
- Shaggy textured crop
- 90-ųjų revival stiliai

## Priežiūra ir produktai

Drauge su stilių tendencijomis keičiasi ir priežiūros požiūris.

**2025-ų priežiūros tendencijos:**
- Natūralūs, organiški produktai
- Matiniai finišai
- Lengvesni, lankstesni produktai
- Daugiafunkciai produktai
- Skalpo priežiūra

## Personalumas

Svarbiausia 2025-ųjų tendencija – personalumas.

**Kodėl personalumas svarbu:**
- Stilius turi atspindėti jūsų asmenybę
- Nėra "vieno tinkamo" kirpimo
- Adaptavimas pagal gyvenimo būdą
- Individualumas virš masinio sekimo

## Kaip pasirinkti sau

Renkantis tendencijas, kurias norite išbandyti:

1. Konsultuokitės su profesionaliu barberiu
2. Atsižvelkite į savo veido formą
3. Pagalvokite apie priežiūros laiką
4. Pradėkite nuo subtilių pokyčių
5. Būkite autentiškas sau

## Išvada

2025-ieji žada įdomias ir įvairias stilių tendencijas. Nesvarbu, ar pasirinksite klasikinį side part, ar drąsų modernų mullet – svarbiausia, kad stilius atspindėtų jūsų asmenybę ir gyvenimo būdą.

Nebijokite eksperimentuoti ir rasti stilių, kuris padės jums jaustis užtikrintai ir patogiai!`,
  },
  {
    slug: 'profesionalus-skutimasis-namuose',
    title: 'Profesionalus skutimasis namuose',
    excerpt: 'Išmokite profesionalaus skutimosi technikos, kurią galite pritaikyti namuose kiekvieną dieną.',
    category: 'haircuts',
    reading_time_minutes: 6,
    cover_image_url: '/assets/img5.jpg',
    is_published: true,
    featured: true,
    content: `# Profesionalus skutimasis namuose

Išmokite profesionalaus skutimosi technikos, kurią galite pritaikyti namuose kiekvieną dieną ir pasiekti barber shop kokybės rezultatus.

## Pasiruošimas

Geras rezultatas prasideda nuo tinkamo pasiruošimo.

**Pasiruošimo žingsniai:**
1. Suminkštinkite plaukus šiltu vandeniu (2-3 minutės)
2. Naudokite pre-shave aliejų
3. Užtepkite kokybišką skutimosi kremą ar muilo
4. Palaukite 2-3 minutes, kad produktas įsigertų
5. Įsitikinkite, kad peiliukas yra aštrus

## Įrankiai

Investavimas į tinkamus įrankius atsipirks kokybe ir patogumuir.

**Būtini įrankiai:**
- Kokybiškas skutimosi peiliukas (safety razor arba cartridge)
- Skutimosi kremas ar muilas
- Skutimosi šepetėlis
- Pre-shave aliejus
- After-shave balzamas
- Alunitas (po skutimosi)

## Technika

### Peiliuko kampas

Tinkamas peiliuko kampas yra kritiškai svarbus.

**Safety razor:** Laikykite ~30 laipsnių kampu
**Cartridge:** Leidžiamas natūraliai prisitaikyti

### Skutimosi kryptis

> "Visada pirmasis praėjimas turi būti plaukų augimo kryptimi – tai sumažina dirginimą."

**Rekomenduojama tvarka:**
1. Pirmas praėjimas: plaukų augimo kryptimi (WTG - with the grain)
2. Antras praėjimas: skersai plaukų augimo (ATG - across the grain)
3. Trečias praėjimas (jei reikia): prieš plaukų augimą (ATG - against the grain)

### Spaudimas

Naudokite minimalų spaudimą – tegul peiliuko svoris atlieka darbą.

**Spaudimo taisyklės:**
- Per didelis spaudimas = įpjovimai ir dirginimas
- Per mažas spaudimas = neefektyvus skutimasis
- Tinkamas spaudimas = lengvas kontaktas

## Sunkios zonos

### Kaklas

Kaklas dažnai būna sudėtingiausia zona.

**Kaklo skutimosi patarimai:**
- Temkite odą laisva ranka
- Skutkite trumpais brūkšniais
- Būkite ypač atsargūs ties Adomo obuoliu
- Plaukų augimo kryptis gali skirtis skirtingose vietose

### Viršutinė lūpa

Viršutinė lūpa reikalauja precizišcumo.

**Patarimai:**
- Ištemkite viršutinę lūpą liežuviu iš vidaus
- Naudokite trumpus, kontroliuojamus brūkšnius
- Būkite ypač atsargūs

## Po skutimosi priežiūra

Tinkama priežiūra po skutimosi yra lygiai taip pat svarbi.

**Po skutimosi rutina:**
1. Nuskalaukite veidą šaltu vandeniu
2. Nusausinkite švelniai (netrinkite)
3. Naudokite alunitą užbaidyti infekcijas
4. Palaukite 1-2 minutes
5. Užtepkite after-shave balzamą
6. Drėkinkite odą

## Dažnos problemos ir sprendimai

### Dirginimas

**Priežastys:**
- Per didelis spaudimas
- Bukas peiliukas
- Netinkamas pasiruošimas
- Skutimasis prieš plaukų augimą per anksti

**Sprendimai:**
- Sumažinkite spaudimą
- Keiskite peiliukus dažniau
- Geriau pasiruoškite
- Praleskite trečią praėjimą

### Įjovimai

**Kaip išvengti:**
- Neskubėkite
- Naudokite aštrų peiliuką
- Temkite odą
- Skutkite trumpais brūkšniais
- Nespausti per stipriai

### Įaugę plaukai

**Prevencija:**
- Reguliarus pilingas
- Tinkama skutimosi kryptis
- Drėkinimas
- Švarus peiliukas

## Peiliuko priežiūra

Tinkama peiliuko priežiūra pratęsia jo gyvavimo laiką.

**Priežiūros patarimai:**
- Nuskalaukite peiliuką po kiekvieno brūkšnio
- Išvalykite kruopščiai po skutimosi
- Išdžiovinkite (nenubankite į rankšluostį)
- Saugokite sausoje vietoje
- Keiskite ašmenis reguliariai

## Safety Razor vs Cartridge

### Safety Razor

**Privalumai:**
- Pigesni ašmenys
- Artimesnis skutimasis
- Mažiau dirginimo (kai išmoksite)
- Ekologiškesnis

**Trūkumai:**
- Mokymosi kreivė
- Reikia daugiau laiko
- Didesnis įpjovimų rizika

### Cartridge

**Privalumai:**
- Lengviau naudoti
- Greičiau
- Saugiau pradedantiesiems

**Trūkumai:**
- Brangesni peiliukai
- Gali dirginti odą
- Mažiau ekologiškas

## Išvada

Profesionalaus skutimosi pasiekimas namuose reikalauja praktikos ir kantrybės. Pradėkite nuo pagrindų, investuokite į kokybišką įrangą, ir netrukus pasieksite rezultatus, kuriais galėsite didžiuotis.

Atminkite – nebijokite klaisti ir mokytis. Kiekvienas profesionalas kažkada buvo pradedantysis!`,
  },
];

export async function seedBlogPosts() {
  try {
    console.log('Starting to seed blog posts...');

    for (const post of blogPosts) {
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('slug', post.slug)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking post ${post.slug}:`, checkError);
        continue;
      }

      if (existing) {
        console.log(`Post ${post.slug} already exists, skipping...`);
        continue;
      }

      const { error: insertError } = await supabaseAdmin
        .from('posts')
        .insert([post]);

      if (insertError) {
        console.error(`Error inserting post ${post.slug}:`, insertError);
      } else {
        console.log(`Successfully seeded post: ${post.title}`);
      }
    }

    console.log('Blog posts seeding completed!');
  } catch (error) {
    console.error('Error seeding blog posts:', error);
  }
}
