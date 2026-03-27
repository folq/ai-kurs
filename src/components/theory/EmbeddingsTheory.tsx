export function EmbeddingsTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Introduksjon</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Embeddings er numeriske vektorer som fanger semantisk mening i tekst.
          Like konsepter gir like vektorer, noe som muliggjør søk basert på
          mening i stedet for nøkkelord.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          I denne workshopen sammenligner du semantisk søk (embeddings + cosine
          similarity) med tradisjonelt keyword-søk (SQL LIKE). Du vil se at
          embeddings forstår konsepter og stemning, selv når de eksakte ordene
          ikke matcher.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Konsepter</h2>
        <div className="bg-teal-50 rounded-lg p-5 space-y-2">
          <div className="text-sm leading-relaxed">
            <strong>Embeddings</strong> — Tekst representert som tall-vektorer.
            Hvert ord, setning eller dokument blir en punkt i et
            høy-dimensjonalt rom.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Cosine similarity</strong> — Måler likhet mellom to vektorer
            basert på vinkelen mellom dem. 1.0 = identisk, 0.0 = ingen likhet.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>sqlite-vec</strong> — SQLite-utvidelse for vektorsøk. Gjør
            KNN-søk (K nearest neighbors) direkte i databasen.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Semantisk vs keyword</strong> — Semantisk søk forstår
            mening. Keyword-søk krever eksakte ord. Begge har styrker i ulike
            situasjoner.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Oppgaver</h2>
        <div className="bg-card border border-border rounded-lg p-5">
          <ol className="list-decimal list-inside space-y-3 text-sm text-foreground/80">
            <li>Søk med naturlig språk og sammenlign semantisk vs keyword</li>
            <li>Endre scoring-funksjon og observer endringer</li>
            <li>Prøv søk der semantisk slår keyword, og omvendt</li>
            <li>
              Utforsk 3D-visualiseringen — se hvordan filmer grupperer seg
            </li>
            <li>Klikk på en film og se anbefalinger basert på vektornærhet</li>
            <li>Sammenlign anbefalinger med dine egne preferanser</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
