import {CubeScene} from "/primitives/box.js"
let viewport = new CubeScene(0xff0808, "viewport"); // red
let collisions = new CubeScene(0x08ff08, "collisions"); // green
let biem = new CubeScene(0x0808ff, "biem"); // blue

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