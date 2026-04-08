export function StructuredOutputsTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Introduksjon</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Structured outputs lar deg tvinge en LLM til å returnere data i et
          bestemt format. Ved å bruke Zod-schemas kan du gå fra ustrukturert
          tekst til typet JSON — med garanti for at outputen matcher strukturen
          du definerer.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          Dette er spesielt nyttig når du trenger å hente ut spesifikke felter
          fra fritekst, for eksempel å analysere en filmanmeldelse og hente ut
          sentiment, score, og nøkkelpunkter som separate, typesikre verdier.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Konsepter</h2>
        <div className="bg-teal-50 rounded-lg p-5 space-y-2">
          <div className="text-sm leading-relaxed">
            <strong>Zod schemas</strong> — Definerer forventet datastruktur med
            typer, enums, arrays og valideringsregler.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Output.object()</strong> — Tvinger LLM til å følge et gitt
            schema. Outputen er garantert å matche.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Type safety</strong> — Outputen er typesikker i TypeScript.
            Ingen manuell parsing eller validering nødvendig.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Data extraction</strong> — Fra fritekst til strukturert
            data. Fungerer som en intelligent parser.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Discriminated union</strong> — Én felles nøkkel (f.eks.
            <code>type</code> eller <code>version</code>) bestemmer hvilke
            felter som finnes. Nyttig når én prompt kan gi ulike former på
            svaret.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Streaming structured output</strong> —{" "}
            <code>streamText</code> med <code>Output.object</code> bygger JSON
            gradvis. API-et strømmer NDJSON-linjer (<code>reasoning</code>,{" "}
            <code>text</code>, <code>finish</code> med bruk) slik at du kan vise
            provider-resonnering og ferdig strukturert resultat parallelt.
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
            <h3 className="font-semibold text-sm mb-1">1. Schema-safari</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Test alle fem schemaene med eksempel-inputen som fylles inn
              automatisk. Observer hvordan ulike schemas trekker ut helt
              forskjellige felter fra lignende tekst.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Schemaet bestemmer hva AI-en trekker ut — det styrer
              strukturen, ikke innholdet.
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
              2. Streaming vs full generering
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Analyser samme tekst med begge moduser. Observer forskjellen i
              opplevd hastighet. Prøv med en lang og en kort input. Når
              foretrekker du hvilken?
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Trade-off mellom UX (rask synlig respons) og
              datakomplett output.
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
              3. Discriminated union i praksis
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Test Content Classification-schemat med tre ulike input-typer: en
              filmanmeldelse, et handlingssammendrag, og et spørsmål. Observer
              at AI-en automatisk klassifiserer typen og tilpasser feltene. Prøv
              med tvetydige tekster — kan du lure den?
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Dynamiske schemas med discriminated unions; AI-en
              velger riktig &quot;gren&quot; basert på input.
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
              4. Lag et eget schema
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Design og implementer et nytt Zod-schema (f.eks. &quot;Actor
              Profile&quot; med navn, kjente roller, sjangre; eller &quot;Movie
              Comparison&quot; med to filmer og forskjeller). Det skal ha minst
              en <code className="bg-foreground/5 px-1 rounded">z.enum()</code>,
              et <code className="bg-foreground/5 px-1 rounded">z.array()</code>
              , og en{" "}
              <code className="bg-foreground/5 px-1 rounded">
                z.number().min().max()
              </code>
              . Registrer det i{" "}
              <code className="bg-foreground/5 px-1 rounded">schemas</code>
              -objektet med beskrivelse og eksempel-input.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Zod schema-design, registreringsmønstre, type safety i
              praksis.
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Fil:{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/lib/schemas.ts
              </code>
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
              5. Visuell schema-komponent
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Bygg en tilpasset visualisering for et av schemaene. Eksempler: et
              sentimentgauge (0–100) for Review Sentiment, en visuell
              aldersmerke-badge for Content Advisory, eller et radar-chart for
              Movie Analysis. Design og implementer komponenten slik at den
              brukes i output-visningen.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Komponentdesign, data-drevet UI, Tailwind-styling,
              samspill mellom schema og presentasjon.
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Filer: Ny komponent i{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/components/structured-outputs/
              </code>
              , koble til i{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/pages/structured-outputs.tsx
              </code>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
