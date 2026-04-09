export function AgentTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Hva er en agent?</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          De fleste kjenner LLM-er som avanserte tekstgeneratorer — du stiller
          et spørsmål og får et svar. En AI-agent tar dette et stort skritt
          videre: det er et system som fungerer som en{" "}
          <strong>autonom problemløser</strong>. Mens en vanlig chatbot
          forventer at du leder samtalen steg for steg, kan du gi en agent et
          overordnet mål. Agenten er i stand til å planlegge, bryte ned
          komplekse problemer i mindre deloppgaver, og jobbe seg systematisk
          gjennom dem.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          Men for at en AI faktisk skal kunne <em>gjøre</em> noe — og ikke bare
          tenke — trenger den tilgang til den virkelige verdenen. Den trenger
          armer og ben. Og det er her <strong>verktøy</strong> kommer inn.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Verktøy og tool calling</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          For at agenten skal kunne utføre faktiske handlinger, gir vi den
          tilgang til verktøy gjennom API-er. Dette kan være alt fra å søke på
          nettet, gjøre utregninger, eller hente informasjon fra en database.
          Mekanismen som gjør dette mulig kalles <strong>tool calling</strong>.
        </p>
        <div className="bg-teal-50 rounded-lg p-5 mt-4 space-y-3">
          <p className="text-sm font-medium">
            Tenk → Handle → Observer (agent-løkken)
          </p>
          <div className="text-sm leading-relaxed space-y-2">
            <div>
              <strong>1. Tenk</strong> — AI-en analyserer oppgaven og vurderer
              hva neste steg er.
            </div>
            <div>
              <strong>2. Handle</strong> — Hvis den mangler informasjon, kaller
              den et spesifikt verktøy. Verktøyet kjøres automatisk og
              returnerer et resultat.
            </div>
            <div>
              <strong>3. Observer</strong> — AI-en leser resultatet og vurderer:
              «Fikk jeg det jeg trengte, eller må jeg bruke et nytt verktøy?»
            </div>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">
            Denne syklusen gjentas automatisk helt til agenten har oppnådd målet
            ditt. Det er dette som kobler AI-ens språkforståelse direkte til
            våre egne systemer.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Viktige prinsipper</h2>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide mb-1">
              Sikkerhet — Human-in-the-loop
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Når en agent kan utføre handlinger, oppstår det risiko. Hvis AI-en
              kan slette data, sende e-poster eller utføre betalinger, må vi
              bygge inn sjekkpunkter der systemet pauser og ber om menneskelig
              godkjenning. Gi aldri en agent mer tilgang enn den absolutt
              trenger.
            </p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide mb-1">
              Presisjon — Klare instruksjoner
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              AI-en forstår ikke magisk hvordan systemene våre fungerer. Den er
              helt avhengig av tekstbeskrivelsene vi gir den. Hvis beskrivelsen
              av et verktøy er uklar, vil AI-en bruke det feil — eller ikke i
              det hele tatt. Krystallklare og detaljerte instruksjoner er
              nøkkelen til suksess.
            </p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide mb-1">
              Robusthet — Feilhåndtering
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Ting vil gå galt: API-er går ned, nettverk feiler, og noen ganger
              formaterer AI-en data feil. En god agent-løkke er robust — den
              krasjer ikke ved feil, men fanger opp feilmeldingen, sender den
              tilbake til AI-en, og lar den prøve på nytt.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">I denne workshopen</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Agenten her har tilgang til seks verktøy: søke filmer semantisk, hente
          detaljer, legge til og fjerne favoritter, liste favoritter, og finne
          lignende filmer. Den bestemmer selv hvilke verktøy den trenger for å
          svare på spørsmålet ditt — og du kan følge prosessen i sanntid.
        </p>
      </section>
    </div>
  );
}
