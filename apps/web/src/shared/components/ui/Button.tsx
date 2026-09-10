import React, { forwardRef } from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
        'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/20',
    secondary:
        'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-hover)] focus-visible:ring-[var(--color-secondary)]',
    outline:
        'border border-slate-300 bg-white text-[var(--color-secondary)] hover:bg-slate-50 focus-visible:ring-[var(--color-primary)]',
    ghost:
        'text-[var(--color-secondary)] hover:bg-slate-100 focus-visible:ring-[var(--color-primary)]',
};

const SIZE_STYLES: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-xs font-medium rounded-md gap-1.5',
    md: 'h-10 px-4 text-sm font-semibold rounded-lg gap-2',
    lg: 'h-12 px-6 text-base font-semibold rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            isLoading = false,
            disabled,
            className = '',
            children,
            ...props
        },
        ref,
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={`inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
                {...props}
            >
                {isLoading && <Spinner size={size === 'lg' ? 'md' : 'sm'} className="text-current" />}
                {children}
            </button>
        );
    },
);

Button.displayName = 'Button';