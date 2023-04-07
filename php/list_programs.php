<?php
function listFiles($dir, $level = 0) {
  $output = '';
  // $output = '<h3 style="font-family: monospace; padding: 0px;">File Manager</h3>';

  // Get the contents of the directory
  $files = scandir($dir);

  // Loop through the files and output them as buttons or list items
  foreach ($files as $file) {
    // Ignore the . and .. entries
    if ($file != '.' && $file != '..') {
      // If the current file is a directory, call the function recursively
      if (is_dir($dir . '/' . $file)) {
        $output .= str_repeat('&nbsp;&nbsp;', $level) . $file . '/' . "<br>";
        $output .= listFiles($dir . '/' . $file, $level + 1);
      } else {
        $file_contents = file_get_contents($dir . '/' . $file);
        $output .= '<button class="program" data-filename="' . $file . '">' . $file . '</button><br>';
        $output .= '<div class="program-contents" style="display: none;" data-filename="' . $file . '">' . htmlspecialchars($file_contents) . '</div>';
      }
    }
  }

  return $output;
}

// Call the function with the root directory
$dirListing = listFiles('../uploads/programs');

// Return the directory listing as plain text
echo $dirListing;
?>