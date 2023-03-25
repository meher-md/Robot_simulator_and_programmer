import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { randFloat } from "three/src/math/MathUtils";
import { Light } from "/primitives/light.js";
import { Window } from "/primitives/window.js";
import { LoadingManager } from "three";
import URDFLoader  from "urdf-loader";
import * as dat from "dat.gui";

let gui = new dat.GUI({autoPlace: false});
document.querySelector('.gui').appendChild(gui.domElement);
gui.closed = true;

class Viewport extends Window{
  constructor(canvas, urdf){
    super(canvas); // Call the constructor of the parent class

    // Add directional and ambient lights to the scene
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0x888888);
    this.scene.add(ambientLight);

    // Add a grid helper to the scene
    const helper = new THREE.GridHelper( 2, 4, 0x05a4ff, 0x333333);
    helper.scale.set(0.5,0.5,0.5);
    helper.receiveShadow = true; // Set receiveShadow to true
    this.scene.add(helper);

    // Add orbit controls to the camera
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.3;

    // Set the camera position and update the controls
    this.camera.position.z = 2;
    this.camera.position.y = 1;
    this.controls.update();

    // this.jointFolder = gui.addFolder(canvas); // Add a folder to the dat.GUI panel

    this.URDFImport(urdf);
    this.robot;
  }

  // This function imports a URDF model, sets its rotation and allows users to control the rotation of its joints using a dat.GUI interface.
  URDFImport(urdf){
    const manager = new LoadingManager();
    const loader = new URDFLoader( manager );
    const meshFolderPath = 'uploads/meshes/'; // Set the folder path here
    loader.loadMeshCb = (path, manager, done) => {
      const fileName = path.split('/').pop(); // Get the filename from the path
      const fullPath = meshFolderPath + fileName; // Generate the full path using the standardized naming convention

      // // Load the STL file using the STLLoader
      loader.defaultMeshLoader(fullPath, manager, done)
    };
    loader.load(urdf,
      result => {
        this.robot=result;
      } 
    );
    
    manager.onLoad = () => {
      let jointFolder = gui;

      // rotates the robot so that it faces upwards
      this.robot.rotation.x = - Math.PI / 2

      for (const jointName in this.robot.joints){
        const joint = this.robot.joints[jointName];
        
        // The joint rotation controls are only added for non-fixed joints with a non-zero axis, 
        // and the rotation limits are set to -3.14 to 3.14 with a step of 0.01.
        if (joint._jointType != "fixed"){
          if (joint.axis.x!=0){
            jointFolder.add(joint.rotation, 'x',
            -3.14, 3.14, 0.01
            ).name(jointName);
          }
          if (joint.axis.y!=0){
            jointFolder.add(joint.rotation, 'y',
            -3.14, 3.14, 0.01
            ).name(jointName);
          }
          if (joint.axis.z!=0){
            jointFolder.add(joint.rotation, 'z',
            -3.14, 3.14, 0.01
            ).name(jointName);
          }
        }
      }
      
      // adds the robot to the scene
      this.scene.add(this.robot);
    }
  }

  animate(){
    if (this.rendering) {
      this.controls.update(); // Update the controls
      this.renderer.render(this.scene, this.camera); // Render the scene with the camera
    }
  }
}

export { Viewport };