// Function to change the canvas size
function changeWindowSize(window, width, height) {
  window.canvas.width = width;
  window.canvas.height = height;

  window.renderer.setSize(width, height);
  window.camera.aspect = width / height;
  window.camera.updateProjectionMatrix();
}

function moveCanvas(window, left, top) {
  window.canvas.style.left = left + "px";
  window.canvas.style.top = top + "px";
}

let window_space_left = button_constant + button_constant * 0.25
let window_space_top = top_height + button_constant * 0.25

let isRecording = false;

changeWindowSize(viewport, ws_width - button_constant * 0.5, ws_height - button_constant * 0.5);
moveCanvas(viewport, window_space_left, window_space_top);
let viewport_btn = document.getElementById("viewport_btn"); // Get the viewport button element
viewport_btn.addEventListener("click", function() { // Add a click event listener to the viewport button
  if (viewport.shown())
    viewport.hide()
  else {
    viewport.show(); // Show the viewport scene
    // Hide the collisions and biem scenes
    collisions.hide();
    biem.hide();
  }
});
viewport_btn.addEventListener("mousedown", function() {
  isRecording = true;
  document.addEventListener("mousemove", handleMouseMovement(window))
});

function handleMouseMovement(event, window){
  
}

changeWindowSize(collisions, ws_width - button_constant * 0.5, ws_height - button_constant * 0.5);
moveCanvas(collisions, window_space_left, window_space_top);
let collisions_btn = document.getElementById("collisions_btn"); // Get the collisions button element
collisions_btn.addEventListener("click", function() { // Add a click event listener to the viewport button
  if (collisions.shown())
    collisions.hide()
  else {
    collisions.show(); // Show the viewport scene
    // Hide the viewport and biem scenes
    viewport.hide();
    biem.hide();
  }
});

changeWindowSize(biem, ws_width - button_constant * 0.5, ws_height - button_constant * 0.5);
moveCanvas(biem, window_space_left, window_space_top);
let biem_btn = document.getElementById("biem_btn"); // Get the biem button element
biem_btn.addEventListener("click", function() { // Add a click event listener to the biem button
  if (biem.shown())
    biem.hide()
  else {
    biem.show(); // Show the viewport scene
    // Hide the viewport and collisions scenes
    viewport.hide();
    collisions.hide();
  }
});