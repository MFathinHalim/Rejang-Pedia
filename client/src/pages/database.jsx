import React, { useEffect, useState } from "react";

const Database = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/getData", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const responseData = await response.json();
        const { data } = responseData;
        setData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures useEffect runs only once after mount
  if (data.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }
  console.log(data);
  return (
    <div className="container">
      <div
        className="header text-dark text-center mt-2 rounded-bottom"
        style={{ fontFamily: "Montserrat" }}
      >
        <img
          id="logo"
          className="border-0"
          src="https://cdn.glitch.global/2f9a2460-083a-49a5-a55f-2abb8ce71e54/logo.png?v=1699767799122"
        />
        <p>
          <i className="fa fa-globe"></i> Punyo Kito Galo
        </p>
      </div>
      <a href="/" className="btn btn-secondary rounded-pill ml-4">
        <i className="fa fa-chevron-left" aria-hidden="true"></i> Beranda
      </a>
      <ul
        className="list-group mt-2"
        style={{ borderRadius: "24px", listStyleType: "none" }}
      >
        {data.map((entry) => (
          <li
            key={entry.id}
            className="list-group-item bg-transparent border-0"
          >
            <a className="mt-2" href={`/details/${entry.id}`}>
              <div className="d-flex flex-column flex-md-row align-items-md-center">
                {entry.Image && (
                  <img
                    className="listing-image mb-2"
                    style={{
                      minWidth: "160px",
                      maxWidth: "160px",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                    src={entry.Image}
                    alt={entry.Title}
                    onError={(e) => e.target.remove()}
                  />
                )}
                <div className={entry.Image ? "ml-md-3" : ""}>
                  <h5 className="mb-1">{entry.Title}</h5>
                  {entry.Content &&
                    entry.Content[0] &&
                    entry.Content[0].babContent && (
                      <p className="text-muted">
                        {entry.Content[0].babContent
                          .replace(/<[^>]+>/g, "")
                          .substring(0, 100)}
                        ...
                      </p>
                    )}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Database;
