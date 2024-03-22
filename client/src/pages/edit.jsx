import React, { useState, useEffect } from "react";
import Quill from "quill";
import { useParams } from "react-router-dom";

const EditArticle = () => {
  const [articleData, setArticleData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/edit/${id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });
        const responseData = await response.json();
        setArticleData(responseData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const initializeQuillEditors = () => {
      document.querySelectorAll(".quill-editor").forEach((element) => {
        new Quill(element, {
          theme: "snow",
        });
      });
    };

    // Call the initialization function after adding dynamic content
    initializeQuillEditors();
  });

  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    const updatedContent = [...articleData.Content];
    updatedContent[index] = { ...updatedContent[index], [name]: value };
    setArticleData({ ...articleData, Content: updatedContent });
  };

  return (
    <div className="container mt-5 p-3">
      <h1>Edit "{articleData?.Title}"</h1>
      <form
        id="babForm"
        action={`/edit/${articleData?.id}`}
        method="post"
        encType="application/json;charset=utf-8"
      >
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            autoComplete="false"
            name="title"
            className="form-control m-1"
            value={articleData?.Title || ""}
            onChange={(e) =>
              setArticleData({ ...articleData, Title: e.target.value })
            }
          />
          <input type="hidden" id="content" name="content" />

          {articleData?.Image && (
            <img
              src={articleData.Image}
              style={{ width: "300px", borderRadius: "10px 10px 24px 24px" }}
              className="img-fluid m-1"
              alt="Image"
            />
          )}
        </div>
        <div className="form-group">
          <label htmlFor="link">Link Video (Optional):</label>
          <input
            type="text"
            id="link"
            name="link"
            className="form-control"
            value={articleData?.Link || ""}
            onChange={(e) =>
              setArticleData({ ...articleData, Link: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="pembuat">Diedit oleh (Optional):</label>
          <input
            type="text"
            id="pembuat"
            name="pembuat"
            className="form-control"
            value="anonymus"
          />
        </div>
        <div id="babSections" className="babSections">
          {articleData?.Content.map((bab, index) => (
            <div className="babSection m-2" key={index}>
              <label htmlFor="babTitle">Bab Title:</label>
              <input
                type="text"
                name="babTitle"
                className="form-control"
                value={bab.babTitle}
                onChange={(e) => handleInputChange(e, index)}
              />

              <label htmlFor="babContent">Bab Content:</label>
              <div className="quill-editor" style={{ height: "300px" }}>
                {bab.babContent}
              </div>

              <button type="button" className="btn btn-danger removeBab">
                <i className="fa fa-trash" aria-hidden="true"></i>
              </button>
              <hr />
            </div>
          ))}
        </div>
        <button type="button" id="addBab" className="m-2 btn btn-primary">
          Tambahkan Bab
        </button>
        <button
          data-sitekey="6LfslRQoAAAAAHVBGwEVitjEQSjCD6F8unKDUdct"
          data-callback="onSubmit"
          name="g-recaptcha-response"
          id="postButton"
          data-action="submit"
          className="g-recaptcha btn btn-info rounded-lg"
        >
          <i className="fa fa-paper-plane" aria-hidden="true"></i> Kirim
        </button>
      </form>
    </div>
  );
};

export default EditArticle;
