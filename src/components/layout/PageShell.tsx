import { useRouter } from "next/router";
import { type ReactNode, useCallback } from "react";

interface PageShellProps {
  title: string;
  description: string;
  theory: ReactNode;
  children: ReactNode;
  defaultTab?: "teori" | "workshop";
}

export function PageShell({
  title,
  description,
  theory,
  children,
  defaultTab = "workshop",
}: PageShellProps) {
  const router = useRouter();
  const activeTab =
    (router.query.tab as string) === "teori" ? "teori" : defaultTab;

  const setTab = useCallback(
    (tab: "teori" | "workshop") => {
      const query = { ...router.query };
      if (tab === "teori") {
        query.tab = "teori";
      } else {
        delete query.tab;
      }
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground max-w-2xl">{description}</p>
      </div>

      <div className="mb-6 flex gap-0 border-b-2 border-border">
        <button
          type="button"
          onClick={() => setTab("teori")}
          className={`px-5 py-2 text-sm font-medium transition-colors -mb-[2px] ${
            activeTab === "teori"
              ? "border-b-2 border-primary text-teal-1200"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Teori
        </button>
        <button
          type="button"
          onClick={() => setTab("workshop")}
          className={`px-5 py-2 text-sm font-medium transition-colors -mb-[2px] ${
            activeTab === "workshop"
              ? "border-b-2 border-primary text-teal-1200"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Workshop
        </button>
      </div>

      {activeTab === "teori" ? theory : children}
    </div>
  );
}
