import { Link } from 'react-router-dom';
import { BrandLogo, Button } from '@/shared/components/ui';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-primary selection:text-white">
            {/* 1. Header Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                    <BrandLogo size="md" />

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <span className="relative text-primary font-semibold cursor-pointer">
              Home
              <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-primary rounded-full" />
            </span>
                        <a href="#courses" className="hover:text-slate-900 transition-colors">
                            Courses
                        </a>
                        <a href="#certifications" className="hover:text-slate-900 transition-colors">
                            Certifications
                        </a>
                        <a href="#vision" className="hover:text-slate-900 transition-colors">
                            Vision
                        </a>
                        <a href="#reviews" className="hover:text-slate-900 transition-colors">
                            Reviews
                        </a>
                    </nav>

                    {/* Auth CTAs */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors px-2 py-1"
                        >
                            Login
                        </Link>
                        <Link to="/register">
                            <Button size="sm" className="rounded-full px-5">
                                Register
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 2. Hero Section */}
            <main className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
                {/* Subtle Ambient Background Gradients */}
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-250 h-112.5 bg-linear-to-b from-red-50/50 via-rose-50/20 to-transparent rounded-full blur-3xl -z-10" />

                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">

                        {/* Left Content Column */}
                        <div className="space-y-8 lg:col-span-6 xl:col-span-5">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full bg-red-50/80 px-3.5 py-1.5 text-xs font-semibold text-primary border border-red-100/60">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                Leading Education Platform
                            </div>

                            {/* Display Headline */}
                            <h1
                                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-950 leading-[1.08]"
                                style={{ fontFamily: 'var(--font-headline)' }}
                            >
                                Transform Your Future<span className="text-primary">.</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
                                Empowering professionals with international certifications and industry-leading training programs designed for the global market.
                            </p>

                            {/* Numeric Proof Points */}
                            <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-6 sm:gap-8">
                                <div>
                                    <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                                        5000+
                                    </div>
                                    <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                                        Active Students
                                    </div>
                                </div>

                                <div>
                                    <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                                        25+
                                    </div>
                                    <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                                        Courses
                                    </div>
                                </div>

                                <div>
                                    <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                                        95%
                                    </div>
                                    <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                                        Satisfaction
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Hero Visual Stack */}
                        <div className="relative lg:col-span-6 xl:col-span-7 flex justify-center lg:justify-end">
                            <div className="relative w-full max-w-xl">
                                {/* Main Workshop Visual */}
                                <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] border border-slate-200/60 aspect-16/11">
                                    <img
                                        src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
                                        alt="Students collaborating around a conference table in an international training session"
                                        className="h-full w-full object-cover"
                                    />
                                    {/* Subtle inner shadow overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                                </div>

                                {/* Floating Badge 1: Top-Right Rating */}
                                <div className="absolute -top-5 right-4 sm:-top-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:px-4 sm:py-3 shadow-lg shadow-slate-900/5 border border-slate-100 flex items-center gap-3 select-none">
                                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-sm font-bold">
                                        ★
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Rating Score
                                        </div>
                                        <div className="text-xs font-extrabold text-slate-900">
                                            95% <span className="text-slate-500 font-normal">Satisfaction</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badge 2: Bottom-Left Student Count */}
                                <div className="absolute -bottom-6 -left-2 sm:-bottom-8 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-slate-900/10 border border-slate-100 flex items-center gap-3.5 select-none">
                                    <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-red-950/20">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-base font-extrabold text-slate-950 tracking-tight">
                                            5000+
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            Active Students Enrolled
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}