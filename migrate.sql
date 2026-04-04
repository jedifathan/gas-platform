-- Migration: add lessons table and update courses table
-- Run with: docker exec -i gas_db psql -U gas_user -d gas_platform < migrate.sql

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS is_published   BOOLEAN     DEFAULT true,
  ADD COLUMN IF NOT EXISTS total_lessons  INT         DEFAULT 0,
  ADD COLUMN IF NOT EXISTS passing_score  INT         DEFAULT 70,
  ADD COLUMN IF NOT EXISTS thumbnail_color VARCHAR(20) DEFAULT '#DCFCE7',
  ADD COLUMN IF NOT EXISTS category_label VARCHAR(100);

-- Update total_lessons from existing data if any
UPDATE courses SET is_published = true, total_lessons = 4, passing_score = 70
WHERE total_lessons IS NULL OR total_lessons = 0;

CREATE TABLE IF NOT EXISTS lessons (
  id             VARCHAR(50)  PRIMARY KEY,
  course_id      VARCHAR(50)  NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  order_index    INT          NOT NULL DEFAULT 1,
  title          VARCHAR(255) NOT NULL,
  content_type   VARCHAR(20)  NOT NULL CHECK (content_type IN ('article','pdf','video','quiz')),
  description    TEXT,
  content_body   TEXT,
  drive_file_id  VARCHAR(255),          -- Google Drive file ID
  duration_minutes INT,
  is_required    BOOLEAN      DEFAULT true,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- Seed default lessons for each course (3 content + 1 quiz)
DO $$
DECLARE
  cid TEXT;
  titles TEXT[] := ARRAY[
    'course-01','course-02','course-03','course-04','course-05','course-06',
    'course-07','course-08','course-09','course-10','course-11','course-12'
  ];
BEGIN
  FOREACH cid IN ARRAY titles LOOP
    IF NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = cid) THEN
      INSERT INTO lessons (id, course_id, order_index, title, content_type, is_required) VALUES
        (cid||'-l1', cid, 1, 'Pengantar Materi',  'article', true),
        (cid||'-l2', cid, 2, 'Materi Utama',      'pdf',     true),
        (cid||'-l3', cid, 3, 'Aktivitas Kelas',   'article', true),
        (cid||'-l4', cid, 4, 'Kuis Evaluasi',     'quiz',    false);
      UPDATE courses SET total_lessons = 4 WHERE id = cid;
    END IF;
  END LOOP;
END $$;
