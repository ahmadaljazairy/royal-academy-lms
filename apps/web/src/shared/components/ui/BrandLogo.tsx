import { Link } from 'react-router-dom';
import logoMark from '@/shared/assets/logo-mark.png';

interface BrandLogoProps {
    /** Sizing presets for consistent rhythm across navbar, cards, and footer */
    size?: 'sm' | 'md' | 'lg';
    /** Toggles wordmark visibility ("Royal Academy" & subtitle) */
    showWordmark?: boolean;
    /** Custom subtitle override (defaults to "International Training Center") */
    subtitle?: string;
    /** Disables the wrapping router link */
    disableLink?: boolean;
    /** Optional container class overrides */
    className?: string;
}

const SIZE_CONFIGS = {
    sm: {
        mark: 'h-8 w-auto',
        title: 'text-lg',
        sub: 'text-[9px] tracking-wider',
        gap: 'gap-2.5',
    },
    md: {
        mark: 'h-11 w-auto',
        title: 'text-2xl',
        sub: 'text-[11px] tracking-wide',
        gap: 'gap-3.5',
    },
    lg: {
        mark: 'h-16 w-auto',
        title: 'text-3xl',
        sub: 'text-xs tracking-wider',
        gap: 'gap-4',
    },
};

export function BrandLogo({
                              size = 'md',
                              showWordmark = true,
                              subtitle = 'International Training Center',
                              disableLink = false,
                              className = '',
                          }: BrandLogoProps) {
    const config = SIZE_CONFIGS[size];

    const content = (
        <div className={`inline-flex items-center ${config.gap} select-none ${className}`}>
            {/* Emblem Graphic */}
            <img
                src={logoMark}
                alt="Royal Academy Crest"
                className={`${config.mark} object-contain transition-transform duration-200 hover:scale-105`}
                loading="eager"
            />

        {/* Brand Typography */}
        {showWordmark && (
        <div className="flex flex-col justify-center leading-tight">
          <span
              className={`${config.title} font-bold text-[#111827]`}
              style={{ fontFamily: 'var(--font-headline)' }}
          >
            Royal Academy
          </span>
                    <span
                        className={`${config.sub} font-normal text-[#6b7280]`}
                        style={{ fontFamily: 'var(--font-body)' }}
                    >
            {subtitle}
          </span>
        </div>
        )}
        </div>
    );

    if (disableLink) {
        return content;
    }

    return (
        <Link
            to="/"
            className="inline-flex items-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b1d24]"
            aria-label="Royal Academy Home"
        >
            {content}
        </Link>
    );
}