<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Robot Arm Simulator</title>
	</head>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" type="image/png" href="images/favicon.png">
	<body>
    <script async src="https://unpkg.com/es-module-shims@1.6.3/dist/es-module-shims.js"></script>

    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.150.1/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.150.1/examples/jsm/",
          "three/examples/jsm/": "https://unpkg.com/three@0.150.1/examples/jsm/",
          "three/src/": "https://unpkg.com/three@0.150.1/src/",
          "urdf-loader": "https://unpkg.com/urdf-loader@0.10.4",
          "dat.gui": "https://unpkg.com/dat.gui@0.7.9/build/dat.gui.module.js"
        }
      }
    </script>

    <div id="overlay"></div>

    <div class="centered-box" id="import-box">
      <button class="import-close-button" onclick="hideBox('#import-box')">&times;</button>
      <h2>Import Files</h2>
      <form id="uploadForm" method="post" enctype="multipart/form-data">
        Select files to upload (.stl or .urdf):
        <br>
        <p></p>
        <input type="file" name="fileToUpload[]" multiple>
        <br><br>
        <input type="button" value="Upload Files" id="upload" onclick="uploadFiles()">
      </form><br>
      <h4>Uploaded Files:</h4>
      <button class="refresh" onclick="updateDirectoryListing()">↻</button>
      <div id="dirListingContainer" class="directory-listing"></div>
    </div>
    
    <div class="centered-box" id="robot-box">
      <button class="import-close-button" onclick="hideBox('#robot-box')">&times;</button>
      <h2>Choose Robot</h2>
      <button class="refresh" onclick="updateDirectoryListing()">↻</button>
      <div id="dirListingContainer" class="directory-listing"></div>
    </div>
    

    <div class="window">
      <canvas id="viewport"></canvas>
    </div>
    <div class="window">
      <canvas id="collisions"></canvas>
    </div>
    <div class="window">
      <canvas id="biem"></canvas>
    </div>

    <script type="module" src="primitives/light.js"></script>
    <script type="module" src="primitives/box.js"></script>

    <script type="module" src="modules/viewport.js"></script>

    <canvas id="top-canvas" class="top-side"></canvas>
    <div class="dropdown">
      <button onclick="dropDown('file')" class="top">File</button>
      <div id="file" class="dropdown-content">
        <button class="dropbtn" onclick="showBox('#robot-box')">Choose Robot</button>
        <button class="dropbtn" onclick="showBox('#import-box')">Import Files</button>
        <button class="dropbtn">Open</button>
      </div>
    </div>
    <div class="dropdown">
      <button onclick="dropDown('edit')" class="top">Edit</button>
      <div id="edit" class="dropdown-content">
        <button class="dropbtn">Undo</button>
        <button class="dropbtn">Redo</button>
      </div>
    </div>
    <div class="dropdown">
      <button onclick="dropDown('view')" class="top">View</button>
      <div id="view" class="dropdown-content">
        <button class="dropbtn">Light Mode</button>
        <button class="dropbtn">Dark Mode</button>
      </div>
    </div>

    <canvas id="side-canvas" class="top-side"></canvas>
    <button class="side" id="viewport_btn"><img src="images/modules/viewport.png" draggable="false"></button>
    <button class="side" id="collisions_btn"><img src="images/modules/collisions.png"draggable="false"></button>
    <button class="side" id="biem_btn"><img src="images/modules/biem.png"draggable="false"></button>

    <script src="layout.js"></script>

    <div class="gui"></div>

    <!-- window space setup -->
		<script type="module" src="main.js"></script>
    <script type="module" src="modules/window-manager.js"></script>
	</body>
</html>