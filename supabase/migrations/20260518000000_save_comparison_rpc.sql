-- save_comparison: comparisons INSERT + play_results UPSERT + comparison_count increment를
-- 단일 트랜잭션으로 처리하여 부분 실패로 인한 데이터 불일치 방지
CREATE OR REPLACE FUNCTION save_comparison(
  p_session_id      BIGINT,
  p_winner_item_id  BIGINT,
  p_loser_item_id   BIGINT,
  p_result_rows     JSONB,
  p_is_complete     BOOLEAN
)
RETURNS INT AS $$
DECLARE
  v_new_count INT;
  v_row       JSONB;
BEGIN
  -- 1. comparisons INSERT
  INSERT INTO comparisons (play_session_id, winner_item_id, loser_item_id)
  VALUES (p_session_id, p_winner_item_id, p_loser_item_id);

  -- 2. play_results UPSERT
  FOR v_row IN SELECT * FROM jsonb_array_elements(p_result_rows)
  LOOP
    INSERT INTO play_results (play_session_id, item_id, tier, tier_order)
    VALUES (
      p_session_id,
      (v_row->>'item_id')::BIGINT,
      v_row->>'tier',
      (v_row->>'tier_order')::INT
    )
    ON CONFLICT (play_session_id, item_id)
    DO UPDATE SET
      tier       = EXCLUDED.tier,
      tier_order = EXCLUDED.tier_order;
  END LOOP;

  -- 3. comparison_count increment + 완료 시 status 갱신
  IF p_is_complete THEN
    UPDATE play_sessions
      SET comparison_count = comparison_count + 1,
          status           = 'completed',
          completed_at     = NOW()
    WHERE id = p_session_id
    RETURNING comparison_count INTO v_new_count;
  ELSE
    UPDATE play_sessions
      SET comparison_count = comparison_count + 1
    WHERE id = p_session_id
    RETURNING comparison_count INTO v_new_count;
  END IF;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION save_comparison(BIGINT, BIGINT, BIGINT, JSONB, BOOLEAN) TO anon;
