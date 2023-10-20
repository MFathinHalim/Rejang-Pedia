// Add event listener to the "Add Bab" button
const addBabButton = document.getElementById("addBab");
addBabButton.addEventListener("click", function () {
  const babSections = document.getElementById("babSections");

  // Create a new div element for the "Bab" section
  const babSection = document.createElement("div");
  babSection.classList.add("babSection"); // Add the Bootstrap class

  // Create the title input field
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("form-group"); // Add the Bootstrap class
  titleDiv.innerHTML = `
    <label for="babTitle">Bab Title:</label>
    <input type="text" name="babTitle" class="form-control" />
  `;
  babSection.appendChild(titleDiv);

  // Create the content textarea
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("form-group"); // Add the Bootstrap class
  contentDiv.innerHTML = `
    <label for="babContent">Bab Content:</label>
    <textarea name="babContent" class="form-control"></textarea>
  `;
  babSection.appendChild(contentDiv);

  // Create the image input field
  const imageDiv = document.createElement("div");
  imageDiv.classList.add("form-group"); // Add the Bootstrap class
  imageDiv.innerHTML = `
    <label for="babImage">Bab Image:</label>
    <input type="file" name="babImage" class="form-control-file" />
    <button type="button" class="btn btn-danger removeBab">
      Remove Bab
    </button>
  `;
  babSection.appendChild(imageDiv);

  // Append the "Bab" section to the "babSections" container
  babSections.appendChild(babSection);
});

// Add event listener for "Remove Bab" buttons
const babSections = document.getElementById("babSections");
babSections.addEventListener("click", function (event) {
  if (event.target.classList.contains("removeBab")) {
    event.target.closest(".babSection").remove();
  }
});
const babForm = document.getElementById("babForm");
babForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Collect "Bab" sections' data
  const babSectionElements = babSections.querySelectorAll(".babSection");
  babDataPromises = Array.from(babSectionElements).map(async (section) => {
    const babTitle = section.querySelector('input[name="babTitle"]').value;
    const babContent = section.querySelector(
      'textarea[name="babContent"]'
    ).value;

    // Mengambil input file gambar
    const babImageInput = section.querySelector('input[name="babImage"]');
    const babImageFile = babImageInput.files[0];

    if (babImageFile) {
      const formData = new FormData();
      formData.append("file", babImageFile);

      // Mengunggah berkas gambar ke ImageKit
      const response = await fetch(
        `https://ik.imagekit.io/9hpbqscxd/api/v1/files/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(
              `public_sfR8hcnPMIJ1ilavSLhv5IZiZ7E=:private_eKrKi5RKb3/NijnWKF82mNgH4gA=`
            )}`,
          },
          body: formData,
          data: {
            folder: "/RejangPedia",
          },
        }
      );

      if (response.ok) {
        const imageData = await response.json();
        return { babTitle, babContent, babImage: imageData.url };
      } else {
        console.error("Gagal mengunggah berkas gambar:", response.statusText);
      }
    } else {
      // Jika tidak ada berkas gambar, biarkan babImage menjadi null
      return { babTitle, babContent, babImage: null };
    }
  });

  // Setelah semua promise selesai, kirim data ke server
  Promise.all(babDataPromises)
    .then((babData) => {
      // Store the collected "Bab" data in the hidden input field
      document.getElementById("content").value = JSON.stringify(babData);

      // Trigger the form submission when the "Post" button is clicked
      babForm.submit();
    })
    .catch((error) => {
      console.error("Terjadi kesalahan:", error);
    });
});

const postButton = document.getElementById("postButton");
postButton.addEventListener("click", function () {
  // Trigger the form submission when the "Post" button is clicked
  babForm.submit();
});
