import {Window} from "./window.js"

import { button_constant } from "../src/layout.js";
import { programmer, viewport } from "../src/main.js";
import {gui} from "./viewport.js"

class Programmer extends Window {
  constructor(window){
    super(window);

    this.file_manager = document.getElementById('file-manager');
    this.text_area = document.getElementById('text-area');
    this.button_bar = document.getElementById('button-bar');
    this.interpreter = document.getElementById('interpreter');

    this.padding = button_constant * 0.25;

    this.code = [];
    this.startTime = performance.now();
    this.timer = 0;

    this.running = false;

    this.currentMovementIndex = 0;
  }

  changeWindowSize(width, height) {
    this.window.width = width;
    this.window.height = height;

    // File Manager
    this.file_manager.style.width = width * 0.2 - this.padding/2 + "px";
    this.file_manager.style.height = height * 0.6 + "px";
    
    // Text Area
    this.text_area.style.width = width * 0.8 - this.padding + "px";
    this.text_area.style.height = height * 0.6 - this.padding/2 + "px";

    this.text_area.style.left = width * 0.2 + this.padding + "px";
    
    // Button Bar
    this.button_bar.style.width = width + "px";
    this.button_bar.style.top = height * 0.62 + this.padding + "px";

    // Interpreter
    this.interpreter.style.top = height * 0.7 + this.padding + "px"
    this.interpreter.style.width = width + "px"
    this.interpreter.style.height = height * 0.30 - this.padding + "px"

    this.updateProgrammerDirectoryListing();
  }

  parse() {
    const text_area = document.getElementById('text-area');
    const inputText = text_area.value;

    const waitRegex = /wait\s*\(\s*(\d+)\s*\);/ig;
    const moveRegex = /move\s*\(\s*(\d+)\s*\)\s*\{([\s\S]+?)\}/igm;
    const jointRegex = /"([\w_]+)"\s*=\s*\[([-.\d]+),?\s*([-.\d]+)?\];?/g;

    this.code = [];
    const latestJointPositions = {};

    const matches = [];

    let match;
    while ((match = moveRegex.exec(inputText)) !== null) {
      matches.push({ type: 'move', match });
    }

    while ((match = waitRegex.exec(inputText)) !== null) {
      matches.push({ type: 'wait', match });
    }

    matches.sort((a, b) => a.match.index - b.match.index);

    for (let i = 0; i < matches.length; i++) {
      const { type, match } = matches[i];
      if (type === 'wait') {
        const time = parseInt(match[1]);
        this.code.push(new Wait(time));
      } 
      if (type === 'move') {
        const time = parseInt(match[1]);
        const jointMovements = [];

        let jointMatch;
        while ((jointMatch = jointRegex.exec(match[2])) !== null) {
          const jointName = jointMatch[1];
          let position1, position2;
          if (jointMatch[3] === undefined){
            position1 = null;
            position2 = parseFloat(jointMatch[2]);
          }
          else {
            position1 = parseFloat(jointMatch[2]);
            position2 = parseFloat(jointMatch[3]);
          }

          if (position1 === null && latestJointPositions[jointName] !== undefined) {
            // If the joint movement has only one position, set position1 to the previous position2
            position1 = latestJointPositions[jointName].position_2;
          }

          const jointMovement = new JointMovement(jointName, position1, position2);
          jointMovements.push(jointMovement);
          latestJointPositions[jointName] = jointMovement;
        }

        const movement = new Movement(time, jointMovements);
        this.code.push(movement);
      }
    }

    this.updateInterpreter();
  }

