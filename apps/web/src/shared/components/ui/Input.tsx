import React, { forwardRef, useId } from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    cornerHint?: React.ReactNode;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
    variant?: 'default' | 'filled';
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            cornerHint,
            error,
            helperText,
            leftIcon,
            rightElement,
            variant = 'filled',
            id,
            className = '',
            disabled,
            ...props
        },
        ref,
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;

        const variantClasses =
            variant === 'filled'
                ? 'bg-[#F0F4F8] border-transparent text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[var(--color-primary)]'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[var(--color-primary)]';

        return (
            <div className="w-full space-y-1.5 text-left">
                {(label || cornerHint) && (
                    <div className="flex items-center justify-between">
                        {label && (
                            <label
                                htmlFor={inputId}
                                className="block text-xs font-semibold text-slate-700 select-none"
                            >
                                {label}
                            </label>
                        )}
                        {cornerHint && (
                            <span className="text-xs text-slate-400 select-none">{cornerHint}</span>
                        )}
                    </div>
                )}

                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? errorId : helperText ? helperId : undefined}
                        className={`w-full rounded-xl border py-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                            leftIcon ? 'pl-10' : 'pl-4'
                        } ${rightElement ? 'pr-11' : 'pr-4'} ${
                            error
                                ? 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20'
                                : variantClasses
                        } ${className}`}
                        {...props}
                    />

                    {rightElement && (
                        <div className="absolute right-3.5 flex items-center justify-center">
                            {rightElement}
                        </div>
                    )}
                </div>

                {error && (
                    <p id={errorId} className="text-xs font-medium text-red-600">
                        {error}
                    </p>
                )}

                {!error && helperText && (
                    <p id={helperId} className="text-xs text-slate-500 flex items-center gap-1">
                        {helperText}
                    </p>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';