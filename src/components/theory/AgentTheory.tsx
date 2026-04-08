export function AgentTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Introduksjon</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          En agent er en LLM som kan bruke verktøy. I stedet for bare å generere
          tekst, kan den søke i databaser, administrere favoritter, og kombinere
          flere steg for å løse oppgaver.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          Agenten i denne workshopen har tilgang til seks verktøy: søke filmer
          semantisk, hente detaljer, legge til og fjerne favoritter, liste
          favoritter, og finne lignende filmer. Den bestemmer selv hvilke
          verktøy den trenger for å svare på spørsmålet ditt.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Konsepter</h2>
        <div className="bg-teal-50 rounded-lg p-5 space-y-2">
          <div className="text-sm leading-relaxed">
            <strong>Tool calling</strong> — LLM velger og kaller funksjoner
            basert på brukerens spørsmål. Den genererer argumenter som JSON.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Agent loop</strong> — Iterativ prosess: LLM tenker → kaller
            verktøy → leser resultat → tenker igjen → svarer (eller kaller flere
            verktøy).
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Multi-step</strong> — Komplekse oppgaver krever flere
            verktøykall i sekvens. Agenten planlegger og utfører steg for steg.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Tool composition</strong> — Kombinere verktøy kreativt. For
            eksempel: søk → hent detaljer → legg til favoritt, alt i én samtale.
          </div>
        </div>
      </section>

    </div>
  );
}
