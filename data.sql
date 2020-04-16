DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT NOT NULL,
  company_handle TEXT REFERENCES companies ON DELETE CASCADE,
  date_posted date DEFAULT CURRENT_DATE,
  CONSTRAINT equity_check CHECK (equity < 1)
);

INSERT INTO companies
  VALUES ('apple', 'Apple', 12, 'Maker of fruit.', 'https://www.mouthhealthy.org/~/media/MouthHealthy/Images/Resources/Lesson%20Plans/experiments_mouthhealthykids_apple.jpg'),
         ('ibm', 'IBM', 5, 'Big blue tires.', 'https://www.ibm.com/innovate/branding/logoartwork/logoartwork.nsf/IBM_logo_pos_CMYK.jpg');

INSERT INTO jobs (title, salary, equity, company_handle, date_posted)
  VALUES ('CEO', 5000, .5, 'apple', '2010-02-01'),
         ('Janitor', 50000, .1, 'ibm', '2009-05-11'),
         ('Coder', 5, .2, 'apple', '2010-02-01'),
         ('Teacher', 52, .3, 'apple', '2011-12-02')