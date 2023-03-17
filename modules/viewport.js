import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { randFloat } from "three/src/math/MathUtils";
import { Light } from "/primitives/light.js";
import { Window } from "/primitives/window.js";

class Viewport extends Window{
  constructor(canvas){
    super(canvas);

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set(1,1,1);
    this.scene.add( directionalLight );
    const ambientLight = new THREE.AmbientLight(0x303030); // soft white light
    this.scene.add(ambientLight);

    const geometry = new THREE.BoxGeometry(1, 1, 1); // create a box geometry with size 1x1x1
    const material = new THREE.MeshStandardMaterial({ color: 0x881111 }); // create a basic mesh material with given color


    for (let i = 0; i < 50; i++){
      this.cube = new THREE.Mesh(geometry, material); // create a mesh from the geometry and material
      this.cube.translateY(0.5);
      let r = 50
      this.cube.translateX(randFloat(-r,r));
      this.cube.translateZ(randFloat(-r,r));
      let s = randFloat(1,3); 
      this.cube.scale.set(s,s,s)
      this.scene.add(this.cube); // add the cube to the scene
    }

    const helper = new THREE.GridHelper( 200, 40, 0x661111, 0x333333);
    // helper.rotation.x = Math.PI / 2;
    helper.scale.set(0.5,0.5,0.5)
    this.scene.add(helper);

    this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    this.camera.position.z = 100; // position the camera 5 units away along the z-axis
    this.camera.position.y = 50; // position the camera 5 units away along the z-axis
    this.controls.update();
  }

  animate(){
    if (this.rendering) {
      this.controls.update();
      this.renderer.render(this.scene, this.camera); // render the scene with the camera
    }
  }
}

export { Viewport };