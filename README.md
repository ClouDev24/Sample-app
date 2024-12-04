Hier ist der vollständige Markdown-Inhalt, einschließlich der Kommentare im Code für alle Abschnitte:

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
import React, { useState } from 'react'; // React und State-Management importieren

function App() {
  // React State: Eingabewert für das Formular und Daten, die von der API abgerufen werden
  const [name, setName] = useState(''); // State für den aktuellen Namen aus dem Eingabefeld
  const [data, setData] = useState([]); // State für die Daten aus dem Backend

  // Funktion zum Abrufen von Daten aus dem Backend
  const fetchData = async () => {
    const response = await fetch('/api/data'); // Anfrage an den API-Endpunkt des Backends
    const result = await response.json(); // Antwort in JSON-Format parsen
    setData(result); // Die empfangenen Daten im State speichern
  };

  // Funktion, die beim Absenden des Formulars ausgeführt wird
  const handleSubmit = async (e) => {
    e.preventDefault(); // Standardverhalten (Seitenreload) verhindern
    await fetch('/api/data', {
      method: 'POST', // HTTP-Methode POST zum Hinzufügen von Daten
      headers: { 'Content-Type': 'application/json' }, // Content-Typ als JSON angeben
      body: JSON.stringify({ name }), // Name als JSON-Daten im Body der Anfrage senden
    });
    fetchData(); // Nach der POST-Anfrage die aktuellen Daten abrufen
  };

  return (
    <div>
      <h1>Frontend: React + Backend API</h1> {/* Überschrift */}
      <form onSubmit={handleSubmit}> {/* Formular für die Eingabe */}
        <input
          type="text" // Eingabefeld für Text
          value={name} // Aktueller Wert aus dem State
          onChange={(e) => setName(e.target.value)} // State aktualisieren, wenn der Benutzer etwas eingibt
          placeholder="Enter name" // Platzhaltertext im Eingabefeld
        />
        <button type="submit">Submit</button> {/* Button zum Absenden des Formulars */}
      </form>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.name}</li> // Daten als Liste darstellen, eindeutiger Schlüssel ist der Index
        ))}
      </ul>
    </div>
  );
}

