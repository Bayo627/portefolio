const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration de la connexion MySQL (XAMPP par défaut)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db'
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL:', err.message);
        console.log('Assurez-vous que MySQL est lancé sur XAMPP et que la base de données portfolio_db existe.');
        return;
    }
    console.log('Connecté à la base de données MySQL.');
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

// 2. Ajouter un nouveau projet
app.post('/api/projects', (req, res) => {
    const { title, description, image_url, tags, link } = req.body;
    const query = 'INSERT INTO projects (title, description, image_url, tags, link) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, description, image_url, tags, link], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, message: 'Projet ajouté avec succès !' });
    });
});

// 3. Supprimer un projet
app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM projects WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Projet supprimé !' });
    });
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
