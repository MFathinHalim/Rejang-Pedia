import React, { useEffect, useState } from "react";

const Home = () => {
  const [data, setData] = useState([]);
  const [dataPilihan, setDataPilihan] = useState([]);
  const [dataAcak, setDataAcak] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Tambahkan state untuk menyimpan kata kunci pencarian

  useEffect(() => {
    document.title = "Beranda - rejangpedia";
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/getData", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const responseData = await response.json();
        const { data, dataPilihan, dataAcak } = responseData;
        setData(data);
        setDataPilihan(dataPilihan);
        setDataAcak(dataAcak);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    window.location.href = `/search?term=${encodeURIComponent(searchTerm)}`;
  };

  if (data.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }
  const op = Math.floor(Math.random() * data.length);

  return (
    <>
      <div className="container">
        <div
          className="header text-dark text-center mt-2 rounded-bottom"
          style={{ fontFamily: '"Montserrat"' }}
        >
          <img
            id="logo"
            draggable="false"
            className="border-0"
            src="https://cdn.glitch.global/2f9a2460-083a-49a5-a55f-2abb8ce71e54/logo.png?v=1699767799122"
          />
          <p>
            <i className="fa fa-globe" /> Punyo Kito Galo
          </p>
        </div>
        <div className="search-box d-flex justify-content-center">
          <input
            autoComplete="off"
            type="text"
            style={{ borderRadius: "12px 8px 8px 12px", padding: 25 }}
            className="form-control search-input custom-input mr-1"
            id="searchInput"
            placeholder="Mau Cari Apa Sanak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            type="button"
            className="btn btn-primary"
            style={{
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "12px",
              borderBottomRightRadius: "12px",
              borderBottomLeftRadius: "8px",
            }}
            onClick={handleSearch}
          >
            <i className="fa fa-search" aria-hidden="true" />
          </button>
        </div>
        <h4 className="m-2 text-white">Apo Bae Yang Disiko?</h4>
        <div
          className="row flex-nowrap overflow-auto"
          style={{ maxWidth: "100%", overflowX: "auto" }}
        >
          <div className="col">
            <h6 className="card-title ml-2">Tengok Galo Artikel</h6>
            <a
              className="card m-1 card-img-top"
              style={{
                color: "white",
                backgroundImage: `url(${
                  data[op].Image != null
                    ? data[op].Image
                    : "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                })`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: 220,
              }}
              href="/data"
            >
              <div
                className="dark-overlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: 24,
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                }}
              />
            </a>
            <a
              href={`/details/${data[op].id}`}
              className="btn btn-primary m-1 border-0"
              style={{
                backgroundColor: "#0d7502ff",
                color: "white",
                width: "fit-content",
                maxWidth: "200px",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                borderRadius: 12,
                textAlign: "left",
              }}
            >
              <i
                className="fa fa-chevron-right"
                aria-hidden="true"
                style={{ color: "white" }}
              />
              Baco Tentang {data[op].Title}
            </a>
          </div>
          <div className="col">
            <h6 className="card-title ml-2">Kamus Bahasa Rejang</h6>
            <a
              className="card m-1 card-img-top"
              href="https://kamusrejang.rejanglebongkab.go.id"
              style={{
                backgroundImage:
                  'url("https://cdn.glitch.global/2f9a2460-083a-49a5-a55f-2abb8ce71e54/thumbnails%2Fkamus.jpg?1702886881063")',
                color: "white",
                backgroundPosition: "center",
                height: 220,
              }}
            >
              <div
                className="dark-overlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: 24,
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                }}
              />
            </a>
            <a
              href="https://kamusrejang.rejanglebongkab.go.id/database"
              className="btn btn-primary m-1 border-0"
              style={{
                backgroundColor: "#dac26aff",
                borderRadius: 12,
                width: "fit-content",
                color: "black",
                textAlign: "left",
              }}
            >
              <i
                className="fa fa-plus"
                aria-hidden="true"
                style={{ color: "white" }}
              />
              Tambahkan Kata
            </a>
          </div>
          <div className="col">
            <h6 className="card-title ml-2">Incoming</h6>
            <a
              className="card m-1 card-img-top"
              href=""
              style={{
                backgroundImage:
                  'url("https://media.istockphoto.com/id/1386740242/vector/vector-bubbles-with-question-mark-question-icons-isolated-on-white.jpg?s=612x612&w=0&k=20&c=evjrckVKb_RVRcN5qV1Tz1pkSu3FvHKCGtynu8btxhA=")',
                color: "white",
                backgroundPosition: "center",
                height: 220,
              }}
            >
              <div
                className="dark-overlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: 24,
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                }}
              />
            </a>
          </div>
        </div>
        <hr className="hr" />
        <h4 className="d-lg-none text-white">Artikel Pilihan</h4>

        <div
          className="mb-2 d-lg-none"
          style={{ maxWidth: "100%", borderRadius: "24px" }}
        >
          <div
            className="row flex-nowrap overflow-auto mr-1"
            style={{ overflowX: "auto" }}
          >
            {dataPilihan.map((entry) => {
              if (
                entry.Title.toLowerCase().includes("rejang") ||
                entry.Title.toLowerCase().includes("bengkulu") ||
                entry.Content[0].babContent.toLowerCase().includes("rejang") ||
                entry.Content[0].babContent.toLowerCase().includes("bengkulu")
              ) {
                return (
                  <div className="col" key={entry.id}>
                    <a
                      className="card"
                      href={`/details/${entry.id}`}
                      style={{
                        borderRadius: "12px",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        border: "none",
                        width: "100%",
                        minWidth: "430px",
                        height: "fit-content",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                      }}
                    >
                      <h6
                        className="card-title mb-2 text-white"
                        style={{
                          margin: "0",
                          maxHeight: "1.2em",
                          overflow: "hidden",
                          fontFamily: "Arial, Helvetica, sans-serif",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.Title}
                      </h6>
                      {entry.Image != null ? (
                        <img
                          className="card-img-top"
                          style={{
                            borderRadius: "12px",
                            backgroundSize: "cover",
                            border: "none",
                          }}
                          src={entry.Image}
                          onError={(e) => e.target.remove()}
                          alt="article"
                        />
                      ) : (
                        <img
                          className="card-img-top"
                          style={{
                            borderRadius: "12px",
                            backgroundSize: "cover",
                            border: "none",
                          }}
                          src="https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                          onError={(e) => e.target.remove()}
                          alt="article"
                        />
                      )}
                    </a>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        <hr className="hr" />

        <h4 className="d-lg-none">? Tahukah Kamu ...</h4>

        <div
          className="mr-2 pl-2 pr-2 mb-2 d-lg-none"
          id="pilihan"
          style={{
            maxWidth: "100%",
            borderRadius: "12px",
            backgroundColor: "rgba(0, 0, 0, 0)",
          }}
        >
          <div
            className="row flex-nowrap overflow-auto"
            style={{ overflowX: "auto" }}
          >
            {dataAcak.map((entry) => (
              <div key={entry.id}>
                <a
                  className="card mr-1 p-1"
                  id="card-pilihan"
                  href={`/details/${entry.id}`}
                  style={{
                    borderRadius: "12px",
                    border: "none",
                    color: "white",
                    height: "fit-content",
                    width: "400px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {entry.Image != null ? (
                    <img
                      className="card-img m-1"
                      style={{
                        width: "50px",
                        height: "50px",
                        border: "none",
                        borderRadius: "12px",
                        objectFit: "cover",
                      }}
                      src={entry.Image}
                      onError={(e) => e.target.remove()}
                      alt="article"
                    />
                  ) : (
                    <img
                      className="card-img m-1"
                      style={{
                        width: "50px",
                        height: "50px",
                        border: "none",
                        borderRadius: "12px",
                      }}
                      src="https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
                      onError={(e) => e.target.remove()}
                      alt="article"
                    />
                  )}

                  <div
                    className="card-body"
                    style={{
                      flexGrow: 1,
                      padding: 0,
                      paddingLeft: "10px",
                      paddingRight: "10px",
                    }}
                  >
                    <p
                      className="card-text ml-3"
                      style={{
                        maxHeight: "3em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "300px",
                      }}
                    >
                      {entry.Content[0].babContent.replace(/<[^>]+>/g, "")}
                    </p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default Home;
