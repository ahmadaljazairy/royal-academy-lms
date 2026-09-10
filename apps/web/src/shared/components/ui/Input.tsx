import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, id, className = '', disabled, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;

        return (
            <div className="w-full space-y-1.5 text-left">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-700 select-none"
                    >
                        {label}
                    </label>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : helperText ? helperId : undefined}
                    className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-secondary transition-colors duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${
                        error
                            ? 'border-red-500 focus:ring-red-500/20'
                            : 'border-slate-300 hover:border-slate-400 focus:ring-primary/20'
                    } ${className}`}
                    {...props}
                />

                {error && (
                    <p id={errorId} className="text-xs font-medium text-red-600">
                        {error}
                    </p>
                )}

                {!error && helperText && (
                    <p id={helperId} className="text-xs text-slate-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';