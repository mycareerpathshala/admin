'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineGlobeAlt,
    HiOutlineCheck,
    HiOutlineExclamationCircle,
    HiOutlineLink,
    HiOutlineAtSymbol,
    HiOutlineIdentification,
    HiXMark,
    HiChevronDown,
} from 'react-icons/hi2';
import { FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa6';
import { MdSupportAgent } from 'react-icons/md';
import DialCodeSelector, {
    DEFAULT_DIAL_COUNTRY,
    parsePhone,
    type DialCountry,
} from '@/assets/components/DialCodeSelector';

interface ContactInfoFields {
    email:                string;
    phone:                string;
    whatsappNumber:       string;
    whatsappDisplay:      string;
    facebookUrl:          string;
    facebookHandle:       string;
    instagramUrl:         string;
    instagramHandle:      string;
    youtubeUrl:           string;
    youtubeHandle:        string;
    linkedinUrl:          string;
    linkedinHandle:       string;
    officeHoursDays:      string;
    officeHoursTime:      string;
    emailResponseTime:    string;
    whatsappResponseTime: string;
    languages:            string;
}

const DEFAULTS: ContactInfoFields = {
    email:                'info@mycareerpathshala.com',
    phone:                '+91 98765 43210',
    whatsappNumber:       '919876543210',
    whatsappDisplay:      '+91 98765 43210',
    facebookUrl:          'https://facebook.com',
    facebookHandle:       '@mycareerpathshala',
    instagramUrl:         'https://instagram.com',
    instagramHandle:      '@mycareerpathshala',
    youtubeUrl:           'https://youtube.com',
    youtubeHandle:        'My Career Pathshala',
    linkedinUrl:          'https://linkedin.com',
    linkedinHandle:       'My Career Pathshala',
    officeHoursDays:      'Monday – Saturday',
    officeHoursTime:      '10:00 – 19:00',
    emailResponseTime:    'within 24 hours',
    whatsappResponseTime: 'within 2 hours',
    languages:            'English • Hindi',
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type SocialPlatform = {
    icon:       React.ElementType;
    color:      string;
    name:       string;
    urlKey:     keyof ContactInfoFields;
    handleKey:  keyof ContactInfoFields;
    urlPh:      string;
    handlePh:   string;
    handleIcon: React.ElementType;
};

const SOCIAL_PLATFORMS: SocialPlatform[] = [
    { icon: FaFacebook,   color: '#1877F2', name: 'Facebook',  urlKey: 'facebookUrl',  handleKey: 'facebookHandle',  urlPh: 'https://facebook.com/...',  handlePh: '@mycareerpathshala',  handleIcon: HiOutlineAtSymbol      },
    { icon: FaInstagram,  color: '#E1306C', name: 'Instagram', urlKey: 'instagramUrl', handleKey: 'instagramHandle', urlPh: 'https://instagram.com/...', handlePh: '@mycareerpathshala',  handleIcon: HiOutlineAtSymbol      },
    { icon: FaYoutube,    color: '#FF0000', name: 'YouTube',   urlKey: 'youtubeUrl',   handleKey: 'youtubeHandle',   urlPh: 'https://youtube.com/...',   handlePh: 'Channel name',        handleIcon: HiOutlineIdentification },
    { icon: FaLinkedinIn, color: '#0A66C2', name: 'LinkedIn',  urlKey: 'linkedinUrl',  handleKey: 'linkedinHandle',  urlPh: 'https://linkedin.com/...',  handlePh: 'Page name',           handleIcon: HiOutlineIdentification },
];

const RESPONSE_TIME_OPTIONS = [
    'within 1 hour',
    'within 2 hours',
    'within 4 hours',
    'within 6 hours',
    'within 12 hours',
    'within 24 hours',
    'within 48 hours',
    'within 2–3 days',
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
});

function parseTo24h(timeStr: string): string {
    const cleaned = timeStr.replace(/\s*(IST|UTC|GMT|EST|PST|CST|BST)\s*/gi, '').trim();
    if (/^\d{2}:\d{2}$/.test(cleaned)) return cleaned;
    const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
        let h = parseInt(match[1]);
        const m = match[2];
        const period = match[3].toUpperCase();
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        const snapped = TIME_OPTIONS.find(t => t === `${String(h).padStart(2, '0')}:${m}`);
        return snapped ?? TIME_OPTIONS[Math.round(h * 2) % 48] ?? '09:00';
    }
    return '09:00';
}

