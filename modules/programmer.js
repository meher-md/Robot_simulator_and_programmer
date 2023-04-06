import {Window} from "./window.js"
import { button_constant } from "../src/layout.js";
import { programmer, viewport } from "../src/main.js";

class Programmer extends Window {
  constructor(window){
    super(window);

    this.file_manager = document.getElementById('file-manager');
    this.text_area = document.getElementById('text-area');
    this.button_bar = document.getElementById('button-bar');
    this.interpreter = document.getElementById('interpreter');

    this.padding = button_constant * 0.25;

    this.movements = [];
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
  }

  parse(){
    const text_area = document.getElementById('text-area');
    const inputText = text_area.value;
    
    const regex = /move\((\d+)\)\s*\{((?:\s*"([\w_]+)"\s*=\s*\[([-.\d]+), ([-.\d]+)\];?\s*)+)\}/gm;
    
    let match;
    this.movements = [];
    while ((match = regex.exec(inputText)) !== null) {
      const time = parseInt(match[1]);
      const jointMovements = match[2].trim().split(';').filter((s) => s.trim().length > 0).map((jointStr) => {
        // console.log(jointStr)
        const regexJoint = /"([\w_]+)"\s*=\s*\[([-.\d]+), ([-.\d]+)\]/;
        const jointMatches = regexJoint.exec(jointStr);
        const jointName = jointMatches[1];
        const position_1 = parseFloat(jointMatches[2]);
        const position_2 = parseFloat(jointMatches[3]);
        return new JointMovement(jointName, position_1, position_2);
      });
      this.movements.push(new Movement(time, jointMovements));
    }

    this.updateInterpreter();
  }

  updateInterpreter(){
    const interpreter_div = document.getElementById('interpreter');
    interpreter_div.innerHTML = '';
    interpreter_div.style.fontFamily = 'monospace'; // Set font-family to monospace
    this.movements.forEach((movement, index) => {
      const movement_div = document.createElement('div');
      movement_div.innerHTML = `<strong>Move ${index + 1} (${movement.time}s)</strong>`;
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
    });
  }

  updateTimer() {
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    this.timer = elapsed;
  }

  animate() { 
    if (this.running){
      const moveNext = () => {
        if (this.currentMovementIndex < this.movements.length) {
          const currentMovement = this.movements[this.currentMovementIndex];
          if (this.timer >= currentMovement.time*1000) {
            this.currentMovementIndex++;
            this.updateInterpreter();
            this.timer = 0;
            this.startTime = performance.now();
            moveNext(); // recursive call
          } else {
            // update timer
            const currentTime = performance.now();
            const elapsed = currentTime - this.startTime;
            this.timer = elapsed;
      
            // interpolate
            currentMovement.jointmovements.forEach((jointMovement) => {
              const deltaPosition = jointMovement.position_2 - jointMovement.position_1;
              const timeRatio = this.timer / (currentMovement.time * 1000);
              const interpolatedPosition = jointMovement.position_1 + (deltaPosition * timeRatio);
              jointMovement.current_position = interpolatedPosition;
      
              let robot_joint = viewport.robot.joints[jointMovement.jointName];
              if (robot_joint._jointType != "fixed"){
                if (robot_joint.axis.x!=0){
                  robot_joint.rotation.x = jointMovement.current_position;
                }
                if (robot_joint.axis.y!=0){
                  robot_joint.rotation.y = jointMovement.current_position;
                }
                if (robot_joint.axis.z!=0){
                  robot_joint.rotation.z = jointMovement.current_position;
                }
              }
            });
          }
        } else {
          this.running = false;
          this.currentMovementIndex = 0;
          this.updateInterpreter();
        }
      };      

      moveNext();
    }
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
  console.log(programmer.movements);
})

const run = document.getElementById("run");
run.addEventListener('click', function(){
  programmer.running = true;
  programmer.startTime = performance.now();
})

// function interpolateMovements(movements) {
//   // set the speed of the interpolation (in milliseconds per time step)
//   const speed = 10;

//   // iterate over each movement and joint movement, and perform linear interpolation in real-time
//   let currentTime = 0;
//   movements.forEach((movement) => {
//     const duration = movement.time;

//     movement.jointmovements.forEach((jointMovement) => {
//       const joint = new JointMovement(jointMovement.jointName, jointMovement.position_1, jointMovement.position_2);

//       const deltaPosition = jointMovement.position_2 - jointMovement.position_1;
//       const deltaT = duration;

//       const positionStep = deltaPosition / deltaT;

//       const interval = setInterval(() => {
//         const currentPosition = jointMovement.position_1 + positionStep * currentTime;
//         joint.current_position = currentPosition;

//         // console.log(`Joint: ${joint.jointName}, Current Position: ${joint.current_position}`);
//         let robot_joint = viewport.robot.joints[joint.jointName];
//         if (robot_joint._jointType != "fixed"){
//           if (robot_joint.axis.x!=0){
//             robot_joint.rotation.x = currentPosition;
//           }
//           if (robot_joint.axis.y!=0){
//             robot_joint.rotation.y = currentPosition;
//           }
//           if (robot_joint.axis.z!=0){
//             robot_joint.rotation.z = currentPosition;
//           }
//         }

//         currentTime += speed / 1000;

//         if (currentTime >= duration) {
//           clearInterval(interval);
//         }
//       }, speed);
//     });
//   });
// }

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