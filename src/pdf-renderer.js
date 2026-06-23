import { jsPDF } from 'jspdf';

const theme = {
    page: { w: 595.28, h: 841.89, margin: 60 },
    leftPanel: { width: 200, bg: '#eef2f6', text: '#1a2a4a', accent: '#2b6cb0', muted: '#5a6b7d' },
    rightPanel: { heading: '#1a2a4a', accent: '#2b6cb0', text: '#2d2d2d', muted: '#5a6b7d', border: '#d0d5dd' }
};

const labels = {
    es: {
        workExperience: 'EXPERIENCIA LABORAL', education: 'EDUCACION Y FORMACION',
        communicationSkills: 'COMPETENCIAS DE COMUNICACION', organisationalSkills: 'COMPETENCIAS DE ORGANIZACION',
        jobRelatedSkills: 'COMPETENCIAS TECNICAS', additionalInfo: 'INFORMACION ADICIONAL',
        skillsShort: 'HABILIDADES', languagesShort: 'IDIOMAS'
    },
    ca: {
        workExperience: 'EXPERIENCIA LABORAL', education: 'EDUCACIO I FORMACIO',
        communicationSkills: 'COMPETENCIES DE COMUNICACIO', organisationalSkills: "COMPETENCIES D'ORGANITZACIO",
        jobRelatedSkills: 'COMPETENCIES TEONIQUES', additionalInfo: 'INFORMACIO ADDICIONAL',
        skillsShort: 'HABILITATS', languagesShort: 'IDIOMES'
    },
    en: {
        workExperience: 'WORK EXPERIENCE', education: 'EDUCATION AND TRAINING',
        communicationSkills: 'COMMUNICATION SKILLS', organisationalSkills: 'ORGANISATIONAL SKILLS',
        jobRelatedSkills: 'JOB-RELATED SKILLS', additionalInfo: 'ADDITIONAL INFORMATION',
        skillsShort: 'SKILLS', languagesShort: 'LANGUAGES'
    }
};

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function setFill(doc, hex) { const [r, g, b] = hexToRgb(hex); doc.setFillColor(r, g, b); }
function setDraw(doc, hex) { const [r, g, b] = hexToRgb(hex); doc.setDrawColor(r, g, b); }
function setText(doc, hex) { const [r, g, b] = hexToRgb(hex); doc.setTextColor(r, g, b); }

function checkPage(doc, y, needed = 60) {
    if (y + needed > theme.page.h - theme.page.margin) {
        doc.addPage();
        drawLeftBg(doc);
        return theme.page.margin;
    }
    return y;
}

function drawLeftBg(doc) {
    setFill(doc, theme.leftPanel.bg);
    doc.rect(0, 0, theme.leftPanel.width, theme.page.h, 'F');
}

function renderSectionHeading(doc, text, x, y, w) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setText(doc, theme.rightPanel.heading);
    doc.text(text, x, y);
    y += 5;
    setDraw(doc, theme.rightPanel.accent);
    doc.setLineWidth(0.5);
    doc.line(x, y, x + w, y);
    return y + 6;
}

function renderTimelineSection(doc, entries, x, y, w) {
    for (const entry of entries) {
        y = checkPage(doc, y, 40);
        if (entry.dates) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            setText(doc, theme.rightPanel.muted);
            doc.text(entry.dates, x, y);
            y += 10;
        }
        const title = entry.occupation || entry.qualification || '';
        if (title) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setText(doc, theme.rightPanel.heading);
            const titleLines = doc.splitTextToSize(title, w);
            doc.text(titleLines, x, y);
            y += titleLines.length * 12;
        }
        const meta = [entry.employer || entry.institution, entry.location].filter(Boolean).join('  |  ');
        if (meta) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            setText(doc, theme.rightPanel.muted);
            doc.text(meta, x, y);
            y += 10;
        }
        if (entry.description && entry.description.length) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            setText(doc, theme.rightPanel.text);
            for (const line of entry.description) {
                if (line) {
                    y = checkPage(doc, y, 12);
                    const descLines = doc.splitTextToSize(`\u2022  ${line}`, w);
                    doc.text(descLines, x, y);
                    y += descLines.length * 10 + 2;
                }
            }
        }
        y += 4;
    }
    return y + 6;
}

function renderBulletList(doc, items, x, y, w) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText(doc, theme.rightPanel.text);
    for (const item of items) {
        if (item) {
            y = checkPage(doc, y, 12);
            const lines = doc.splitTextToSize(`\u2022  ${item}`, w);
            doc.text(lines, x, y);
            y += lines.length * 10 + 3;
        }
    }
    return y;
}

