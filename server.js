const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurer le stockage des fichiers avec Multer
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // Limite à 25 Mo pour éviter la saturation du disque
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Configuration de la connexion MySQL (XAMPP par défaut) - Connexion globale sans spécifier de base initiale
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
});

// Connexion et initialisation automatique de la base de données et des tables
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL:', err.message);
        console.log('Assurez-vous que MySQL est lancé sur XAMPP.');
        return;
    }
    console.log('Connecté au serveur MySQL.');

    // 1. Créer la base de données si elle n'existe pas
    const dbName = process.env.DB_NAME || 'portfolio_db';
    db.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la base de données:', err.message);
            return;
        }

        // 2. Utiliser la base de données
        db.query(`USE \`${dbName}\``, (err) => {
            if (err) {
                console.error('Erreur lors de la sélection de la base de données:', err.message);
                return;
            }
            console.log(`Utilisation de la base de données "${dbName}".`);

            // 3. Créer la table projects si elle n'existe pas
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    image_url TEXT,
                    tags VARCHAR(255),
                    link TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `;
            db.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Erreur lors de la création de la table projects:', err.message);
                    return;
                }
                console.log('Table "projects" initialisée et prête pour le stockage.');
            });
        });
    });
});

// ROUTES API

// 1. Récupérer tous les projets
app.get('/api/projects', (req, res) => {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Ajouter un nouveau projet (avec support de téléversement de fichiers)
app.post('/api/projects', upload.fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'projectFile', maxCount: 1 }
]), (req, res) => {
    const { title, description, tags } = req.body;
    
    let imageUrl = req.body.image_url || '';
    let projectLink = req.body.link || '';

    // Si une image a été téléversée
    if (req.files && req.files['imageFile'] && req.files['imageFile'][0]) {
        const host = req.get('host');
        const protocol = req.protocol;
        imageUrl = `${protocol}://${host}/uploads/${req.files['imageFile'][0].filename}`;
    }

    // Si un fichier de projet a été téléversé
    if (req.files && req.files['projectFile'] && req.files['projectFile'][0]) {
        const host = req.get('host');
        const protocol = req.protocol;
        projectLink = `${protocol}://${host}/uploads/${req.files['projectFile'][0].filename}`;
    }

    const query = 'INSERT INTO projects (title, description, image_url, tags, link) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, description, imageUrl, tags, projectLink], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Projet ajouté avec succès !',
            project: {
                id: result.insertId,
                title,
                description,
                image_url: imageUrl,
                tags,
                link: projectLink
            }
        });
    });
});

// 3. Supprimer un projet (et supprimer physiquement tous ses fichiers associés sur le disque)
app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;

    // 1. Récupérer d'abord les liens de fichiers pour suppression physique
    const selectQuery = 'SELECT image_url, link FROM projects WHERE id = ?';
    db.query(selectQuery, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            const { image_url, link } = results[0];

            // Fonction interne de suppression physique
            const deletePhysicalFile = (url) => {
                if (!url) return;
                try {
                    const marker = '/uploads/';
                    const index = url.indexOf(marker);
                    if (index !== -1) {
                        const filename = url.substring(index + marker.length);
                        const filePath = path.join(uploadsDir, filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            console.log(`[NETTOYAGE] Fichier physique supprimé: ${filename}`);
                        }
                    }
                } catch (e) {
                    console.error("Erreur de nettoyage du fichier:", e.message);
                }
            };

            // Nettoyer l'image et l'archive/sources du projet
            deletePhysicalFile(image_url);
            deletePhysicalFile(link);
        }

        // 2. Supprimer la ligne de la base de données
        const deleteQuery = 'DELETE FROM projects WHERE id = ?';
        db.query(deleteQuery, [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Projet et ses fichiers physiques supprimés avec succès !' });
        });
    });
});
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
