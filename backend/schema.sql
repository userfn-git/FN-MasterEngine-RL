-- ==============================================================================
-- FN ROCKET LEAGUE MASTER-ENGINE DATABASE SCHEMA
-- File: backend/schema.sql (v4.0.2 PRO)
-- Primary SQLite schema for persistent storage of macros, presets, and telemetry
-- ==============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. Global Engine Settings Key-Value Table
CREATE TABLE IF NOT EXISTS engine_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    updated_at TEXT NOT NULL
);

-- 2. Macro Configurations (Timing windows, flip cancels, deadzones, sensitivities)
CREATE TABLE IF NOT EXISTS macro_configurations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    preset_type TEXT NOT NULL,
    jump1_ms INTEGER NOT NULL,
    jump2_delay_ms INTEGER NOT NULL,
    jump2_ms INTEGER NOT NULL,
    cancel_delay_ms INTEGER NOT NULL,
    cancel_hold_ms INTEGER NOT NULL,
    roll_type TEXT NOT NULL DEFAULT 'Q',
    roll_hold_ms INTEGER NOT NULL DEFAULT 650,
    deadzone REAL NOT NULL DEFAULT 0.05,
    dodge_deadzone REAL NOT NULL DEFAULT 0.05,
    curve_exponent REAL NOT NULL DEFAULT 1.40,
    ground_sense REAL NOT NULL DEFAULT 1.35,
    aerial_sense REAL NOT NULL DEFAULT 1.55,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 3. User Saved Presets & Profiles
CREATE TABLE IF NOT EXISTS user_presets (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'local_user',
    preset_name TEXT NOT NULL,
    category TEXT DEFAULT 'competitive',
    description TEXT,
    config_json TEXT NOT NULL,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 4. Hardware Performance & Polling Telemetry Logs
CREATE TABLE IF NOT EXISTS hardware_telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    cpu_load REAL,
    gpu_load REAL,
    polling_rate_hz INTEGER,
    polling_latency_ms REAL,
    thread_jitter_ms REAL,
    bottleneck_status TEXT,
    active_macros INTEGER DEFAULT 0
);

-- 5. Macro Execution Performance Benchmarks & Timing Drift Logs
CREATE TABLE IF NOT EXISTS macro_benchmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    macro_name TEXT NOT NULL,
    duration_ms REAL,
    hold_accuracy_pct REAL,
    timing_drift_ms REAL,
    cpu_load_pct REAL,
    input_delay_us REAL,
    status TEXT
);

-- 6. Wikipedia Esports Mechanics & Computer Science Knowledge Cache
CREATE TABLE IF NOT EXISTS wikipedia_mechanics_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    source_url TEXT NOT NULL,
    fetched_at TEXT NOT NULL
);

-- Indexes for lightning fast queries during 120Hz physics loops
CREATE INDEX IF NOT EXISTS idx_macro_preset ON macro_configurations(preset_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_time ON hardware_telemetry(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_benchmarks_time ON macro_benchmarks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wiki_topic ON wikipedia_mechanics_cache(topic);
