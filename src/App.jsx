// Componente principal del generador de CV web
// Incluye un asistente de 4 pasos: Datos personales, Perfiles multilingüe, Revisión y Descarga
import { useState } from "react";
import ParticleBackground from "./ParticleBackground";
import StepReview from "./StepReview";
import { generateCV } from "./pdf-renderer";

// Icono de Material Symbols (Google Fonts)
function Icon({ name, className = "" }) {
    return (
        <span
            className={`material-symbols-outlined text-[1.2em] leading-none ${className}`}
        >
            {name}
        </span>
    );
}

// Mapas y constantes globales
const LANG_MAP = { es: "Español", ca: "Català", en: "English" };
const LANG_CODES = ["es", "ca", "en"];

// Valores por defecto para los formularios dinámicos
const EMPTY_WORK = {
    dates: "",
    occupation: "",
    employer: "",
    location: "",
    description: [""],
};
const EMPTY_EDU = { dates: "", qualification: "", institution: "" };
const EMPTY_CAT = { category: "", items: [""] };

// Plantilla de perfil vacío para cada idioma
const EMPTY_PROFILE = {
    title: "",
    shortDescription: "",
    workExperience: [],
    education: [],
    languageSkills: [],
    digitalSkills: [],
    communicationSkills: [],
    organisationalSkills: [],
    jobRelatedSkills: [],
    additionalInfo: "",
};

function initProfiles() {
    const p = {};
    LANG_CODES.forEach((c) => {
        p[c] = { ...EMPTY_PROFILE };
    });
    return p;
}

// Pasos del asistente de creación del CV
const STEPS = [
    { id: 0, label: "Datos", icon: "person" },
    { id: 1, label: "Perfiles", icon: "description" },
    { id: 2, label: "Revisar", icon: "visibility" },
    { id: 3, label: "Descarga", icon: "download" },
];

// Secciones del perfil profesional (colapsables en el paso 1)
const PROFILE_SECTIONS = [
    {
        key: "intro",
        icon: "track_changes",
        label: "Introducción",
        color: "from-violet-500 to-purple-600",
    },
    {
        key: "work",
        icon: "work",
        label: "Experiencia",
        color: "from-blue-500 to-cyan-600",
    },
    {
        key: "edu",
        icon: "school",
        label: "Educación",
        color: "from-emerald-500 to-teal-600",
    },
    {
        key: "lang",
        icon: "language",
        label: "Idiomas",
        color: "from-amber-500 to-orange-600",
    },
    {
        key: "skills",
        icon: "bolt",
        label: "Skills",
        color: "from-pink-500 to-rose-600",
    },
    {
        key: "comm",
        icon: "chat",
        label: "Comunicación",
        color: "from-sky-500 to-indigo-600",
    },
    {
        key: "org",
        icon: "assignment",
        label: "Organización",
        color: "from-lime-500 to-green-600",
    },
    {
        key: "tech",
        icon: "build",
        label: "Técnicas",
        color: "from-slate-500 to-slate-700",
    },
    {
        key: "extra",
        icon: "attach_file",
        label: "Extra",
        color: "from-fuchsia-500 to-pink-600",
    },
];

// ============== Helpers y componentes de UI ==============

// Combina clases CSS condicionales (como clsx)
function cn(...cls) {
    return cls.filter(Boolean).join(" ");
}

// Clases base para inputs, labels y botones (Tailwind)
const inputBase =
    "w-full bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-xl px-4 py-2.5 text-sm " +
    "text-slate-800 placeholder:text-slate-400 " +
    "transition-all duration-200 ease-out " +
    "focus:outline-none focus:ring-2 focus:ring-navy-400/40 focus:border-navy-400 focus:bg-white " +
    "hover:border-slate-300";

const labelBase =
    "block text-xs font-semibold text-slate-500 tracking-wider mb-1.5 uppercase";

const BtnPrimary =
    "group relative inline-flex items-center gap-2 px-6 py-2.5 font-semibold text-sm text-white " +
    "rounded-xl overflow-hidden shadow-lg shadow-navy-200/50 " +
    "transition-all duration-200 hover:shadow-xl hover:shadow-navy-300/50 hover:-translate-y-0.5 " +
    "active:translate-y-0 active:shadow-md";

// Campo de formulario con label
function Field({ label, children, className }) {
    return (
        <label className={cn("block", className)}>
            <span className={labelBase}>{label}</span>
            {children}
        </label>
    );
}

// Input de texto estándar
function Input({ label, value, onChange, type = "text", ...props }) {
    return (
        <Field label={label}>
            <input
                type={type}
                value={value}
                onChange={onChange}
                className={inputBase}
                {...props}
            />
        </Field>
    );
}

