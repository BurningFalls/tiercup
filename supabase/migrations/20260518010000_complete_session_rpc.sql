-- complete_session: 조기 종료 시 현재 비교 결과로 play_results를 upsert하고
-- play_sessions status를 completed로 갱신하는 단일 트랜잭션 처리
CREATE OR REPLACE FUNCTION complete_session(
  p_session_id  BIGINT,
  p_result_rows JSONB
)
RETURNS VOID AS $$
DECLARE
  v_row JSONB;
BEGIN
  -- play_results upsert (비교 결과가 있을 때만)
  IF jsonb_array_length(p_result_rows) > 0 THEN
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
  END IF;

  -- play_sessions status 갱신
  UPDATE play_sessions
    SET status       = 'completed',
        completed_at = NOW()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION complete_session(BIGINT, JSONB) TO anon;
