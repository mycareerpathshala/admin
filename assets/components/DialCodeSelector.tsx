'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiChevronDown, HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import { DIAL_COUNTRIES, type DialCountry } from '@/assets/lib/data/dialCodes';

export { DIAL_COUNTRIES, type DialCountry };
export const DEFAULT_DIAL_COUNTRY = DIAL_COUNTRIES.find(c => c.name === 'India') ?? DIAL_COUNTRIES[0];

export function parsePhone(stored: string): { country: DialCountry; number: string } {
    if (!stored) return { country: DEFAULT_DIAL_COUNTRY, number: '' };
    const sorted = [...DIAL_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
    const match  = sorted.find(c => stored.startsWith(c.dial));
    if (match) return { country: match, number: stored.slice(match.dial.length).trim() };
    return { country: DEFAULT_DIAL_COUNTRY, number: stored };
}

interface Props {
    value:    DialCountry;
    onChange: (c: DialCountry) => void;
}

export default function DialCodeSelector({ value, onChange }: Props) {
    const [open, setOpen]   = useState(false);
    const [query, setQuery] = useState('');
    const [style, setStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const inputRef   = useRef<HTMLInputElement>(null);

    const filtered = DIAL_COUNTRIES.filter(c =>
        !query.trim() ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.dial.includes(query),
    );

    function openDropdown() {
        if (!triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        setStyle({ position: 'fixed', top: r.bottom + 6, left: r.left, width: Math.max(r.width, 234), zIndex: 9999 });
        setOpen(true);
    }

    useEffect(() => {
        if (!open) return;
        setTimeout(() => inputRef.current?.focus(), 50);
        function handler(e: MouseEvent) {
            const t  = e.target as Node;
            const dd = document.getElementById('dial-code-dropdown');
            if (!triggerRef.current?.contains(t) && !dd?.contains(t)) { setOpen(false); setQuery(''); }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const dropdown = open && typeof document !== 'undefined' ? createPortal(
        <div id="dial-code-dropdown" style={style} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
                <HiMagnifyingGlass className="size-4 shrink-0 text-slate-400" />
                <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search country or code…"
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-300 outline-none" />
                {query && (
                    <button type="button" onClick={() => setQuery('')} className="text-slate-300 hover:text-slate-500">
                        <HiXMark className="size-3.5" />
                    </button>
                )}
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0
                    ? <li className="px-4 py-3 text-center text-xs text-slate-400">No results</li>
                    : filtered.map(c => (
                        <li key={c.name}>
                            <button type="button" onClick={() => { onChange(c); setOpen(false); setQuery(''); }}
                                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 ${c.name === value.name ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'}`}>
                                <span className="text-base leading-none">{c.flag}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="shrink-0 text-xs text-slate-400">{c.dial}</span>
                            </button>
                        </li>
                    ))
                }
            </ul>
        </div>,
        document.body,
    ) : null;

    return (
        <div className="relative">
            <button ref={triggerRef} type="button" onClick={openDropdown}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-all hover:border-primary/40 hover:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                <span className="text-base leading-none">{value.flag}</span>
                <span className="font-medium text-slate-700">{value.dial}</span>
                <HiChevronDown className={`size-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {dropdown}
        </div>
    );
}
