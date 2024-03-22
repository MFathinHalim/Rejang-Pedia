import React from "react";

const NewArticle = () => {
  const previewPhoto = () => {
    const input = document.getElementById("image");
    const file = input.files;
    if (file) {
      const fileReader = new FileReader();
      const preview = document.getElementById("preview");
      fileReader.onload = function (event) {
        preview.setAttribute("src", event.target.result);
      };
      fileReader.readAsDataURL(file[0]);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="display-4">Artikel Baru</h1>
      <form
        id="babForm"
        action="/new"
        method="post"
        enctype="multipart/form-data"
      >
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            autoComplete="false"
            id="title"
            name="title"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="link">Link Video (Optional):</label>
          <input
            type="text"
            autoComplete="false"
            id="link"
            name="link"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="pembuat">Pembuat (Optional):</label>
          <input
            type="text"
            autoComplete="false"
            id="pembuat"
            name="pembuat"
            className="form-control"
          />
        </div>

        <input type="hidden" id="content" name="content" />

        <div className="form-group">
          <label htmlFor="image">Cover Image:</label>
          <input
            type="file"
            name="image"
            id="image"
            className="form-control-file"
            required
            onChange={previewPhoto}
          />
        </div>
        <div className="form-group">
          <img
            id="preview"
            style={{
              width: "460px",
              maxWidth: "100%",
              border: "2px solid #ccc",
              objectFit: "cover",
              borderRadius: "24px",
            }}
            className="img-fluid"
            alt="Image"
          />
        </div>

        <button type="button" id="addBab" className="btn btn-primary">
          Tambah Bab
        </button>
        <div id="babSections" className="mt-3"></div>

        <button
          data-sitekey="6LfslRQoAAAAAHVBGwEVitjEQSjCD6F8unKDUdct"
          data-callback="onSubmit"
          name="g-recaptcha-response"
          id="postButton"
          data-action="submit"
          type="submit"
          className="btn-lg g-recaptcha btn btn-info mt-3 rounded-lg"
        >
          <i className="fa fa-paper-plane" aria-hidden="true"></i> Kirim
        </button>
      </form>
    </div>
  );
};

export default NewArticle;
