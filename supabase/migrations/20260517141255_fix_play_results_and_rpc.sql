-- ============================================================
-- 1. play_results (play_session_id, item_id) UNIQUE 제약 추가
--    upsert onConflict 대상 컬럼에 UNIQUE 제약이 없으면
--    런타임 Postgres conflict-target 오류 발생
-- ============================================================
ALTER TABLE play_results
  ADD CONSTRAINT play_results_session_item_unique UNIQUE (play_session_id, item_id);

-- ============================================================
-- 2. increment_play_count RPC 함수 추가
--    race condition 방지를 위해 atomic UPDATE 사용
-- ============================================================
CREATE OR REPLACE FUNCTION increment_play_count(cup_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE tier_cups SET play_count = play_count + 1 WHERE id = cup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_play_count(BIGINT) TO anon;

-- ============================================================
-- 3. increment_comparison_count RPC 함수 추가
--    comparison_count 동시성 문제 해결 (메모리 증분 대신 atomic UPDATE)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_comparison_count(
  p_session_id BIGINT,
  p_is_complete BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  IF p_is_complete THEN
    UPDATE play_sessions
      SET comparison_count = comparison_count + 1,
          status = 'completed',
          completed_at = NOW()
    WHERE id = p_session_id;
  ELSE
    UPDATE play_sessions
      SET comparison_count = comparison_count + 1
    WHERE id = p_session_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_comparison_count(BIGINT, BOOLEAN) TO anon;
