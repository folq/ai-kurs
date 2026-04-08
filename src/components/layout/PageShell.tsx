import { useRouter } from "next/router";
import { type ReactNode, useCallback } from "react";

type TabId = "workshop" | "oppgaver" | "teori";

interface PageShellProps {
  title: string;
  description: string;
  theory: ReactNode;
  tasks?: ReactNode;
  children: ReactNode;
  defaultTab?: TabId;
}

export function PageShell({
  title,
  description,
  theory,
  tasks,
  children,
  defaultTab = "workshop",
}: PageShellProps) {
  const router = useRouter();
  const rawTab = router.query.tab as string | undefined;
  const activeTab: TabId =
    rawTab === "teori" || rawTab === "oppgaver" ? rawTab : defaultTab;

  const setTab = useCallback(
    (tab: TabId) => {
      const query = { ...router.query };
      if (tab === defaultTab) {
        delete query.tab;
      } else {
        query.tab = tab;
      }
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    },
    [router, defaultTab],
  );

  const tabs: { id: TabId; label: string; content: ReactNode }[] = [
    { id: "workshop", label: "Workshop", content: children },
    ...(tasks != null
      ? [{ id: "oppgaver" as TabId, label: "Oppgaver", content: tasks }]
      : []),
    { id: "teori", label: "Teori", content: theory },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground max-w-2xl">{description}</p>
      </div>

      <div className="mb-6 flex gap-0 border-b-2 border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 text-sm font-medium transition-colors -mb-[2px] ${
              activeTab === t.id
                ? "border-b-2 border-primary text-teal-1200"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.find((t) => t.id === activeTab)?.content}
    </div>
  );
}
