-- ============================================================
-- item-images 버킷 생성 (공개 버킷)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true);

-- ============================================================
-- Storage RLS 정책
-- 공개 버킷이므로 오브젝트 URL 직접 접근 가능 (SELECT 정책 불필요)
-- 업로드/삭제는 anon 허용 (앱 레벨에서 파일 크기·형식 검증)
-- ============================================================

-- 업로드: 누구나 가능 (INSERT + UPDATE for upsert)
CREATE POLICY "item_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "item_images_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'item-images');

-- 삭제: 누구나 가능 (티어컵 삭제 시 연동)
CREATE POLICY "item_images_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'item-images');
