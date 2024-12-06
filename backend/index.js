const express = require('express'); // Express.js für den Webserver importieren
const bodyParser = require('body-parser'); // Middleware für JSON-Parsing
const cors = require('cors'); // CORS-Middleware für Cross-Origin-Zugriff
const { Pool } = require('pg'); // PostgreSQL-Client-Bibliothek

const app = express(); // Express-App initialisieren
const port = 5000; // Backend läuft auf Port 5000

// Middleware hinzufügen
app.use(bodyParser.json()); // Automatisches JSON-Parsing für eingehende Anfragen
app.use(cors()); // Erlaubt Zugriffe von anderen Domains (z. B. Frontend)

// Verbindung zur PostgreSQL-Datenbank
const pool = new Pool({
  user: 'postgres', // Datenbankbenutzername
  host: 'database', // Hostname des Datenbankdienstes (Name des Docker-Services)
  database: 'mydb', // Name der Datenbank
  password: 'mypassword', // Passwort des Benutzers
  port: 5432, // Standard-Port für PostgreSQL
});

// GET-Route: Daten aus der Datenbank abrufen
app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM my_table'); // SQL-Abfrage
    res.json(result.rows); // Ergebnisse als JSON an den Client senden
  } catch (err) {
    res.status(500).json({ error: err.message }); // Fehlerbehandlung
  }
});

// POST-Route: Neue Daten zur Datenbank hinzufügen
app.post('/api/data', async (req, res) => {
  const { name } = req.body; // Eingehende Daten aus dem Request-Body
  try {
    await pool.query('INSERT INTO my_table (name) VALUES ($1)', [name]); // SQL-Insert
    res.status(201).send('Data added'); // Erfolgreiche Antwort senden
  } catch (err) {
    res.status(500).json({ error: err.message }); // Fehlerbehandlung
  }
});

// Startet den Server und hört auf Port 5000
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});