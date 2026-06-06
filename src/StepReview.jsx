// Paso de revisión: muestra todos los datos ingresados antes de descargar
import { useState } from "react";

const LANG_MAP = { es: "Español", ca: "Català", en: "English" };
const LANG_CODES = ["es", "ca", "en"];

function cn(...cls) {
    return cls.filter(Boolean).join(" ");
}

// Etiquetas para cada sección del perfil
const SEC_LABELS = {
    title: "Título profesional",
    shortDescription: "Descripción corta",
    workExperience: "Experiencia laboral",
    education: "Educación",
    languageSkills: "Idiomas",
    digitalSkills: "Habilidades digitales",
    communicationSkills: "Competencias de comunicación",
    organisationalSkills: "Competencias de organización",
    jobRelatedSkills: "Competencias técnicas",
    additionalInfo: "Información adicional",
};

// Tarjeta reutilizable para mostrar un grupo de datos
function InfoCard({ title, children, onEdit, className }) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/60 p-6 space-y-4",
                className,
            )}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    {title}
                </h3>
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-xs font-semibold text-navy-600 hover:text-navy-700 hover:bg-navy-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Editar
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

// Muestra un campo con label y valor
function Field({ label, value }) {
    if (!value) return null;
    return (
        <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {label}
            </span>
            <p className="text-sm text-slate-700 mt-0.5">{value}</p>
        </div>
    );
}

// Muestra una lista de strings
function ListBlock({ items }) {
    if (!items || !items.length) return null;
    return (
        <ul className="space-y-1">
            {items.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-slate-300 mt-px">•</span>
                    {item}
                </li>
            ))}
        </ul>
    );
}

