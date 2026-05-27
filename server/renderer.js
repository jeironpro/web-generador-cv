import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';
import { defaultTemplate } from './default.js';
import { labels } from './i18n.js';
import {
    renderLeftPanel,
    renderSectionHeading,
    renderTimelineSection,
    renderBulletList
} from './components.js';

function shouldPageBreak(doc, m, needed = 60) {
    return doc.y > doc.page.height - m - needed;
}

export function renderCV(data, lang, outputPath) {
    return new Promise((resolve, reject) => {
        const t = labels[lang] || labels.es;
        const profile = (data.profiles && (data.profiles[lang] || data.profiles.es)) || {};
        const theme = defaultTemplate;
        const m = theme.page.margin;

        const doc = new PDFDocument({
            size: theme.page.size,
            margin: m,
            info: {
                Title: `CV - ${data.name}`,
                Author: data.name,
                Subject: `CV - ${lang.toUpperCase()}`,
                Keywords: 'CV, curriculum vitae, ' + profile.title
            }
        });

        const ws = createWriteStream(outputPath);
        ws.on('finish', () => resolve(outputPath));
        ws.on('error', reject);

        doc.on('error', reject);
        doc.pipe(ws);

    const lpW = theme.leftPanel.width;
    const rightX = lpW + 18;
    const pw = doc.page.width - rightX - m;

    function check(needed) {
        if (shouldPageBreak(doc, m, needed)) {
            doc.addPage();
        }
    }

    renderLeftPanel(doc, data, profile, t, theme);

    doc.y = 40;

    doc.font('Helvetica')
       .fontSize(11)
       .fillColor(theme.rightPanel.muted)
       .text(profile.title, rightX, doc.y, { width: pw });
    doc.y += 2;

    doc.font('Helvetica-Bold')
       .fontSize(20)
       .fillColor(theme.rightPanel.heading)
       .text(data.name, rightX, doc.y, { width: pw });
    doc.y += 8;

    doc.moveTo(rightX, doc.y)
       .lineTo(rightX + pw, doc.y)
       .lineWidth(0.5)
       .strokeColor(theme.rightPanel.border)
       .stroke();
    doc.y += 10;

    if (profile.workExperience && profile.workExperience.length) {
        check(80);
        renderSectionHeading(doc, t.workExperience, {
            x: rightX, y: doc.y, width: pw,
            size: 10,
            color: theme.rightPanel.heading,
            borderColor: theme.rightPanel.accent
        });

        doc.y = renderTimelineSection(doc, profile.workExperience, {
            x: rightX, y: doc.y, width: pw,
            titleSize: 10,
            titleColor: theme.rightPanel.heading,
            dateSize: 8,
            dateColor: theme.rightPanel.muted,
            metaSize: 8,
            muted: theme.rightPanel.muted,
            bodySize: 8.5,
            bodyColor: theme.rightPanel.text,
            lineColor: theme.rightPanel.accent,
            dotColor: theme.rightPanel.accent
        });
        doc.y += 6;
    }

    if (profile.education && profile.education.length) {
        check(60);
        renderSectionHeading(doc, t.education, {
            x: rightX, y: doc.y, width: pw,
            size: 10,
            color: theme.rightPanel.heading,
            borderColor: theme.rightPanel.accent
        });

        doc.y = renderTimelineSection(doc, profile.education, {
            x: rightX, y: doc.y, width: pw,
            titleSize: 10,
            titleColor: theme.rightPanel.heading,
            dateSize: 8,
            dateColor: theme.rightPanel.muted,
            metaSize: 8,
            muted: theme.rightPanel.muted,
            lineColor: theme.rightPanel.accent,
            dotColor: theme.rightPanel.accent
        });
        doc.y += 6;
    }

    if (profile.communicationSkills && profile.communicationSkills.length) {
        check(50);
        renderSectionHeading(doc, t.communicationSkills, {
            x: rightX, y: doc.y, width: pw,
            size: 10,
            color: theme.rightPanel.heading,
            borderColor: theme.rightPanel.accent
        });

        doc.y = renderBulletList(doc, profile.communicationSkills, {
            x: rightX, y: doc.y, width: pw,
            size: 8.5,
            color: theme.rightPanel.text
        });
        doc.y += 6;
    }

    if (profile.organisationalSkills && profile.organisationalSkills.length) {
        check(50);
        renderSectionHeading(doc, t.organisationalSkills, {
            x: rightX, y: doc.y, width: pw,
            size: 10,
            color: theme.rightPanel.heading,
            borderColor: theme.rightPanel.accent
        });

        doc.y = renderBulletList(doc, profile.organisationalSkills, {
            x: rightX, y: doc.y, width: pw,
            size: 8.5,
            color: theme.rightPanel.text
        });
        doc.y += 6;
    }

    if (profile.jobRelatedSkills && profile.jobRelatedSkills.length) {
        check(50);
        renderSectionHeading(doc, t.jobRelatedSkills, {
            x: rightX, y: doc.y, width: pw,
            size: 10,
            color: theme.rightPanel.heading,
            borderColor: theme.rightPanel.accent
        });

        doc.y = renderBulletList(doc, profile.jobRelatedSkills, {
            x: rightX, y: doc.y, width: pw,
            size: 8.5,
            color: theme.rightPanel.text
        });
        doc.y += 6;
    }

    if (profile.additionalInfo) {
        check(30);
        renderSectionHeading(doc, t.additionalInfo, {
            x: rightX, y: doc.y, width: pw,
            size: 10,
            color: theme.rightPanel.heading,
            borderColor: theme.rightPanel.accent
        });

        doc.font('Helvetica')
           .fontSize(8.5)
           .fillColor(theme.rightPanel.text)
           .text(profile.additionalInfo, rightX, doc.y, { width: pw });
        doc.y += 6;
    }

        doc.end();
    });
}
