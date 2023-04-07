import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeWindow } from "./window.js";
import { LoadingManager } from "three";
import URDFLoader  from "urdf-loader";
import * as dat from "dat.gui";

let gui = new dat.GUI({autoPlace: false});
document.querySelector('#viewport-gui').appendChild(gui.domElement);
gui.closed = true;

class Viewport extends ThreeWindow{
  constructor(window, urdf){
    super(window); // Call the constructor of the parent class

    // Add directional and ambient lights to the scene
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
    this.scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0x888888);
    this.scene.add(ambientLight);

    // Add a grid helper to the scene
    const helper = new THREE.GridHelper( 16, 32, 0x6ac36d, 0x444444);
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

    if (urdf!=null)
      this.URDFImport(urdf);
    else {
      console.warn("no valid urdf given")
    }
    this.robot;

    this.jointControllers = [];
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
      
        if (joint._jointType != "fixed"){
          if (joint.axis.x!=0){
            const xController = jointFolder.add(joint.rotation, 'x', -3.14, 3.14, 0.01);
            xController.name(jointName);
            this.jointControllers.push(xController); // add controller to array
          }
          if (joint.axis.y!=0){
            const yController = jointFolder.add(joint.rotation, 'y', -3.14, 3.14, 0.01);
            yController.name(jointName);
            this.jointControllers.push(yController); // add controller to array
          }
          if (joint.axis.z!=0){
            const zController = jointFolder.add(joint.rotation, 'z', -3.14, 3.14, 0.01);
            zController.name(jointName);
            this.jointControllers.push(zController); // add controller to array
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

export { Viewport, gui };