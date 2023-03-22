import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { randFloat } from "three/src/math/MathUtils";
import { Light } from "/primitives/light.js";
import { Window } from "/primitives/window.js";
import { LoadingManager } from "three";
import URDFLoader  from "urdf-loader";
import * as dat from "dat.gui";

let gui = new dat.GUI();
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

    this.jointFolder = gui.addFolder(canvas); // Add a folder to the dat.GUI panel

    // this.URDFImport(urdf);
    this.robot;
  }

  URDFImport(urdf){
    const manager = new LoadingManager();
    const loader = new URDFLoader( manager );
    loader.load(urdf,
      result => {
        this.robot=result;
      } 
    );
    
    manager.onLoad = () => {
      let jointFolder = this.jointFolder;
      let robot = this.robot;

      robot.rotation.x = - Math.PI / 2
      // robot.joints['arm_joint_2'].setJointValue(THREE.MathUtils.degToRad(30));

      for (const jointName in robot.joints){
        const joint = robot.joints[jointName];

        if (joint._jointType != "fixed"){
          if (joint.axis.x!=0){
            // joint.rotation.x = randFloat(-3.14, 3.14);
            jointFolder.add(joint.rotation, 'x',
            -3.14, 3.14, 0.01
            ).name(jointName);
          }
          if (joint.axis.y!=0){
            // joint.rotation.y = randFloat(-3.14, 3.14);
            jointFolder.add(joint.rotation, 'y',
            -3.14, 3.14, 0.01
            ).name(jointName);
          }
          if (joint.axis.z!=0){
            // joint.rotation.z = randFloat(-3.14, 3.14);
            jointFolder.add(joint.rotation, 'z',
            -3.14, 3.14, 0.01
            ).name(jointName);
          }
        }
      }
      
      this.scene.add(robot);
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