import type { ReactNode } from "react";

type AdminGateProps = {
  allowed: boolean;
  reason: string;
  children: ReactNode;
};

export function AdminGate({ allowed, reason, children }: AdminGateProps) {
  if (!allowed) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Developer tools</div>
        <h1 className="mt-2 text-lg font-black text-stone-950">Disabled</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{reason}</p>
      </section>
    );
  }

  return <>{children}</>;
}
