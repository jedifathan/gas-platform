-- ─────────────────────────────────────────────────────────────────────────────
-- GAS Platform — Database Schema + Seed Data
-- Runs automatically on first `docker compose up` via
-- /docker-entrypoint-initdb.d/init.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS regions (
  id         VARCHAR(50)  PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  province   VARCHAR(255),
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schools (
  id         VARCHAR(50)  PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  district   VARCHAR(255),
  region_id  VARCHAR(50)  REFERENCES regions(id) ON DELETE SET NULL,
  address    TEXT,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id         VARCHAR(50)  PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  -- TODO production: store bcrypt hash, never plain text
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(50)  NOT NULL CHECK (role IN ('admin','teacher','gov_observer')),
  school_id  VARCHAR(50)  REFERENCES schools(id) ON DELETE SET NULL,
  region_id  VARCHAR(50)  REFERENCES regions(id) ON DELETE SET NULL,
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- ── Seed: Regions ─────────────────────────────────────────────────────────────
-- Replace / extend with real data from your regions.json

INSERT INTO regions (id, name, province) VALUES
  ('reg-001', 'Tangerang Selatan', 'Banten'),
  ('reg-002', 'Tangerang',         'Banten')
ON CONFLICT (id) DO NOTHING;

-- ── Seed: Schools ─────────────────────────────────────────────────────────────
-- Replace / extend with real data from your schools.json
-- (school_id values are inferred from users.json)

INSERT INTO schools (id, name, district, region_id) VALUES
  ('sch-001', 'TK Tunas Bangsa', 'Ciputat',     'reg-001'),
  ('sch-002', 'PAUD Melati',     'Pondok Aren', 'reg-001'),
  ('sch-003', 'TK Bintang',      'Karawaci',    'reg-002')
ON CONFLICT (id) DO NOTHING;

-- ── Seed: Users ───────────────────────────────────────────────────────────────
-- Copied verbatim from src/data/users.json

INSERT INTO users (id, name, email, password, role, school_id, region_id, is_active, created_at, last_login) VALUES
  ('usr-001', 'Admin GAS Pusat',     'admin@gas-program.my.id',             'password123', 'admin',        NULL,      NULL,      true, '2024-01-01T00:00:00Z', '2025-03-14T09:00:00Z'),
  ('usr-002', 'Ibu Ani Rahayu',      'ani.rahayu@tktunasbangsa.id',         'password123', 'teacher',      'sch-001', NULL,      true, '2024-02-01T00:00:00Z', '2025-03-13T14:30:00Z'),
  ('usr-003', 'Bapak Doni Kusuma',   'doni.kusuma@paudmelati.id',           'password123', 'teacher',      'sch-002', NULL,      true, '2024-03-01T00:00:00Z', '2025-03-10T11:00:00Z'),
  ('usr-004', 'Drs. Ahmad Fauzi',    'a.fauzi@dinkes-tangsel.go.id',        'password123', 'gov_observer', NULL,      'reg-001', true, '2024-01-10T00:00:00Z', '2025-03-12T08:00:00Z'),
  ('usr-005', 'Ibu Sri Wahyuni',     'sri.wahyuni@tkbintang.id',            'password123', 'teacher',      'sch-003', NULL,      true, '2024-02-15T00:00:00Z', '2025-03-11T10:00:00Z'),
  ('usr-006', 'Bapak Eko Prasetyo', 'eko.prasetyo@dinkes-tangerang.go.id',  'password123', 'gov_observer', NULL,      'reg-002', true, '2024-01-15T00:00:00Z', '2025-03-08T09:00:00Z')
ON CONFLICT (id) DO NOTHING;
