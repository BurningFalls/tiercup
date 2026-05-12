-- ============================================================
-- 1. tier_cups
-- ============================================================
CREATE TABLE tier_cups (
  id           BIGSERIAL PRIMARY KEY,
  play_code    VARCHAR(10)  NOT NULL UNIQUE,
  manage_code  VARCHAR(20)  NOT NULL UNIQUE,
  title        VARCHAR(30)  NOT NULL,
  play_count   INT          NOT NULL DEFAULT 0,
  like_count   INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. items
-- ============================================================
CREATE TABLE items (
  id            BIGSERIAL PRIMARY KEY,
  tier_cup_id   BIGINT       NOT NULL REFERENCES tier_cups(id) ON DELETE CASCADE,
  name          VARCHAR(50)  NOT NULL,
  image_url     TEXT,
  display_order INT          NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. play_sessions
-- ============================================================
CREATE TABLE play_sessions (
  id               BIGSERIAL PRIMARY KEY,
  tier_cup_id      BIGINT      NOT NULL REFERENCES tier_cups(id) ON DELETE CASCADE,
  result_code      VARCHAR(10) NOT NULL UNIQUE,
  status           TEXT        NOT NULL DEFAULT 'in_progress'
                               CHECK (status IN ('in_progress', 'completed')),
  comparison_count INT         NOT NULL DEFAULT 0,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- ============================================================
-- 4. comparisons
-- ============================================================
CREATE TABLE comparisons (
  id              BIGSERIAL PRIMARY KEY,
  play_session_id BIGINT      NOT NULL REFERENCES play_sessions(id) ON DELETE CASCADE,
  winner_item_id  BIGINT      NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  loser_item_id   BIGINT      NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. play_results
-- ============================================================
CREATE TABLE play_results (
  id              BIGSERIAL PRIMARY KEY,
  play_session_id BIGINT NOT NULL REFERENCES play_sessions(id) ON DELETE CASCADE,
  item_id         BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tier            TEXT   NOT NULL CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'F', '?')),
  tier_order      INT    NOT NULL
);

-- ============================================================
-- 6. likes
-- ============================================================
CREATE TABLE likes (
  id           BIGSERIAL PRIMARY KEY,
  tier_cup_id  BIGINT       NOT NULL REFERENCES tier_cups(id) ON DELETE CASCADE,
  client_id    VARCHAR(100) NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (tier_cup_id, client_id)
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX idx_tier_cups_play_count  ON tier_cups(play_count DESC);
CREATE INDEX idx_tier_cups_like_count  ON tier_cups(like_count DESC);
CREATE INDEX idx_tier_cups_created_at  ON tier_cups(created_at DESC);

CREATE INDEX idx_items_tier_cup_id              ON items(tier_cup_id);
CREATE INDEX idx_play_sessions_tier_cup_id      ON play_sessions(tier_cup_id);
CREATE INDEX idx_comparisons_play_session_id    ON comparisons(play_session_id);
CREATE INDEX idx_play_results_play_session_id   ON play_results(play_session_id);
CREATE INDEX idx_likes_tier_cup_id              ON likes(tier_cup_id);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tier_cups_updated_at
  BEFORE UPDATE ON tier_cups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS 활성화
-- ============================================================
ALTER TABLE tier_cups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons   ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS 정책 (anon — 비로그인 공개 서비스)
-- ============================================================

-- tier_cups: 누구나 조회/생성/수정/삭제 (play_count·like_count 업데이트 포함)
CREATE POLICY "tier_cups_select" ON tier_cups FOR SELECT USING (true);
CREATE POLICY "tier_cups_insert" ON tier_cups FOR INSERT WITH CHECK (true);
CREATE POLICY "tier_cups_update" ON tier_cups FOR UPDATE USING (true);
CREATE POLICY "tier_cups_delete" ON tier_cups FOR DELETE USING (true);

-- items: 누구나 조회/생성/삭제
-- items UPDATE 정책 미포함 — 이름/이미지는 삭제 후 재생성 방식 사용
CREATE POLICY "items_select" ON items FOR SELECT USING (true);
CREATE POLICY "items_insert" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "items_delete" ON items FOR DELETE USING (true);

-- play_sessions: 누구나 조회/생성/수정
CREATE POLICY "play_sessions_select" ON play_sessions FOR SELECT USING (true);
CREATE POLICY "play_sessions_insert" ON play_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "play_sessions_update" ON play_sessions FOR UPDATE USING (true);

-- comparisons: 누구나 조회/생성
CREATE POLICY "comparisons_select" ON comparisons FOR SELECT USING (true);
CREATE POLICY "comparisons_insert" ON comparisons FOR INSERT WITH CHECK (true);

-- play_results: 누구나 조회/생성/수정/삭제 (드래그앤드롭 수정 포함)
CREATE POLICY "play_results_select" ON play_results FOR SELECT USING (true);
CREATE POLICY "play_results_insert" ON play_results FOR INSERT WITH CHECK (true);
CREATE POLICY "play_results_update" ON play_results FOR UPDATE USING (true);
CREATE POLICY "play_results_delete" ON play_results FOR DELETE USING (true);

-- likes: 누구나 조회/생성/삭제
CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (true);

-- ============================================================
-- Data API 접근 권한 (anon 역할)
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON tier_cups     TO anon;
GRANT SELECT, INSERT, DELETE         ON items         TO anon;
GRANT SELECT, INSERT, UPDATE         ON play_sessions TO anon;
GRANT SELECT, INSERT                 ON comparisons   TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON play_results  TO anon;
GRANT SELECT, INSERT, DELETE         ON likes         TO anon;

GRANT USAGE ON SEQUENCE tier_cups_id_seq     TO anon;
GRANT USAGE ON SEQUENCE items_id_seq         TO anon;
GRANT USAGE ON SEQUENCE play_sessions_id_seq TO anon;
GRANT USAGE ON SEQUENCE comparisons_id_seq   TO anon;
GRANT USAGE ON SEQUENCE play_results_id_seq  TO anon;
GRANT USAGE ON SEQUENCE likes_id_seq         TO anon;
