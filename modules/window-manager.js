import {viewport, collisions, biem} from "/main.js";
import { button_constant, top_height, ws_width, ws_height } from "../layout.js";

let border = button_constant * 0.25;
let window_space_left = button_constant + border;
let window_space_top = top_height + border;

let isRecording = false;

var side = "";
let left = null;
let right = null;
let current_window = null;

// FUNCTIONS ========================================================================================

// Function to change the canvas size while keeping the aspect ratio
function changeWindowSize(window, width, height) {
  window.canvas.width = width;
  window.canvas.height = height;

  window.renderer.setSize(width, height);
  window.camera.aspect = width / height;
  window.camera.updateProjectionMatrix();
}

// function to move a window
function moveWindow(window, left, top) {
  window.canvas.style.left = left + "px";
  window.canvas.style.top = top + "px";
}

let mouseMoveHandler = function(event) { };
let touchMoveHandler = function(event) { };
function addMouseDownEventListener(button, window) {
  button.addEventListener("mousedown", function() {
    isRecording = true;

    button.style.cursor = "context-menu"
    mouseMoveHandler = function(event) {
      handleMouseMovement(event, window);
    };
    document.addEventListener("mousemove", mouseMoveHandler)
  });
  button.addEventListener("touchstart", function() { 
    isRecording = true; 
    button.style.cursor = "context-menu" 
    touchMoveHandler = function(event) { 
      handleTouchMovement(event, window); 
    }; 
    document.addEventListener("touchmove", touchMoveHandler, {passive: false}) 
  });
}

function handleMovement(moveX, window) {
  current_window = window;
  document.body.style.cursor = "context-menu";
  window.canvas.style.zIndex = 1;
  window.show();
  if (moveX < button_constant + ws_width / 2) {
    side = "left";
    if (left == null) {
      moveWindow(window, button_constant + border, top_height + border);
      changeWindowSize(window, ws_width / 2 - border * 1.5, ws_height - border * 2);
    }
    else {
      var rect = left.canvas.getBoundingClientRect();
      moveWindow(window, rect.left, rect.top);
      changeWindowSize(window, left.canvas.width, left.canvas.height);
      if (right == window) {
        right = null;
      }
    }
  }
  if (moveX > button_constant + ws_width / 2) {
    side = "right";
    if (right == null) {
      moveWindow(window, button_constant + ws_width / 2 + border * 0.5, top_height + border);
      changeWindowSize(window, ws_width / 2 - border * 1.5, ws_height - border * 2);
      if (left != null) {
        moveWindow(left, button_constant + border, top_height + border);
        changeWindowSize(left, ws_width / 2 - border * 1.5, ws_height - border * 2);
      }
    }
    else {
      var rect = right.canvas.getBoundingClientRect();
      moveWindow(window, rect.left, rect.top);
      changeWindowSize(window, right.canvas.width, right.canvas.height);
      if (left == window) {
        left = null;
      }
    }
  }
}

function handleMouseMovement(event, window) {
  let movementX = event.clientX;
  handleMovement(movementX, window);
}
function handleTouchMovement(event, window) {
  event.preventDefault();
  let movementX = event.touches[0].clientX;
  handleMovement(movementX, window);
}

document.addEventListener("mouseup", function() {
  if (isRecording) {
    document.removeEventListener("mousemove", mouseMoveHandler);
    endMouseorTouch();
  }
});

document.addEventListener("touchend", function() {
  if (isRecording) {
    document.removeEventListener("touchmove", touchMoveHandler);
    endMouseorTouch();
  }
});

function endMouseorTouch(){
  document.body.style.cursor = "default"
  viewport_btn.style.cursor = "default"
  collisions_btn.style.cursor = "default"
  biem_btn.style.cursor = "default"

  current_window.canvas.style.zIndex = 0;

  if (side == "left") {
    if (left != current_window) {
      if (left != null)
        left.hide();
      left = current_window;

      if (current_window == right)
        right = null;
    }
  }
  if (side == "right") {
    if (right != current_window) {
      if (right != null)
        right.hide();
      right = current_window;

      if (current_window == left)
        left = null;
    }
  }
  if (left != null && right == null) {
    changeWindowSize(left, ws_width - button_constant * 0.5, ws_height - button_constant * 0.5);
    moveWindow(left, window_space_left, window_space_top);
  }
  if (right != null && left == null) {
    changeWindowSize(right, ws_width - button_constant * 0.5, ws_height - button_constant * 0.5);
    moveWindow(right, window_space_left, window_space_top);
    left = right;
    right = null;
  }

  side = "";
  current_window = null;
  isRecording = false;
}


// MAIN ============================================================================================

let viewport_btn = document.getElementById("viewport_btn"); // Get the viewport button element
addMouseDownEventListener(viewport_btn, viewport);

let collisions_btn = document.getElementById("collisions_btn"); // Get the collisions button element
addMouseDownEventListener(collisions_btn, collisions);

let biem_btn = document.getElementById("biem_btn"); // Get the biem button element
addMouseDownEventListener(biem_btn, biem);

// opens viewport on start
// side = "left";
// current_window=viewport;
// current_window.show();
// endMouseorTouch();