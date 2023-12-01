// Add event listener to the "Add Bab" button
var addBabButton = document.getElementById("addBab");
// Initialize Quill editor for this "Bab Content"
var babSections = document.getElementById("babSections");
var quill;
// Add event listener for "Add Bab" button
addBabButton === null || addBabButton === void 0 ? void 0 : addBabButton.addEventListener("click", function () {
    var babSections = document.getElementById("babSections");
    // Create a new div element for the "Bab" section
    var babSection = document.createElement("div");
    babSection.classList.add("babSection"); // Add the Bootstrap class
    // Create the title input field
    var titleDiv = document.createElement("div");
    titleDiv.classList.add("form-group"); // Add the Bootstrap class
    titleDiv.innerHTML = "\n    <label for=\"babTitle\">Bab Title:</label>\n    <input type=\"text\" name=\"babTitle\" class=\"form-control\" />\n  ";
    babSection.appendChild(titleDiv);
    // Create the content textarea
    var contentDiv = document.createElement("div");
    contentDiv.classList.add("form-group"); // Add the Bootstrap class
    contentDiv.innerHTML = "\n    <label for=\"babContent\">Bab Content:</label>\n    <div class=\"quill-editor\" name=\"babContent\" style=\"height: 300px;\"></div>\n  ";
    babSection.appendChild(contentDiv);
    // Create the image input field
    var imageDiv = document.createElement("div");
    imageDiv.classList.add("form-group"); // Add the Bootstrap class
    imageDiv.innerHTML = "\n    <button type=\"button\" class=\"btn btn-danger removeBab\">\n      <i class=\"fa fa-trash\" aria-hidden=\"true\"></i>\n    </button>\n  ";
    babSection.appendChild(imageDiv);
    // Append the "Bab" section to the "babSections" container
    babSections === null || babSections === void 0 ? void 0 : babSections.appendChild(babSection);
    quill = new Quill(babSection.querySelector(".quill-editor"), {
        theme: "snow",
    });
});
// Add event listener for "Remove Bab" buttons
babSections === null || babSections === void 0 ? void 0 : babSections.addEventListener("click", function (event) {
    var _a;
    if (event.target.classList.contains("removeBab")) {
        (_a = event.target.closest(".babSection")) === null || _a === void 0 ? void 0 : _a.remove();
    }
});
var babForm = document.getElementById("babForm");
function onSubmit(token) {
    // Collect "Bab" sections' data
    var babSectionElements = babSections === null || babSections === void 0 ? void 0 : babSections.querySelectorAll(".babSection");
    var babData = Array.from(babSectionElements).map(function (section) {
        var _a;
        var babTitle = (_a = section.querySelector('input[name="babTitle"]')) === null || _a === void 0 ? void 0 : _a.value;
        var babContent = section.querySelector(".quill-editor")
            .children[0].innerHTML;
        return { babTitle: babTitle, babContent: babContent };
    });
    // Log data to the console to check its contents
    console.log(babData);
    // Store the collected "Bab" data in the hidden input field
    document.getElementById("content").value =
        JSON.stringify(babData);
    babForm === null || babForm === void 0 ? void 0 : babForm.submit();
}