// Revisión de todos los datos del CV
export default function StepReview({ data, photoPreview, activeLang, setActiveLang, onPrev, onNext }) {
    const [langTab, setLangTab] = useState(activeLang);

    function hasProfileData(lang) {
        const p = data.profiles[lang];
        if (!p) return false;
        return p.title || p.shortDescription || p.workExperience?.length || p.education?.length
            || p.languageSkills?.length || p.digitalSkills?.length || p.communicationSkills?.length
            || p.organisationalSkills?.length || p.jobRelatedSkills?.length || p.additionalInfo;
    }

    const availableLangs = LANG_CODES.filter(hasProfileData);
    const currentLang = availableLangs.includes(langTab) ? langTab : availableLangs[0] || "es";
    const prof = data.profiles[currentLang] || {};

    return (
        <div className="space-y-5 animate-fade-up">
            {/* Título */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                        <span className="material-symbols-outlined text-white text-lg">visibility</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Revisa tu CV
                        </h2>
                        <p className="text-xs text-slate-500">
                            Verifica que todos los datos sean correctos antes de descargar
                        </p>
                    </div>
                </div>
                {/* Pestañas de idioma para los perfiles */}
                {availableLangs.length > 1 && (
                    <div className="inline-flex gap-1 bg-slate-100/80 backdrop-blur-sm p-1 rounded-2xl border border-slate-200/60 shadow-sm">
                        {availableLangs.map((code) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => { setLangTab(code); setActiveLang(code); }}
                                className={cn(
                                    "px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                                    currentLang === code
                                        ? "bg-white text-navy-700 shadow-md shadow-slate-200/80 scale-105"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50",
                                )}
                            >
                                {LANG_MAP[code]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Datos personales */}
            <InfoCard title="Información personal" onEdit={() => onPrev()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nombre" value={data.name} />
                    <Field label="Correo" value={data.email} />
                    <Field label="Teléfono" value={data.telephone} />
                    <Field label="Dirección" value={data.address} />
                    <Field label="Nacionalidad" value={data.nationality} />
                    <Field label="Fecha de nacimiento" value={data.dateOfBirth} />
                </div>
                {photoPreview && (
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Foto</span>
                        <div className="mt-1 w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white shadow-md">
                            <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}
            </InfoCard>

            {/* Redes sociales */}
            {data.socialLinks?.length > 0 && data.socialLinks.some(s => s.name || s.url) && (
                <InfoCard title="Redes sociales" onEdit={() => onPrev()}>
                    <div className="space-y-2">
                        {data.socialLinks.filter(s => s.name || s.url).map((s, i) => (
                            <div key={i} className="text-sm text-slate-700">
                                {s.name && <span className="font-semibold">{s.name}: </span>}
                                {s.url && <span className="text-slate-500">{s.url}</span>}
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}

            {/* Perfil del idioma actual */}
            {prof.title || prof.shortDescription ? (
                <InfoCard
                    title={`Introducción — ${LANG_MAP[currentLang]}`}
                    onEdit={() => onPrev()}
                >
                    <Field label="Título profesional" value={prof.title} />
                    <Field label="Descripción corta" value={prof.shortDescription} />
                </InfoCard>
            ) : null}

            {/* Experiencia laboral */}
            {prof.workExperience?.length > 0 && (
                <InfoCard
                    title={`Experiencia laboral — ${LANG_MAP[currentLang]}`}
                    onEdit={() => onPrev()}
                >
                    {prof.workExperience.map((w, i) => (
                        <div key={i} className={cn("pb-4", i < prof.workExperience.length - 1 && "border-b border-slate-200 mb-4")}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-sm text-slate-800">{w.occupation || "—"}</p>
                                    <p className="text-xs text-slate-500">{w.employer}{w.employer && w.location ? " · " : ""}{w.location}</p>
                                </div>
                                {w.dates && <span className="text-xs text-slate-400 shrink-0">{w.dates}</span>}
                            </div>
                            <ListBlock items={w.description?.filter(Boolean)} />
                        </div>
                    ))}
                </InfoCard>
            )}

            {/* Educación */}
            {prof.education?.length > 0 && (
                <InfoCard
                    title={`Educación — ${LANG_MAP[currentLang]}`}
                    onEdit={() => onPrev()}
                >
                    {prof.education.map((e, i) => (
                        <div key={i} className={cn("pb-3", i < prof.education.length - 1 && "border-b border-slate-200 mb-3")}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-sm text-slate-800">{e.qualification || "—"}</p>
                                    <p className="text-xs text-slate-500">{e.institution}</p>
                                </div>
                                {e.dates && <span className="text-xs text-slate-400 shrink-0">{e.dates}</span>}
                            </div>
                        </div>
                    ))}
                </InfoCard>
            )}

            {/* Idiomas */}
            {prof.languageSkills?.length > 0 && (
                <InfoCard
                    title={`Idiomas — ${LANG_MAP[currentLang]}`}
                    onEdit={() => onPrev()}
                >
                    <ListBlock items={prof.languageSkills.map(l => l.language).filter(Boolean)} />
                </InfoCard>
            )}

            {/* Habilidades digitales */}
            {prof.digitalSkills?.length > 0 && (
                <InfoCard
                    title={`Habilidades digitales — ${LANG_MAP[currentLang]}`}
                    onEdit={() => onPrev()}
                >
                    {prof.digitalSkills.map((cat, i) => (
                        <div key={i}>
                            <p className="text-sm font-semibold text-slate-700">{cat.category}</p>
                            <ListBlock items={cat.items?.filter(Boolean)} />
                        </div>
                    ))}
                </InfoCard>
            )}

            {/* Listas de habilidades */}
            {[
                { key: "communicationSkills", label: "Comunicación" },
                { key: "organisationalSkills", label: "Organización" },
                { key: "jobRelatedSkills", label: "Técnicas" },
            ].map(({ key, label }) => {
                const items = prof[key]?.filter(Boolean);
                if (!items?.length) return null;
                return (
                    <InfoCard
                        key={key}
                        title={`${label} — ${LANG_MAP[currentLang]}`}
                        onEdit={() => onPrev()}
                    >
                        <ListBlock items={items} />
                    </InfoCard>
                );
            })}

            {/* Información adicional */}
            {prof.additionalInfo && (
                <InfoCard
                    title={`Información adicional — ${LANG_MAP[currentLang]}`}
                    onEdit={() => onPrev()}
                >
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{prof.additionalInfo}</p>
                </InfoCard>
            )}

            {/* Navegación */}
            <div className="flex justify-between pt-2">
                <button
                    type="button"
                    onClick={onPrev}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 rounded-xl hover:bg-white/60 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="group relative inline-flex items-center gap-2 px-6 py-2.5 font-semibold text-sm text-white rounded-xl overflow-hidden shadow-lg shadow-emerald-200/50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-xl hover:shadow-emerald-300/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
                >
                    Continuar
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}