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
              1. Enkel verktøybruk
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Be agenten: &quot;Finn sci-fi-filmer med høy rating og legg til
              den beste i favoritter.&quot; Observer hvilke verktøy den velger og
              i hvilken rekkefølge. Klikk på verktøykortene for å se argumenter
              og resultater.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Agenter velger verktøy basert på intensjon — de
              planlegger og handler.
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
              2. Multi-step utfordring
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Gi en kompleks oppgave som krever flere verktøy i sekvens:
              &quot;Se på favorittene mine, finn filmer som ligner på den best
              ratede favoritten, og anbefal noe jeg ikke har sett.&quot; Observer
              agent-loopen steg for steg.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Multi-step reasoning og tool composition — agenten
              bygger en plan.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                UI
              </span>
              <span className="text-xs text-foreground/50">~15 min</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">3. Modellkamp</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Kjør samme komplekse oppgave med 2–3 ulike modeller (f.eks.
              GPT-4o-mini, Claude Sonnet, Gemini Flash). Sammenlign: antall
              verktøykall, kvalitet på valg, og sluttresultat. Hvilken modell er
              best som agent?
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Modellers evne til verktøybruk varierer — større er
              ikke alltid bedre.
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
              4. Nytt agent-verktøy
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Implementer et nytt verktøy{" "}
              <code className="bg-foreground/5 px-1 rounded">
                getMoviesByGenre
              </code>{" "}
              som filtrerer filmer fra databasen basert på sjanger (SQL{" "}
              <code className="bg-foreground/5 px-1 rounded">LIKE</code>-søk).
              Gi det en god{" "}
              <code className="bg-foreground/5 px-1 rounded">description</code>{" "}
              — agenten bruker beskrivelsen til å velge verktøy. Registrer det
              og test at agenten faktisk bruker det.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: Tool-design (beskrivelser er avgjørende!), Zod
              input-schemas, SQL-spørringer.
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Fil:{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/lib/agent-tools.ts
              </code>
              . Tips: Prøv å gi verktøyet en dårlig beskrivelse og se hva som
              skjer.
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
              5. Verktøybruk-dashboard
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Bygg en visuell oversikt over agentens verktøybruk i samtalen:
              antall kall per verktøy, rekkefølgen de ble kalt i, og eventuell
              feilhåndtering. Vis den i sidebaren ved siden av favorittlisten.
              Design den slik at den hjelper utviklere å forstå og debugge
              agentens oppførsel.
            </p>
            <p className="text-xs text-foreground/50 mt-2 italic">
              Læringsmål: State management, data-ekstraksjon fra
              chat-meldinger, visuell design for utviklerverktøy.
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              Filer: Ny komponent, koble til i{" "}
              <code className="bg-foreground/5 px-1 rounded">
                src/pages/agent.tsx
              </code>{" "}
              sidebaren
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
