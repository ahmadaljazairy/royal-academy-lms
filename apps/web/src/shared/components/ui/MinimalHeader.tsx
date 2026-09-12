import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';

interface MinimalHeaderProps {
    /** Explicit route path (e.g. '/'). If omitted, navigates back in browser history. */
    backTo?: string;
    /** Label displayed next to the arrow. Defaults to 'Back'. */
    backLabel?: string;
    /** Custom click handler override */
    onBack?: () => void;
}

export function MinimalHeader({
                                  backTo,
                                  backLabel = 'Back',
                                  onBack,
                              }: MinimalHeaderProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    const navContent = (
        <>
            <svg
                className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
            </svg>
            <span>{backLabel}</span>
        </>
    );

    const navClasses =
        'inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer';

    return (
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
            <BrandLogo size="md" />

            {backTo && !onBack ? (
                <Link to={backTo} className={navClasses}>
                    {navContent}
                </Link>
            ) : (
                <button type="button" onClick={handleBack} className={navClasses}>
                    {navContent}
                </button>
            )}
        </header>
    );
}