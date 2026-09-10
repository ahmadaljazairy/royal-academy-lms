import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', children, ...props }: CardProps) {
    return (
        <div
            className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
    return (
        <div className={`px-6 pt-6 pb-4 border-b border-slate-100 ${className}`} {...props}>
            {children}
        </div>
    );
}

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className = '', children, ...props }: CardTitleProps) {
    return (
        <h3
            className={`text-xl font-bold tracking-tight text-[var(--color-secondary)] ${className}`}
            style={{ fontFamily: 'var(--font-headline)' }}
            {...props}
        >
            {children}
        </h3>
    );
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className = '', children, ...props }: CardDescriptionProps) {
    return (
        <p className={`text-sm text-[var(--color-neutral)] mt-1 ${className}`} {...props}>
            {children}
        </p>
    );
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export function CardContent({ className = '', children, ...props }: CardContentProps) {
    return (
        <div className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    );
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
    return (
        <div
            className={`px-6 py-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}