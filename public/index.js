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
    <label for="title">Bab Title:</label>
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
