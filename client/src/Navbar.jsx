const Navbar = () => {
  return (
    <div id="nav" className="sticky-top">
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-light sticky-top"
        id="khususDekstop"
      >
        <a
          className="navbar-brand"
          href="/"
          style={{ fontFamily: '"Montserrat" !important' }}
        >
          rejangpedia
        </a>
        <button
          className="navbar-toggler border-0"
          style={{ borderRadius: 0 }}
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i className="fa fa-bars" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* Centered navigation items */}
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://kamusrejang.rejanglebongkab.go.id"
              >
                <i className="fa fa-book" /> Kamus Rejang
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/new">
                <i className="fa fa-plus" /> Tambah Artikel
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="fa fa-bars" /> Daftar
              </a>
              <div
                className="dropdown-menu bg-light"
                aria-labelledby="navbarDropdown"
              >
                <a className="dropdown-item text-white" href="/tentang">
                  <i className="fa fa-question" aria-hidden="true" /> Tentang
                </a>
                <div className="dropdown-divider" />
                <button className="dropdown-item text-white">
                  Buka di Aplikasi
                </button>
              </div>
            </li>
          </ul>
          <ul className="navbar-nav">
            <a
              className="dropdown-item text-white"
              href="https://mfathinhalim.github.io"
            >
              <i className="fa fa-question-circle" aria-hidden="true" />
              Fathin
            </a>
          </ul>
        </div>
      </nav>
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-light sticky-top"
        id="khususHp"
      >
        <div className="container">
          <div className="row w-100">
            <div className="col-9 text-center">
              <a
                className="navbar-brand"
                href="/"
                style={{ fontFamily: '"Montserrat" !important' }}
              >
                rejangpedia
              </a>
            </div>
          </div>
        </div>
      </nav>
      <nav
        className="navbar fixed-bottom bawah navbar-expand navbar-light bg-light"
        id="khususHpBawah"
      >
        <ul className="navbar-nav nav-justified w-100">
          <li className="nav-item">
            <a className="nav-link" href="/">
              <i className="fa fa-home" />
              <span className="d-block">Home</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/new">
              <i className="fa fa-plus" />
              <span className="d-block">Tambah</span>
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              href="https://kamusrejang.rejanglebongkab.go.id"
            >
              <i className="fa fa-book" />
              <span className="d-block">Kamus</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/dropdown">
              <i className="fa fa-bars" />
              <span className="d-block">Menu</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
