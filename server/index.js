import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { renderCV } from './renderer.js';
import { unlinkSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({ dest: join(__dirname, 'uploads') });
mkdirSync(join(__dirname, 'output'), { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/generate-cv', upload.single('photo'), async (req, res, next) => {
    try {
        const { data, lang } = req.body;
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const langCode = lang || 'es';

        if (!parsed.name) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }

        if (req.file) {
            parsed.photo = req.file.path;
        } else {
            parsed.photo = null;
        }

        const outputPath = join(__dirname, 'output', `cv-${langCode}-${Date.now()}.pdf`);
        await renderCV(parsed, langCode, outputPath);

        res.download(outputPath, `cv-${langCode}.pdf`, () => {
            try { unlinkSync(outputPath); } catch {}
            if (req.file) try { unlinkSync(req.file.path); } catch {}
        });
    } catch (err) {
        next(err);
    }
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(3001, () => console.log('Server on http://localhost:3001'));
