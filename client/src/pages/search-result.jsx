import React, { useState, useEffect } from "react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const fetchData = async () => {
    if (searchTerm) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/search?term=${searchTerm}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("term");
    if (query) {
      setSearchTerm(query);
    }
  }, []);

  useEffect(() => {
    fetchData();
  });

  const handleSearch = () => {
    fetchData();
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      fetchData();
    }
  };

  if (results.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-success" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Navbar code here */}

      <div className="container mt-5 mb-5">
        <h3>Iko Kan Sanak?</h3>
        <div className="mb-3 d-flex justify-content-center">
          <input
            autoComplete="off"
            type="text"
            style={{ borderRadius: "12px 8px 8px 12px", padding: "25px" }}
            className="form-control search-input custom-input mr-1"
            id="searchInput"
            value={searchTerm}
            placeholder="Mau Cari Apa Sanak..."
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            type="submit"
            className="btn btn-primary border-0 rounded-0"
            style={{ borderRadius: "8px 12px 12px 8px !important" }}
            onClick={handleSearch}
            id="searchButton"
          >
            <i className="fa fa-search" aria-hidden="true"></i>
          </button>
        </div>
        <a href="/" className="btn btn-secondary rounded-pill mb-3">
          <i className="fa fa-chevron-left" aria-hidden="true"></i> Beranda
        </a>
        <ul
          className="list-group"
          style={{ borderRadius: "24px !important", listStyleType: "none" }}
        >
          {results.results.map((result, index) => (
            <li key={index} className="mb-4">
              <div className="d-flex flex-column flex-md-row align-items-md-center">
                {result.Image && (
                  <img
                    className="listing-image mb-3 mb-md-0 mr-md-3"
                    style={{
                      width: "160px",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                    src={result.Image}
                    alt={result.Title}
                    onError={(e) => e.target.remove()}
                  />
                )}
                <div className={!result.Image ? "" : "ml-md-3"}>
                  <a
                    className="text-decoration-none"
                    href={`/details/${result.id}`}
                  >
                    <h5 className="mb-2">{result.Title}</h5>
                    {result.Content &&
                      result.Content[0] &&
                      result.Content[0].babContent && (
                        <p className="text-muted">
                          {result.Content[0].babContent
                            .replace(/<[^>]+>/g, "")
                            .substring(0, 100)}
                          ...
                        </p>
                      )}
                  </a>
                </div>
              </div>
              {index !== results.length - 1 && <hr className="my-3" />}
            </li>
          ))}
          <div className="d-flex align-items-center">
            <a className="mt-2">
              <h6>Dak Do Lagi lah..</h6>
            </a>
          </div>
        </ul>
      </div>
    </div>
  );
};

export default Search;
