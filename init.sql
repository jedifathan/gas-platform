-- ─────────────────────────────────────────────────────────────────────────────
-- GAS Platform — Database Schema + Real Seed Data
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS regions (
  id         VARCHAR(50)  PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  kota       VARCHAR(255),
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schools (
  id             VARCHAR(50)  PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  district       VARCHAR(255),
  region_id      VARCHAR(50)  REFERENCES regions(id) ON DELETE SET NULL,
  address        TEXT,
  total_students INT,
  total_teachers INT,
  is_active      BOOLEAN      DEFAULT true,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id         VARCHAR(50)  PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(50)  NOT NULL CHECK (role IN ('admin','teacher','gov_observer')),
  school_id  VARCHAR(50)  REFERENCES schools(id) ON DELETE SET NULL,
  region_id  VARCHAR(50)  REFERENCES regions(id) ON DELETE SET NULL,
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS courses (
  id          VARCHAR(50)  PRIMARY KEY,
  order_num   INT          NOT NULL,
  title       VARCHAR(255) NOT NULL,
  month_label VARCHAR(50),
  description TEXT,
  objectives  JSONB        DEFAULT '[]',
  activities  JSONB        DEFAULT '[]',
  tools       JSONB        DEFAULT '[]',
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Regions: all Jakarta kecamatan ───────────────────────────────────────────
INSERT INTO regions (id, name, kota) VALUES
  ('reg-jkt-pst-gambir','Gambir','Jakarta Pusat'),
  ('reg-jkt-pst-sawahbesar','Sawah Besar','Jakarta Pusat'),
  ('reg-jkt-pst-kemayoran','Kemayoran','Jakarta Pusat'),
  ('reg-jkt-pst-senen','Senen','Jakarta Pusat'),
  ('reg-jkt-pst-cempakaputih','Cempaka Putih','Jakarta Pusat'),
  ('reg-jkt-pst-joharbaru','Johar Baru','Jakarta Pusat'),
  ('reg-jkt-pst-menteng','Menteng','Jakarta Pusat'),
  ('reg-jkt-pst-tanahabang','Tanah Abang','Jakarta Pusat'),
  ('reg-jkt-utr-penjaringan','Penjaringan','Jakarta Utara'),
  ('reg-jkt-utr-pademangan','Pademangan','Jakarta Utara'),
  ('reg-jkt-utr-tanjungpriok','Tanjung Priok','Jakarta Utara'),
  ('reg-jkt-utr-koja','Koja','Jakarta Utara'),
  ('reg-jkt-utr-kelapagading','Kelapa Gading','Jakarta Utara'),
  ('reg-jkt-utr-cilincing','Cilincing','Jakarta Utara'),
  ('reg-jkt-bar-cengkareng','Cengkareng','Jakarta Barat'),
  ('reg-jkt-bar-kalideres','Kali Deres','Jakarta Barat'),
  ('reg-jkt-bar-grogol','Grogol Petamburan','Jakarta Barat'),
  ('reg-jkt-bar-palmerah','Palmerah','Jakarta Barat'),
  ('reg-jkt-bar-tamansari','Taman Sari','Jakarta Barat'),
  ('reg-jkt-bar-tambora','Tambora','Jakarta Barat'),
  ('reg-jkt-bar-kebunjeruk','Kebun Jeruk','Jakarta Barat'),
  ('reg-jkt-bar-kembangan','Kembangan','Jakarta Barat'),
  ('reg-jkt-sel-tebet','Tebet','Jakarta Selatan'),
  ('reg-jkt-sel-setiabudi','Setiabudi','Jakarta Selatan'),
  ('reg-jkt-sel-mampang','Mampang Prapatan','Jakarta Selatan'),
  ('reg-jkt-sel-pasarminggu','Pasar Minggu','Jakarta Selatan'),
  ('reg-jkt-sel-jagakarsa','Jagakarsa','Jakarta Selatan'),
  ('reg-jkt-sel-kebayoranbaru','Kebayoran Baru','Jakarta Selatan'),
  ('reg-jkt-sel-cilandak','Cilandak','Jakarta Selatan'),
  ('reg-jkt-sel-kebayoranlama','Kebayoran Lama','Jakarta Selatan'),
  ('reg-jkt-sel-pesanggrahan','Pesanggrahan','Jakarta Selatan'),
  ('reg-jkt-sel-pancoran','Pancoran','Jakarta Selatan'),
  ('reg-jkt-tim-matraman','Matraman','Jakarta Timur'),
  ('reg-jkt-tim-pulogadung','Pulo Gadung','Jakarta Timur'),
  ('reg-jkt-tim-jatinegara','Jatinegara','Jakarta Timur'),
  ('reg-jkt-tim-durensawit','Duren Sawit','Jakarta Timur'),
  ('reg-jkt-tim-kramatjati','Kramat Jati','Jakarta Timur'),
  ('reg-jkt-tim-makasar','Makasar','Jakarta Timur'),
  ('reg-jkt-tim-pasarrebo','Pasar Rebo','Jakarta Timur'),
  ('reg-jkt-tim-cipayung','Cipayung','Jakarta Timur'),
  ('reg-jkt-tim-ciracas','Ciracas','Jakarta Timur'),
  ('reg-jkt-tim-cakung','Cakung','Jakarta Timur'),
  ('reg-kep-seribu-utara','Kep. Seribu Utara','Kab. Kep. Seribu'),
  ('reg-kep-seribu-selatan','Kep. Seribu Selatan','Kab. Kep. Seribu')
ON CONFLICT (id) DO NOTHING;

-- ── Schools: 17 pilot schools ─────────────────────────────────────────────────
INSERT INTO schools (id, name, district, region_id, address, total_students, total_teachers) VALUES
  ('sch-pasreb-001','SPS Negeri Bale Bermain Baru Bahagia','Pasar Rebo','reg-jkt-tim-pasarrebo','Jl. Puskesmas No.Rt 08/01, RT.8/RW.9, Baru, Kec. Ps. Rebo, Jakarta Timur 13780',30,4),
  ('sch-pasreb-002','RA Al-Jadid','Pasar Rebo','reg-jkt-tim-pasarrebo','Jl. Gongseng Raya No.34, RT.3/RW.9, Baru, Kec. Ps. Rebo, Jakarta Timur 13780',45,8),
  ('sch-pasreb-003','RA Qurrota Ayun','Pasar Rebo','reg-jkt-tim-pasarrebo','Jl. Puskesmas Kalisari RT.003 RW.003 No.21 Kalisari, Pasar Rebo, Jakarta Timur',40,4),
  ('sch-pasreb-004','TK Islam Toledo','Pasar Rebo','reg-jkt-tim-pasarrebo','Jl. Lapan 25 Pekayon, RT.9/RW.1, Pekayon, Kec. Ps. Rebo, Jakarta Timur 13790',104,7),
  ('sch-pasreb-005','TKN 03 Pasar Rebo','Pasar Rebo','reg-jkt-tim-pasarrebo','MV56+G9J, RT.4/RW.9, Pekayon, Pasar Rebo, Jakarta Timur 13710',60,3),
  ('sch-pasreb-006','TKN 04 Pasar Rebo','Pasar Rebo','reg-jkt-tim-pasarrebo','Jl. Telaga, RT.13/RW.9, Pekayon, Kec. Ps. Rebo, Jakarta Timur 13790',55,3),
  ('sch-jatneg-001','TK Al Jannah','Jatinegara','reg-jkt-tim-jatinegara','Jl. Cipinang Jaya IIA No.2, RT.7/RW.7, Cipinang Besar Sel., Kec. Jatinegara, Jakarta Timur 13410',28,6),
  ('sch-jatneg-002','TK Al Iman','Jatinegara','reg-jkt-tim-jatinegara','Jl. Cipinang Jaya LL No.1, RT.1/RW.8, Cipinang Besar Sel., Kec. Jatinegara, Jakarta Timur 13410',103,6),
  ('sch-jatneg-003','TK Mishbahul Amal','Jatinegara','reg-jkt-tim-jatinegara','Jl. Cipinang Jaya IIE No.9, RT.9/RW.9, Cipinang Besar Sel., Kec. Jatinegara, Jakarta Timur 13410',13,2),
  ('sch-jatneg-004','TKN 01 Jatinegara','Jatinegara','reg-jkt-tim-jatinegara','Jl. Cipinang Pulo Kel, RT.013/RW.12, Cipinang Besar Utara, Kec. Jatinegara, Jakarta Timur 13410',80,4),
  ('sch-jatneg-005','TPA Negeri Bina Tunas Jaya IV','Jatinegara','reg-jkt-tim-jatinegara','Jl. Bekasi Barat No.2, RT.004/RW.2, Rawa Bunga, Kec. Jatinegara, Jakarta Timur 13350',30,1),
  ('sch-jatneg-006','PAUD Melati Suci','Jatinegara','reg-jkt-tim-jatinegara','Jl. Wedana Dalam No.36A, RT.10/RW.1, Bali Mester, Kec. Jatinegara, Jakarta Timur 13310',41,4),
  ('sch-matraman-001','TKIT Cahaya Hati','Matraman','reg-jkt-tim-matraman','Jl. Asem Gede Timur No.13, RT.3/RW.5, Utan Kayu Sel., Kec. Matraman, Jakarta Timur 13120',78,4),
  ('sch-matraman-002','TK Negeri Matraman 01','Matraman','reg-jkt-tim-matraman','Jl. Pandan Raya No.13, RT.10/RW.13, Utan Kayu Sel., Kec. Matraman, Jakarta Timur 13120',70,4),
  ('sch-matraman-003','TK Antonius','Matraman','reg-jkt-tim-matraman','Matraman, Jakarta Timur',22,2),
  ('sch-matraman-004','TK Marsudirini','Matraman','reg-jkt-tim-matraman','Jl. Matraman Raya No.129, RT.4/RW.8, Palmeriam, Kec. Matraman, Jakarta Timur 13140',44,2),
  ('sch-matraman-005','TK Al Furqon','Matraman','reg-jkt-tim-matraman','Jl. Penegak Gg. II No.17, RT.3/RW.3, Palmeriam, Kec. Matraman, Jakarta Timur 13140',30,3)
ON CONFLICT (id) DO NOTHING;

-- ── Users ─────────────────────────────────────────────────────────────────────
INSERT INTO users (id, name, email, password, role, school_id, region_id, is_active, created_at, last_login) VALUES
  ('usr-001','Admin GAS Pusat','admin@gas-program.my.id','password123','admin',NULL,NULL,true,'2024-01-01T00:00:00Z','2025-03-14T09:00:00Z'),
  ('usr-002','Pengamat Dinas Pasar Rebo','dinas.pasarrebo@dinkes-jaktim.go.id','password123','gov_observer',NULL,'reg-jkt-tim-pasarrebo',true,'2024-01-10T00:00:00Z','2025-03-12T08:00:00Z'),
  ('usr-003','Pengamat Dinas Jatinegara','dinas.jatinegara@dinkes-jaktim.go.id','password123','gov_observer',NULL,'reg-jkt-tim-jatinegara',true,'2024-01-10T00:00:00Z','2025-03-12T08:00:00Z'),
  ('usr-004','Pengamat Dinas Matraman','dinas.matraman@dinkes-jaktim.go.id','password123','gov_observer',NULL,'reg-jkt-tim-matraman',true,'2024-01-10T00:00:00Z','2025-03-12T08:00:00Z'),
  ('usr-010','Guru SPS Bale Bermain','guru@spsbalebermaín.id','password123','teacher','sch-pasreb-001',NULL,true,'2024-02-01T00:00:00Z','2025-03-13T14:30:00Z'),
  ('usr-011','Guru RA Al-Jadid','guru@raaljadid.id','password123','teacher','sch-pasreb-002',NULL,true,'2024-02-01T00:00:00Z','2025-03-13T14:30:00Z'),
  ('usr-012','Guru RA Qurrota Ayun','guru@raqurrotaayun.id','password123','teacher','sch-pasreb-003',NULL,true,'2024-02-01T00:00:00Z','2025-03-10T11:00:00Z'),
  ('usr-013','Guru TK Islam Toledo','guru@tkislamtoledo.id','password123','teacher','sch-pasreb-004',NULL,true,'2024-02-01T00:00:00Z','2025-03-11T10:00:00Z'),
  ('usr-014','Guru TKN 03 Pasar Rebo','guru@tkn03pasarrebo.id','password123','teacher','sch-pasreb-005',NULL,true,'2024-02-01T00:00:00Z','2025-03-08T09:00:00Z'),
  ('usr-015','Guru TKN 04 Pasar Rebo','guru@tkn04pasarrebo.id','password123','teacher','sch-pasreb-006',NULL,true,'2024-02-01T00:00:00Z','2025-03-08T09:00:00Z'),
  ('usr-020','Guru TK Al Jannah','guru@tkaljannah.id','password123','teacher','sch-jatneg-001',NULL,true,'2024-03-01T00:00:00Z','2025-03-10T11:00:00Z'),
  ('usr-021','Guru TK Al Iman','guru@tkaliman.id','password123','teacher','sch-jatneg-002',NULL,true,'2024-03-01T00:00:00Z','2025-03-10T11:00:00Z'),
  ('usr-022','Guru TK Mishbahul Amal','guru@tkmishbahulamal.id','password123','teacher','sch-jatneg-003',NULL,true,'2024-03-01T00:00:00Z','2025-03-10T11:00:00Z'),
  ('usr-023','Guru TKN 01 Jatinegara','guru@tkn01jatinegara.id','password123','teacher','sch-jatneg-004',NULL,true,'2024-03-01T00:00:00Z','2025-03-08T09:00:00Z'),
  ('usr-024','Guru TPA Bina Tunas Jaya','guru@tpabinatunasjaya.id','password123','teacher','sch-jatneg-005',NULL,true,'2024-03-01T00:00:00Z','2025-03-08T09:00:00Z'),
  ('usr-025','Guru PAUD Melati Suci','guru@paudmelatisuci.id','password123','teacher','sch-jatneg-006',NULL,true,'2024-03-01T00:00:00Z','2025-03-08T09:00:00Z'),
  ('usr-030','Guru TKIT Cahaya Hati','guru@tkitcahayahati.id','password123','teacher','sch-matraman-001',NULL,true,'2024-03-01T00:00:00Z','2025-03-10T11:00:00Z'),
  ('usr-031','Guru TKN Matraman 01','guru@tknmatraman01.id','password123','teacher','sch-matraman-002',NULL,true,'2024-03-01T00:00:00Z','2025-03-10T11:00:00Z'),
  ('usr-032','Guru TK Antonius','guru@tkantonius.id','password123','teacher','sch-matraman-003',NULL,true,'2024-03-01T00:00:00Z','2025-03-08T09:00:00Z'),
  ('usr-033','Guru TK Marsudirini','guru@tkmarsudirini.id','password123','teacher','sch-matraman-004',NULL,true,'2024-03-01T00:00:00Z','2025-03-08T09:00:00Z'),
  ('usr-034','Guru TK Al Furqon','guru@tkalfurqon.id','password123','teacher','sch-matraman-005',NULL,true,'2024-03-01T00:00:00Z','2025-03-08T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ── Courses: 12 Bulan Kelas Gigi ─────────────────────────────────────────────
INSERT INTO courses (id, order_num, title, month_label, description, objectives, activities, tools) VALUES
('course-01',1,'Petualangan Gigi','Juli 2025','Mengenal jenis-jenis gigi sulung dan fungsinya dalam proses makan.','["Mengidentifikasi jenis-jenis gigi sulung (gigi seri, taring, geraham)","Menjelaskan fungsi masing-masing jenis gigi sulung","Membedakan bentuk dan letak gigi pada gambar atau model gigi"]','["Menghitung dan mengamati gigi menggunakan cermin kecil","Tebak-tebakan jenis gigi sulung melalui kuis gambar","Pemberian stiker bintang untuk jawaban benar"]','["Poster edukasi gigi sulung"]'),
('course-02',2,'Perkenalan Alat Pembersih Gigi','Agustus 2025','Mengenal alat pembersih gigi dan fungsinya melalui media gambar dan benda nyata.','["Mengenal alat pembersih gigi (sikat gigi, pasta gigi)","Menyebutkan fungsi masing-masing alat pembersih gigi"]','["Anak membawa alat pembersih gigi pribadi","Menunjukkan berbagai jenis sikat gigi dengan ukuran berbeda","Demonstrasi takaran pasta gigi yang sesuai (sebesar biji kacang)"]','["Berbagai jenis sikat gigi dengan ukuran berbeda"]'),
('course-03',3,'Waktu dan Cara Menyikat Gigi','September 2025','Mengetahui manfaat, waktu yang tepat, dan teknik menyikat gigi yang benar.','["Mengetahui manfaat menyikat gigi secara teratur","Menyebutkan waktu yang tepat menyikat gigi: setelah sarapan dan sebelum tidur","Menunjukkan teknik menyikat gigi yang benar (gerakan memutar, dari gusi ke ujung gigi)","Mengetahui frekuensi ideal: dua kali sehari"]','["Demonstrasi oleh guru menggunakan phantom gigi","Praktik menyikat gigi bersama","Menggunakan lagu berdurasi dua menit sebagai panduan waktu"]','["Phantom gigi","Sikat gigi","Lagu sikat gigi berdurasi 2 menit"]'),
('course-04',4,'Dokter Gigi, Sahabat Gigi','Oktober 2025','Mengenal profesi dokter gigi dan menumbuhkan sikap positif terhadap pemeriksaan gigi.','["Mengenal profesi dokter gigi","Mengetahui peran dokter gigi dalam merawat gigi","Menunjukkan sikap positif terhadap dokter gigi","Menumbuhkan rasa percaya diri saat menjadi pasien"]','["Bermain peran Dokter Gigi dan Pasien secara bergantian"]','["Mainan alat dokter gigi"]'),
('course-05',5,'Perkenalan Gigi Berlubang','November 2025','Mengenali perbedaan gigi sehat dan berlubang serta pentingnya perawatan.','["Mengenali perbedaan gigi sehat dan gigi berlubang","Mengetahui ciri-ciri gigi tidak sehat (berlubang, menghitam, sakit, goyang)","Memahami bahwa gigi berlubang perlu dirawat dokter gigi","Mengenal kondisi rongga mulut yang sehat"]','["Menempel kertas pada gambar gigi berlubang agar menjadi gigi sehat kembali"]','["Poster perbedaan gigi sehat dan gigi berlubang"]'),
('course-06',6,'Makanan yang Jadi Musuh Gigi','Desember 2025','Mengenal jenis makanan yang dapat menyebabkan gigi berlubang.','["Mengenali makanan kariogenik","Mengetahui dampak makanan manis terhadap gigi","Membedakan makanan baik dan buruk untuk gigi","Menumbuhkan sikap berhati-hati dalam memilih makanan"]','["Permainan kotak Sahabat Gigi dan Musuh Gigi","Anak memasukkan kartu bergambar makanan ke kotak yang sesuai"]','["Dua kotak berlabel Sahabat Gigi dan Musuh Gigi","Kartu bergambar makanan"]'),
('course-07',7,'Minuman yang Jadi Musuh Gigi','Januari 2026','Mengenal jenis minuman yang baik dan buruk untuk kesehatan gigi.','["Membedakan minuman yang baik dan buruk untuk gigi"]','["Permainan klasifikasi gambar minuman menggunakan klip","Anak menjepit gambar minuman ke gambar gigi sehat atau berlubang"]','["Gambar gigi sehat dan berlubang berukuran besar","Klip bergambar minuman"]'),
('course-08',8,'Akibat Gigi Berlubang','Februari 2026','Memahami dampak gigi berlubang terhadap kesehatan dan aktivitas sehari-hari.','["Menjelaskan bahwa gigi berlubang dapat menyebabkan rasa sakit","Memahami dampak gigi berlubang yang dibiarkan","Mengetahui bahwa sakit gigi mengganggu makan dan pertumbuhan","Menunjukkan sikap peduli terhadap kesehatan gigi"]','["Pembacaan cerita perjalanan gigi berlubang melalui flashcard"]','["Flashcard urutan terjadinya gigi berlubang dan akibatnya"]'),
('course-09',9,'Peri Gigi','Maret 2026','Memahami proses tanggalnya gigi sulung dan tumbuhnya gigi tetap.','["Mengetahui bahwa gigi sulung akan tanggal secara alami","Memahami bahwa gigi tanggal akan digantikan gigi tetap","Menyadari tanggalnya gigi adalah hal normal","Mengetahui pentingnya merawat gigi sulung"]','["Membuat Kotak Peri Gigi untuk menyimpan gigi sulung yang copot","Bermain peran menukar gigi ke Peri Gigi — guru mengganti dengan hadiah kecil"]','["Mainan cabut gigi"]'),
('course-10',10,'Ayo ke Dokter Gigi','April 2026','Memahami pentingnya memeriksakan gigi secara rutin ke dokter gigi.','["Memahami pentingnya periksa gigi rutin meskipun tidak sakit","Mengetahui bahwa dokter gigi membantu merawat gigi","Mengembangkan sikap berani saat ke dokter gigi","Menumbuhkan kebiasaan menjaga kesehatan gigi sejak dini"]','["Membaca pop up book bersama"]','["Pop up book"]'),
('course-11',11,'Gigi Sehat, Tubuh Kuat','Mei 2026','Mengaitkan kesehatan gigi dengan kesehatan tubuh secara keseluruhan.','["Mengenal pentingnya menjaga kesehatan gigi","Menyebutkan cara menjaga gigi tetap sehat","Memahami bahwa gigi sehat membantu makan sehingga tubuh kuat","Mengetahui makanan dan minuman yang sehat untuk gigi dan tubuh"]','["Sikat Gigi Bersama mengikuti panduan lagu selama 2 menit","Buka Bekal Sehat — anak membawa bekal makanan sehat","Tebak-Tebakan Gigi Sehat menggunakan mainan makanan"]','["Sikat gigi","Pasta gigi","Phantom gigi","Mainan makanan dan minuman"]'),
('course-12',12,'Jagalah Gigimu','Juni 2026','Mengulas dan memperkuat seluruh materi kesehatan gigi selama setahun.','["Mengingat waktu yang tepat menyikat gigi","Menjelaskan cara menyikat gigi yang benar","Mengetahui pentingnya menyikat gigi dua kali sehari","Mengenali makanan yang merusak gigi","Memahami bahwa gigi tidak terawat bisa berlubang dan sakit","Mengetahui pentingnya periksa gigi rutin"]','["Tanya Jawab Interaktif dengan Poster — guru memberi pertanyaan terbuka, anak menjawab lisan"]','["Poster waktu sikat gigi, cara sikat gigi yang benar, kunjungan ke dokter gigi"]')
ON CONFLICT (id) DO NOTHING;
