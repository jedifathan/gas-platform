import { Link } from 'react-router-dom'
import { ArrowRight, Target, Users, BookOpen, BarChart2 } from 'lucide-react'

const OBJECTIVES = [
  { icon: BookOpen,  title: 'Pelatihan Guru',     desc: 'Meningkatkan kompetensi guru PAUD/TK dalam edukasi kesehatan gigi melalui LMS digital.' },
  { icon: Users,     title: 'Edukasi Anak',       desc: 'Menanamkan kebiasaan menyikat gigi yang benar sejak dini melalui kegiatan di sekolah.' },
  { icon: Target,    title: 'Keterlibatan Orang Tua', desc: 'Mendorong orang tua aktif mendukung kebiasaan kesehatan gigi anak di rumah.' },
  { icon: BarChart2, title: 'Monitoring Nasional', desc: 'Memantau cakupan dan kualitas program di seluruh Indonesia secara transparan.' },
]

const TIMELINE = [
  { year: '2023', event: 'Inisiasi Program GAS oleh Kemenkes RI' },
  { year: '2024', event: 'Pilot di 3 wilayah Banten — 52 sekolah' },
  { year: '2025', event: 'Pengembangan platform digital & ekspansi nasional' },
  { year: '2026', event: 'Target 500 sekolah di 10 provinsi' },
]

export default function AboutProgram() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50
                        border border-primary-200 text-primary-700 text-xs font-medium mb-5">
          Kementerian Kesehatan Republik Indonesia
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">
          Tentang Program Gigi Anak Sehat
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Program <strong className="text-gray-700">GAS (Gigi Anak Sehat)</strong> adalah
          inisiatif nasional Kementerian Kesehatan RI yang bertujuan meningkatkan
          kesehatan gigi anak prasekolah (usia 3–6 tahun) melalui pendekatan sekolah.
        </p>
      </div>

      {/* About card */}
      <div className="card p-7 mb-10 bg-gradient-to-br from-primary-50 to-white border-primary-100">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Latar Belakang</h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            Data Riskesdas 2018 menunjukkan bahwa <strong className="text-gray-800">93% anak
            Indonesia mengalami masalah gigi</strong>, namun hanya 2,8% yang mendapat
            perawatan. Karies gigi pada anak prasekolah menjadi masalah kesehatan yang
            serius karena dampaknya terhadap gizi, tumbuh kembang, dan kualitas hidup.
          </p>
          <p>
            Program GAS hadir sebagai solusi preventif berbasis sekolah — melatih guru
            sebagai agen perubahan kesehatan gigi yang menjangkau anak sekaligus
            mendidik orang tua untuk meneruskan kebiasaan baik di rumah.
          </p>
        </div>
      </div>

      {/* Objectives */}
      <h2 className="text-xl font-bold text-gray-900 mb-5">Tujuan Program</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {OBJECTIVES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5 flex gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <h2 className="text-xl font-bold text-gray-900 mb-5">Perjalanan Program</h2>
      <div className="card p-6 mb-12">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-primary-100" />
          <div className="space-y-6">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex gap-5 items-start relative">
                <div className={`w-14 h-7 rounded-full flex items-center justify-center text-xs
                                font-bold shrink-0 z-10
                                ${i === TIMELINE.length - 1
                                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-400'
                                  : 'bg-white text-gray-600 border border-gray-200'}`}>
                  {item.year}
                </div>
                <p className={`text-sm pt-0.5 ${i === TIMELINE.length - 1 ? 'text-primary-700 font-medium' : 'text-gray-600'}`}>
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scope note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-10">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Catatan Privasi</h3>
        <p className="text-xs text-amber-700 leading-relaxed">
          Platform ini <strong>tidak menyimpan data klinis atau data pribadi anak</strong>.
          Seluruh data yang dikumpulkan bersifat agregat di tingkat sekolah dan wilayah
          untuk keperluan monitoring dan evaluasi program.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link to="/leaderboard"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700
                     text-sm font-medium transition-colors">
          Lihat peringkat sekolah <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
