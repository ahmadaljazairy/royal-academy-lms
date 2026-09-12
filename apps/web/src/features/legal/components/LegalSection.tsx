import React from 'react';

interface LegalSectionProps {
    id: string;
    index: number;
    title: string;
    children: React.ReactNode;
}

export function LegalSection({ id, index, title, children }: LegalSectionProps) {
    return (
        <section id={id} className="rounded-2xl bg-[#F0F4FD] border border-[#E2EAF9] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {index}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {title}
                </h2>
            </div>
            {children}
        </section>
    );
}