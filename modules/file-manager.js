import {viewport} from "../src/main.js"

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function dropDown(id) {
  document.getElementById(id).classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.top')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

function showBox(id){
  let overlay = document.querySelector('#overlay');
  overlay.style.display = 'block';
  // Show the import files box
  var box = document.querySelector(id);
  box.style.display = 'block';
}
function hideBox(id){
  let overlay = document.querySelector('#overlay');
  overlay.style.display = 'none';
  // Show the import files box
  var box = document.querySelector(id);
  box.style.display = 'none';
}

function uploadFiles() {
  var form = document.getElementById("uploadForm");
  var formData = new FormData(form);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'php/upload.php', true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      // console.log(xhr.responseText);
      // var response = JSON.parse(xhr.responseText);
      var response = xhr.responseText;
      // Display error messages as alerts
      let upload_error_div = document.getElementById('upload-error');
      upload_error_div.textContent = response;
      // alert(errors.join("\n"));
      // Files uploaded successfully!
      updateAllDirectoryListings();
    } else {
      alert('Something went wrong while uploading the files.');
    }
  };
  xhr.send(formData);
}

function updateImportDirectoryListing() {
  var dirListingContainers = document.querySelectorAll('#importListingContainer');
  dirListingContainers.forEach(function(dirListingContainer) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        dirListingContainer.innerHTML = this.responseText;
      }
    };
    xhr.open('GET', 'php/list_files.php', true);
    xhr.send();
  });
}
function updateRobotDirectoryListing() {
  var dirListingContainers = document.querySelectorAll('#robotListingContainer');
  dirListingContainers.forEach(function(dirListingContainer) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        dirListingContainer.innerHTML = this.responseText;
        var buttons = dirListingContainer.querySelectorAll('button');
        buttons.forEach(function(button) {
          button.addEventListener('click', function(event) {
            viewport.URDFImport('uploads/'+button.textContent);
          });
        });

      }
    };
    xhr.open('GET', 'php/list_top_level_files.php', true);
    xhr.send();
  });
}
function updateAllDirectoryListings(){
  updateImportDirectoryListing();
  updateRobotDirectoryListing();
}

// calls all updates for directory listings
updateAllDirectoryListings();


// add all button click events
const importCloseButton = document.getElementById('importCloseButton');
if (importCloseButton) {
  importCloseButton.addEventListener('click', function() {
    hideBox('#import-box');
  });
}

const robotCloseButton = document.getElementById('robotCloseButton');
if (robotCloseButton) {
  robotCloseButton.addEventListener('click', function() {
    hideBox('#robot-box');
  });
}

const importRefreshButton = document.getElementById('importRefreshButton');
if (importRefreshButton) {
  importRefreshButton.addEventListener('click', updateImportDirectoryListing);
}

const robotRefreshButton = document.getElementById('robotRefreshButton');
if (robotRefreshButton) {
  robotRefreshButton.addEventListener('click', updateRobotDirectoryListing);
}

const uploadButton = document.getElementById('upload');
// if (uploadButton) {
  uploadButton.addEventListener('click', uploadFiles);
// }

const chooseRobotBtn = document.getElementById('choose-robot-btn');
chooseRobotBtn.addEventListener('click', function() {
  showBox('#robot-box');
});

const importFilesBtn = document.getElementById('import-files-btn');
importFilesBtn.addEventListener('click', function() {
  showBox('#import-box');
});

const fileBtn = document.getElementById('file-btn');
fileBtn.addEventListener('click', function() {
  dropDown('file');
});

const editBtn = document.getElementById('edit-btn');
editBtn.addEventListener('click', function() {
  dropDown('edit');
});

const viewBtn = document.getElementById('view-btn');
viewBtn.addEventListener('click', function() {
  dropDown('view');
});