  updateInterpreter(){
    const interpreter_div = document.getElementById('interpreter');
    interpreter_div.innerHTML = '';
    interpreter_div.style.fontFamily = 'monospace'; // Set font-family to monospace
    this.code.forEach((element, index) => {
      if (element instanceof Movement){ // checks if the code element is a movement 
        const movement = element;
        const movement_div = document.createElement('div');
        movement_div.innerHTML = `<strong>Move ${index + 1} (${movement.time}ms)</strong>`;
        const jointMovements_div = document.createElement('div');
        movement.jointmovements.forEach(jointMovement => {
          const joint_div = document.createElement('div');
          joint_div.innerHTML = `->    ${jointMovement.jointName}: [${jointMovement.position_1}, ${jointMovement.position_2}]`;
          jointMovements_div.appendChild(joint_div);
        });
        movement_div.appendChild(jointMovements_div);
        interpreter_div.appendChild(movement_div);

        // Add event listener to change background color when the movement is running
        if (this.currentMovementIndex === index) {
          movement_div.style.backgroundColor = '#437a45';
        } else {
          movement_div.style.backgroundColor = '';
        }
      } 
      if (element instanceof Wait) {
        const wait = element;
        const wait_div = document.createElement('div');
        wait_div.innerHTML = `<br><strong>Wait ${wait.time}ms</strong><br><br>`;
        interpreter_div.appendChild(wait_div);

        // Add event listener to change background color when the movement is running
        if (this.currentMovementIndex === index) {
          wait_div.style.backgroundColor = '#437a45';
        } else {
          wait_div.style.backgroundColor = '';
        }
      }
    });
  }

  updateProgrammerDirectoryListing() {
    var dirListingContainer = document.getElementById('file-manager');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        dirListingContainer.innerHTML = this.responseText;
        var buttons = dirListingContainer.querySelectorAll('button');
        buttons.forEach(function(button) {
          button.addEventListener('click', function() {
            var filename = this.getAttribute('data-filename');
            var xhr2 = new XMLHttpRequest();
            xhr2.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                document.getElementById('text-area').value = this.responseText;
              }                         
            };
            xhr2.open('GET', '../uploads/programs/' + filename, true);
            xhr2.send();
          });
        });
      }
    };
    xhr.open('GET', 'php/list_programs.php', true);
    xhr.send();
  }

  updateTimer() {
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    this.timer = elapsed;
  }

  animate() {
    // Check if animation is running
    if (this.running) {
      // If it is, move to the next movement or wait command
      this.moveNext();
    }
  }
  
  moveNext(){
    // Check if there are more commands to execute
    if (this.currentMovementIndex < this.code.length) {
      // Check if the current command is a movement command
      if (this.code[this.currentMovementIndex] instanceof Movement){
        // If it is, handle the movement command
        this.handleMovement();
      } 
      // Check if the current command is a wait command
      if (this.code[this.currentMovementIndex] instanceof Wait){
        // If it is, handle the wait command
        this.handleWait();
      }
    } 
    else {
      // If there are no more commands, handle the end of the animation
      this.handleEnd();
    }
  }

  handleMovement() {
    const currentMovement = this.code[this.currentMovementIndex];
  
    if (this.timer >= currentMovement.time) { // if the timer has elapsed the required time for the current movement
      this.executeMovement(currentMovement.jointmovements); // execute the movement
      this.currentMovementIndex++; // move to the next movement in the code
      this.updateInterpreter(); // update the UI to reflect the current movement
      this.timer = 0; // reset the timer to 0
      this.startTime = performance.now(); // reset the start time to the current time
      this.moveNext(); // recursively call moveNext() to move to the next movement or wait in the code
    } else {
      this.updateTimer(); // update the timer to reflect the elapsed time
      this.interpolateMovement(currentMovement.jointmovements, this.timer, currentMovement.time); // interpolate the joint movements based on the elapsed time and the total movement time
    }
  }  

  executeMovement(jointmovements) {
    jointmovements.forEach((jointMovement) => {
      let robot_joint = viewport.robot.joints[jointMovement.jointName];
      if (robot_joint._jointType != "fixed") {
        if (robot_joint.axis.x!=0){
          robot_joint.rotation.x = jointMovement.position_2;
          const xController = gui.__controllers.find(controller => controller.property === 'x' && controller.__li.textContent === jointMovement.jointName);
          xController.setValue(robot_joint.rotation.x);
        }
        if (robot_joint.axis.y!=0){
          robot_joint.rotation.y = jointMovement.position_2;
          const yController = gui.__controllers.find(controller => controller.property === 'y' && controller.__li.textContent === jointMovement.jointName);
          yController.setValue(robot_joint.rotation.y);
        }
        if (robot_joint.axis.z!=0){
          robot_joint.rotation.z = jointMovement.position_2;
          const zController = gui.__controllers.find(controller => controller.property === 'z' && controller.__li.textContent === jointMovement.jointName);
          zController.setValue(robot_joint.rotation.z);
        }
      }
    });
  }

