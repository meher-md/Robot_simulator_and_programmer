function animate() {
	// Requesting the browser to call the animate function again on the next frame
	requestAnimationFrame( animate );

  viewport.animate();
  collisions.animate();
  biem.animate();
}
// Calling the animate function to start the animation
animate();