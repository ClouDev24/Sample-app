Hier ist die vollständige Antwort in Markdown-Format, die du direkt in deine `README.md` einfügen kannst:

```markdown
# Fullstack Projekt: React + Node.js + PostgreSQL mit Docker

Dieses Projekt enthält ein Beispiel für eine Fullstack-Anwendung, die aus einem **Frontend** (React), einem **Backend** (Node.js + Express) und einer **PostgreSQL-Datenbank** besteht. Alle Services werden mithilfe von **Docker** orchestriert und in separaten Containern ausgeführt.

---

## Projektstruktur

Die Struktur des Projekts sieht wie folgt aus:

```
my-project/
├── frontend/
│   ├── Dockerfile
│   └── [React-Code]
├── backend/
│   ├── Dockerfile
│   └── [Node.js-Code]
├── database/
│   └── init.sql
├── docker-compose.yml
```

### **Erläuterungen:**
- **`frontend/`**: Enthält die React-Anwendung für die Benutzeroberfläche.
- **`backend/`**: Beinhaltet den Node.js-Server, der RESTful-APIs bereitstellt und die PostgreSQL-Datenbank nutzt.
- **`database/`**: Optionales Verzeichnis für SQL-Skripte, die beim Start der Datenbank automatisch ausgeführt werden.
- **`docker-compose.yml`**: Orchestriert alle Services, erstellt ein gemeinsames Netzwerk und definiert Abhängigkeiten.

---

## Frontend (React)

### **Ziel:**
Das Frontend bietet eine Benutzeroberfläche, um Daten einzugeben und anzuzeigen. Es sendet alle Anfragen an das Backend.

### **Setup:**
1. Erstelle das React-Projekt:
   ```bash
   npx create-react-app frontend
   ```

2. Passe die Hauptdatei (`frontend/src/App.js`) an, um ein Formular und eine Liste anzuzeigen.

#### **Beispiel-Code:**
```javascript
import React, { useState } from 'react';

function App() {
  const [name, setName] = useState('');
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const response = await fetch('/api/data'); // Anfrage an das Backend über Proxy
    const result = await response.json();
    setData(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    fetchData();
  };

  return (
    <div>
      <h1>Frontend: React + Backend API</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
        <button type="submit">Submit</button>
      </form>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

### **Dockerfile für das Frontend:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
EXPOSE 3000
```

---

## Backend (Node.js)

### **Ziel:**
Das Backend stellt die API-Endpunkte bereit, die Daten von der Datenbank abrufen oder hinzufügen. Es ist so konfiguriert, dass es nur vom Frontend im selben Netzwerk aufgerufen werden kann.

### **Setup:**
1. Erstelle ein neues Node.js-Projekt:
   ```bash
   mkdir backend && cd backend
   npm init -y
   npm install express pg body-parser cors
   ```

2. Schreibe die API-Logik in `index.js`.

#### **Beispiel-Code:**
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'database',
  database: 'mydb',
  password: 'mypassword',
  port: 5432,
});

app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM my_table');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/data', async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('INSERT INTO my_table (name) VALUES ($1)', [name]);
    res.status(201).send('Data added');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
```

### **Dockerfile für das Backend:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
EXPOSE 5000
```

---

## PostgreSQL-Datenbank

### **Setup:**
Die Datenbank speichert persistent die Benutzerdaten. Ein SQL-Skript sorgt dafür, dass beim ersten Start die Tabelle erstellt wird.

#### **Beispiel-SQL-Skript (`database/init.sql`):**
```sql
CREATE TABLE my_table (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
```

---

## Docker Compose

### **Ziel:**
Docker Compose orchestriert die Services, verbindet sie in einem Netzwerk und stellt sicher, dass das Backend nur intern erreichbar ist.

#### **Beispiel `docker-compose.yml`:**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    expose:
      - "5000"
    depends_on:
      - database
    environment:
      - PGUSER=postgres
      - PGHOST=database
      - PGDATABASE=mydb
      - PGPASSWORD=mypassword
      - PGPORT=5432

  database:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  db-data:
```

---

## API Gateway (Traefik)

### **Warum ein API Gateway?**
- **Sicherheit:** Schutz vor direktem Zugriff auf das Backend.
- **Lastverteilung:** Anfragen können auf mehrere Backend-Instanzen verteilt werden.
- **Zentralisierung:** Einheitlicher Einstiegspunkt für APIs.

### **Traefik-Konfiguration:**
1. Füge Traefik als Service hinzu:
   ```yaml
   traefik:
     image: traefik:v2.10
     ports:
       - "80:80"
     command:
       - "--providers.docker=true"
       - "--entrypoints.http.address=:80"
     volumes:
       - /var/run/docker.sock:/var/run/docker.sock
   ```

2. Route Backend-Anfragen über `/api`:
   ```yaml
   backend:
     labels:
       - "traefik.http.routers.backend.rule=PathPrefix(`/api`)"
   ```

Nach dieser Konfiguration ist das Backend nur über das Frontend und das API Gateway erreichbar.

---

## Nächste Schritte

1. **HTTPS aktivieren**: Stelle sicher, dass das Gateway TLS-Zertifikate nutzt.
2. **Load Balancing**: Skaliere Backend- und Frontend-Instanzen.
3. **Datenbankzugriff absichern**: Füge Firewall-Regeln hinzu oder nutze eine Cloud-Datenbank.
```

Füge dies einfach in deine `README.md` ein, und du hast eine umfassende Dokumentation deines Projekts!
