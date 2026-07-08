-- Generic anchor ledger: cryptographically proof every data mutation via Stellar
-- Every row = one anchored event (payment, tenant, maintenance, floor, unit)
CREATE TABLE IF NOT EXISTS anchors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  record_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  record_label TEXT NOT NULL DEFAULT '',
  record_snapshot JSONB NOT NULL,
  sha256_hash TEXT NOT NULL,
  stellar_tx_hash TEXT,
  anchored_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anchors_building_id ON anchors(building_id);
CREATE INDEX IF NOT EXISTS idx_anchors_record_type ON anchors(record_type);
CREATE INDEX IF NOT EXISTS idx_anchors_created_at ON anchors(created_at DESC);

-- RLS: single-user — user can only see and insert their own anchors
ALTER TABLE anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY anchors_user_select ON anchors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY anchors_user_insert ON anchors
  FOR INSERT WITH CHECK (user_id = auth.uid());
