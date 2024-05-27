const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require("archiver");

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({ fileName: req.file.filename, originalName: req.file.originalname });
});

app.get('/files', (req, res) => {
    fs.readdir('uploads/', (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan files.');
        }
        const fileInfos = files.map(file => ({
            name: file,
            size: (fs.statSync(path.join('uploads', file)).size / 1024).toFixed(2), // size in KB
            url: `http://localhost:${PORT}/uploads/${file}`
        }));
        res.send(fileInfos);
    });
});

app.delete('/files', (req, res) => {
    fs.readdir('uploads/', (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan files.');
        }
        for (const file of files) {
            fs.unlink(path.join('uploads/', file), err => {
                if (err) {
                    return res.status(500).send('Unable to delete file.');
                }
            });
        }
        res.send({ message: 'All files have been deleted.' });
    });
});

app.delete('/files/:name', (req, res) => {
    const fileName = req.params.name;
    fs.unlink(path.join('uploads/', fileName), (err) => {
        if (err) {
            return res.status(500).send('Unable to delete file.');
        }
        res.send({ message: `File ${fileName} deleted.` });
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/files/zip", (req, res) => {
    const output = fs.createWriteStream("files.zip");
    const archive = archiver("zip");

    output.on("close", () => {
        res.download("files.zip", "files.zip", (err) => {
            if (err) {
                console.error(err);
            }
            fs.unlinkSync("files.zip");
        });
    });

    archive.on("error", (err) => {
        console.error(err);
        res.status(500).send("Unable to create zip archive.");
    });

    archive.pipe(output);

    fs.readdir("uploads/", (err, files) => {
        if (err) {
            return res.status(500).send("Unable to scan files.");
        }
        files.forEach((file) => {
            archive.file(`uploads/${file}`, { name: file });
        });
        archive.finalize();
    });

    // Set the response headers to trigger a file download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=files.zip");
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