// Área de texto
function TextArea({ label, value, onChange }) {
    return (
        <Field label={label}>
            <textarea
                value={value}
                onChange={onChange}
                rows={3}
                className={cn(inputBase, "resize-none")}
            />
        </Field>
    );
}

// Lista dinámica de inputs (añadir/eliminar ítems)
function ArrayField({ label, values, onChange, placeholder }) {
    const set = (i, v) => onChange(values.map((x, j) => (j === i ? v : x)));
    const add = () => onChange([...values, ""]);
    const del = (i) => onChange(values.filter((_, j) => j !== i));
    return (
        <div className="space-y-2">
            <span className={labelBase}>{label}</span>
            {values.map((v, i) => (
                <div
                    key={i}
                    className="flex gap-2 animate-fade-up"
                    style={{ animationDelay: `${i * 0.03}s` }}
                >
                    <input
                        value={v}
                        onChange={(e) => set(i, e.target.value)}
                        placeholder={placeholder}
                        className={cn(inputBase, "flex-1")}
                        autoFocus={i === values.length - 1}
                    />
                    <button
                        type="button"
                        onClick={() => del(i)}
                        className="shrink-0 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-lg"
                    >
                        ×
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={add}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-700 transition-colors group"
            >
                <span className="w-5 h-5 rounded-full border-2 border-navy-400 group-hover:border-navy-600 flex items-center justify-center text-xs font-bold transition-colors">
                    +
                </span>
                Añadir
            </button>
        </div>
    );
}

// Tarjeta con bordes para entradas dinámicas (experiencia, educación, etc.)
function EntryCard({ children, onDelete, title, color }) {
    return (
        <div
            className={cn(
                "relative rounded-xl border border-slate-200/70 bg-white/60 backdrop-blur-sm p-5 space-y-4",
                "shadow-sm hover:shadow-md transition-all duration-200 group/card",
            )}
        >
            {title && (
                <div className="flex items-center gap-2.5 mb-1">
                    {color && (
                        <div
                            className={cn(
                                "w-1 h-5 rounded-full bg-gradient-to-b",
                                color,
                            )}
                        />
                    )}
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {title}
                    </span>
                </div>
            )}
            {children}
            {onDelete && (
                <button
                    type="button"
                    onClick={onDelete}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-lg opacity-0 group-hover/card:opacity-100"
                >
                    ×
                </button>
            )}
        </div>
    );
}

// Contenedor con efecto glassmorphism (fondo translúcido + blur)
function GlassCard({ children, className }) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/60",
                className,
            )}
        >
            {children}
        </div>
    );
}

// ===== Componentes de navegación del asistente =====

// Panel lateral con los 3 pasos del asistente
function StepWizard({ current, onChange }) {
    return (
        <div className="hidden lg:flex flex-col gap-3 w-56 shrink-0">
            {STEPS.map((s, i) => {
                const isActive = current === i;
                const done = i < current;
                return (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => onChange(i)}
                        className={cn(
                            "group relative flex items-center gap-4 px-5 py-3.5 rounded-2xl text-left transition-all duration-300",
                            isActive
                                ? "bg-white shadow-lg shadow-slate-200/80 scale-[1.02]"
                                : "hover:bg-white/60 hover:shadow-sm",
                            done ? "opacity-80" : "",
                        )}
                    >
                        {isActive && (
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-navy-50 to-white opacity-50" />
                        )}
                        <div
                            className={cn(
                                "relative w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300",
                                isActive
                                    ? "bg-gradient-to-br from-navy-500 to-navy-700 text-white shadow-md shadow-navy-200 scale-110"
                                    : done
                                      ? "bg-emerald-100 text-emerald-600"
                                      : "bg-slate-100 text-slate-400",
                            )}
                        >
                            <Icon
                                name={done ? "check" : s.icon}
                                className={cn(
                                    isActive
                                        ? "text-white"
                                        : done
                                          ? "text-emerald-600"
                                          : "text-slate-400",
                                )}
                            />
                        </div>
                        <div className="relative">
                            <span
                                className={cn(
                                    "block text-xs font-semibold uppercase tracking-wider transition-colors",
                                    isActive
                                        ? "text-navy-700"
                                        : done
                                          ? "text-emerald-600"
                                          : "text-slate-400",
                                )}
                            >
                                Paso {i + 1}
                            </span>
                            <span
                                className={cn(
                                    "block text-sm font-bold transition-colors",
                                    isActive
                                        ? "text-slate-800"
                                        : "text-slate-500",
                                )}
                            >
                                {s.label}
                            </span>
                        </div>
                        {done && (
                            <div className="relative ml-auto">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <svg
                                        className="w-3.5 h-3.5 text-emerald-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </button>
                );
            })}
            <div className="mt-4 px-5 py-4 rounded-2xl bg-gradient-to-br from-navy-50 to-indigo-50/50 border border-navy-100/50">
                <div className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1">
                    Progreso
                </div>
                <div className="w-full h-1.5 bg-navy-100/70 rounded-full overflow-hidden mt-2">
                    <div
                        className="h-full bg-gradient-to-r from-navy-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${((current + 1) / STEPS.length) * 100}%`,
                        }}
                    />
                </div>
                <div className="text-xs text-navy-400 mt-1.5 font-medium">
                    {current + 1} de {STEPS.length}
                </div>
            </div>
        </div>
    );
}

