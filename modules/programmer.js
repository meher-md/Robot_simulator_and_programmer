import {Window} from "./window.js"
import { button_constant } from "../src/layout.js";
import { programmer } from "../src/main.js";

class Programmer extends Window {
  constructor(window){
    super(window);

    this.file_manager = document.getElementById('file-manager');
    this.text_area = document.getElementById('text-area');
    this.button_bar = document.getElementById('button-bar');
    this.interpreter = document.getElementById('interpreter');

    this.padding = button_constant * 0.25;
  }

  changeWindowSize(width, height) {
    this.window.width = width;
    this.window.height = height;

    // File Manager
    this.file_manager.style.width = width * 0.2 - this.padding/2 + "px";
    this.file_manager.style.height = height * 0.4 + "px";
    
    // Text Area
    this.text_area.style.width = width * 0.8 - this.padding + "px";
    this.text_area.style.height = height * 0.4 - this.padding/2 + "px";

    this.text_area.style.left = width * 0.2 + this.padding + "px";
    
    // Button Bar
    this.button_bar.style.width = width + "px";
    this.button_bar.style.top = height * 0.42 + this.padding + "px";

    // Interpreter
    this.interpreter.style.top = height * 0.5 + this.padding + "px"
    this.interpreter.style.width = width + "px"
    this.interpreter.style.height = height * 0.50 - this.padding + "px"
  }

  parse(){
    // Split the text area content by line breaks
    const lines = this.text_area.value.split('\n');

    // Parse each line to create the joint movement objects
    const jointMovements = lines.map(line => {
      // Extract the time and joint movement instructions from the line
      const regex = /move\((\d+)\)\s*{\s*((\"[a-zA-Z_]+\"\s*=\s*\[[\d\.\-,\s]+\];\s*)+)/g;
      const match = regex.exec(line);
      
      // Parse the joint movement instructions into JointMovement objects
      const instructions = match[2].split(';').filter(Boolean);
      const jointMovements = instructions.map(instruction => {
        const [jointName, positions] = instruction.split('=').map(str => str.trim());
        const [position1, position2] = JSON.parse(positions);
        return new JointMovement(jointName, position1, position2);
      });
      
      // Create the JointMovement object for the line
      const time = Number(match[1]);
      return new Movement(time, jointMovements);
    });
  }
}

class Movement {
  constructor(time, jointmovements){
    this.time = time;
    this.jointmovements = jointmovements;
  }
}

class JointMovement {
  constructor(jointName, position_1, position_2){
    this.jointName = jointName;
    this.position_1 = position_1;
    this.position_2 = position_2;
  }
}

const load = document.getElementById("load");
load.addEventListener("click", function(){
  programmer.parse();
})

document.addEventListener("keydown", function(e) {
  var textarea = document.getElementById("text-area");
  
  // Check if the textarea element is focused
  if (textarea === document.activeElement && e.key === "Tab") {
    e.preventDefault();
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;

    // Insert four spaces at the current cursor position
    textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
    
    // Move the cursor to the end of the inserted spaces
    textarea.selectionStart = textarea.selectionEnd = start + 4;
  }
});


export {Programmer}