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