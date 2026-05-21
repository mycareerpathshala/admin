'use client';

import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    HiOutlineCalendarDays,
    HiOutlineClock,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineXMark,
} from 'react-icons/hi2';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS   = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];

function parseDate(v: string) {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
}

interface Props {
    value:       string;   // YYYY-MM-DDTHH:mm  ('' = nothing selected)
    onChange:    (v: string) => void;
    placeholder?: string;
}

export default function DateTimePicker({ value, onChange, placeholder = 'Select date & time' }: Props) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const savedValue = useRef<string>('');
    const [open, setOpen]   = useState(false);
    const [style, setStyle] = useState<React.CSSProperties>({});

    const initial = parseDate(value);

    const [viewYear,  setViewYear]  = useState(() => initial?.getFullYear()  ?? new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(() => initial?.getMonth()      ?? new Date().getMonth());
    const [selDay,    setSelDay]    = useState<{ y: number; m: number; d: number } | null>(
        initial ? { y: initial.getFullYear(), m: initial.getMonth(), d: initial.getDate() } : null,
    );
    const [hour,   setHour]   = useState(() => initial?.getHours()   ?? 9);
    const [minute, setMinute] = useState(() => initial?.getMinutes()  ?? 0);
    const [syncedValue, setSyncedValue] = useState(value);

    // Derived-state pattern (React-recommended alternative to setState-in-effect):
    // sync picker state when value changes externally (e.g. after cancel restores saved value).
    if (syncedValue !== value) {
        setSyncedValue(value);
        const d = parseDate(value);
        if (d) {
            setSelDay({ y: d.getFullYear(), m: d.getMonth(), d: d.getDate() });
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
            setHour(d.getHours());
            setMinute(d.getMinutes());
        } else if (!value) {
            setSelDay(null);
        }
    }


    function openPicker() {
        savedValue.current = value;
        if (triggerRef.current) {
            const r           = triggerRef.current.getBoundingClientRect();
            const popupW      = 444;
            const popupH      = 340; // approx calendar + footer height
            const left        = Math.max(8, Math.min(r.left, window.innerWidth - popupW - 8));
            const spaceBelow  = window.innerHeight - r.bottom - 8;
            const top         = spaceBelow >= popupH
                ? r.bottom + 6                    // enough room → open below
                : r.top - popupH - 6;             // not enough  → open above
            setStyle({ position: 'fixed', top: Math.max(8, top), left, zIndex: 9999, width: popupW });
        }
        setOpen(true);
    }

    function cancelPicker() {
        onChange(savedValue.current);
        setOpen(false);
    }

    function emit(day: { y: number; m: number; d: number }, h: number, min: number) {
        const p = (n: number) => String(n).padStart(2, '0');
        onChange(`${day.y}-${p(day.m + 1)}-${p(day.d)}T${p(h)}:${p(min)}`);
    }

    function pickDay(d: number) {
        const day = { y: viewYear, m: viewMonth, d };
        setSelDay(day);
        emit(day, hour, minute);
    }

    function adjHour(delta: number) {
        const h = (hour + delta + 24) % 24;
        setHour(h);
        if (selDay) emit(selDay, h, minute);
    }

    function adjMinute(delta: number) {
        const m = (minute + delta + 60) % 60;
        setMinute(m);
        if (selDay) emit(selDay, hour, m);
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }
    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }

    function clearValue(e: React.MouseEvent) {
        e.stopPropagation();
        setSelDay(null);
        onChange('');
    }

    const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today       = new Date();

    const displayStr = selDay
        ? new Date(selDay.y, selDay.m, selDay.d, hour, minute)
            .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            + ' · '
            + String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0')
        : null;

    return (
        <div className="relative">
            {/* ── Trigger ────────────────────────────────────────────────── */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => open ? setOpen(false) : openPicker()}
                className={[
                    'flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all outline-none',
                    open
                        ? 'border-primary bg-white ring-2 ring-primary/20'
                        : 'border-slate-200 bg-white hover:border-slate-300',
                ].join(' ')}
            >
                <span className={`flex items-center gap-2.5 ${displayStr ? 'text-slate-700' : 'text-slate-400'}`}>
                    <HiOutlineCalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                    {displayStr ?? placeholder}
                </span>

                {displayStr ? (
                    <span
                        role="button"
                        onClick={clearValue}
                        className="flex shrink-0 items-center rounded-lg p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-400"
                    >
                        <HiOutlineXMark className="h-3.5 w-3.5" />
                    </span>
                ) : (
                    <HiOutlineClock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                )}
            </button>

            {/* ── Popup (portal so it escapes overflow:hidden parents) ──── */}
            {open && typeof document !== 'undefined' && createPortal(
                <>
                    {/* Blurred backdrop — sits behind the calendar, blurs everything beneath */}
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 9998, backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', background: 'rgba(15,23,42,0.08)' }}
                        onClick={cancelPicker}
                    />
                    <div style={style} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10">

                    {/* Body: calendar left + time right */}
                    <div className="flex">

                        {/* Calendar */}
                        <div className="flex-1 p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <button type="button" onClick={prevMonth}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                                    <HiOutlineChevronLeft className="h-4 w-4" />
                                </button>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-slate-800">{MONTHS[viewMonth]}</span>
                                    <span className="text-sm font-medium text-slate-400">{viewYear}</span>
                                </div>
                                <button type="button" onClick={nextMonth}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                                    <HiOutlineChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mb-1 grid grid-cols-7 text-center">
                                {WEEKDAYS.map(d => (
                                    <span key={d} className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{d}</span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7">
                                {Array.from({ length: firstDow }).map((_, i) => <span key={`gap-${i}`} />)}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const d          = i + 1;
                                    const isSelected = selDay?.y === viewYear && selDay?.m === viewMonth && selDay?.d === d;
                                    const isToday    = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;
                                    return (
                                        <button key={d} type="button" onClick={() => pickDay(d)}
                                            className={[
                                                'mx-auto my-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all',
                                                isSelected
                                                    ? 'scale-110 bg-primary text-white shadow-md shadow-primary/30'
                                                    : isToday
                                                        ? 'bg-primary/8 font-bold text-primary ring-1 ring-primary/25'
                                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
                                            ].join(' ')}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Vertical divider */}
                        <div className="w-px self-stretch bg-slate-100" />

                        {/* Time panel */}
                        <div className="flex w-40 flex-col items-center justify-center gap-4 bg-slate-50/70 py-4">
                            <div className="flex items-center gap-1.5">
                                <HiOutlineClock className="h-3 w-3 text-slate-400" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Time</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <TimeSpinner
                                    label="HH"
                                    value={hour}
                                    display={String(hour).padStart(2, '0')}
                                    onUp={() => adjHour(1)}
                                    onDown={() => adjHour(-1)}
                                />
                                <span className="mb-5 text-lg font-light text-slate-300 select-none">:</span>
                                <TimeSpinner
                                    label="MM"
                                    value={minute}
                                    display={String(minute).padStart(2, '00')}
                                    onUp={() => adjMinute(5)}
                                    onDown={() => adjMinute(-5)}
                                />
                            </div>

                            <span className="text-[9px] font-semibold text-slate-400 select-none">24 h</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2 border-t border-slate-100 p-3">
                        <button
                            type="button"
                            onClick={cancelPicker}
                            className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={!selDay}
                            className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {selDay ? 'Confirm' : 'Pick a date first'}
                        </button>
                    </div>
                </div>
                </>,
                document.body,
            )}
        </div>
    );
}

function TimeSpinner({
    label, display, onUp, onDown,
}: {
    label: string;
    value: number;
    display: string;
    onUp: () => void;
    onDown: () => void;
}) {
    return (
        <div className="flex flex-col items-center gap-1">
            <button
                type="button"
                onClick={onUp}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
            >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
            </button>

            <span className="w-12 rounded-xl bg-white py-2 text-center text-base font-bold tabular-nums text-slate-800 ring-1 ring-slate-200">
                {display}
            </span>

            <button
                type="button"
                onClick={onDown}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
            >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 select-none">{label}</span>
        </div>
    );
}
