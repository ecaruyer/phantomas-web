/**@overview Contains functions regarding the isotropic region edition GUI.*/

function regionEdit(index) {
  /** @function regionEdit
   * @memberof module:GUI Construction
   * @param {Number} index The index in the array of the fiber to edit.
   * @desc Adds the isotropic region edition GUI.
   */

  resizeGUI();
  scene.removeCPHighlight(true);

  // editGUI is emptied
  var editGUI = document.getElementById('editGUI');
  editGUI.innerHTML = "";
  editGUI.style = "list-style-type: none";

  // REMOVE BUTTON
  var removebutton = document.createElement("BUTTON");
  removebutton.style.float = "right";
  removebutton.innerHTML = "Remove Isotropic Region";
  removebutton.id = "removebutton";
  removebutton.id = "Remove Isotropic Region (Del)"
  removebutton.className = "w3-btn w3-hover-red w3-border w3-border-white"
  removebutton.onclick = function() {
    removeIsotropicRegionClick()
  };
  editGUI.appendChild(removebutton);
  editGUI.appendChild(document.createElement("BR"));
  editGUI.appendChild(document.createElement("BR"));

  // PROPERTY FIELD
  var field = document.createElement("FIELDSET");
  editGUI.appendChild(field);
  var regionprops = document.createElement("UL");

  // TITLE AND COLOR
  var regioncolor = phantom.isotropicRegions.source[index].color;
  var colorpicker = document.createElement("INPUT");
  colorpicker.type = "color";
  colorpicker.value = "#" + regioncolor.getHexString();
  colorpicker.className = 'w3-btn nameFieldLabel';
  colorpicker.onchange = function() {
    phantom.isotropicRegions.source[index].color = new THREE.Color(parseInt(this.value.slice(1,7), 16));
    phantom.isotropicRegions.source[index].notify();
    document.getElementById('regionSelector').childNodes[index + 1].childNodes[0].style.color = phantom.isotropicRegions.source[index].color.getStyle();
  }

  var nameInput = document.createElement("INPUT");
  nameInput.type = 'text';
  nameInput.name = 'nameInput';
  nameInput.value = phantom.isotropicRegions.source[index].name;
  nameInput.className = "w3-input w3-border field";
  // Disable key bindings when writing
  nameInput.onkeyup = function(event) {
    event.stopPropagation();
    if (event.keyCode == 13) {
      this.blur();
    }
  };
  nameInput.onchange = function() {
    phantom.isotropicRegions.source[index].name = this.value;
    document.getElementById('regionSelector').childNodes[index + 1].childNodes[1].innerHTML = this.value;
  };

  var titleAndColor = document.createElement("LEGEND");
  titleAndColor.appendChild(colorpicker);
  titleAndColor.appendChild(nameInput);

  field.appendChild(titleAndColor);

  // RADIUS
  var radius = document.createElement("LI");
  var radiuslabel = document.createElement("LABEL");
  radiuslabel.innerHTML = "Radius: ";
  var geometry = phantom.isotropicRegions.sphere[index].mesh.geometry;

  var radiusvalue = document.createElement("INPUT");
  radiusvalue.style.width = "50px";
  radiusvalue.className = "w3-input w3-border field";
  radiusvalue.type = "number";
  radiusvalue.min = 0;
  radiusvalue.step = Math.pow(10, -precision);
  radiusvalue.value = phantom.isotropicRegions.source[index].radius;
  radiusvalue.onchange = function() {
    this.value = roundToPrecision(Math.max(1 / (10 * precision), Math.abs(this.value))); //Radius cannot be negative, must be at least precision value.
    phantom.isotropicRegions.source[index].setRadius(this.value);
  };
  radiusvalue.onkeyup = nameInput.onkeyup;


  radius.appendChild(radiuslabel);
  radius.appendChild(radiusvalue);
  regionprops.appendChild(radius);

  // POSITION
  var position = document.createElement("FIELDSET");
  position.innerHTML = "<legend>Position</legend>";
  var positionul = document.createElement("UL");
  position.appendChild(positionul);

  var xpos = document.createElement("LI");
  var xposlabel = document.createElement("LABEL");
  xposlabel.innerHTML = "x ";
  xpos.appendChild(xposlabel);
  var xvalue = document.createElement("INPUT");
  xvalue.id = 'xvalue';
  xvalue.className = "w3-input w3-border field";
  xvalue.style.width = "60px";
  xvalue.type = "number";
  xvalue.step = Math.pow(10, -precision);
  xvalue.value = phantom.isotropicRegions.source[index].center[0];
  xvalue.onchange = function() {
    this.value = roundToPrecision(this.value);
    phantom.isotropicRegions.source[index].setCenter('x', xvalue.value);
    if (guiStatus.dragAndDropping) {
      dragAndDrop();
    }
  };
  xvalue.onkeyup = nameInput.onkeyup;
  xpos.appendChild(xvalue);
  positionul.appendChild(xpos);

  var ypos = document.createElement("LI");
  var yposlabel = document.createElement("LABEL");
  yposlabel.innerHTML = "y ";
  ypos.appendChild(yposlabel);
  var yvalue = document.createElement("INPUT");
  yvalue.id = 'yvalue';
  yvalue.className = "w3-input w3-border field";
  yvalue.style.width = "60px";
  yvalue.type = "number";
  yvalue.step = Math.pow(10, -precision);
  yvalue.value = phantom.isotropicRegions.source[index].center[1];
  yvalue.onchange = function() {
    this.value = roundToPrecision(this.value);
    phantom.isotropicRegions.source[index].setCenter('y', yvalue.value);
    if (guiStatus.dragAndDropping) {
      dragAndDrop();
    }
  }
  yvalue.onkeyup = nameInput.onkeyup;
  ypos.appendChild(yvalue);
  positionul.appendChild(ypos);

  var zpos = document.createElement("LI");
  var zposlabel = document.createElement("LABEL");
  zposlabel.innerHTML = "z ";
  zpos.appendChild(zposlabel);
  var zvalue = document.createElement("INPUT");
  zvalue.id = 'zvalue';
  zvalue.className = "w3-input w3-border field";
  zvalue.style.width = "60px";
  zvalue.type = "number";
  zvalue.step = Math.pow(10, -precision);
  zvalue.value = phantom.isotropicRegions.source[index].center[2];
  zvalue.onchange = function() {
    this.value = roundToPrecision(this.value);
    phantom.isotropicRegions.source[index].setCenter('z', zvalue.value);
    if (guiStatus.dragAndDropping) {
      dragAndDrop();
    }
  }
  zvalue.onkeyup = nameInput.onkeyup;
  zpos.appendChild(zvalue);
  positionul.appendChild(zpos);

  regionprops.appendChild(position);

  //BUTTONS UNDER Position
  var buttons = document.createElement("LI");
  position.appendChild(buttons);
  buttons.innerHTML = "&nbsp;&nbsp;&nbsp;"

  var ddbutton = document.createElement("BUTTON");
  ddbutton.id = 'ddbutton';
  if (guiStatus.dragAndDropping) { //Acting only when hovering over CPs
    ddbutton.className = 'w3-btn w3-yellow w3-hover-khaki w3-border w3-ripple w3-small';
  } else {
    ddbutton.className = 'w3-btn w3-hover-yellow w3-border w3-border-white w3-small w3-ripple';
  }
  ddbutton.title = "Drag and Drop (D)";
  ddbutton.style = 'margin-top: 10px; margin-bottom: 10px';
  ddbutton.innerHTML = '<i class="icons">&#xE901;</i>';
  ddbutton.onclick = function() {
    // undobutton.disabled = false;
    if (!guiStatus.dragAndDropping) {
      guiStatus.dragAndDropping = true;
      this.className = 'w3-btn w3-yellow w3-hover-khaki w3-border w3-ripple w3-small';
      dragAndDrop();
    } else {
      guiStatus.dragAndDropping = false;
      this.className = 'w3-btn w3-hover-yellow w3-border w3-border-white w3-small w3-ripple'
      scene.removeControls();
    }
  }
  buttons.appendChild(ddbutton);

  field.appendChild(regionprops);
}
