// Add event listener to the "Add Bab" button
const addBabButton = document.getElementById("addBab");
// Initialize Quill editor for this "Bab Content"
const babSections = document.getElementById("babSections");
var quill;
// Add event listener for "Add Bab" button
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
    <div class="quill-editor" name="babContent" style="height: 300px;"></div>
  `;
  babSection.appendChild(contentDiv);

  // Create the image input field
  const imageDiv = document.createElement("div");
  imageDiv.classList.add("form-group"); // Add the Bootstrap class
  imageDiv.innerHTML = `
    <button type="button" class="btn btn-danger removeBab">
      Hapus Bab
    </button>
  `;
  babSection.appendChild(imageDiv);

  // Append the "Bab" section to the "babSections" container
  babSections.appendChild(babSection);

  quill = new Quill(babSection.querySelector(".quill-editor"), {
    theme: "snow",
  });
});

// Add event listener for "Remove Bab" buttons
babSections.addEventListener("click", function (event) {
  if (event.target.classList.contains("removeBab")) {
    event.target.closest(".babSection").remove();
  }
});
const babForm = document.getElementById("babForm");
function onSubmit(token) {
  // Collect "Bab" sections' data
  const babSectionElements = babSections.querySelectorAll(".babSection");
  babData = Array.from(babSectionElements).map((section) => {
    const babTitle = section.querySelector('input[name="babTitle"]').value;
    const babContent =
      section.querySelector(".quill-editor").children[0].innerHTML;
    return { babTitle, babContent };
  });

  // Log data to the console to check its contents
  console.log(babData);

  // Store the collected "Bab" data in the hidden input field
  document.getElementById("content").value = JSON.stringify(babData);

  babForm.submit();
}
