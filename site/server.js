const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
require('dotenv').config();

/**
 * 💡 Connexion à Cosmos DB
 */
const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const databaseName = process.env.COSMOS_DB_DATABASE_NAME;

mongoose.connect(connectionString, {
    dbName: databaseName,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Connecté à Azure Cosmos DB !");
}).catch((err) => {
    console.error("❌ Erreur de connexion à Cosmos DB : ", err.message);
});

// Modèle de données
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});
const User = mongoose.model('User', userSchema);

/**
 * 💡 Serveur HTTP natif
 */
const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        // ROUTES GET
        if (req.url === '/') {
            fs.readFile('index.html', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else if (req.url === '/login.html') {
            fs.readFile('login.html', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else if (req.url === '/register.html') {
            fs.readFile('register.html', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else if (req.url === '/style.css') {
            fs.readFile('style.css', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            });
        }
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const params = new URLSearchParams(body);
            if (req.url === '/register') {
                try {
                    const hashedPassword = await bcrypt.hash(params.get('password'), 10);
                    const newUser = new User({
                        username: params.get('username'),
                        email: params.get('email'),
                        password: hashedPassword
                    });
                    await newUser.save();
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end("Inscription réussie !");
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end("Erreur lors de l'inscription : " + error.message);
                }
            } else if (req.url === '/login') {
                try {
                    const user = await User.findOne({ email: params.get('email') });
                    if (user && await bcrypt.compare(params.get('password'), user.password)) {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end("Connexion réussie !");
                    } else {
                        res.writeHead(401, { 'Content-Type': 'text/plain' });
                        res.end("Email ou mot de passe incorrect.");
                    }
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end("Erreur lors de la connexion : " + error.message);
                }
            }
        });
    }
});

// Démarrage du serveur
server.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});