export default App; // Komponente exportieren, damit sie verwendet werden kann
```

### **Dockerfile für das Frontend:**
```dockerfile
FROM node:18 # Node.js-Image in Version 18 als Basis
WORKDIR /app # Arbeitsverzeichnis im Container
COPY package*.json ./ # Kopiert die Paketdefinitionen (package.json und package-lock.json)
RUN npm install # Installiert die Abhängigkeiten
COPY . . # Kopiert den restlichen Quellcode in das Arbeitsverzeichnis
CMD ["npm", "start"] # Startet die React-Anwendung im Entwicklungsmodus
EXPOSE 3000 # Container-externer Port für das Frontend
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
```

### **Dockerfile für das Backend:**
```dockerfile
FROM node:18 # Basis-Image: Node.js in Version 18
WORKDIR /app # Arbeitsverzeichnis im Container
COPY package*.json ./ # Kopiert die Paketdefinitionen (package.json und package-lock.json)
RUN npm install # Installiert die Abhängigkeiten
COPY . . # Kopiert den gesamten Quellcode in das Arbeitsverzeichnis
CMD ["node", "index.js"] # Startet den Node.js-Server
EXPOSE 5000 # Exponiert den Port 5000 für interne Anfragen
```

---

## PostgreSQL-Datenbank

### **Setup:**
Die Datenbank speichert persistent die Benutzerdaten. Ein SQL-Skript sorgt dafür, dass beim ersten Start die Tabelle erstellt wird.

#### **Beispiel-SQL-Skript (`database/init.sql`):**
```sql
CREATE TABLE my_table (
  id SERIAL PRIMARY KEY,  -- ID als Primärschlüssel mit automatischer Zuweisung
  name TEXT NOT NULL      -- Spalte für den Namen, der nicht leer sein darf
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
      - "3000:3000"  # Mappt Port 3000 des Containers auf Port 3000 des Hosts
    depends_on:
      - backend      # Stellt sicher, dass das Backend vor dem Frontend gestartet wird

  backend:
    build: ./backend
    expose:
      - "5000"        # Exponiert den Port 5000 für das interne Netzwerk (nicht nach außen)
    depends_on:
      - database


Hier sind die nächsten Schritte, um die Container in einem lokalen Kubernetes **Kind**-Cluster auszuführen und die Images mit einem **GitHub Workflow** in Docker Hub zu pushen:

---

## **1. Container-Images in Docker Hub hochladen**

### **Voraussetzungen**
- Ein **Docker Hub Account**.
- Zugriff auf das GitHub Repository mit Push-Berechtigungen.

### **Schritt 1: Docker Hub Zugangsdaten als GitHub Secrets hinzufügen**
1. Gehe in dein GitHub Repository.
2. Öffne die **Settings > Secrets and variables > Actions**.
3. Füge folgende Secrets hinzu:
   - **`DOCKER_USERNAME`**: Dein Docker Hub Benutzername.
   - **`DOCKER_PASSWORD`**: Dein Docker Hub Passwort.

---

### **Schritt 2: GitHub Workflow erstellen**

Erstelle im Repository die Datei `.github/workflows/docker-publish.yml` mit folgendem Inhalt:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches:
      - main  # Workflow wird bei Änderungen im "main"-Branch ausgeführt

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v3  # Checkt den Code des Repositories aus

    - name: Log in to Docker Hub
      uses: docker/login-action@v2  # Loggt sich bei Docker Hub ein
      with:
        username: ${{ secrets.DOCKER_USERNAME }}  # Docker Hub Benutzername aus Secrets
        password: ${{ secrets.DOCKER_PASSWORD }}  # Docker Hub Passwort aus Secrets

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2  # Aktiviert Buildx für Multi-Architektur-Builds

    - name: Build and Push Frontend
      uses: docker/build-push-action@v5
      with:
        context: ./frontend  # Build-Kontext für das Frontend
        push: true  # Image wird nach Docker Hub gepusht
        tags: ${{ secrets.DOCKER_USERNAME }}/frontend:latest  # Image-Tag

    - name: Build and Push Backend
      uses: docker/build-push-action@v5
      with:
        context: ./backend  # Build-Kontext für das Backend
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/backend:latest

    - name: Build and Push Database
      uses: docker/build-push-action@v5
      with:
        context: ./database  # Falls ein Dockerfile für die DB benötigt wird
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/database:latest
```

### **Workflow auslösen**
- Sobald du Änderungen in den `main`-Branch pusht, werden die Images automatisch gebaut und in Docker Hub veröffentlicht.

---

## **2. Images in einem lokalen Kubernetes Kind Cluster ausführen**

### **Schritt 1: Kind Cluster installieren**
Installiere **Kind**, ein leichtgewichtiges Kubernetes für lokale Tests. 

#### Installation:
```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

### **Schritt 2: Cluster erstellen**
Erstelle einen neuen Kind-Cluster:
```bash
kind create cluster --name my-cluster
```

### **Schritt 3: Docker Images in den Cluster laden**
Damit der Kind-Cluster die Images von Docker Hub verwenden kann:
1. **kubectl** installieren:
   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   chmod +x ./kubectl
   sudo mv ./kubectl /usr/local/bin/kubectl
   ```

2. Lade die Images von Docker Hub in den Cluster:
   ```bash
   docker pull <DOCKER_USERNAME>/frontend:latest
   docker pull <DOCKER_USERNAME>/backend:latest
   kind load docker-image <DOCKER_USERNAME>/frontend:latest --name my-cluster
   kind load docker-image <DOCKER_USERNAME>/backend:latest --name my-cluster
   ```

---

### **Schritt 4: Kubernetes Deployments erstellen**

Erstelle eine Datei `k8s-deployment.yml` mit folgendem Inhalt:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  labels:
    app: frontend
spec:
  replicas: 1  # Anzahl der Frontend-Instanzen
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: <DOCKER_USERNAME>/frontend:latest  # Docker Image für das Frontend
        ports:
        - containerPort: 3000

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  labels:
    app: backend
spec:
  replicas: 1  # Anzahl der Backend-Instanzen
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: <DOCKER_USERNAME>/backend:latest  # Docker Image für das Backend
        ports:
        - containerPort: 5000

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000  # Weiterleitung an den Frontend-Port
  type: NodePort  # Service von außerhalb erreichbar machen

---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 5000
      targetPort: 5000  # Weiterleitung an den Backend-Port
  type: ClusterIP  # Nur intern im Cluster erreichbar
```

---

### **Schritt 5: Deployments anwenden**
```bash
kubectl apply -f k8s-deployment.yml
```

---

### **Schritt 6: Frontend im Browser testen**
1. Finde den **NodePort** des Frontend-Services:
   ```bash
   kubectl get svc frontend-service
   ```
   Suche die Spalte `PORT(S)`. Beispielsweise könnte es `30007:80/TCP` sein.

2. Öffne deinen Browser und navigiere zu:
   ```
   http://localhost:<NodePort>
   ```

---

### **Zusammenfassung**
- Der Workflow lädt deine Docker-Images automatisch in Docker Hub hoch.
- Das Kind-Cluster führt die Images in isolierten Containern aus.
- Services sind intern entkoppelt und können unabhängig skaliert werden.
```
