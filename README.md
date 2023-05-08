# Robot Arm Simulator

Robot Arm Simulator is a web-based application for simulating robotic arms. It allows users to import and view 3D models of robotic arms in the URDF file format and interact with them using a 3D viewport. The simulator also includes a programming interface and a Built-in Extrusion Mesh Editor (BIEM) tool.

## Installation

There is no need to install npm to host the program locally, but you do need to use a hosting service that allows the running of PHP. 

### Hosting Services

Some hosting services that allow running of PHP include:

- Heroku
- AWS
- Google Cloud
- DigitalOcean
- Bluehost

### Getting Started

To get started with the Robot Arm Simulator, you can use the PHP development server to host the program locally. To do this, follow these steps:

1. Download the code from the GitHub repository:

   ```
   git clone https://github.com/example/robot-arm-simulator-2.git
   ```

2. Open a terminal window and navigate to the directory where you downloaded the code.
3. Run the following command to start the PHP development server:

   ```
   php -S localhost:3000
   ```

4. Open a web browser and go to `http://localhost:3000` to access the program.

## Usage

### Window Management:

The window management feature of this program allows users to manage their sub-programs on the window space. Here are the criteria for window management:

- If no sub-program is running, then the window space is empty.
- If a sub-program is dragged from the side menu and the window space has less than two sub-programs running on the window space, then the sub-program is placed onto the window space.
- If the window space has one sub-program running on the window space, then the newly clicked sub-program will be placed below the existing sub-program in a split-screen view.

### Viewport

#### Importing a Robot Arm

To import a robot arm, click on the "File" dropdown menu and select "Choose Robot". This will open the "Choose Robot" dialog box. Click on a URDF file to load it into the viewport.

#### Viewing the Robot Arm

Once a robot arm has been loaded into the viewport, you can interact with it by dragging your mouse to rotate the view or using the scroll wheel to zoom in and out.

### Programming the Robot Arm

To access the programming interface, drag the "Programmer" button into the window space from the menu bar. This will open the programming interface, where you can write code to control the robot arm.

The programming language used is a custom language designed for controlling robotic arms. It allows you to specify the positions of the robotic arm's joints using a series of move commands, and also includes commands for waiting between movements.

### Syntax

The basic syntax of a move command is as follows:

```
move(time) {
    "joint_name_1" = [position_1a, position_1b];
    "joint_name_2" = [position_2];
    "joint_name_3" = [position_3a, position_3b];
    ...
}
```

- `time`: The time (in milliseconds) to take to complete the movement.
- `joint_name`: The name of the joint to move.
- `position`: The position (in radians) to move the joint to. For joints with more than one axis of rotation, you can specify multiple positions separated by commas.

There is also a `wait` command that allows you to pause for a specified amount of time:

```
wait(time);
```

#### Example

Here is an example program that moves a robotic arm through a series of positions:

```
move(100){
    "lbr_iiwa_joint_1" = [0,0];
    "lbr_iiwa_joint_2" = [-3.14,-3.14];
    "lbr_iiwa_joint_3" = [-3.14,-3.14];
    "lbr_iiwa_joint_4" = [0,0];
    "lbr_iiwa_joint_5" = [-3.14,-3.14];
    "lbr_iiwa_joint_6" = [0,0];
    "lbr_iiwa_joint_7" = [-3.14,-3.14];
}

wait(300);

move(300){
    "lbr_iiwa_joint_2" = [-2.83];
}

move(700){
    "lbr_iiwa_joint_1" = [-1.57];
    "lbr_iiwa_joint_2" = [-2.74];
    "lbr_iiwa_joint_3" = [1.57];
    "lbr_iiwa_joint_4" = [-1.57];
    "lbr_iiwa_joint_5" = [-2.74];
    "lbr_iiwa_joint_6" = [1.57];
    "lbr_iiwa_joint_7" = [-1.57];
}

wait(500);

```

### Basic Integrated Environment Modeller (BIEM)

To access the BIEM tool, click drag the "BIEM" button in the menu bar onto the window space. This will open the BIEM tool, where you can create and edit extrusion meshes.

## Contributing

Contributions to Robot Arm Simulator are welcome! If you find a bug or have a feature request, please open an issue on the GitHub repository.