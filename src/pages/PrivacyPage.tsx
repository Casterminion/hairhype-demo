import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF5FF]">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl py-24">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[#9333EA] hover:text-[#7E22CE] transition-colors text-sm font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={16} />
            Grįžti į pagrindinį
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-[#E9D5FF]">
          <h1 className="text-4xl md:text-5xl font-serif text-[#0C0C0C] mb-4">
            Privatumo politika
          </h1>

          <div className="mb-8 text-sm text-[#5A5A5A]">
            <p><strong>Įsigaliojimo data:</strong> 2025-11-12</p>
            <p><strong>Paskutinį kartą atnaujinta:</strong> 2025-11-14</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8 text-[#5A5A5A] leading-relaxed">
            <section>
              <p className="text-base">
                Ši Privatumo politika paaiškina, kaip Hair Hype Junior (toliau – „Valdytojas", „mes"),
                valdantis svetainę hairhypejunior.lt (toliau – „Svetainė"), renka, naudoja ir saugo Jūsų
                asmens duomenis. Duomenis tvarkome vadovaudamiesi BDAR (ES Bendruoju duomenų apsaugos reglamentu),
                Lietuvos Respublikos asmens duomenų teisinės apsaugos įstatymu ir kitais taikomais teisės aktais.
              </p>
            </section>

            <section className="bg-[#FAF5FF] p-6 rounded-lg border border-[#E9D5FF]">
              <h2 className="text-xl font-serif text-[#0C0C0C] mb-3">Kontaktai duomenų apsaugos klausimais</h2>
              <p className="mb-2"><strong>El. paštas:</strong> <a href="mailto:marius@hairhypejunior.lt" className="text-[#7E22CE] hover:underline">marius@hairhypejunior.lt</a></p>
              <p className="mb-2"><strong>Tel.:</strong> <a href="tel:+37063172855" className="text-[#7E22CE] hover:underline">+370 631 72855</a></p>
              <p><strong>Adresas:</strong> Sukilėlių pr. 72, Kaunas, 50108 Kauno m. sav.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">1. Sąvokos</h2>
              <p><strong>Asmens duomenys</strong> – bet kokia informacija apie identifikuotą ar identifikuojamą fizinį asmenį.</p>
              <p><strong>Tvarkymas</strong> – bet kuris su asmens duomenimis atliekamas veiksmas (rinkimas, saugojimas, perdavimas ir kt.).</p>
              <p><strong>Vartotojas / Klientas</strong> – asmuo, besinaudojantis Svetaine ar joje pateikęs duomenis.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">2. Kokius duomenis renkame</h2>

              <h3 className="text-xl font-serif text-[#0C0C0C] mb-3 mt-6">2.1. Naršant Svetainėje (automatiškai)</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP adresas, naršyklė, įrenginys, operacinė sistema, ekrano rezoliucija;</li>
                <li>apsilankymo laikas, peržiūrėti puslapiai, nuorodos;</li>
                <li>slapukų identifikatoriai (kai taikoma);</li>
                <li>serverio žurnalai (saugumui ir diagnostikai).</li>
              </ul>
              <p className="mt-3 text-sm"><em>Teisinis pagrindas:</em> teisėtas interesas užtikrinti Svetainės veikimą ir saugumą (BDAR 6(1)(f)); neprivalomiems slapukams – sutikimas (6(1)(a)).</p>

              <h3 className="text-xl font-serif text-[#0C0C0C] mb-3 mt-6">2.2. Rezervuojant vizitą</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>vardas, pavardė (arba slapyvardis, jei pateikiate);</li>
                <li>telefono numeris, el. paštas;</li>
                <li>pasirinkta paslauga, rezervacijos data ir laikas, pastabos;</li>
                <li>techninis rezervacijos ID.</li>
              </ul>
              <p className="mt-3 text-sm"><em>Teisinis pagrindas:</em> sutarties sudarymas ir vykdymas (6(1)(b)); teisėtas interesas tvarkyti užsakymus ir užkardyti piktnaudžiavimą (6(1)(f)); teisinių prievolių vykdymas (6(1)(c)), jei išrašomos sąskaitos.</p>

              <h3 className="text-xl font-serif text-[#0C0C0C] mb-3 mt-6">2.3. Priminimai ir komunikacija</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>rezervacijos patvirtinimai ir priminimai SMS / el. paštu;</li>
                <li>informacija apie pasikeitimus ar atšaukimą.</li>
              </ul>
              <p className="mt-3 text-sm"><em>Teisinis pagrindas:</em> teisėtas interesas mažinti neatvykimus ir užtikrinti aptarnavimą (6(1)(f)) arba sutikimas (6(1)(a)) – jei reikalaujama.</p>
              <p className="mt-2 text-sm"><strong>Atsisakymas:</strong> galite atsisakyti pranešimų parašę mums el. paštu, arba – jei tiekėjas palaiko – atsakę į SMS žinute „STOP".</p>

              <h3 className="text-xl font-serif text-[#0C0C0C] mb-3 mt-6">2.4. Atsiliepimai ir kontaktų forma</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>atsiliepimo tekstas, vardas / inicialai, vertinimas;</li>
                <li>Jūsų pateiktas žinutės turinys.</li>
              </ul>
              <p className="mt-3 text-sm"><em>Teisinis pagrindas:</em> sutarties vykdymas arba teisėtas interesas (6(1)(b)/(f)); viešai skelbiami atsiliepimai – su sutikimu (6(1)(a)).</p>

              <h3 className="text-xl font-serif text-[#0C0C0C] mb-3 mt-6">2.5. Administratoriaus paskyros (vidinis valdymas)</h3>
              <p>Prisijungimo el. paštas, sesijos identifikatoriai, audito žurnalai.</p>
              <p className="mt-2 text-sm"><em>Teisinis pagrindas:</em> teisėtas interesas (6(1)(f)).</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">3. Slapukai (Cookies) ir panašios technologijos</h2>
              <p className="mb-4">Svetainėje gali būti naudojami:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Būtini slapukai</strong> – svetainės veikimui (sesija, kalbos pasirinkimas).</li>
                <li><strong>Funkciniai</strong> – patogumui (pvz., prisiminimui).</li>
                <li><strong>Analitiniai</strong> – srauto ir turinio našumo matavimui (tik su sutikimu).</li>
                <li><strong>Rinkodaros / trečiųjų šalių</strong> – socialinėms integracijoms ar reklamai (tik su sutikimu).</li>
              </ul>
              <p className="mb-4"><strong>Jūsų pasirinkimai:</strong> neprivalomi slapukai įjungiami tik gavus sutikimą. Sutikimą galite bet kada pakeisti per „Slapukų nustatymai" valdiklį Svetainėje arba ištrinti slapukus naršyklės nustatymuose.</p>

              <div className="overflow-x-auto mt-6">
                <table className="min-w-full border border-[#E9D5FF] text-sm">
                  <thead className="bg-[#FAF5FF]">
                    <tr>
                      <th className="border border-[#E9D5FF] px-4 py-2 text-left">Pavadinimas</th>
                      <th className="border border-[#E9D5FF] px-4 py-2 text-left">Tipas</th>
                      <th className="border border-[#E9D5FF] px-4 py-2 text-left">Paskirtis</th>
                      <th className="border border-[#E9D5FF] px-4 py-2 text-left">Galiojimas</th>
                      <th className="border border-[#E9D5FF] px-4 py-2 text-left">Teikėjas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#E9D5FF] px-4 py-2">app_session</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Būtinas</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Sesijos palaikymas ir saugumas</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Sesija</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">hairhypejunior.lt</td>
                    </tr>
                    <tr>
                      <td className="border border-[#E9D5FF] px-4 py-2">cookie_consent</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Būtinas</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Įrašo slapukų pasirinkimus</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">6–12 mėn.</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">hairhypejunior.lt</td>
                    </tr>
                    <tr>
                      <td className="border border-[#E9D5FF] px-4 py-2">_ga, _ga_*</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Analitiniai</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Srauto statistika (GA4)</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">iki 24 mėn.</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Google</td>
                    </tr>
                    <tr>
                      <td className="border border-[#E9D5FF] px-4 py-2">_clck, _clsk</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Analitiniai</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">Sesijų analizė</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">iki 12 mėn.</td>
                      <td className="border border-[#E9D5FF] px-4 py-2">[Clarity/Clicky]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">4. Duomenų naudojimo tikslai</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>rezervacijų priėmimas ir valdymas;</li>
                <li>komunikacija ir priminimai (SMS / el. paštu);</li>
                <li>svetainės veikimas, saugumas ir patobulinimai;</li>
                <li>klientų aptarnavimas ir užklausų administravimas;</li>
                <li>teisinių prievolių (apskaitos ir kt.) vykdymas;</li>
                <li>analitika ir našumo matavimas (tik su sutikimu);</li>
                <li>rinkodara (tik su aiškiu sutikimu).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">5. Duomenų gavėjai (tvarkytojai)</h2>
              <p className="mb-4">Duomenis galime perduoti patikimiems paslaugų teikėjams (tvarkytojams) pagal BDAR 28 str., tik tiek, kiek būtina paslaugai suteikti:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Svetainės talpinimas / infrastruktūra:</strong> paslaugų teikėjas;</li>
                <li><strong>Duomenų bazė / rezervacijų sistema:</strong> Supabase EEA regionas;</li>
                <li><strong>SMS / el. pašto siuntimas:</strong> ClickSend;</li>
                <li><strong>Analitika:</strong> Google Analytics, Microsoft Clarity – tik su sutikimu;</li>
              </ul>
              <p className="mt-4">Taip pat duomenys gali būti teikiami valstybės institucijoms teisės aktų nustatytais atvejais.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">6. Duomenų perdavimas už EEE ribų</h2>
              <p>Jei paslaugų teikėjai yra už EEE, perdavimas atliekamas taikant Europos Komisijos standartines sutarčių sąlygas (SCC) ir kitas apsaugos priemones. Dėl detalių galite kreiptis aukščiau nurodytais kontaktais.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">7. Saugojimo terminai</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Rezervacijų duomenys</strong> – 3 metai po paskutinės rezervacijos, jei nėra ginčo / teisinių reikalavimų.</li>
                <li><strong>Apskaitos dokumentai</strong> – 10 metų (pagal teisės aktus).</li>
                <li><strong>Kontaktų formos užklausos</strong> – 12 mėn.</li>
                <li><strong>Atsiliepimai</strong> – kol publikuojami arba kol atšaukiamas sutikimas.</li>
                <li><strong>Serverio žurnalai</strong> – iki 12 mėn.</li>
                <li><strong>Slapukai</strong> – kaip nurodyta slapukų nustatymuose arba iki sutikimo atšaukimo.</li>
              </ul>
              <p className="mt-4">Kai duomenų nebereikia, juos saugiai ištriname arba anonimizuojame.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">8. Jūsų teisės</h2>
              <p className="mb-4">Pagal BDAR turite teisę:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>gauti patvirtinimą, ar tvarkome Jūsų duomenis, ir jų kopiją (prieiga);</li>
                <li>ištaisyti netikslius / neišsamius duomenis;</li>
                <li>ištrinti („teisė būti pamirštam"), jei taikoma;</li>
                <li>apriboti tvarkymą;</li>
                <li>perkelti duomenis;</li>
                <li>nesutikti su tvarkymu, kai jis grindžiamas teisėtu interesu;</li>
                <li>atšaukti sutikimą, kai tvarkymas grindžiamas sutikimu (pvz., analitiniai / rinkodaros slapukai).</li>
              </ul>
              <p className="mt-4">
                <strong>Kreipkitės:</strong> <a href="mailto:marius@hairhypejunior.lt" className="text-[#7E22CE] hover:underline">marius@hairhypejunior.lt</a>.
                Tapatybę galime paprašyti patvirtinti. Atsakysime per 1 mėn. (galime pratęsti dar 2 mėn., jei prašymas sudėtingas – Jus informuosime).
              </p>
              <p className="mt-4">
                Skundą galite teikti <strong>Valstybinei duomenų apsaugos inspekcijai:</strong> <a href="http://www.vdai.lrv.lt" target="_blank" rel="noopener noreferrer" className="text-[#7E22CE] hover:underline">www.vdai.lrv.lt</a>, <a href="mailto:ada@ada.lt" className="text-[#7E22CE] hover:underline">ada@ada.lt</a>, <a href="tel:+37052712804" className="text-[#7E22CE] hover:underline">(+370 5) 271 2804</a>, A. Juozapavičiaus g. 6, 09310 Vilnius.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">9. Saugumas</h2>
              <p>Taikome technines ir organizacines priemones: TLS šifravimą, prieigos kontrolę, žurnalus, atsargines kopijas, ribotą prieigą pagal būtinumą. Vis dėlto jokia internetinė sistema negali garantuoti absoliutaus saugumo.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">10. Vaikų privatumas</h2>
              <p>Paslaugos skirtos suaugusiems. Sąmoningai vaikų (iki 14 m.) duomenų nerenkame. Jei manote, kad vaikas pateikė duomenis be tėvų sutikimo, susisiekite – duomenis ištrinsime.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">11. Nuorodos į trečiąsias šalis</h2>
              <p>Svetainėje gali būti nuorodų į trečiųjų šalių svetaines ar socialinius tinklus (pvz., „Instagram"). Už jų privatumo praktiką neatsakome – perskaitykite jų privatumo politikas.</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">12. Politikos pakeitimai</h2>
              <p>Šią Privatumo politiką galime atnaujinti. Naujausia versija visada pateikiama Svetainėje, nurodant įsigaliojimo datą. Esminius pakeitimus pranešime aiškiau (pvz., pranešimu Svetainėje).</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">13. Slapukų valdymas – greita instrukcija</h2>
              <p className="mb-4">Spauskite „Slapukų nustatymai" ir pasirinkite, kuriems slapukams sutinkate.</p>
              <p className="mb-2"><strong>Naršyklėse galite ištrinti / blokuoti slapukus:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy & Security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-[#0C0C0C] mb-4">14. Kontaktai</h2>
              <div className="bg-[#FAF5FF] p-6 rounded-lg border border-[#E9D5FF]">
                <p className="font-semibold text-[#0C0C0C] mb-3">Hair Hype Junior</p>
                <p className="mb-2"><strong>Adresas:</strong> Sukilėlių pr. 72, Kaunas, 50108 Kauno m. sav.</p>
                <p className="mb-2"><strong>El. paštas:</strong> <a href="mailto:marius@hairhypejunior.lt" className="text-[#7E22CE] hover:underline">marius@hairhypejunior.lt</a></p>
                <p><strong>Tel.:</strong> <a href="tel:+37063172855" className="text-[#7E22CE] hover:underline">+370 631 72855</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
