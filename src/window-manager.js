import {viewport, programmer, biem, collisions} from "./main.js";
import { button_constant, top_height, ws_width, ws_height } from "./layout.js";

let border = button_constant * 0.25;
let window_space_left = button_constant + border;
let window_space_top = top_height + border;

let isRecording = false;

var side = "";
let left = null;
let right = null;
let current_window = null;

// FUNCTIONS ========================================================================================

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
  window.window.style.zIndex = 1;
  window.show();
  if (moveX < button_constant + ws_width / 2) {
    side = "left";
    if (left == null) {
      window.moveWindow(button_constant + border, top_height + border);
      window.changeWindowSize(ws_width / 2 - border * 1.5, ws_height - border * 2);
    }
    else {
      var rect = left.window.getBoundingClientRect();
      window.moveWindow(rect.left, rect.top);
      window.changeWindowSize(left.window.width, left.window.height);
      if (right == window) {
        right = null;
      }
    }
  }
  if (moveX > button_constant + ws_width / 2) {
    side = "right";
    if (right == null) {
      window.moveWindow(button_constant + ws_width / 2 + border * 0.5, top_height + border);
      window.changeWindowSize(ws_width / 2 - border * 1.5, ws_height - border * 2);
      if (left != null) {
        left.moveWindow(button_constant + border, top_height + border);
        left.changeWindowSize(ws_width / 2 - border * 1.5, ws_height - border * 2);
      }
    }
    else {
      var rect = right.window.getBoundingClientRect();
      window.moveWindow(rect.left, rect.top);
      window.changeWindowSize(right.window.width, right.window.height);
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
  programmer_btn.style.cursor = "default"
  biem_btn.style.cursor = "default"

  current_window.window.style.zIndex = 0;

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
    left.changeWindowSize(ws_width - button_constant * 0.5, ws_height - button_constant * 0.5);
    left.moveWindow(window_space_left, window_space_top);
  }
  if (right != null && left == null) {
    right.changeWindowSize(ws_width - button_constant * 0.5, ws_height - button_constant * 0.5);
    right.moveWindow(window_space_left, window_space_top);
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

let programmer_btn = document.getElementById("programmer_btn"); // Get the programmer button element
addMouseDownEventListener(programmer_btn, programmer);

let biem_btn = document.getElementById("biem_btn"); // Get the biem button element
addMouseDownEventListener(biem_btn, biem);

let collisions_btn = document.getElementById("collisions_btn"); // Get the biem button element
addMouseDownEventListener(collisions_btn, collisions);

// opens viewport on start
side = "left";
current_window=programmer;
current_window.show();
endMouseorTouch();