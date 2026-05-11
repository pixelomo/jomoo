-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- Users (synced from Clerk via webhook)
-- ─────────────────────────────────────────────
CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id      TEXT        UNIQUE NOT NULL,
  email         TEXT        NOT NULL,
  nickname      TEXT,
  gender        TEXT        CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  date_of_birth DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users (clerk_id);

-- ─────────────────────────────────────────────
-- Product registrations
-- ─────────────────────────────────────────────
CREATE TABLE product_registrations (
  id                           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_id                     TEXT        NOT NULL,
  model_name                   TEXT        NOT NULL,
  installation_date            DATE        NOT NULL,
  installation_address_state   TEXT        NOT NULL,
  installation_address_detail  TEXT        NOT NULL,
  contact_person               TEXT        NOT NULL,
  phone_number                 TEXT,
  purchase_date                DATE,
  dealer_name                  TEXT,
  serial_number                TEXT        NOT NULL,
  serial_number_valid          BOOLEAN,
  warranty_card_url            TEXT,
  serial_number_image_url      TEXT,
  status                       TEXT        NOT NULL DEFAULT 'PENDING'
                                           CHECK (status IN (
                                             'PENDING',
                                             'RETURNED',
                                             'REGISTERED_NO_WARRANTY',
                                             'REGISTERED_WITH_WARRANTY'
                                           )),
  flagged_for_review           BOOLEAN     NOT NULL DEFAULT FALSE,
  submitted_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at                  TIMESTAMPTZ,
  reviewer_id                  TEXT,
  review_notes                 TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registrations_user_id ON product_registrations (user_id);
CREATE INDEX idx_registrations_status  ON product_registrations (status);

-- ─────────────────────────────────────────────
-- Warranty records (created on approval with warranty)
-- ─────────────────────────────────────────────
CREATE TABLE warranty_records (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id  UUID        UNIQUE NOT NULL REFERENCES product_registrations(id) ON DELETE CASCADE,
  expiry_date      DATE        NOT NULL,
  card_generated   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Ownership transfer audit log
-- ─────────────────────────────────────────────
CREATE TABLE ownership_transfers (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id          UUID        NOT NULL REFERENCES product_registrations(id) ON DELETE CASCADE,
  changed_by               UUID        NOT NULL REFERENCES users(id),
  previous_address_state   TEXT,
  previous_address_detail  TEXT,
  previous_contact_person  TEXT,
  previous_phone_number    TEXT,
  new_address_state        TEXT,
  new_address_detail       TEXT,
  new_contact_person       TEXT,
  new_phone_number         TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ownership_transfers_registration_id ON ownership_transfers (registration_id);

-- ─────────────────────────────────────────────
-- Auto-update updated_at trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON product_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_warranty_records_updated_at
  BEFORE UPDATE ON warranty_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