// Sección colapsable del perfil profesional (Paso 1)
function SectionCard({ icon, label, color, children, open, onToggle, step }) {
    return (
        <GlassCard
            className={cn(
                "overflow-hidden transition-all duration-300",
                open && "shadow-xl",
            )}
        >
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/50 cursor-pointer group"
            >
                <div className="flex items-center gap-3.5">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm transition-transform duration-200",
                            open && "scale-110",
                            color,
                        )}
                    >
                        <Icon name={icon} className="text-white text-sm" />
                    </div>
                    <div className="text-left">
                        <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            {label}
                            {open && step !== undefined && (
                                <span className="text-[10px] font-semibold text-navy-500 bg-navy-50 px-2 py-0.5 rounded-full">
                                    Paso {step}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                <div
                    className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300",
                        open
                            ? "bg-navy-50 text-navy-600"
                            : "text-slate-300 group-hover:text-slate-500",
                    )}
                >
                    <svg
                        className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            open && "rotate-180",
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </button>
            {open && (
                <div className="px-6 pb-6 space-y-5 animate-slide-down">
                    {children}
                </div>
            )}
        </GlassCard>
    );
}

// ==================== PASO 0: DATOS PERSONALES ====================
function StepPersonal({
    data,
    setData,
    setPhoto,
    photoPreview,
    setPhotoPreview,
    onNext,
}) {
    function onPhoto(e) {
        const file = e.target.files[0];
        if (!file) return;
        setPhoto(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    }

    return (
        <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <Icon name="person" className="text-white text-lg" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">
                        Información personal
                    </h2>
                    <p className="text-xs text-slate-500">
                        Tus datos de contacto y redes sociales
                    </p>
                </div>
            </div>

            <GlassCard className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Nombre completo"
                            value={data.name}
                            onChange={(e) =>
                                setData((d) => ({ ...d, name: e.target.value }))
                            }
                            placeholder="Ej: María García López"
                        />
                    </div>
                    <Input
                        label="Correo electrónico"
                        type="email"
                        value={data.email}
                        onChange={(e) =>
                            setData((d) => ({ ...d, email: e.target.value }))
                        }
                        placeholder="maria@ejemplo.com"
                    />
                    <Input
                        label="Teléfono"
                        value={data.telephone}
                        onChange={(e) =>
                            setData((d) => ({
                                ...d,
                                telephone: e.target.value,
                            }))
                        }
                        placeholder="+34 600 000 000"
                    />
                    <Input
                        label="Dirección"
                        value={data.address}
                        onChange={(e) =>
                            setData((d) => ({ ...d, address: e.target.value }))
                        }
                        placeholder="08001, Barcelona, España"
                    />
                    <Input
                        label="Nacionalidad"
                        value={data.nationality}
                        onChange={(e) =>
                            setData((d) => ({
                                ...d,
                                nationality: e.target.value,
                            }))
                        }
                        placeholder="Española"
                    />
                    <Input
                        label="Fecha de nacimiento"
                        type="date"
                        value={data.dateOfBirth}
                        onChange={(e) =>
                            setData((d) => ({
                                ...d,
                                dateOfBirth: e.target.value,
                            }))
                        }
                    />
                </div>
            </GlassCard>

            <GlassCard className="p-6">
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="shrink-0">
                        {photoPreview ? (
                            <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-md ring-2 ring-white">
                                <img
                                    src={photoPreview}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPhoto(null);
                                        setPhotoPreview(null);
                                    }}
                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xs hover:bg-black/60 transition"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <label className="cursor-pointer inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-navy-500 to-indigo-600 text-white font-semibold text-sm rounded-xl hover:from-navy-600 hover:to-indigo-700 transition-all shadow-md shadow-navy-200/50 hover:shadow-lg">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 5v9"
                                />
                            </svg>
                            Subir foto
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onPhoto}
                                className="hidden"
                            />
                        </label>
                        <p className="text-xs text-slate-400 mt-2">
                            PNG, JPG o WebP — se mostrará como recorte circular
                            en el CV
                        </p>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                    <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                    </svg>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Redes sociales
                    </span>
                </div>
                {data.socialLinks.length === 0 && (
                    <p className="text-sm text-slate-400 italic">
                        Aún no has añadido ninguna red social.
                    </p>
                )}
                {data.socialLinks.map((link, i) => (
                    <EntryCard
                        key={i}
                        onDelete={() =>
                            setData((d) => ({
                                ...d,
                                socialLinks: d.socialLinks.filter(
                                    (_, j) => j !== i,
                                ),
                            }))
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Red"
                                value={link.name}
                                onChange={(e) => {
                                    const s = [...data.socialLinks];
                                    s[i] = { ...s[i], name: e.target.value };
                                    setData((d) => ({ ...d, socialLinks: s }));
                                }}
                                placeholder="LinkedIn, GitHub..."
                            />
                            <Input
                                label="URL"
                                value={link.url}
                                onChange={(e) => {
                                    const s = [...data.socialLinks];
                                    s[i] = { ...s[i], url: e.target.value };
                                    setData((d) => ({ ...d, socialLinks: s }));
                                }}
                                placeholder="linkedin.com/in/usuario"
                            />
                        </div>
                    </EntryCard>
                ))}
                <button
                    type="button"
                    onClick={() =>
                        setData((d) => ({
                            ...d,
                            socialLinks: [
                                ...d.socialLinks,
                                { name: "", url: "" },
                            ],
                        }))
                    }
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-700 transition-colors"
                >
                    <span className="w-5 h-5 rounded-full border-2 border-navy-400 flex items-center justify-center text-xs font-bold">
                        +
                    </span>
                    Añadir red social
                </button>
            </GlassCard>

            <NavButtons step={0} onPrev={() => {}} onNext={onNext} />
        </div>
    );
}

// ==================== PASO 1: PERFILES MULTILINGÜE (flujo secuencial por idioma) ====================
function StepProfiles({
    data,
    setData,
    activeLang,
    setActiveLang,
    langsDone,
    profileExpanded,
    toggleProfile,
    onPrev,
    onNext,
}) {
    const prof = data.profiles[activeLang] || EMPTY_PROFILE;

    function setProf(key, val) {
        setData((d) => ({
            ...d,
            profiles: {
                ...d.profiles,
                [activeLang]: { ...d.profiles[activeLang], [key]: val },
            },
        }));
    }

    return (
        <div className="space-y-5 animate-fade-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                        <Icon
                            name="description"
                            className="text-white text-lg"
                        />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Contenido del CV
                        </h2>
                        <p className="text-xs text-slate-500">
                            Editando: {LANG_MAP[activeLang]}
                        </p>
                    </div>
                </div>
                {/* Píldoras para cambiar entre idiomas ya completados */}
                {langsDone.length > 0 && (
                    <div className="flex gap-1.5">
                        {langsDone.map((code) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => setActiveLang(code)}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-semibold rounded-xl transition-all",
                                    activeLang === code
                                        ? "bg-navy-600 text-white shadow-md"
                                        : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80",
                                )}
                            >
                                {LANG_MAP[code]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {PROFILE_SECTIONS.map((sec, idx) => (
                    <SectionCard
                        key={sec.key}
                        icon={sec.icon}
                        label={sec.label}
                        color={sec.color}
                        open={profileExpanded[sec.key]}
                        onToggle={() => toggleProfile(sec.key)}
                        step={idx + 1}
                    >
                        {sec.key === "intro" && (
                            <>
                                <Input
                                    label="Título profesional"
                                    value={prof.title}
                                    onChange={(e) =>
                                        setProf("title", e.target.value)
                                    }
                                    placeholder="Ej: Desarrollador Full Stack"
                                />
                                <TextArea
                                    label="Descripción corta"
                                    value={prof.shortDescription}
                                    onChange={(e) =>
                                        setProf(
                                            "shortDescription",
                                            e.target.value,
                                        )
                                    }
                                />
                            </>
                        )}
                        {sec.key === "work" && (
                            <>
                                {prof.workExperience.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">
                                        Sin experiencia laboral añadida.
                                    </p>
                                )}
                                {prof.workExperience.map((w, i) => (
                                    <EntryCard
                                        key={i}
                                        title={`Experiencia ${i + 1}`}
                                        color="from-blue-500 to-cyan-600"
                                        onDelete={() =>
                                            setProf(
                                                "workExperience",
                                                prof.workExperience.filter(
                                                    (_, j) => j !== i,
                                                ),
                                            )
                                        }
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Input
                                                label="Fechas"
                                                value={w.dates}
                                                onChange={(e) => {
                                                    const we = [
                                                        ...prof.workExperience,
                                                    ];
                                                    we[i] = {
                                                        ...we[i],
                                                        dates: e.target.value,
                                                    };
                                                    setProf(
                                                        "workExperience",
                                                        we,
                                                    );
                                                }}
                                                placeholder="ene 2024 - actualidad"
                                            />
                                            <Input
                                                label="Ocupación"
                                                value={w.occupation}
                                                onChange={(e) => {
                                                    const we = [
                                                        ...prof.workExperience,
                                                    ];
                                                    we[i] = {
                                                        ...we[i],
                                                        occupation:
                                                            e.target.value,
                                                    };
                                                    setProf(
                                                        "workExperience",
                                                        we,
                                                    );
                                                }}
                                                placeholder="Desarrollador Full Stack"
                                            />
                                            <Input
                                                label="Empleador"
                                                value={w.employer}
                                                onChange={(e) => {
                                                    const we = [
                                                        ...prof.workExperience,
                                                    ];
                                                    we[i] = {
                                                        ...we[i],
                                                        employer:
                                                            e.target.value,
                                                    };
                                                    setProf(
                                                        "workExperience",
                                                        we,
                                                    );
                                                }}
                                                placeholder="Empresa S.L."
                                            />
                                            <Input
                                                label="Ubicación"
                                                value={w.location}
                                                onChange={(e) => {
                                                    const we = [
                                                        ...prof.workExperience,
                                                    ];
                                                    we[i] = {
                                                        ...we[i],
                                                        location:
                                                            e.target.value,
                                                    };
                                                    setProf(
                                                        "workExperience",
                                                        we,
                                                    );
                                                }}
                                                placeholder="Barcelona, España"
                                            />
                                        </div>
                                        <ArrayField
                                            label="Tareas"
                                            values={w.description}
                                            placeholder="Ej: Desarrollo de APIs REST"
                                            onChange={(v) => {
                                                const we = [
                                                    ...prof.workExperience,
                                                ];
                                                we[i] = {
                                                    ...we[i],
                                                    description: v,
                                                };
                                                setProf("workExperience", we);
                                            }}
                                        />
                                    </EntryCard>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setProf("workExperience", [
                                            ...prof.workExperience,
                                            { ...EMPTY_WORK },
                                        ])
                                    }
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-700 transition-colors"
                                >
                                    <span className="w-5 h-5 rounded-full border-2 border-navy-400 flex items-center justify-center text-xs font-bold">
                                        +
                                    </span>
                                    Añadir experiencia
                                </button>
                            </>
                        )}
                        {sec.key === "edu" && (
                            <>
                                {prof.education.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">
                                        Sin formación añadida.
                                    </p>
                                )}
                                {prof.education.map((e, i) => (
                                    <EntryCard
                                        key={i}
                                        title={`Formación ${i + 1}`}
                                        color="from-emerald-500 to-teal-600"
                                        onDelete={() =>
                                            setProf(
                                                "education",
                                                prof.education.filter(
                                                    (_, j) => j !== i,
                                                ),
                                            )
                                        }
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Input
                                                label="Fechas"
                                                value={e.dates}
                                                onChange={(ev) => {
                                                    const ed = [
                                                        ...prof.education,
                                                    ];
                                                    ed[i] = {
                                                        ...ed[i],
                                                        dates: ev.target.value,
                                                    };
                                                    setProf("education", ed);
                                                }}
                                                placeholder="2020 - 2024"
                                            />
                                            <Input
                                                label="Titulación"
                                                value={e.qualification}
                                                onChange={(ev) => {
                                                    const ed = [
                                                        ...prof.education,
                                                    ];
                                                    ed[i] = {
                                                        ...ed[i],
                                                        qualification:
                                                            ev.target.value,
                                                    };
                                                    setProf("education", ed);
                                                }}
                                                placeholder="Grado en Ingeniería"
                                            />
                                            <Input
                                                label="Institución"
                                                value={e.institution}
                                                onChange={(ev) => {
                                                    const ed = [
                                                        ...prof.education,
                                                    ];
                                                    ed[i] = {
                                                        ...ed[i],
                                                        institution:
                                                            ev.target.value,
                                                    };
                                                    setProf("education", ed);
                                                }}
                                                placeholder="Universidad de Barcelona"
                                            />
                                        </div>
                                    </EntryCard>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setProf("education", [
                                            ...prof.education,
                                            { ...EMPTY_EDU },
                                        ])
                                    }
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-700 transition-colors"
                                >
                                    <span className="w-5 h-5 rounded-full border-2 border-navy-400 flex items-center justify-center text-xs font-bold">
                                        +
                                    </span>
                                    Añadir formación
                                </button>
                            </>
                        )}
                        {sec.key === "lang" && (
                            <ArrayField
                                label="Idiomas"
                                values={prof.languageSkills.map(
                                    (l) => l.language,
                                )}
                                placeholder="Ej: Inglés C1 Avanzado"
                                onChange={(v) =>
                                    setProf(
                                        "languageSkills",
                                        v.map((lang) => ({ language: lang })),
                                    )
                                }
                            />
                        )}
                        {sec.key === "skills" && (
                            <>
                                {prof.digitalSkills.length === 0 && (
                                    <p className="text-sm text-slate-400 italic">
                                        Sin categorías añadidas.
                                    </p>
                                )}
                                {prof.digitalSkills.map((cat, i) => (
                                    <EntryCard
                                        key={i}
                                        title={`Categoría ${i + 1}`}
                                        color="from-pink-500 to-rose-600"
                                        onDelete={() =>
                                            setProf(
                                                "digitalSkills",
                                                prof.digitalSkills.filter(
                                                    (_, j) => j !== i,
                                                ),
                                            )
                                        }
                                    >
                                        <Input
                                            label="Categoría"
                                            value={cat.category}
                                            onChange={(e) => {
                                                const ds = [
                                                    ...prof.digitalSkills,
                                                ];
                                                ds[i] = {
                                                    ...ds[i],
                                                    category: e.target.value,
                                                };
                                                setProf("digitalSkills", ds);
                                            }}
                                            placeholder="Ej: Backend, Frontend..."
                                        />
                                        <ArrayField
                                            label="Tecnologías"
                                            values={cat.items}
                                            placeholder="Ej: React, Node.js..."
                                            onChange={(v) => {
                                                const ds = [
                                                    ...prof.digitalSkills,
                                                ];
                                                ds[i] = { ...ds[i], items: v };
                                                setProf("digitalSkills", ds);
                                            }}
                                        />
                                    </EntryCard>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setProf("digitalSkills", [
                                            ...prof.digitalSkills,
                                            { ...EMPTY_CAT },
                                        ])
                                    }
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-700 transition-colors"
                                >
                                    <span className="w-5 h-5 rounded-full border-2 border-navy-400 flex items-center justify-center text-xs font-bold">
                                        +
                                    </span>
                                    Añadir categoría
                                </button>
                            </>
                        )}
                        {sec.key === "comm" && (
                            <ArrayField
                                label="Habilidades"
                                values={prof.communicationSkills}
                                placeholder="Ej: Trabajo en equipo, liderazgo..."
                                onChange={(v) =>
                                    setProf("communicationSkills", v)
                                }
                            />
                        )}
                        {sec.key === "org" && (
                            <ArrayField
                                label="Habilidades"
                                values={prof.organisationalSkills}
                                placeholder="Ej: Gestión de proyectos, metodologías ágiles..."
                                onChange={(v) =>
                                    setProf("organisationalSkills", v)
                                }
                            />
                        )}
                        {sec.key === "tech" && (
                            <ArrayField
                                label="Habilidades"
                                values={prof.jobRelatedSkills}
                                placeholder="Ej: Docker, AWS, CI/CD..."
                                onChange={(v) => setProf("jobRelatedSkills", v)}
                            />
                        )}
                        {sec.key === "extra" && (
                            <TextArea
                                label="Información adicional"
                                value={prof.additionalInfo}
                                onChange={(e) =>
                                    setProf("additionalInfo", e.target.value)
                                }
                            />
                        )}
                    </SectionCard>
                ))}
            </div>

            <NavButtons
                step={1}
                onPrev={onPrev}
                onNext={onNext}
            />
        </div>
    );
}

// ==================== PASO 3: DESCARGA ====================
// Genera los 3 CVs (ES/CA/EN) de una sola vez y muestra los disponibles para descargar
// Paso de descarga: genera los CVs solo para los idiomas que el usuario completó
function StepDownload({ data, photo, setStep, langsDone }) {
    const [blobs, setBlobs] = useState({});
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [errors, setErrors] = useState([]);

    async function generateAll() {
        if (!data.name.trim()) {
            alert("El nombre es obligatorio");
            return;
        }
        setGenerating(true);
        setErrors([]);
        setBlobs({});

        // Convert photo File to data URL if provided
        const getPhotoDataUrl = () => {
            if (!photo) return Promise.resolve(null);
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(photo);
            });
        };
        const photoDataUrl = await getPhotoDataUrl();

        const results = await Promise.allSettled(
            langsDone.map(async (lang) => {
                const doc = generateCV(data, lang, photoDataUrl);
                const blob = doc.output('blob');
                return { lang, blob };
            })
        );

        const newBlobs = {};
        const newErrors = [];
        for (const r of results) {
            if (r.status === "fulfilled") {
                newBlobs[r.value.lang] = r.value.blob;
            } else {
                newErrors.push(r.reason.message);
            }
        }
        setBlobs(newBlobs);
        setErrors(newErrors);
        setGenerated(true);
        setGenerating(false);
    }

    function downloadBlob(lang) {
        const blob = blobs[lang];
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cv-${lang}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const allDone = generated && Object.keys(blobs).length === langsDone.length;

    return (
        <div className="animate-scale-in flex flex-col items-center justify-center py-8">
            <GlassCard className="w-full max-w-lg p-8 text-center space-y-6">
                <div className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg animate-float",
                    allDone
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                        : "bg-gradient-to-br from-navy-500 to-indigo-600",
                )}>
                    <svg
                        className="w-9 h-9 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                    >
                        {allDone ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        )}
                    </svg>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {allDone ? "CVs generados" : generating ? "Generando CVs..." : "Descargar CV"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {allDone
                            ? "Los CVs están listos. Elige cuál descargar:"
                            : generating
                                ? "Generando los CVs..."
                                : `Genera los CVs (${langsDone.map(c => LANG_MAP[c]).join(", ")})`}
                    </p>
                </div>

                {/* Barra de progreso durante la generación */}
                {generating && (
                    <div className="space-y-2">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-navy-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: (Object.keys(blobs).length / langsDone.length) * 100 + "%" }}
                            />
                        </div>
                        <p className="text-xs text-slate-400">
                            {Object.keys(blobs).length} de {langsDone.length}
                        </p>
                    </div>
                )}

                {/* Botones de descarga cuando ya están generados */}
                {generated && (
                    <div className="space-y-3">
                        {langsDone.map((code) => {
                            const ready = !!blobs[code];
                            return (
                                <button
                                    key={code}
                                    type="button"
                                    onClick={() => ready && downloadBlob(code)}
                                    disabled={!ready}
                                    className={cn(
                                        BtnPrimary,
                                        "w-full justify-center text-base py-3.5",
                                        code === 'es' && "bg-gradient-to-r from-navy-600 to-indigo-600",
                                        code === 'ca' && "bg-gradient-to-r from-amber-600 to-orange-600",
                                        code === 'en' && "bg-gradient-to-r from-emerald-600 to-teal-600",
                                        !ready && "opacity-40 pointer-events-none",
                                    )}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 5v9" />
                                    </svg>
                                    Descargar CV — {LANG_MAP[code]}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Errores */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Errores</p>
                        {errors.map((e, i) => (
                            <p key={i} className="text-sm text-red-700">{e}</p>
                        ))}
                    </div>
                )}

                <div className="space-y-3">
                    {!generated && !generating && (
                        <button
                            type="button"
                            onClick={generateAll}
                            className={cn(BtnPrimary, "w-full justify-center bg-gradient-to-r from-navy-600 to-indigo-600 text-base py-3.5")}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 5v9" />
                            </svg>
                            Generar CVs ({langsDone.map(c => c.toUpperCase()).join(", ")})
                        </button>
                    )}
                    {generating && (
                        <button
                            type="button"
                            disabled
                            className={cn(BtnPrimary, "w-full justify-center bg-gradient-to-r from-navy-600 to-indigo-600 text-base py-3.5 opacity-80 pointer-events-none")}
                        >
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generando...
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Volver a perfiles {langsDone.length > 0 && `(${langsDone.length})`}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}

// Botones de navegación (Anterior / Continuar) para cada paso
function NavButtons({ step, onPrev, onNext }) {
    return (
        <div className="flex justify-between pt-2">
            {step > 0 ? (
                <button
                    type="button"
                    onClick={onPrev}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 rounded-xl hover:bg-white/60 transition-all"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Anterior
                </button>
            ) : (
                <div />
            )}
            {step < 3 && (
                <button
                    type="button"
                    onClick={onNext}
                    className={cn(
                        BtnPrimary,
                        "bg-gradient-to-r from-navy-600 to-indigo-600",
                    )}
                >
                    Continuar
                    <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function App() {
    const [data, setData] = useState({
        name: "",
        address: "",
        telephone: "",
        email: "",
        nationality: "",
        dateOfBirth: "",
        socialLinks: [],
        profiles: initProfiles(),
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [activeLang, setActiveLang] = useState("es");
    const [step, setStep] = useState(0);
    const [profileExpanded, setProfileExpanded] = useState({});
    // Idiomas que el usuario ha completado
    const [langsDone, setLangsDone] = useState([]);
    // Idiomas que el usuario rechazó al preguntarle si quería añadirlos
    const [langsSkipped, setLangsSkipped] = useState([]);
    // Controla si se muestra el modal para añadir otro idioma
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    // Idioma que se está preguntando en el modal
    const [pendingLang, setPendingLang] = useState("");

    function toggleProfile(key) {
        setProfileExpanded((s) => ({ ...s, [key]: !s[key] }));
    }

    // Al hacer clic en "Continuar" en Perfiles: guarda el idioma actual como completado
    // y si quedan idiomas sin completar ni saltar, pregunta si quiere añadirlos
    function handleProfileNext() {
        const updated = [...new Set([...langsDone, activeLang])];
        setLangsDone(updated);
        const remaining = LANG_CODES.filter(
            (c) => !updated.includes(c) && !langsSkipped.includes(c),
        );
        if (remaining.length > 0) {
            setPendingLang(remaining[0]);
            setShowLangPrompt(true);
        } else {
            setStep(2);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative">
            <ParticleBackground />
            <div className="relative z-10">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
                    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-600 to-indigo-600 flex items-center justify-center shadow-md">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <span className="font-bold text-slate-800">
                                    CV Generator
                                </span>
                            </div>
                        </div>

                        {/* Mobile step indicator */}
                        <div className="flex items-center gap-2 lg:hidden">
                            {STEPS.map((s, i) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setStep(i)}
                                    className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                                        i === step
                                            ? "bg-navy-600 text-white shadow-md scale-110"
                                            : i < step
                                              ? "bg-emerald-100 text-emerald-600"
                                              : "bg-slate-100 text-slate-400",
                                    )}
                                >
                                    <Icon
                                        name={i < step ? "check" : s.icon}
                                        className={
                                            i === step
                                                ? "text-white"
                                                : i < step
                                                  ? "text-emerald-600"
                                                  : "text-slate-400"
                                        }
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Main */}
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex gap-8">
                        <StepWizard current={step} onChange={setStep} />

                        <div className="flex-1 min-w-0">
                            {step === 0 && (
                                <StepPersonal
                                    data={data}
                                    setData={setData}
                                    setPhoto={setPhoto}
                                    photoPreview={photoPreview}
                                    setPhotoPreview={setPhotoPreview}
                                    onNext={() => setStep(1)}
                                />
                            )}
                            {step === 1 && (
                                <StepProfiles
                                    data={data}
                                    setData={setData}
                                    activeLang={activeLang}
                                    setActiveLang={setActiveLang}
                                    langsDone={langsDone}
                                    profileExpanded={profileExpanded}
                                    toggleProfile={toggleProfile}
                                    onPrev={() => setStep(0)}
                                    onNext={handleProfileNext}
                                />
                            )}
                            {step === 2 && (
                                <StepReview
                                    data={data}
                                    photoPreview={photoPreview}
                                    activeLang={activeLang}
                                    setActiveLang={setActiveLang}
                                    onPrev={() => setStep(1)}
                                    onNext={() => setStep(3)}
                                />
                            )}
                            {step === 3 && (
                                <StepDownload
                                    data={data}
                                    photo={photo}
                                    setStep={setStep}
                                    langsDone={langsDone}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal: pregunta si quiere añadir otro idioma antes de continuar */}
                {showLangPrompt && (
                    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-5 border border-white/60 animate-scale-in">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto shadow-lg">
                                <span className="material-symbols-outlined text-white text-2xl">translate</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    ¿Quieres añadir el CV en {LANG_MAP[pendingLang]}?
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Puedes tener tu CV en varios idiomas. Los idiomas que no añadas ahora no se generarán.
                                </p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <button
                                    type="button"
                                    // Cambia al idioma pendiente para que el usuario lo rellene
                                    onClick={() => {
                                        setActiveLang(pendingLang);
                                        setShowLangPrompt(false);
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 font-semibold text-sm text-white rounded-xl bg-gradient-to-r from-navy-600 to-indigo-600 hover:shadow-lg transition-all"
                                >
                                    Sí, añadir {LANG_MAP[pendingLang]}
                                </button>
                                <button
                                    type="button"
                                    // Guarda el idioma como saltado y busca el siguiente pendiente
                                    onClick={() => {
                                        const newSkipped = [...langsSkipped, pendingLang];
                                        setLangsSkipped(newSkipped);
                                        setShowLangPrompt(false);
                                        const remaining = LANG_CODES.filter(
                                            (c) => !langsDone.includes(c) && !newSkipped.includes(c),
                                        );
                                        if (remaining.length > 0) {
                                            setPendingLang(remaining[0]);
                                            setShowLangPrompt(true);
                                        } else {
                                            setStep(2);
                                        }
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 font-semibold text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                >
                                    No, continuar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <footer className="text-center py-8 text-xs text-slate-400">
                    Hecho con React + Vite + PDFKit
                </footer>
            </div>
        </div>
    );
}
