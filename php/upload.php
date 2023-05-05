<?php
$target_dir = "../uploads/";
$uploadOk = 1;
$response = array();
$errors = array();

set_error_handler(function($errno, $errstr) use (&$errors) {
  if ($errno == E_WARNING || $errno == E_ERROR) {
    array_push($errors, $errstr);
    echo implode("\n", $errors);
    exit;
  }
});

// Loop through each file
foreach ($_FILES["fileToUpload"]["name"] as $key => $name) {
  error_log("received files");
  $target_file = $target_dir . basename($name);
  $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

  // Check if file already exists
  if (file_exists($target_file)) {
    array_push($errors, "Sorry, file already exists.");
    $uploadOk = 0;
  }

  // Allow certain file formats
  $allowed_ext = array("stl", "urdf", "txt");
  $file_ext = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
  if(!in_array($file_ext, $allowed_ext)){
    array_push($errors, "Sorry, only STL and URDF files are allowed.");
    $uploadOk = 0;
  }

  // Check if $uploadOk is set to 0 by an error
  if ($uploadOk == 0) {
    array_push($errors, "Sorry, your file was not uploaded.");
  // if everything is ok, try to upload file
  } else {
    if ($file_ext == "stl") {
      $target_file = $target_dir . "meshes/" . basename($name);
    }
    if ($file_ext == "txt") {
      $target_file = $target_dir . "programs/" . basename($name);
    }
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"][$key], $target_file)) {
      array_push($errors, "The file ". htmlspecialchars( basename( $_FILES["fileToUpload"]["name"][$key])). " has been uploaded.");
    } else {
      array_push($errors, "Sorry, there was an error uploading your file.");
    }
  }
}

// Restore the default error handler
restore_error_handler();

// If there were errors, return them as a JSON-encoded array
if (!empty($errors)) {
  // http_response_code(400);
  echo implode("\n", $errors);
}

exit;
?>