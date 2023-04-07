<?php
$target_dir = "uploads/";
$uploadOk = 1;

// Loop through each file
foreach ($_FILES["fileToUpload"]["name"] as $key => $name) {
  $target_file = $target_dir . basename($name);
  $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

  // Check if file already exists
  if (file_exists($target_file)) {
    echo "Sorry, file already exists.";
    $uploadOk = 0;
  }

  // Allow certain file formats
  $allowed_ext = array("stl", "urdf", "txt");
  $file_ext = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
  if(!in_array($file_ext, $allowed_ext)){
    echo "Sorry, only STL and URDF files are allowed.";
    $uploadOk = 0;
  }

  // Check if $uploadOk is set to 0 by an error
  if ($uploadOk == 0) {
    echo "Sorry, your file was not uploaded.";
  // if everything is ok, try to upload file
  } else {
    if ($file_ext == "stl") {
      $target_file = $target_dir . "meshes/" . basename($name);
    }
    if ($file_ext == "txt") {
      $target_file = $target_dir . "programs/" . basename($name);
    }
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"][$key], $target_file)) {
      echo "The file ". htmlspecialchars( basename( $_FILES["fileToUpload"]["name"][$key])). " has been uploaded.";
    } else {
      echo "Sorry, there was an error uploading your file.";
    }
  }
}

header("Location: {$_SERVER['HTTP_REFERER']}");
exit;
?>
