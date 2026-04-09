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
            gradvis. API-et strømmer SSE-events (<code>reasoning</code>,{" "}
            <code>text-delta</code>, <code>finish</code> med bruk) slik at du
            kan vise provider-resonnering og ferdig strukturert resultat
            parallelt.
          </div>
        </div>
      </section>
    </div>
  );
}
