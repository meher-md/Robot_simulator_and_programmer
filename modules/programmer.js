import {Window} from "./window.js"

class Programmer extends Window {
  constructor(window){
    super(window);
    this.textarea = this.window.querySelector("textarea");
    this.runningCode = document.getElementById("running-code");
  }

  changeWindowSize(width, height) {
    this.window.width = width;
    this.window.height = height;

    // this.runningCode.style.width = width + "px";

    this.textarea.style.width = width + 'px';
    height = height /2;
    this.textarea.style.height = height - height*0.05 + 'px';
  }
}

const saveButton = document.getElementById("save-button");
const runningCodeDiv = document.querySelector('#running-code');

saveButton.addEventListener('click', () => {
  const lines = textarea.value.split('\n');

  runningCodeDiv.innerHTML = '';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > 0) {
      const newButton = document.createElement('button');
      newButton.textContent = lines[i];
      newButton.classList.add('file');
      runningCodeDiv.appendChild(newButton);
    } else {
      runningCodeDiv.appendChild(document.createElement('br'));
    }
  }
});

export {Programmer}