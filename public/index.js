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
babForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Collect "Bab" sections' data
  const babSectionElements = babSections.querySelectorAll(".babSection");
  babData = Array.from(babSectionElements).map((section) => {
    const babTitle = section.querySelector('input[name="babTitle"]').value;
    const babContent = section.querySelector(
      'textarea[name="babContent"]'
    ).value;
    return { babTitle, babContent };
  });

  // Store the collected "Bab" data in the hidden input field
  document.getElementById("content").value = JSON.stringify(babData);

  // Trigger the form submission
  babForm.submit();
});

const postButton = document.getElementById("postButton");
postButton.addEventListener("click", function () {
  // Trigger the form submission when the "Post" button is clicked
  babForm.submit();
});
