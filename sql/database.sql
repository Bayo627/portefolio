-- Création de la base de données
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Création de la table des projets
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    tags VARCHAR(255), -- Tags séparés par des virgules
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des projets par défaut
INSERT INTO projects (title, description, image_url, tags, link) VALUES 
('FinTech Dashboard', 'Interface d\'analyse financière conçue pour offrir une lisibilité maximale des données complexes avec une navigation intuitive.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfwN-32F90Le-7PUSKjFb7TkZuroKVJHoHHgDXD1ErfGXUSWgxPaP0YaKR1KYlAqkcBM62b16ntZUP3UJZTq1wLD1qXsO_y0b5G9lgUxAM3Q6W-BqFDE5zKyJ8nX1IrmBZfMlSknkt-1ZmyeCyG6msdaf5tV0zorpyrX8WmYbB-mqxg0siryakK-5EqjpAVNqU8asLtSbRONAoGIAGYQs1_IcdW2lSpiZgogQcqAZCdY-oyCkB7_mF7ro4QHFj1g8ZwCbJECUteF0', 'React,Tailwind', '#'),
('E-commerce Premium', 'Refonte de l\'expérience d\'achat mobile pour une marque de luxe, avec un accent sur la fluidité des micro-interactions.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQDilrRrpFPz8orWoOiECT4edam0rSSNZLD_us0LKp6MYxNCYrliOxBVPywMzRoECpq29XmegYN9mgc0HRyb7XGfjXuDOjCNMO5lnz1LAIVVkj3TgZu89Tsr_lFvGTFIulSazbk6ZujZ7MBcy2we8-gYhhGsmncpQ5IapM5_WVIz5XLCAKUVJSvPsYSstdrI1sSsl6CJK8wn8MaZ0VH2ZMLiu5xv9MYU6vY456EXarJiGlakccdLJ85EkE9bXeHA58qN-YtOKi74E', 'Vue.js,Figma', '#'),
('Architecture Système', 'Conception d\'une architecture backend robuste et évolutive pour supporter une plateforme SaaS à fort trafic.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTyrWaF-wjC_Ay0a7tzX50-xnGgYPnT_l9MGqUVONU8IpSXBPGROKEDlpoO555bl1WX_eAywxb1yrJXTNg0mdbbIvfptsKS287_u15gfqgsVuWpaFrYgDdLtgowpevY7fhPlFd5UzOW4ecgZGgtGPFA6c0mGbO9OO1NvRKVBepVigMcQHIoaeaKpN64n2hFKWotRgyCyqjMSDfo2wKIGZyrospT6RNiU4uP7iJ6CqVCxvR-yMgmsofoXmWEKhh8gr-i7FeXdiQk1s', 'Node.js,API', '#');
