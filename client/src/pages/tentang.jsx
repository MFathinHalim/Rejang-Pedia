const Tentang = () => {
  return (
    <div className="container text-white">
      <a
        className="btn btn-outline-primary"
        href="https://www.fathin.my.id"
        id="hpDp"
      >
        <i className="fa fa-question-circle" aria-hidden="true" /> Tentang
        Fathin
      </a>
      <button className="btn btn-outline-success" onclick="openApp()">
        Buka di Aplikasi
      </button>
      <div className="dropdown-divider" />
      <h1>Tentang</h1>
      <p>
        rejangpedia adalah aplikasi yang dibuat dan dikembangkan oleh
        <strong>M. FATHIN HALIM</strong>, siswa kelas VIII SMPN 1 rejang lebong.
        Konsep dr rejangpedia adalah apalikasi all in dengan semangat gotong
        royong dalam melestarikan budaya bengkulu pada umumnya dan rejang lebong
        pada khususnya dalam bentuk digital literasi dimana setiap orang bisa
        ikut berpartisipasi. Fitur yang sudah bisa dinikmati pada rejangpedia
        saat ini yaitu artikel budaya, artikel umum, kamus kata bahasa rejang,
        konverter kaganga. Kedepan Insyaallah akan terus dikembang dengan
        menambah fitur media sosial dan kamus-kamus bahasa daerah lain yang ada
        diwilayah Bengkulu. Setiap orang dapat ikut berpartisipasi dengan
        menambahkan informasi dalam bentuk artikel dan kata-arti database kamus
        dengan melalui filtering moderasi terlebih dahulu
      </p>
      <h3>Tujuan</h3>
      <p>
        Tujuan kami adalah untuk memberikan platform bagi pengguna untuk berbagi
        pengetahuan dan informasi yang bermanfaat.
      </p>
      <h3>Ingin Ikut Membantu dalam RejangPedia ?</h3>
      <p>
        Bisa! Dengan Donasi ke Saweria anda dapat membantu kami dalam
        pengembangan aplikasi ini!
      </p>
      <a
        href="https://saweria.co/domaTomoharu"
        className="btn btn-outline-warning mb-2"
      >
        Saweria!
      </a>
      <div className="dropdown-divider" />
      <h1>Peraturan dan Privasi rejangpedia</h1>
      <h3>1. Pedoman Konten</h3>
      <p>
        Kami menghargai kontribusi pengguna, namun konten yang tidak sesuai
        seperti konten berbahaya, spam, atau pelanggaran hak cipta akan dihapus.
      </p>
      <h3>2. Perlindungan Privasi</h3>
      <p>
        Kami menghormati privasi pengguna. Informasi pribadi tidak akan
        dibagikan tanpa izin pengguna.
      </p>
      <h3>3. Hak Cipta</h3>
      <p>
        Seluruh konten yang diunggah ke Rejang Pedia harus mematuhi hak cipta.
      </p>
      <h3>4. Referensi</h3>
      <p>Harap cantumkan Referensi yang anda gunakan.</p>
      <iframe
        src="https://scribehow.com/embed/Membuat_artikel_pada_rejangpedia__xHPXpnG8TByHWoClRaf7gA"
        width="100%"
        height={640}
        allowFullScreen=""
        frameBorder={0}
        style={{ borderRadius: 12 }}
      />
    </div>
  );
};

export default Tentang;
