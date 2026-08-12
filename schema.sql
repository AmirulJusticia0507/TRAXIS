-- =====================================================================
-- TRAXIS - MRT & KRL Transit Management System (TMS)
-- PostgreSQL Database Schema
-- Version: 1.0.0
--
-- Sinkronisasi kontrak data:
--   * Nama kolom memakai snake_case (PostgreSQL/API layer memetakan ke
--     camelCase TypeScript Interface di sisi Angular).
--   * ENUM SQL disinkronkan dengan enum TS (lihat GUIDELINES.md).
-- =====================================================================

BEGIN;

-- =====================================================================
-- ENUM TYPES
-- =====================================================================

-- Sinkron: interface Train.status di GUIDELINES.md
CREATE TYPE train_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'DELAYED');

-- Status operasional jadwal kereta
CREATE TYPE schedule_status AS ENUM ('ON_TIME', 'DELAYED', 'CANCELLED', 'COMPLETED');

-- Status insiden jalur
CREATE TYPE incident_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- Tipe jalur: MRT atau KRL
CREATE TYPE line_type AS ENUM ('MRT', 'KRL');

-- Status telemetri posisi kereta real-time
CREATE TYPE position_status AS ENUM ('IN_TRANSIT', 'AT_STATION', 'OUT_OF_SERVICE');

-- =====================================================================
-- MASTER DATA: LINES
-- =====================================================================