function merge(raw: Partial<ContactInfoFields> | null): ContactInfoFields {
    if (!raw) return { ...DEFAULTS };
    const result = { ...DEFAULTS };
    for (const k of Object.keys(DEFAULTS) as (keyof ContactInfoFields)[]) {
        if (raw[k]) result[k] = raw[k] as string;
    }
    return result;
}

function parseSplit(value: string, sep: string): [string, string] {
    const idx = value.indexOf(sep);
    if (idx === -1) return [value.trim(), ''];
    return [value.slice(0, idx).trim(), value.slice(idx + sep.length).trim()];
}

function FormSection({ title, icon: Icon, children, childrenClassName }: {
    title:             string;
    icon:              React.ElementType;
    children:          React.ReactNode;
    childrenClassName?: string;
}) {
    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                </span>
                <h3 className="font-semibold text-slate-800">{title}</h3>
            </div>
            <div className={childrenClassName ?? 'grid gap-5 p-6 sm:grid-cols-2'}>{children}</div>
        </div>
    );
}

function SocialRow({
    platform,
    url,
    handle,
    onUrlChange,
    onHandleChange,
}: {
    platform:       SocialPlatform;
    url:            string;
    handle:         string;
    onUrlChange:    (v: string) => void;
    onHandleChange: (v: string) => void;
}) {
    const { icon: Icon, color, name, urlPh, handlePh, handleIcon: HandleIcon } = platform;
    const inputCls = 'w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20';
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center gap-3 sm:w-36">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: color }}>
                    <Icon className="size-4" />
                </span>
                <span className="text-sm font-semibold text-slate-700">{name}</span>
            </div>
            <div className="relative flex-1">
                <HiOutlineLink className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input type="url" value={url} onChange={(e) => onUrlChange(e.target.value)} placeholder={urlPh}
                    className={`${inputCls} pl-8 pr-3.5`} />
            </div>
            <div className="relative sm:w-52">
                <HandleIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input type="text" value={handle} onChange={(e) => onHandleChange(e.target.value)} placeholder={handlePh}
                    className={`${inputCls} pl-8 pr-3.5`} />
            </div>
        </div>
    );
}

function Field({
    label,
    hint,
    value,
    onChange,
    placeholder,
    type = 'text',
}: {
    label:       string;
    hint?:       string;
    value:       string;
    onChange:    (v: string) => void;
    placeholder?: string;
    type?:       string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
        </div>
    );
}

