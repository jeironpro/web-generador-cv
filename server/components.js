import { Mail, MapPin, Phone, Calendar, Globe, Share2 } from 'lucide-static';

function lucideToPath(svg) {
    let d = '';
    const elemRe = /<(\w+)([^>]*)\/>/g;
    const attrRe = /(\w+)=["']([^"']*)["']/g;
    let m;
    while ((m = elemRe.exec(svg)) !== null) {
        const tag = m[1];
        const attrs = {};
        let a;
        while ((a = attrRe.exec(m[2])) !== null) attrs[a[1]] = a[2];
        switch (tag) {
            case 'path': d += attrs.d || ''; break;
            case 'circle': {
                const cx = +attrs.cx, cy = +attrs.cy, r = +attrs.r;
                d += `M${cx-r} ${cy}A${r} ${r} 0 1 0 ${cx+r} ${cy}A${r} ${r} 0 1 0 ${cx-r} ${cy}`;
                break;
            }
            case 'rect': {
                const rx = +attrs.x, ry = +attrs.y, rw = +attrs.width, rh = +attrs.height, rr = +attrs.rx || 0;
                if (rr) {
                    d += `M${rx+rr} ${ry}h${rw-2*rr}a${rr} ${rr} 0 0 1 ${rr} ${rr}v${rh-2*rr}a${rr} ${rr} 0 0 1 -${rr} ${rr}h${-(rw-2*rr)}a${rr} ${rr} 0 0 1 -${rr} -${rr}v${-(rh-2*rr)}a${rr} ${rr} 0 0 1 ${rr} -${rr}Z`;
                } else {
                    d += `M${rx} ${ry}h${rw}v${rh}h-${rw}Z`;
                }
                break;
            }
            case 'line':
                d += `M${attrs.x1} ${attrs.y1}L${attrs.x2} ${attrs.y2}`;
                break;
        }
    }
    return d;
}

const ICONS = {
    email: lucideToPath(Mail),
    address: lucideToPath(MapPin),
    phone: lucideToPath(Phone),
    birth: lucideToPath(Calendar),
    nationality: lucideToPath(Globe),
    social: lucideToPath(Share2)
};

function drawIcon(doc, name, ix, iy) {
    const d = ICONS[name];
    if (!d) return;
    doc.save();
    doc.translate(ix, iy);
    doc.scale(9 / 24);
    doc.path(d).lineWidth(2).stroke('#000000');
    doc.restore();
}

export function renderLeftPanel(doc, data, profile, t, theme) {
    const pw = theme.leftPanel.width;
    const pad = 22;
    const x = pad;
    const w = pw - pad * 2;

    doc.save();
    doc.rect(0, 0, pw, doc.page.height).fill(theme.leftPanel.bg);

    let y = 30;

    const photoR = 35;
    const photoCX = x + w / 2;
    if (data.photo) {
        doc.save();
        doc.circle(photoCX, y + photoR, photoR).clip();
        doc.image(data.photo, photoCX - photoR, y, {
            cover: [photoR * 2, photoR * 2],
            align: 'center',
            valign: 'center'
        });
        doc.restore();
    }
    doc.circle(photoCX, y + photoR, photoR)
       .lineWidth(1.5)
       .strokeColor(theme.leftPanel.muted)
       .stroke();

    y += photoR * 2 + 10;

    doc.font('Helvetica')
       .fontSize(8)
       .fillColor(theme.leftPanel.text)
       .text(profile.shortDescription, x, y, { width: w, lineGap: 2 });
    y = doc.y + 6;

    doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.5).strokeColor(theme.leftPanel.muted).stroke();
    y += 8;

    const infoItems = [
        { icon: 'email', value: data.email },
        { icon: 'address', value: data.address },
        { icon: 'phone', value: data.telephone },
        { icon: 'birth', value: data.dateOfBirth },
        { icon: 'nationality', value: data.nationality }
    ];

    for (const item of infoItems) {
        if (item.value) {
            drawIcon(doc, item.icon, x, y);
            doc.font('Helvetica')
               .fontSize(7.5)
               .fillColor(theme.leftPanel.text)
               .text(item.value, x + 12, y, { width: w - 12 });
            y = doc.y + 5;
        }
    }

    if (data.socialLinks && data.socialLinks.length) {
        for (const s of data.socialLinks) {
            drawIcon(doc, 'social', x, y);
            doc.font('Helvetica')
               .fontSize(7)
               .fillColor(theme.leftPanel.text)
               .text(s.url, x + 12, y, { width: w - 12, lineGap: 1 });
            y = doc.y + 4;
        }
    }

    y += 5;
    doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.5).strokeColor(theme.leftPanel.muted).stroke();
    y += 10;

    if (profile.digitalSkills && profile.digitalSkills.length) {
        doc.font('Helvetica-Bold')
           .fontSize(7.5)
           .fillColor(theme.leftPanel.accent)
           .text(t.skillsShort.toUpperCase(), x, y, { width: w });
        y = doc.y + 4;

        for (const cat of profile.digitalSkills) {
            doc.font('Helvetica-Bold')
               .fontSize(6.5)
               .fillColor(theme.leftPanel.accent)
               .text(cat.category, x, y, { width: w });
            y = doc.y + 2;
            if (cat.items && cat.items.length) {
                for (const skill of cat.items) {
                    doc.font('Helvetica')
                       .fontSize(7)
                       .fillColor(theme.leftPanel.text)
                       .text(`\u2022 ${skill}`, x + 4, y, { width: w - 4, lineGap: 1 });
                    y = doc.y + 3;
                }
            }
            y += 2;
        }
    }

    y += 2;
    doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.5).strokeColor(theme.leftPanel.muted).stroke();
    y += 10;
    doc.y = y;

    if (profile.languageSkills && profile.languageSkills.length) {
        doc.font('Helvetica-Bold')
           .fontSize(7.5)
           .fillColor(theme.leftPanel.accent)
           .text(t.languagesShort.toUpperCase(), x, y, { width: w });
        y = doc.y + 4;

        for (const lang of profile.languageSkills) {
            const label = lang.writing ? `${lang.language}  ${lang.writing}` : lang.language;
            doc.font('Helvetica')
               .fontSize(8)
               .fillColor(theme.leftPanel.text)
               .text(`\u2022 ${label}`, x, y, { width: w });
            y = doc.y + 10;
        }
    }

    doc.restore();
}

