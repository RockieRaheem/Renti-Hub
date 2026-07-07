-- Stellar Digital Notary: immutable hash anchoring for payment receipts
-- Adds columns to store the Stellar transaction hash and receipt hash
-- Run this in Supabase SQL Editor

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS stellar_hash TEXT,
  ADD COLUMN IF NOT EXISTS stellar_tx_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_stellar_tx_hash ON payments(stellar_tx_hash);
