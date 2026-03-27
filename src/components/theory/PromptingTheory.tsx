export function PromptingTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Introduksjon</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Prompting handler om hvordan du kommuniserer med en LLM. Systemprompten
          setter rollens rammer — den bestemmer hvordan AI-en oppfører seg, hvilken
          tone den bruker, og hva den fokuserer på. Parametere som temperatur og max
          tokens gir deg kontroll over kreativitet og lengde på svaret.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          I denne workshopen bruker vi en filmanbefalings-kontekst for å eksperimentere
          med ulike prompting-strategier. Du vil se hvordan små endringer i
          systemprompt eller parametere kan gi dramatisk forskjellige resultater.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Konsepter</h2>
        <div className="bg-teal-50 rounded-lg p-5 space-y-2">
          <div className="text-sm leading-relaxed">
            <strong>System prompt</strong> — Setter AI-ens rolle og oppførsel. Tenk på
            det som en stillingsbeskrivelse.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Temperatur</strong> — Lav (0.0–0.3) = forutsigbar og fokusert. Høy
            (0.8–2.0) = kreativ og variert. Standard er 0.7.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Max tokens</strong> — Begrenser lengden på svaret. Én token ≈ ¾ av
            et ord på engelsk.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Modellvalg</strong> — Ulike modeller har ulik styrke, hastighet og
            pris. Større modeller gir ofte bedre svar, men koster mer.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Oppgaver</h2>
        <div className="bg-card border border-border rounded-lg p-5">
          <ol className="list-decimal list-inside space-y-3 text-sm text-foreground/80">
            <li>Endre prompten og observer hvordan svaret endres</li>
            <li>Juster temperatur — sammenlign lav (0.1) vs høy (1.5)</li>
            <li>Prøv å jailbreake AI-en</li>
            <li>Endre prompten til å motstå jailbreaking</li>
            <li>Bytt modell og se forskjellen i kvalitet og hastighet</li>
            <li>Sammenlign modeller — hvilken synes du var best?</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
