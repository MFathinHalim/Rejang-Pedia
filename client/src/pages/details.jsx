import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./details.css";

const Details = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/details/${id}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        const responseData = await response.json();
        console.log(responseData);
        setData(responseData.data);
        document.title = "Artikel: " + responseData.data.Title;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div>
      {data && data.Title ? (
        <div className="row">
          {/* Sidebar */}
          <div
            className="col-lg-2 col-md-3 sticky-top"
            style={{
              borderRight: "2px dashed #515151",
              borderTop: "2px dashed #515151",
            }}
          >
            <div className="sidebar sticky-top">
              <h4 className="p-3 pt-5">
                <strong>Daftar Isi</strong>
              </h4>
              <ul
                className="list-group bg-transparent border-0"
                style={{ background: "none" }}
              >
                {data.Content.map((bab) => (
                  <li
                    key={bab.babTitle}
                    className="list-group-item bg-transparent border-0"
                  >
                    <a href={`#${bab.babTitle}`}>{bab.babTitle}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="container">
            {/* Main Content */}
            <div className="col-lg-10 col-md-9">
              <div className="main-content">
                <h1 id="title">{data.Title}</h1>
                <p
                  className="dibuat mr-auto"
                  style={{
                    fontSize: "15px",
                    maxWidth: "100%",
                    paddingLeft: "10px",
                    borderLeft: "3px solid #138496",
                  }}
                >
                  <strong style={{ color: "#138496" }}> Ditulis oleh </strong>
                  {data.Pembuat}{" "}
                  {data.Waktu ? ` • ${data.Waktu}` : ` • 07-Maret-2023`}
                  {data.Diedit && (
                    <>
                      <br />
                      <br id="x" />
                      <strong style={{ color: "#138496" }}>
                        {" "}
                        Diedit oleh{" "}
                      </strong>
                      {data.Diedit}{" "}
                      {data.Edit ? ` • ${data.Edit}` : ` • 07-Maret-2023`}
                    </>
                  )}
                </p>
                <div className="d-flex flex-column flex-md-row">
                  {data.Image && data.Image != null && (
                    <>
                      <img
                        className="listing-image mr-2"
                        style={{
                          height: "250px",
                          border: "1px solid #ccc",
                          objectFit: "contain",
                          background: "rgba(0, 0, 0, 0)",
                          borderRadius: "12px",
                        }}
                        src={data.Image}
                        alt={data.Title}
                      />
                      <br />
                    </>
                  )}
                  {data.Link && (
                    <article>
                      <iframe
                        style={{
                          width: "460px",
                          maxWidth: "100%",
                          height: "250px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          border: "1px solid #ccc",
                        }}
                        className="img-fluid"
                        src={data.Link}
                      ></iframe>
                    </article>
                  )}
                </div>

                <div className="d-flex mt-3">
                  <button className="btn btn-info rounded-pill mr-1 text-white">
                    <i
                      className="fa fa-share text-white"
                      aria-hidden="true"
                    ></i>
                    Bagikan
                  </button>
                  <a
                    className="btn btn-secondary rounded-pill"
                    href={`/edit/${data.id}`}
                  >
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                    Edit Artikel
                  </a>
                </div>

                <div style={{ borderRadius: "24px" }}>
                  {data.Content.map((bab) => (
                    <div key={bab.babTitle} className="my-4">
                      <h3>{bab.babTitle}</h3>
                      <p
                        id={bab.babTitle}
                        dangerouslySetInnerHTML={{ __html: bab.babContent }}
                      ></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Data not available.</p>
      )}
    </div>
  );
};

export default Details;
