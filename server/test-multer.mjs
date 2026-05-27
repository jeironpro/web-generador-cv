import express from 'express';
import multer from 'multer';
import http from 'http';

const upload = multer({ dest: '/tmp' });
const app = express();
app.use(express.json({ limit: '50mb' }));

app.post('/test-multer', upload.single('photo'), (req, res) => {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
    console.error('ERROR:', err);
    res.status(500).json({ error: err.message });
});

const server = app.listen(3002, () => {
    const data = JSON.stringify({ name: 'Test' });
    const boundary = '----testboundary123';
    const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="data"',
        '',
        data,
        `--${boundary}--`
    ].join('\r\n');

    const req = http.request({
        hostname: 'localhost',
        port: 3002,
        path: '/test-multer',
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': Buffer.byteLength(body)
        }
    }, (res) => {
        let chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
            console.log('STATUS:', res.statusCode);
            console.log('RESPONSE:', Buffer.concat(chunks).toString());
            server.close();
        });
    });
    req.on('error', (e) => {
        console.error('REQUEST ERROR:', e);
        server.close();
    });
    req.write(body);
    req.end();
});
