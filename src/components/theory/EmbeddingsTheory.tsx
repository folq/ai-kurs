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
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                UI
              </span>
              <span className="text-xs text-foreground/50">~5 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">
              1. Semantisk magi
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Søk etter &quot;filmer om ensomhet i verdensrommet&quot; og
              sammenlign semantisk vs keyword-resultater. Observer at semantisk
              finner relevante filmer selv uten eksakte ordmatcher, mens keyword
              kan komme tomhendt tilbake.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Semantisk søk forstår mening, ikke bare ord.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                UI
              </span>
              <span className="text-xs text-foreground/50">~10 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">
              2. Finn grensene
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Prøv søk der keyword slår semantisk (f.eks. eksakt tittel,
              spesifikke årstall). Finn minst ett eksempel av hvert. Skriv ned:
              når er hvilken metode best?
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Begge tilnærminger har styrker; hybrid er ofte best i
              praksis.
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
              3. 3D-utforskning og anbefalinger
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Bruk 3D-visualiseringen til å identifisere klynger av filmer.
              Klikk på filmer i ulike deler av rommet og observer anbefalingene.
              Stemmer klyngene med sjanger, eller fanger de noe dypere?
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Embeddings fanger semantiske relasjoner som går utover
              sjanger — tematikk, tone, målgruppe.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Kode
              </span>
              <span className="text-xs text-foreground/50">~45 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">4. Hybrid-søk</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Implementer en hybrid-søkemodus som kombinerer semantic score og
              keyword-match til en samlet ranking. Legg til en tredje kolonne
              eller en toggle i søke-UI-et. Bruk en vektet formel (f.eks.{" "}
              <code className="bg-foreground/5 px-1 rounded">
                0.7 * semantic + 0.3 * keyword
              </code>
              ).
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Søke-ranking-algoritmer, API-utvidelse, kombinering av
              signaler.
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Filer:{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/pages/api/embeddings/search.ts
              </code>{" "}
              for backend,{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/pages/embeddings.tsx
              </code>{" "}
              for UI
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Kode
              </span>
              <span className="text-xs text-foreground/50">~60 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">
              5. Anbefalingsforklaring
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Bygg en &quot;Hvorfor denne anbefalingen?&quot;-komponent som
              vises når man klikker en anbefalt film. Bruk structured outputs (
              <code className="bg-foreground/5 px-1 rounded">
                generateObject
              </code>{" "}
              med et Zod-schema) til å generere en forklaring av likheten —
              felles temaer, lignende stemning, overlappende sjangre.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Kombinere AI-features (embeddings + structured
              outputs), komponent-komposisjon, UX-design.
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Filer: Ny komponent i{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/components/embeddings/
              </code>
              , nytt schema i{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/lib/schemas.ts
              </code>
              , ny API-route eller utvid{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/pages/api/embeddings/similar.ts
              </code>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
