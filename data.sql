-- CREATE TABLE companies (
--   handle TEXT PRIMARY KEY,
--   name TEXT UNIQUE NOT NULL,
--   num_employees INTEGER,
--   description TEXT,
--   logo_url TEXT
-- );

CREATE TABLE jobs (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT NOT NULL,
  company_handle TEXT REFERENCES companies ON DELETE CASCADE,
  date_posted DATETIME DEFAULT current_time,
  CONSTRAINT equity_check CHECK (equity < 1)
);