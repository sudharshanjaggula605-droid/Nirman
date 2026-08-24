-- Migration 001: Extensions
-- Enables necessary PostgreSQL extensions for UUID generation and cryptographic functions.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
