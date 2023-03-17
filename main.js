import {Box} from "/primitives/box.js"
import {Viewport} from "/modules/viewport.js"

let viewport = new Viewport("viewport"); // red 0xff0808
let collisions = new Box(0x08ff08, "collisions"); // green
let biem = new Box(0x0808ff, "biem"); // blue

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