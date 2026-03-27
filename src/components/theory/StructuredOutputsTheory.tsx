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
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Oppgaver</h2>
        <div className="bg-card border border-border rounded-lg p-5">
          <ol className="list-decimal list-inside space-y-3 text-sm text-foreground/80">
            <li>
              Inkluder forskjellige datatyper i schema, se output endre seg
            </li>
            <li>Sammenlign generering av hele objektet vs streaming</li>
            <li>Lag et nytt schema fra scratch (eksempler gitt)</li>
            <li>Vis det frem for sidemannen</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
