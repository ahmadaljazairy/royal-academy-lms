import { BrowserRouter } from 'react-router-dom';
import { BrandLogo } from '@/shared/components/ui';
export function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-canvas)]">
                <main className="w-full max-w-xl p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-slate-200/80">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-4">
                        <h1 className="text-xl font-bold text-[var(--color-secondary)]">
                            Configuration Smoke Test
                        </h1>
                        <p className="text-xs text-[var(--color-neutral)] mt-1">
                            Verifying Tailwind v4 theme tokens, path aliases, and brand assets.
                        </p>
                    </div>

                    {/* Logo Variations */}
                    <div className="space-y-6">
                        <section className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral)]">
                Default (Size: md, Linked)
              </span>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <BrandLogo />
                            </div>
                        </section>

                        <section className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral)]">
                Large (Size: lg, Linked)
              </span>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <BrandLogo size="lg" />
                            </div>
                        </section>

                        <section className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral)]">
                Emblem Only (Size: sm, Unlinked)
              </span>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <BrandLogo size="sm" showWordmark={false} disableLink />
                            </div>
                        </section>
                    </div>

                    {/* Palette Token Verification */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                        <span className="text-[var(--color-primary)]">● Primary Crimson</span>
                        <span className="text-[var(--color-secondary)]">● Secondary Navy</span>
                        <span className="text-[var(--color-neutral)]">● Neutral Slate</span>
                    </div>
                </main>
            </div>
        </BrowserRouter>
    );
}