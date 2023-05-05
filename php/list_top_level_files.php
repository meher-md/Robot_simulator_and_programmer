<?php
function listTopLevelFiles($dir) {
  $output = '';

  // Get the contents of the directory
  $files = scandir($dir);

  // Loop through the files and output them as buttons or list items
  foreach ($files as $file) {
    // Ignore the . and .. entries
    if ($file != '.' && $file != '..') {
      // If the current file is a directory, add it to the output
      if (is_dir($dir . '/' . $file)) {

      } else {
        // Check if the file has a .urdf extension
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        if ($extension == 'urdf' || $extension == 'URDF') {
          $output .= '<button class="file">' . $file . '</button><br>';
        }
      }
    }
  }

  return $output;
}

// Call the function with the root directory
$dirListing = listTopLevelFiles('../uploads/');

// Return the directory listing as plain text
echo $dirListing;
?>