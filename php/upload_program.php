<?php
// Check if the filename and content were sent
if(isset($_POST["filename"]) && isset($_POST["content"])) {
  $target_dir = "../uploads/programs/";
  $filename = basename($_POST["filename"]);
  $target_file = $target_dir . $filename;

  // Check if the file already exists
  if (file_exists($target_file)) {
    // Replace the file contents with the new contents
    file_put_contents($target_file, $_POST["content"]);
    error_log( "The file " . htmlspecialchars($filename) . " has been updated.");
  } else {
    // Upload the new file
    if (file_put_contents($target_file, $_POST["content"])) {
      error_log( "The file " . htmlspecialchars($filename) . " has been uploaded.");
    } else {
      error_log( "Error uploading file.");
    }
  }
} else {
  error_log( "No filename or content sent.");
}
?>