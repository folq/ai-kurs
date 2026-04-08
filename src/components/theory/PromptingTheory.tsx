export function PromptingTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Hva er prompting?</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Når du bruker en språkmodell (LLM) skriver du ikke kode den kjører —
          du <em>kommuniserer</em> med den. Prompten er hele konteksten modellen
          ser: systemprompt, brukermelding og eventuell samtalehistorikk. Små
          endringer i ordlyd kan gi dramatisk ulike resultater, og det er
          nettopp dette som gjør prompt engineering til et eget fagfelt.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">
          Systemprompt: AI-ens stillingsbeskrivelse
        </h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Systemprompten setter rammene for <em>hvem</em> modellen er,{" "}
          <em>hva</em> den skal gjøre og <em>hva den ikke skal</em> gjøre. I
          workshopen har vi fire ferdiglagde presets — «Standard assistent»,
          «Filmkritiker», «Spoilerfri guide» og «Sjangerekspert» — som viser
          hvordan identisk spørsmål gir helt forskjellige svar når rollen
          endres.
        </p>
        <div className="bg-teal-50 rounded-lg p-4 mt-3 space-y-1.5 text-sm text-foreground/80">
          <p>
            <strong>Tips for gode systemprompter:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Definer rolle og kompetanse tydelig</li>
            <li>Beskriv ønsket tone og format</li>
            <li>
              Sett eksplisitte begrensninger (f.eks. «aldri avslør spoilere»)
            </li>
          </ul>
        </div>
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-foreground/80">
            Her er noen eksempel prompts for de ulike presetene:
          </p>

          <div className="border border-border rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Standard assistent
            </p>
            <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
              <li>«Anbefal tre filmer for en koselig fredagskveld»</li>
              <li>«Hva bør jeg se hvis jeg likte Interstellar?»</li>
              <li>
                «Gi meg en blanding av ny og gammel film i thriller-sjangeren»
              </li>
            </ul>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Filmkritiker
            </p>
            <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
              <li>«Hva gjør Parasite til en viktig film?»</li>
              <li>
                «Sammenlign Christopher Nolans tidlige filmer med de nyeste»
              </li>
              <li>«Er Marvel-filmene god kinematografi?»</li>
            </ul>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Spoilerfri guide
            </p>
            <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
              <li>«Hva handler Severance om, uten å avsløre noe?»</li>
              <li>«Bør jeg se The Prestige? Ikke spoil slutten!»</li>
              <li>«Forklar premisset i Dark uten å røpe vendepunktene»</li>
            </ul>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Sjangerekspert
            </p>
            <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-5">
              <li>«Hva er de beste sci-fi-filmene fra 2000-tallet?»</li>
              <li>«Forklar forskjellen på slasher og psykologisk skrekk»</li>
              <li>
                «Jeg liker noir — finnes det moderne filmer i den stilen?»
              </li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-foreground/50 mt-3">
          Merk: Systemprompten er <em>ikke</em> en sikkerhetsmekanisme — brukere
          kan prøve å «bryte ut» av rollen (jailbreaking). Robuste guardrails
          krever flere lag.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">
          Parametere: temperatur og maks tokens
        </h2>
        <div className="bg-teal-50 rounded-lg p-4 space-y-3 text-sm text-foreground/80">
          <div>
            <strong>Temperatur</strong> (0.0 – 2.0) styrer tilfeldigheten i
            token-valg:
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>
                <strong>Lav (0.0–0.3):</strong> Deterministisk og forutsigbart —
                best for fakta, kode, klassifisering
              </li>
              <li>
                <strong>Høy (0.8–2.0):</strong> Kreativt og variert — best for
                brainstorming, kreativ tekst
              </li>
              <li>Standard ~0.7 er en vanlig balanse</li>
            </ul>
          </div>
          <div>
            <strong>Max tokens</strong> setter en øvre grense for svarlengde. Én
            token tilsvarer omtrent ¾ av et ord på engelsk. Kortere svar bruker
            færre tokens og koster mindre.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Modellvalg: avveininger</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Modeller varierer langs tre akser: <strong>kvalitet</strong>,{" "}
          <strong>hastighet</strong> og <strong>pris</strong>. I workshopen kan
          du bytte modell fritt:
        </p>
        <div className="bg-teal-50 rounded-lg p-4 mt-3 space-y-1.5 text-sm text-foreground/80">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Flaggskip</strong> (Claude Opus, GPT-5.4, Gemini Pro):
              Beste kvalitet, tregere, dyrest
            </li>
            <li>
              <strong>Mid-tier</strong> (Claude Sonnet, GPT-4o, Gemini Flash):
              God balanse for de fleste oppgaver
            </li>
            <li>
              <strong>Lette</strong> (Claude Haiku, GPT-4o mini, Flash Lite):
              Raskest og billigst — ofte godt nok
            </li>
            <li>
              <strong>Reasoning</strong> (DeepSeek R1): Tenker steg-for-steg,
              synlig i «reasoning tokens»
            </li>
          </ul>
        </div>
        <p className="text-xs text-foreground/50 mt-3">
          Pris er per million tokens og ulik for input vs. output. Prisforskjell
          mellom billigste og dyreste modell kan være over 100×.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">
          Modellsammenligning og LLM-as-judge
        </h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          I Modellsammenligning-fanen sender du <em>samme prompt</em> til 2–4
          modeller parallelt og ser forskjeller i stil, lengde, nøyaktighet og
          token-bruk side om side.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-2">
          <strong>LLM-as-judge</strong> lar deg deretter la en modell vurdere og
          rangere svarene fra de andre. Dette mønsteret brukes i praksis til
          evaluering, A/B-testing av prompter og kvalitetssikring. Husk at
          dommeren også har sine egne biaser — velg en sterk modell som judge.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Tokens og kostnad</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Alt som sendes til og fra modellen telles i <strong>tokens</strong>:
          input (prompt + samtalehistorikk), output (svaret) og eventuelt
          reasoning-tokens for modeller som tenker steg-for-steg.
        </p>
        <div className="bg-teal-50 rounded-lg p-4 mt-3 space-y-1.5 text-sm text-foreground/80">
          <ul className="list-disc pl-5 space-y-1">
            <li>I appen vises input-, output- og reasoning-tokens per svar</li>
            <li>Estimert pris vises i NOK per melding</li>
            <li>
              Lengre samtaler = mer input-tokens, fordi hele historikken sendes
              hver gang
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