function PhoneField({
    label,
    hint,
    dialCountry,
    number,
    onDialChange,
    onNumberChange,
    placeholder,
}: {
    label:          string;
    hint?:          string;
    dialCountry:    DialCountry;
    number:         string;
    onDialChange:   (c: DialCountry) => void;
    onNumberChange: (v: string) => void;
    placeholder?:   string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
            <div className="flex gap-2">
                <DialCodeSelector value={dialCountry} onChange={onDialChange} />
                <input
                    type="tel"
                    value={number}
                    onChange={(e) => onNumberChange(e.target.value)}
                    placeholder={placeholder ?? '98765 43210'}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>
            {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
        </div>
    );
}

function SelectDropdown({
    value,
    options,
    onChange,
}: {
    value:    string;
    options:  string[];
    onChange: (v: string) => void;
}) {
    const uid        = useId();
    const ddId       = `sd-${uid}`;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen]   = useState(false);
    const [style, setStyle] = useState<React.CSSProperties>({});

    function openDropdown() {
        if (!triggerRef.current) return;
        const r       = triggerRef.current.getBoundingClientRect();
        const popupH  = 208;
        const below   = window.innerHeight - r.bottom - 8;
        const top     = below >= popupH ? r.bottom + 4 : r.top - popupH - 4;
        setStyle({ position: 'fixed', top: Math.max(8, top), left: r.left, width: r.width, zIndex: 9999 });
        setOpen(true);
    }

    useEffect(() => {
        if (!open) return;
        function handler(e: MouseEvent) {
            const t  = e.target as Node;
            const dd = document.getElementById(ddId);
            if (!triggerRef.current?.contains(t) && !dd?.contains(t)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, ddId]);

    return (
        <div className="min-w-0 flex-1">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => open ? setOpen(false) : openDropdown()}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
                <span>{value}</span>
                <HiChevronDown className={`size-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && typeof document !== 'undefined' && createPortal(
                <div id={ddId} style={style} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                    <ul className="scrollbar-thin max-h-52 overflow-y-auto py-1">
                        {options.map((opt) => (
                            <li key={opt}>
                                <button
                                    type="button"
                                    onClick={() => { onChange(opt); setOpen(false); }}
                                    className={`flex w-full items-center px-3.5 py-2 text-left text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 ${opt === value ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'}`}
                                >
                                    {opt}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>,
                document.body,
            )}
        </div>
    );
}

function DayRangeSelect({
    startValue, endValue, onStartChange, onEndChange,
}: {
    startValue: string; endValue: string;
    onStartChange: (v: string) => void; onEndChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Office Hours — Days</label>
            <div className="flex items-center gap-2">
                <SelectDropdown value={startValue} options={DAYS_OF_WEEK} onChange={onStartChange} />
                <span className="shrink-0 text-sm font-semibold text-slate-400">–</span>
                <SelectDropdown value={endValue} options={DAYS_OF_WEEK} onChange={onEndChange} />
            </div>
        </div>
    );
}

function TimeRangeSelect({
    startValue, endValue, onStartChange, onEndChange,
}: {
    startValue: string; endValue: string;
    onStartChange: (v: string) => void; onEndChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Office Hours — Time</label>
            <div className="flex items-center gap-2">
                <SelectDropdown value={startValue} options={TIME_OPTIONS} onChange={onStartChange} />
                <span className="shrink-0 text-sm font-semibold text-slate-400">–</span>
                <SelectDropdown value={endValue} options={TIME_OPTIONS} onChange={onEndChange} />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">24-hour clock</p>
        </div>
    );
}

function TagInput({
    tags,
    setTags,
    placeholder,
}: {
    tags:        string[];
    setTags:     (t: string[]) => void;
    placeholder?: string;
}) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    function addTag() {
        const v = input.trim();
        if (v && !tags.includes(v)) setTags([...tags, v]);
        setInput('');
    }

    return (
        <div
            className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 px-3 py-2 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
            onClick={() => inputRef.current?.focus()}
        >
            {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setTags(tags.filter((t) => t !== tag)); }}
                        className="ml-0.5 text-primary/60 hover:text-primary"
                    >
                        <HiXMark className="size-3" />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                    if (e.key === 'Backspace' && !input && tags.length) setTags(tags.slice(0, -1));
                }}
                placeholder={tags.length === 0 ? placeholder : 'Add more…'}
                className="min-w-24 flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
        </div>
    );
}

