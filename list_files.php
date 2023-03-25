<?php
function listFiles($dir, $level = 0) {
  $output = '';

  // Get the contents of the directory
  $files = scandir($dir);

  // Loop through the files and output them as list items
  foreach ($files as $file) {
    // Ignore the . and .. entries
    if ($file != '.' && $file != '..') {
      // If the current file is a directory, call the function recursively
      if (is_dir($dir . '/' . $file)) {
        $output .= str_repeat('&nbsp;&nbsp;', $level) . $file . '/' . "<br>";
        $output .= listFiles($dir . '/' . $file, $level + 1);
      } else {
        $output .= str_repeat('&nbsp;&nbsp;', $level) . $file . "<br>";
      }
    }
  }

  return $output;
}


// Call the function with the root directory
$dirListing = listFiles('./uploads/');

// Return the directory listing as plain text
echo $dirListing;
?>