function renderLeftPanel(doc, data, profile, t, photoDataUrl) {
    const pw = theme.leftPanel.width;
    const pad = 22;
    const x = pad;
    const w = pw - pad * 2;
    let y = 30;

    drawLeftBg(doc);

    const photoR = 35;
    const photoCX = x + w / 2;
    if (photoDataUrl) {
        const imgW = photoR * 2;
        const imgH = photoR * 2;
        const imgX = photoCX - photoR;
        doc.addImage(photoDataUrl, 'JPEG', imgX, y, imgW, imgH, undefined, 'FAST');
        doc.setLineWidth(0); 
    }

    doc.setLineWidth(1.5);
    setDraw(doc, theme.leftPanel.muted);
    doc.circle(photoCX, y + photoR, photoR, 'S');

    y += photoR * 2 + 10;

    if (profile.shortDescription) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setText(doc, theme.leftPanel.text);
        const lines = doc.splitTextToSize(profile.shortDescription, w);
        doc.text(lines, x, y);
        y += lines.length * 10 + 6;
    }

    setDraw(doc, theme.leftPanel.muted);
    doc.setLineWidth(0.5);
    doc.line(x, y, x + w, y);
    y += 8;

    const infoItems = [
        { value: data.email },
        { value: data.address },
        { value: data.telephone },
        { value: data.dateOfBirth },
        { value: data.nationality }
    ];

    for (const item of infoItems) {
        if (item.value) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            setText(doc, theme.leftPanel.text);
            doc.text(item.value, x + 12, y);
            y += 10;
        }
    }

    if (data.socialLinks && data.socialLinks.length) {
        for (const s of data.socialLinks) {
            if (s.url) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                setText(doc, theme.leftPanel.text);
                const socialLines = doc.splitTextToSize(s.url, w - 12);
                doc.text(socialLines, x + 12, y);
                y += socialLines.length * 8 + 4;
            }
        }
    }

    y += 5;
    doc.setLineWidth(0.5);
    setDraw(doc, theme.leftPanel.muted);
    doc.line(x, y, x + w, y);
    y += 10;

    if (profile.digitalSkills && profile.digitalSkills.length) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        setText(doc, theme.leftPanel.accent);
        doc.text(t.skillsShort.toUpperCase(), x, y);
        y += 10;

        for (const cat of profile.digitalSkills) {
            if (cat.category) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(6.5);
                setText(doc, theme.leftPanel.accent);
                doc.text(cat.category, x, y);
                y += 8;
            }
            if (cat.items && cat.items.length) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7);
                setText(doc, theme.leftPanel.text);
                for (const skill of cat.items) {
                    if (skill) {
                        const skillLines = doc.splitTextToSize(`\u2022 ${skill}`, w - 4);
                        doc.text(skillLines, x + 4, y);
                        y += skillLines.length * 8 + 3;
                    }
                }
            }
            y += 2;
        }
    }

    y += 2;
    doc.setLineWidth(0.5);
    setDraw(doc, theme.leftPanel.muted);
    doc.line(x, y, x + w, y);
    y += 10;

    if (profile.languageSkills && profile.languageSkills.length) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        setText(doc, theme.leftPanel.accent);
        doc.text(t.languagesShort.toUpperCase(), x, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setText(doc, theme.leftPanel.text);
        for (const lang of profile.languageSkills) {
            const label = lang.writing ? `${lang.language}  ${lang.writing}` : lang.language;
            doc.text(`\u2022 ${label}`, x, y);
            y += 12;
        }
    }
}

export function generateCV(data, lang, photoDataUrl) {
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const t = labels[lang] || labels.es;
    const profile = (data.profiles && (data.profiles[lang] || data.profiles.es)) || {};

    renderLeftPanel(doc, data, profile, t, photoDataUrl);

    const rightX = theme.leftPanel.width + 18;
    const pw = theme.page.w - rightX - theme.page.margin;
    let y = 40;

    if (profile.title) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        setText(doc, theme.rightPanel.muted);
        doc.text(profile.title, rightX, y);
        y += 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    setText(doc, theme.rightPanel.heading);
    const nameLines = doc.splitTextToSize(data.name, pw);
    doc.text(nameLines, rightX, y);
    y += nameLines.length * 24 + 8;

    setDraw(doc, theme.rightPanel.border);
    doc.setLineWidth(0.5);
    doc.line(rightX, y, rightX + pw, y);
    y += 10;

    if (profile.workExperience && profile.workExperience.length) {
        y = checkPage(doc, y, 80);
        y = renderSectionHeading(doc, t.workExperience, rightX, y, pw);
        y = renderTimelineSection(doc, profile.workExperience, rightX, y, pw);
    }

    if (profile.education && profile.education.length) {
        y = checkPage(doc, y, 60);
        y = renderSectionHeading(doc, t.education, rightX, y, pw);
        y = renderTimelineSection(doc, profile.education, rightX, y, pw);
    }

    if (profile.communicationSkills && profile.communicationSkills.length) {
        y = checkPage(doc, y, 50);
        y = renderSectionHeading(doc, t.communicationSkills, rightX, y, pw);
        y = renderBulletList(doc, profile.communicationSkills, rightX, y, pw);
        y += 6;
    }

    if (profile.organisationalSkills && profile.organisationalSkills.length) {
        y = checkPage(doc, y, 50);
        y = renderSectionHeading(doc, t.organisationalSkills, rightX, y, pw);
        y = renderBulletList(doc, profile.organisationalSkills, rightX, y, pw);
        y += 6;
    }

    if (profile.jobRelatedSkills && profile.jobRelatedSkills.length) {
        y = checkPage(doc, y, 50);
        y = renderSectionHeading(doc, t.jobRelatedSkills, rightX, y, pw);
        y = renderBulletList(doc, profile.jobRelatedSkills, rightX, y, pw);
        y += 6;
    }

    if (profile.additionalInfo) {
        y = checkPage(doc, y, 30);
        y = renderSectionHeading(doc, t.additionalInfo, rightX, y, pw);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        setText(doc, theme.rightPanel.text);
        const infoLines = doc.splitTextToSize(profile.additionalInfo, pw);
        doc.text(infoLines, rightX, y);
    }

    return doc;
}
