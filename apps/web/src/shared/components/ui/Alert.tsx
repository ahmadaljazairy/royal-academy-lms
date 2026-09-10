import React from 'react';

interface AlertProps {
    variant?: 'error' | 'warning' | 'success' | 'info';
    title?: string;
    children: React.ReactNode;
    className?: string;
}

const ALERT_CONFIGS = {
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
};

export function Alert({ variant = 'error', title, children, className = '' }: AlertProps) {
    return (
        <div
            role="alert"
            className={`rounded-xl border p-4 text-sm ${ALERT_CONFIGS[variant]} ${className}`}
        >
            {title && <h5 className="font-semibold leading-none tracking-tight mb-1">{title}</h5>}
            <div className="text-xs leading-relaxed opacity-90">{children}</div>
        </div>
    );
}