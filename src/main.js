import {Programmer} from "../modules/programmer.js";
import {Viewport} from "../modules/viewport.js"
import {BIEM} from "../modules/biem.js"
// import {Box} from "../modules/box.js"

let viewport = new Viewport("viewport", null); // red 0xff0808
let programmer = new Programmer("programmer");
let biem = new BIEM("biem");
// let programmer = new Box(0x08ff08, "programmer"); // green
// let programmer = new Viewport("programmer", 'urdf/URDF_models/SC_3DoF.urdf'); // green
// let biem = new Box(0x0808ff, "biem"); // blue
// let biem = new Viewport("biem", 'urdf/T12/urdf/arm.urdf'); // blue

function animate() {
	// Requesting the browser to call the animate function again on the next frame
	requestAnimationFrame( animate );

  viewport.animate();
  programmer.animate();
  biem.animate();
}

// Calling the animate function to start the animation
animate();

export {viewport, programmer, biem};