interpolateMovement(jointmovements, timeElapsed, totalTime) {
  // Iterate over each joint movement object
  jointmovements.forEach((jointMovement) => {
    const deltaPosition = jointMovement.position_2 - jointMovement.position_1; // Calculate the delta (difference) between the two positions for this joint movement
    const timeRatio = timeElapsed / totalTime; // Calculate the ratio of time elapsed to total time for this joint movement
    const interpolatedPosition = jointMovement.position_1 + (deltaPosition * timeRatio); // Calculate the interpolated position for this joint movement
    jointMovement.current_position = interpolatedPosition; // Set the current position of this joint movement to the interpolated position
    
    // Find the corresponding joint in the robot model and update its rotation based on the interpolated position
    let robot_joint = viewport.robot.joints[jointMovement.jointName];
    if (robot_joint._jointType != "fixed") {
      if (robot_joint.axis.x!=0){
        robot_joint.rotation.x = jointMovement.current_position;
        const xController = gui.__controllers.find(controller => controller.property === 'x' && controller.__li.textContent === jointMovement.jointName);
        xController.setValue(robot_joint.rotation.x);
      }
      if (robot_joint.axis.y!=0){
        robot_joint.rotation.y = jointMovement.current_position;
        const yController = gui.__controllers.find(controller => controller.property === 'y' && controller.__li.textContent === jointMovement.jointName);
        yController.setValue(robot_joint.rotation.y);
      }
      if (robot_joint.axis.z!=0){
        robot_joint.rotation.z = jointMovement.current_position;
        const zController = gui.__controllers.find(controller => controller.property === 'z' && controller.__li.textContent === jointMovement.jointName);
        zController.setValue(robot_joint.rotation.z);
      }
    }
  });
}  
  
  handleWait() {
    const currentWait = this.code[this.currentMovementIndex];
    if (this.timer >= currentWait.time) {
      this.currentMovementIndex++;
      this.updateInterpreter();
      this.timer = 0;
      this.startTime = performance.now();
      this.moveNext(); // recursive call
    } else {
      this.updateTimer();
    }
  }
  
  handleEnd(){
    this.running = false;
    this.currentMovementIndex = 0;
    this.updateInterpreter();
  }
}

class Wait {
  constructor(time){
    this.time = time;
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

    this.current_position = 0;
  }
}

const load = document.getElementById("load");
load.addEventListener("click", function(){
  programmer.parse();
})

const run = document.getElementById("run");
const run_feedback = document.getElementById("run-feedback");
run.addEventListener('click', function(){
  let success = true;
  if (viewport.robot==null){
    run_feedback.style.color = "red";
    run_feedback.textContent = "Error - no robot found in viewport"
    success = false;
  }
  if (programmer.code.length==0){
    run_feedback.style.color = "red";
    run_feedback.textContent = "Error - no code loaded into interpreter"
    success=false;
  }
  if (success){
    programmer.running = true;
    programmer.startTime = performance.now();
    run_feedback.style.color = "white";
    run_feedback.textContent = "Started Run Successfully";
  }
})

// Add event listener to the save button
document.getElementById("save").addEventListener("click", function() {
  var filename = document.getElementById("filename-input").value; // Get the filename from the input field
  var content = document.getElementById("text-area").value; // Get the contents of the text area
  var xhr = new XMLHttpRequest(); // Create a new XMLHttpRequest object
  xhr.open("POST", "../php/upload_program.php", true); // Set up the request
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // Set the content type
  xhr.send("filename=" + encodeURIComponent(filename) + "&content=" + encodeURIComponent(content)); // Set the data to be sent

  // update file manager
  programmer.updateProgrammerDirectoryListing();
});

// Editor

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