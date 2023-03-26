import {Window} from "../modules/window.js";
import {Viewport} from "../modules/viewport.js"

let viewport = new Viewport("viewport", null); // red 0xff0808
let collisions = new Window("collisions");
let biem = new Window("biem");
// let collisions = new Box(0x08ff08, "collisions"); // green
// let collisions = new Viewport("collisions", 'urdf/URDF_models/SC_3DoF.urdf'); // green
// let biem = new Box(0x0808ff, "biem"); // blue
// let biem = new Viewport("biem", 'urdf/T12/urdf/arm.urdf'); // blue

function animate() {
	// Requesting the browser to call the animate function again on the next frame
	requestAnimationFrame( animate );

  viewport.animate();
  collisions.animate();
  biem.animate();
}

// Calling the animate function to start the animation
animate();

export {viewport, collisions, biem};