export default function ContactInfoPage() {
    const [fields, setFields]   = useState<ContactInfoFields>({ ...DEFAULTS });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [toast, setToast]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Split-state for enhanced inputs
    const [languageTags,           setLanguageTags]           = useState<string[]>(['English', 'Hindi']);
    const [officeHoursDaysStart,   setOfficeHoursDaysStart]   = useState('Monday');
    const [officeHoursDaysEnd,     setOfficeHoursDaysEnd]     = useState('Saturday');
    const [officeHoursTimeStart,   setOfficeHoursTimeStart]   = useState('10:00');
    const [officeHoursTimeEnd,     setOfficeHoursTimeEnd]     = useState('19:00');
    const [phoneDialCountry,       setPhoneDialCountry]       = useState<DialCountry>(DEFAULT_DIAL_COUNTRY);
    const [phoneNumber,            setPhoneNumber]            = useState('');
    const [waDisplayDialCountry,   setWaDisplayDialCountry]   = useState<DialCountry>(DEFAULT_DIAL_COUNTRY);
    const [waDisplayNumber,        setWaDisplayNumber]        = useState('');

    useEffect(() => {
        fetch('/api/contact-info')
            .then((r) => r.json())
            .then((d) => {
                const merged = merge(d.data);
                setFields(merged);

                setLanguageTags(
                    merged.languages
                        ? merged.languages.split(' • ').map((s) => s.trim()).filter(Boolean)
                        : [],
                );

                const [dStart, dEnd] = parseSplit(merged.officeHoursDays, ' – ');
                setOfficeHoursDaysStart(dStart);
                setOfficeHoursDaysEnd(dEnd);

                const [tStart, tEnd] = parseSplit(merged.officeHoursTime, ' – ');
                setOfficeHoursTimeStart(parseTo24h(tStart));
                setOfficeHoursTimeEnd(parseTo24h(tEnd));

                const parsedPhone = parsePhone(merged.phone);
                setPhoneDialCountry(parsedPhone.country);
                setPhoneNumber(parsedPhone.number);

                const parsedWa = parsePhone(merged.whatsappDisplay);
                setWaDisplayDialCountry(parsedWa.country);
                setWaDisplayNumber(parsedWa.number);
            })
            .finally(() => setLoading(false));
    }, []);

    function set(key: keyof ContactInfoFields) {
        return (v: string) => setFields((prev) => ({ ...prev, [key]: v }));
    }

    // Computed combined values for preview + save
    const combinedPhone        = phoneNumber.trim() ? `${phoneDialCountry.dial} ${phoneNumber.trim()}` : '';
    const combinedWaDisplay    = waDisplayNumber.trim() ? `${waDisplayDialCountry.dial} ${waDisplayNumber.trim()}` : '';
    const combinedDays         = [officeHoursDaysStart, officeHoursDaysEnd].filter(Boolean).join(' – ');
    const combinedTime         = [officeHoursTimeStart, officeHoursTimeEnd].filter(Boolean).join(' – ');
    const combinedLanguages    = languageTags.join(' • ');

    async function handleSave() {
        setSaving(true);
        try {
            const payload: ContactInfoFields = {
                ...fields,
                phone:           combinedPhone,
                whatsappDisplay: combinedWaDisplay,
                officeHoursDays: combinedDays,
                officeHoursTime: combinedTime,
                languages:       combinedLanguages,
            };
            const res = await fetch('/api/contact-info', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error();
            showToast('success', 'Contact info saved successfully.');
        } catch {
            showToast('error', 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    function showToast(type: 'success' | 'error', msg: string) {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="mb-4 h-5 w-40 rounded bg-slate-100" />
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="h-10 rounded-xl bg-slate-100" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Contact Information</h2>
                    <p className="text-sm text-slate-400">
                        This data is displayed on the public Contact page.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
                >
                    <HiOutlineCheck className="size-4" />
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            {/* Primary contact */}
            <FormSection title="Primary Contact" icon={HiOutlineEnvelope}>
                <Field
                    label="Email Address"
                    value={fields.email}
                    onChange={set('email')}
                    placeholder="info@example.com"
                    type="email"
                />
                <PhoneField
                    label="Phone Number"
                    dialCountry={phoneDialCountry}
                    number={phoneNumber}
                    onDialChange={setPhoneDialCountry}
                    onNumberChange={setPhoneNumber}
                    placeholder="98765 43210"
                />
                <PhoneField
                    label="WhatsApp Display Number"
                    hint="Shown to users on the contact page"
                    dialCountry={waDisplayDialCountry}
                    number={waDisplayNumber}
                    onDialChange={setWaDisplayDialCountry}
                    onNumberChange={setWaDisplayNumber}
                    placeholder="98765 43210"
                />
                <Field
                    label="WhatsApp Link Number"
                    hint="Digits only for wa.me link (e.g. 919876543210)"
                    value={fields.whatsappNumber}
                    onChange={set('whatsappNumber')}
                    placeholder="919876543210"
                />
            </FormSection>

            {/* Social media */}
            <FormSection title="Social Media" icon={HiOutlineGlobeAlt} childrenClassName="flex flex-col gap-3 p-5">
                {/* Column headers — desktop only */}
                <div className="hidden sm:flex items-center gap-3 px-1 pb-1">
                    <div className="w-36 shrink-0" />
                    <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Profile URL</span>
                    <span className="w-52 shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">Handle / Name</span>
                </div>
                {SOCIAL_PLATFORMS.map((p) => (
                    <SocialRow
                        key={p.name}
                        platform={p}
                        url={fields[p.urlKey]}
                        handle={fields[p.handleKey]}
                        onUrlChange={set(p.urlKey)}
                        onHandleChange={set(p.handleKey)}
                    />
                ))}
            </FormSection>

            {/* Support info */}
            <FormSection title="Support Information" icon={HiOutlineClock}>
                <DayRangeSelect
                    startValue={officeHoursDaysStart}
                    endValue={officeHoursDaysEnd}
                    onStartChange={setOfficeHoursDaysStart}
                    onEndChange={setOfficeHoursDaysEnd}
                />
                <TimeRangeSelect
                    startValue={officeHoursTimeStart}
                    endValue={officeHoursTimeEnd}
                    onStartChange={setOfficeHoursTimeStart}
                    onEndChange={setOfficeHoursTimeEnd}
                />
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email Response Time</label>
                    <SelectDropdown value={fields.emailResponseTime} options={RESPONSE_TIME_OPTIONS} onChange={set('emailResponseTime')} />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">WhatsApp Response Time</label>
                    <SelectDropdown value={fields.whatsappResponseTime} options={RESPONSE_TIME_OPTIONS} onChange={set('whatsappResponseTime')} />
                </div>
                <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Languages Supported</label>
                    <TagInput
                        tags={languageTags}
                        setTags={setLanguageTags}
                        placeholder="Type a language and press Enter…"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Press Enter to add · Backspace to remove last</p>
                </div>
            </FormSection>

            {/* Preview strip */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Live preview</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5"><HiOutlineEnvelope className="size-4 text-blue-500" /> {fields.email || '—'}</span>
                    <span className="flex items-center gap-1.5"><HiOutlinePhone className="size-4 text-teal-500" /> {combinedPhone || '—'}</span>
                    <span className="flex items-center gap-1.5"><FaWhatsapp className="size-4 text-green-500" /> {combinedWaDisplay || '—'}</span>
                    <span className="flex items-center gap-1.5"><FaFacebook className="size-4 text-blue-600" /> {fields.facebookHandle || '—'}</span>
                    <span className="flex items-center gap-1.5"><FaInstagram className="size-4 text-pink-500" /> {fields.instagramHandle || '—'}</span>
                    <span className="flex items-center gap-1.5"><FaYoutube className="size-4 text-red-500" /> {fields.youtubeHandle || '—'}</span>
                    <span className="flex items-center gap-1.5"><FaLinkedinIn className="size-4 text-sky-600" /> {fields.linkedinHandle || '—'}</span>
                    <span className="flex items-center gap-1.5"><HiOutlineClock className="size-4 text-violet-500" /> {combinedDays} · {combinedTime}</span>
                    <span className="flex items-center gap-1.5"><HiOutlineCheckCircle className="size-4 text-emerald-500" /> Email: {fields.emailResponseTime}</span>
                    <span className="flex items-center gap-1.5"><MdSupportAgent className="size-4 text-violet-500" /> {combinedLanguages || '—'}</span>
                </div>
            </div>

            {/* Save button (bottom) */}
            <div className="flex justify-end pb-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
                >
                    <HiOutlineCheck className="size-4" />
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={[
                        'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-xl transition',
                        toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600',
                    ].join(' ')}
                >
                    {toast.type === 'success'
                        ? <HiOutlineCheck className="size-4.5 shrink-0" />
                        : <HiOutlineExclamationCircle className="size-4.5 shrink-0" />
                    }
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
