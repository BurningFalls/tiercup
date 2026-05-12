-- ============================================================
-- 1. update_updated_at 함수 search_path 고정 (보안 경고 수정)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. Storage SELECT 정책 제거
--    공개 버킷은 URL 직접 접근으로 충분 — 목록 조회 노출 불필요
-- ============================================================
DROP POLICY IF EXISTS "item_images_select" ON storage.objects;

-- ============================================================
-- 3. comparisons / play_results FK 인덱스 추가 (성능 경고 수정)
-- ============================================================
CREATE INDEX idx_comparisons_winner_item_id ON comparisons(winner_item_id);
CREATE INDEX idx_comparisons_loser_item_id  ON comparisons(loser_item_id);
CREATE INDEX idx_play_results_item_id       ON play_results(item_id);
