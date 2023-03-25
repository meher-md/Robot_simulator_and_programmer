import * as THREE from "three";

class Light{
  constructor(scene, color){ // Constructor for Light class, creates sphere and directional light with given color
    // Create sphere geometry and material with given color
    let sphereGeometry = new THREE.SphereGeometry(0.05);
    let sphereMaterial = new THREE.MeshBasicMaterial( { color: color } );
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(this.sphere)
    
    // Create directional light with given color
    this.light = new THREE.DirectionalLight( color );
    scene.add(this.light);
  }

  // Change position of sphere and light
  changePosition(x, y, z){
    this.sphere.position.set(x,y,z);
    this.light.position.set(x,y,z);
  }

  // Change color of sphere and light
  changeColor(color){
    let sphereMaterial = new THREE.MeshBasicMaterial( { color: color } );
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

    this.light = new THREE.DirectionalLight( color );
  }
}

export {Light};