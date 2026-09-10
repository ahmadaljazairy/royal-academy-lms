import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { BrandLogo, Button } from '@/shared/components/ui';
import { ComponentTestPage } from '@/app/pages/ComponentTestPage';

function SmokeTestPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas">
            <main className="w-full max-w-xl p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-slate-200/80">
                {/* Header */}
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-secondary">
                            Configuration Smoke Test
                        </h1>
                        <p className="text-xs text-neutral mt-1">
                            Verifying Tailwind v4 theme tokens, path aliases, and brand assets.
                        </p>
                    </div>

                    <Link to="/test-components">
                        <Button size="sm" variant="outline">
                            UI Sandbox →
                        </Button>
                    </Link>
                </div>

                {/* Logo Variations */}
                <div className="space-y-6">
                    <section className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral">
              Default (Size: md, Linked)
            </span>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <BrandLogo />
                        </div>
                    </section>

                    <section className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral">
              Large (Size: lg, Linked)
            </span>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <BrandLogo size="lg" />
                        </div>
                    </section>

                    <section className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral">
              Emblem Only (Size: sm, Unlinked)
            </span>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <BrandLogo size="sm" showWordmark={false} disableLink />
                        </div>
                    </section>
                </div>

                {/* Palette Token Verification */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                    <span className="text-primary">● Primary Crimson</span>
                    <span className="text-secondary">● Secondary Navy</span>
                    <span className="text-neutral">● Neutral Slate</span>
                </div>
            </main>
        </div>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SmokeTestPage />} />
                <Route path="/test-components" element={<ComponentTestPage />} />
            </Routes>
        </BrowserRouter>
    );
}