CREATE TABLE lines (
    id          BIGSERIAL    PRIMARY KEY,
    code        VARCHAR(10)  NOT NULL UNIQUE,          -- e.g. 'MRT_NS', 'KRL_RED'
    name        VARCHAR(100) NOT NULL,
    type        line_type    NOT NULL,
    color_hex   CHAR(7)      NOT NULL DEFAULT '#00529B', -- lihat STYLES.md design tokens
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- MASTER DATA: STATIONS
-- =====================================================================

CREATE TABLE stations (
    id          BIGSERIAL    PRIMARY KEY,
    code        VARCHAR(10)  NOT NULL UNIQUE,          -- e.g. 'LB', 'HI'
    name        VARCHAR(100) NOT NULL,
    line_id     BIGINT       NOT NULL REFERENCES lines (id) ON DELETE RESTRICT,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- TRAINS
-- Sinkron: openapi.yaml schemas Train / TrainCreate
-- =====================================================================

CREATE TABLE trains (
    id          BIGSERIAL    PRIMARY KEY,
    train_code  VARCHAR(20)  NOT NULL UNIQUE,          -- e.g. 'MRT-NS-101'
    line_id     BIGINT       NOT NULL REFERENCES lines (id) ON DELETE RESTRICT,
    capacity    INT          NOT NULL DEFAULT 0 CHECK (capacity >= 0),
    status      train_status NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- SCHEDULES
-- Sinkron: TABLES.md "Jadwal Real-time Kereta" + openapi.yaml /schedules
-- =====================================================================

CREATE TABLE schedules (
    id                      BIGSERIAL        PRIMARY KEY,
    train_id                BIGINT           NOT NULL REFERENCES trains (id) ON DELETE RESTRICT,
    line_id                 BIGINT           NOT NULL REFERENCES lines (id) ON DELETE RESTRICT,
    origin_station_id       BIGINT           NOT NULL REFERENCES stations (id) ON DELETE RESTRICT,
    destination_station_id  BIGINT           NOT NULL REFERENCES stations (id) ON DELETE RESTRICT,
    departure_time          TIMESTAMPTZ      NOT NULL,
    arrival_time            TIMESTAMPTZ      NOT NULL,
    status                  schedule_status  NOT NULL DEFAULT 'ON_TIME',
    created_at              TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_schedule_time_order CHECK (arrival_time > departure_time),
    CONSTRAINT chk_schedule_distinct_stations CHECK (origin_station_id <> destination_station_id)
);

-- =====================================================================
-- INCIDENTS
-- Sinkron: FORMS.md "Pencatatan Insiden Jalur" + openapi.yaml /incidents
-- =====================================================================

CREATE TABLE incidents (
    id                      BIGSERIAL        PRIMARY KEY,
    line_type               line_type        NOT NULL,
    train_id                BIGINT           REFERENCES trains (id) ON DELETE SET NULL,
    location_station        VARCHAR(100)     NOT NULL CHECK (char_length(location_station) >= 3),
    delay_duration_minutes  INT              NOT NULL DEFAULT 0 CHECK (delay_duration_minutes BETWEEN 0 AND 300),
    description             TEXT             NOT NULL CHECK (char_length(description) <= 500),
    status                  incident_status  NOT NULL DEFAULT 'OPEN',
    reported_at             TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    resolved_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    -- resolved_at hanya boleh terisi saat status RESOLVED
    CONSTRAINT chk_incident_resolved CHECK (
        (status = 'RESOLVED' AND resolved_at IS NOT NULL)
        OR
        (status <> 'RESOLVED' AND resolved_at IS NULL)
    )
);

-- =====================================================================
-- TRAIN POSITIONS (telemetri real-time)
-- Latency target refresh status kereta < 2 detik (lihat GOALS.md).
-- =====================================================================

CREATE TABLE train_positions (
    id              BIGSERIAL       PRIMARY KEY,
    train_id        BIGINT          NOT NULL REFERENCES trains (id) ON DELETE CASCADE,
    station_id      BIGINT          REFERENCES stations (id) ON DELETE SET NULL,
    latitude        NUMERIC(9,6)    NOT NULL,
    longitude       NUMERIC(9,6)    NOT NULL,
    speed_kmh       NUMERIC(6,2)    NOT NULL DEFAULT 0 CHECK (speed_kmh >= 0),
    status          position_status NOT NULL DEFAULT 'IN_TRANSIT',
    last_updated_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- INDEXES (optimasi query real-time & server-side pagination)
-- =====================================================================

-- Schedules
CREATE INDEX idx_schedules_departure_time ON schedules (departure_time);
CREATE INDEX idx_schedules_line_id        ON schedules (line_id);
CREATE INDEX idx_schedules_train_id       ON schedules (train_id);
CREATE INDEX idx_schedules_status         ON schedules (status);

-- Trains
CREATE INDEX idx_trains_line_id  ON trains (line_id);
CREATE INDEX idx_trains_status   ON trains (status);

-- Stations
CREATE INDEX idx_stations_line_id ON stations (line_id);

-- Incidents
CREATE INDEX idx_incidents_status     ON incidents (status);
CREATE INDEX idx_incidents_reported   ON incidents (reported_at);
CREATE INDEX idx_incidents_line_type  ON incidents (line_type);

-- Train positions (query posisi terbaru per armada)
CREATE INDEX idx_train_positions_updated ON train_positions (last_updated_at DESC);
CREATE INDEX idx_train_positions_train   ON train_positions (train_id);

-- =====================================================================
-- TRIGGER: AUTO-UPDATE updated_at
-- =====================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lines_updated_at
    BEFORE UPDATE ON lines
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_stations_updated_at
    BEFORE UPDATE ON stations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_trains_updated_at
    BEFORE UPDATE ON trains
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_incidents_updated_at
    BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- VIEW: SCHEDULE SUMMARY
-- Sinkron kolom dengan TABLES.md (train_code, line_name, origin_station,
-- destination_station, departure_time, status)
-- =====================================================================

CREATE OR REPLACE VIEW v_schedule_summary AS
SELECT
    s.id                        AS id,
    t.train_code                AS train_code,
    l.code                      AS line_code,
    l.name                      AS line_name,
    l.type                      AS line_type,
    o.code                      AS origin_station_code,
    o.name                      AS origin_station,
    d.code                      AS destination_station_code,
    d.name                      AS destination_station,
    s.departure_time            AS departure_time,
    s.arrival_time              AS arrival_time,
    s.status                    AS status
FROM schedules s
JOIN trains    t ON t.id = s.train_id
JOIN lines     l ON l.id = s.line_id
JOIN stations  o ON o.id = s.origin_station_id
JOIN stations  d ON d.id = s.destination_station_id;

-- =====================================================================
-- SEED DATA (development)
-- =====================================================================

INSERT INTO lines (code, name, type, color_hex) VALUES
    ('MRT_NS', 'MRT North-South Line',      'MRT', '#00529B'),
    ('MRT_EW', 'MRT East-West Line',        'MRT', '#00A79D'),
    ('KRL_RED', 'KRL Red Line',             'KRL', '#C8102E'),
    ('KRL_GREEN', 'KRL Green Line',         'KRL', '#3A913F'),
    ('KRL_YELLOW', 'KRL Yellow Line',       'KRL', '#F5C400');

INSERT INTO stations (code, name, line_id) VALUES
    -- MRT NS
    ('LB', 'Lebak Bulus',   1),
    ('FH', 'Fatmawati',     1),
    ('BM', 'Blok M',        1),
    ('HI', 'Bundaran HI',   1),
    -- KRL Red (Jakarta Kota - Bogor)
    ('JK', 'Jakarta Kota',  3),
    ('MN', 'Manggarai',     3),
    ('BG', 'Bogor',         3);

INSERT INTO trains (train_code, line_id, capacity, status) VALUES
    ('MRT-NS-101', 1, 1200, 'ACTIVE'),
    ('MRT-NS-102', 1, 1200, 'ACTIVE'),
    ('MRT-NS-103', 1, 1200, 'MAINTENANCE'),
    ('KRL-RED-201', 3, 1800, 'ACTIVE'),
    ('KRL-RED-202', 3, 1800, 'DELAYED');

INSERT INTO schedules
    (train_id, line_id, origin_station_id, destination_station_id, departure_time, arrival_time, status)
VALUES
    (1, 1, 1, 4, '2026-08-12 06:15:00+07', '2026-08-12 06:52:00+07', 'ON_TIME'),
    (1, 1, 4, 1, '2026-08-12 07:05:00+07', '2026-08-12 07:42:00+07', 'ON_TIME'),
    (2, 1, 1, 4, '2026-08-12 06:30:00+07', '2026-08-12 07:07:00+07', 'DELAYED'),
    (4, 3, 5, 7, '2026-08-12 06:00:00+07', '2026-08-12 07:35:00+07', 'ON_TIME'),
    (5, 3, 7, 5, '2026-08-12 06:45:00+07', '2026-08-12 08:20:00+07', 'DELAYED');

INSERT INTO incidents
    (line_type, train_id, location_station, delay_duration_minutes, description, status, reported_at, resolved_at)
VALUES
    ('MRT', 2, 'Blok M', 15, 'Penumpukan penumpang di pintu masuk Stasiun Blok M.', 'RESOLVED',
     '2026-08-12 06:20:00+07', '2026-08-12 07:10:00+07'),
    ('KRL', 5, 'Manggarai', 25, 'Sinyal bermasalah di sekitar Stasiun Manggarai.', 'OPEN',
     '2026-08-12 08:05:00+07', NULL);

INSERT INTO train_positions
    (train_id, station_id, latitude, longitude, speed_kmh, status, last_updated_at)
VALUES
    (1, NULL, -6.289600, 106.803500, 62.50, 'IN_TRANSIT', NOW()),
    (2, 3,    -6.244500, 106.800300, 0.00,  'AT_STATION', NOW()),
    (4, 5,    -6.137400, 106.814600, 0.00,  'AT_STATION', NOW()),
    (5, NULL, -6.206000, 106.860700, 45.20, 'IN_TRANSIT', NOW());

-- =====================================================================
-- VERSION CONTROL
-- =====================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    version     VARCHAR(50) PRIMARY KEY,
    description TEXT         NOT NULL,
    applied_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations (version, description)
VALUES ('1.0.0', 'Initial schema: lines, stations, trains, schedules, incidents, train_positions, views, seed data')
ON CONFLICT (version) DO NOTHING;

COMMIT;
