CREATE TABLE my_table (
  id SERIAL PRIMARY KEY,  -- ID als Primärschlüssel mit automatischer Zuweisung
  name TEXT NOT NULL      -- Spalte für den Namen, der nicht leer sein darf
);