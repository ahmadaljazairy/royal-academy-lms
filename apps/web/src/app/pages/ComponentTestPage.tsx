import React, { useState } from 'react';
import {
    BrandLogo,
    Button,
    Input,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Alert,
    Spinner,
} from '@/shared/components/ui';

export function ComponentTestPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [hasError, setHasError] = useState(false);

    return (
        <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header & Brand Logo */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-secondary)]">
                            UI Primitive Sandbox
                        </h1>
                        <p className="text-sm text-[var(--color-neutral)] mt-1">
                            Live verification suite for shared components and design tokens.
                        </p>
                    </div>
                    <BrandLogo size="md" />
                </div>

                {/* 1. Buttons & Spinners */}
                <Card>
                    <CardHeader>
                        <CardTitle>Buttons & Spinners</CardTitle>
                        <CardDescription>
                            Testing button variants, interactive loading spinners, and size tokens.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="primary" isLoading={isLoading} onClick={() => setIsLoading(!isLoading)}>
                                Primary {isLoading ? '(Active)' : ''}
                            </Button>
                            <Button variant="secondary" isLoading={isLoading}>
                                Secondary
                            </Button>
                            <Button variant="outline" isLoading={isLoading}>
                                Outline
                            </Button>
                            <Button variant="ghost" isLoading={isLoading}>
                                Ghost
                            </Button>
                            <Button variant="primary" disabled>
                                Disabled
                            </Button>
                        </div>

                        <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 uppercase">Standalone Spinners:</span>
                            <Spinner size="sm" className="text-[var(--color-primary)]" />
                            <Spinner size="md" className="text-[var(--color-secondary)]" />
                            <Spinner size="lg" className="text-slate-400" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center text-xs text-slate-500">
                        <span>Click Primary button to toggle global loading state.</span>
                        <Button size="sm" variant="outline" onClick={() => setIsLoading(!isLoading)}>
                            Toggle Loading
                        </Button>
                    </CardFooter>
                </Card>

                {/* 2. Form Inputs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Form Inputs</CardTitle>
                        <CardDescription>Validating label association, helper text, and validation error states.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Standard Input"
                            placeholder="e.g. user@royalacademy.edu"
                            helperText="We will never share your email with unauthorized third parties."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />

                        <Input
                            label="Input with Error State"
                            placeholder="Enter secure password"
                            type="password"
                            value={inputValue}
                            error={hasError ? 'Password must be at least 8 characters with one number.' : undefined}
                            onChange={(e) => setInputValue(e.target.value)}
                        />

                        <Input
                            label="Disabled Input"
                            value="Immutable System Account"
                            disabled
                        />
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button size="sm" variant="outline" onClick={() => setHasError(!hasError)}>
                            Toggle Error State
                        </Button>
                    </CardFooter>
                </Card>

                {/* 3. Feedback Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Feedback Alerts</CardTitle>
                        <CardDescription>Visual indicators for server responses, warnings, and error payloads.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Alert variant="info" title="System Notice">
                            Stateful session authentication is active via HttpOnly cookies.
                        </Alert>
                        <Alert variant="success" title="Profile Verified">
                            Your academic credentials have been confirmed by the administration.
                        </Alert>
                        <Alert variant="warning" title="Session Renewal Required">
                            Your Redis session will expire within 5 minutes of inactivity.
                        </Alert>
                        <Alert variant="error" title="Validation Conflict">
                            The specified email address already belongs to an active account.
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}