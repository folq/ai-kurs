export function PromptingTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Introduksjon</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Prompting handler om hvordan du kommuniserer med en LLM.
          Systemprompten setter rollens rammer — den bestemmer hvordan AI-en
          oppfører seg, hvilken tone den bruker, og hva den fokuserer på.
          Parametere som temperatur og max tokens gir deg kontroll over
          kreativitet og lengde på svaret.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          I denne workshopen bruker vi en filmanbefalings-kontekst for å
          eksperimentere med ulike prompting-strategier. Du vil se hvordan små
          endringer i systemprompt eller parametere kan gi dramatisk
          forskjellige resultater.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Konsepter</h2>
        <div className="bg-teal-50 rounded-lg p-5 space-y-2">
          <div className="text-sm leading-relaxed">
            <strong>System prompt</strong> — Setter AI-ens rolle og oppførsel.
            Tenk på det som en stillingsbeskrivelse.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Temperatur</strong> — Lav (0.0–0.3) = forutsigbar og
            fokusert. Høy (0.8–2.0) = kreativ og variert. Standard er 0.7.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Max tokens</strong> — Begrenser lengden på svaret. Én token
            ≈ ¾ av et ord på engelsk.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Modellvalg</strong> — Ulike modeller har ulik styrke,
            hastighet og pris. Større modeller gir ofte bedre svar, men koster
            mer.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Oppgaver</h2>
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                UI
              </span>
              <span className="text-xs text-foreground/50">~5 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">
              1. Rolle-eksperiment
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Bytt mellom de fire prompt-presetene (Default Assistant, Film
              Critic, Spoiler-Free Guide, Genre Expert) med{" "}
              <em>samme spørsmål</em>. Observer hvordan AI-ens tone, detaljer og
              perspektiv endres.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: System prompts setter rammene for AI-ens oppførsel —
              som en stillingsbeskrivelse.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                UI
              </span>
              <span className="text-xs text-foreground/50">~10 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">2. Temperatur-lab</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Send samme spørsmål 3 ganger med temperatur 0.1, deretter 3 ganger
              med 1.5. Sammenlign variasjon og kreativitet mellom kjøringene.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Temperatur styrer tilfeldighet og kreativitet. Lav =
              forutsigbar, høy = variert.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                UI
              </span>
              <span className="text-xs text-foreground/50">~15 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">
              3. Jailbreak og forsvar
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Prøv å få AI-en til å bryte ut av sin rolle (f.eks. snakke om noe
              helt annet enn film). Deretter skriv en systemprompt som motstår
              angrepet. Test den igjen.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Prompt engineering for sikkerhet og guardrails.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Kode
              </span>
              <span className="text-xs text-foreground/50">~30 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">
              4. Ny prompt-preset
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Legg til en ny prompt-preset med en kreativ persona (f.eks.
              &quot;Filmhistoriker fra 1920-tallet&quot; eller
              &quot;Overdramatisk filmelsker&quot;). Legg den til i
              preset-listen og test at den fungerer i UI-et.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Hvordan systemprompter struktureres i kode;
              React-state og UI-komponenter.
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Hint: Presetene er definert som et array med {"{"} label, prompt{" "}
              {"}"} objekter i{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/pages/prompting.tsx
              </code>
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Kode
              </span>
              <span className="text-xs text-foreground/50">~45 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">
              5. Egendefinerte evalueringskriterier for LLM-dommer
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Utvid LLM-as-judge med et felt der brukeren skriver inn hva
              dommeren skal vurdere (f.eks. &quot;humor&quot;,
              &quot;nøyaktighet&quot;, &quot;kreativitet&quot;). Send kriteriene
              med i judge-prompten og vis dem i resultatet.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Prompt engineering for evaluering, API-design,
              skjema-UX.
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Filer:{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/components/prompting/JudgePanel.tsx
              </code>
              ,{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/app/api/prompting/judge/route.ts
              </code>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