export function renderSectionHeading(doc, text, opts) {
    doc.font('Helvetica-Bold')
       .fontSize(opts.size || 10)
       .fillColor(opts.color || '#1a2a4a')
       .text(text, opts.x, opts.y);
    doc.y += 2;
    doc.moveTo(opts.x, doc.y)
       .lineTo(opts.x + opts.width, doc.y)
       .lineWidth(0.5)
       .strokeColor(opts.borderColor || '#1a2a4a')
       .stroke();
    doc.y += 6;
}

export function renderTimelineSection(doc, entries, opts) {
    const cx = opts.x;
    const cw = opts.width;
    let y = opts.y;

    for (const entry of entries) {
        const date = entry.dates || '';
        if (date) {
            doc.font('Helvetica')
               .fontSize(opts.dateSize || 8)
               .fillColor(opts.muted || '#555555')
               .text(date, cx, y, { width: cw, lineGap: 1 });
            y = doc.y + 1;
        }

        const title = entry.occupation || entry.qualification || '';
        doc.font('Helvetica-Bold')
           .fontSize(opts.titleSize || 10)
           .fillColor(opts.titleColor || '#1a2a4a')
           .text(title, cx, y, { width: cw, lineGap: 1 });
        y = doc.y + 1;

        const meta = [entry.employer || entry.institution, entry.location].filter(Boolean).join('  |  ');
        if (meta) {
            doc.font('Helvetica')
               .fontSize(opts.metaSize || 8)
               .fillColor(opts.muted || '#555555')
               .text(meta, cx, y, { width: cw, lineGap: 1 });
            y = doc.y + 2;
        }

            if (entry.description && entry.description.length) {
                doc.font('Helvetica')
                   .fontSize(opts.bodySize || 8.5)
                   .fillColor(opts.bodyColor || '#2d2d2d');
                for (const line of entry.description) {
                    if (line) doc.text(`\u2022  ${line}`, cx, y, { width: cw, lineGap: 1 });
                    y = doc.y + 2;
                }
            }

        y += 4;
    }

    return y + (opts.spacing || 6);
}

export function renderBulletList(doc, items, opts) {
    const x = opts.x;
    const w = opts.width;
    let cursor = opts.y;

    doc.font('Helvetica')
       .fontSize(opts.size || 9)
       .fillColor(opts.color || '#2d2d2d');
    for (const item of items) {
        if (item) doc.text(`\u2022  ${item}`, x, cursor, { width: w, lineGap: 2 });
        cursor = doc.y + 3;
    }
    return cursor + (opts.spacing || 4);
}
