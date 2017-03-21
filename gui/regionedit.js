function regionEdit(index) {
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
  removebutton.onclick = function() { removeIsotropicRegionClick() };
  editGUI.appendChild(removebutton);
  editGUI.appendChild(document.createElement("BR"));
  editGUI.appendChild(document.createElement("BR"));

  // PROPERTY FIELD
  var field = document.createElement("FIELDSET");
  editGUI.appendChild(field);
  var regionprops = document.createElement("UL");

  // TITLE AND COLOR
  var titleAndColor = document.createElement("LEGEND");
  var colorSpan = document.createElement("span");
  colorSpan.style.color = phantom.isotropicRegions.sphere[index].color.getStyle();
  colorSpan.style.fontSize = 'x-large';
  colorSpan.innerHTML = '&nbsp;&nbsp;&#9632;';

  var titleSpan = document.createElement("span");
  titleSpan.innerHTML = "Editing region ";

  titleAndColor.appendChild(titleSpan);
  titleAndColor.appendChild(colorSpan);

  field.appendChild(titleAndColor);

  // RADIUS
  var radius = document.createElement("LI");
  var radiuslabel = document.createElement("LABEL");
  radiuslabel.innerHTML = "Radius: ";
  var geometry = phantom.isotropicRegions.sphere[index].mesh.geometry;

  var radiusvalue = document.createElement("INPUT");
  radiusvalue.style.width = "50px";
  radiusvalue.type = "number";
  radiusvalue.min = 0;
  radiusvalue.step = .1;
  radiusvalue.value = phantom.isotropicRegions.source[index].radius;
  radiusvalue.onchange = function() {
    phantom.isotropicRegions.source[index].radius = this.value;
    phantom.isotropicRegions.source[index].notify();
  }

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
  xvalue.style.width = "60px";
  xvalue.type = "number";
  xvalue.step = .1;
  xvalue.value = phantom.isotropicRegions.source[index].center[0];
  xvalue.onchange = function() {
    phantom.isotropicRegions.source[index].setCenter('x', xvalue.value);
  }
  xpos.appendChild(xvalue);
  positionul.appendChild(xpos);

  var ypos = document.createElement("LI");
  var yposlabel = document.createElement("LABEL");
  yposlabel.innerHTML = "y ";
  ypos.appendChild(yposlabel);
  var yvalue = document.createElement("INPUT");
  yvalue.id = 'yvalue';
  yvalue.style.width = "60px";
  yvalue.type = "number";
  yvalue.step = .1;
  yvalue.value = phantom.isotropicRegions.source[index].center[1];
  yvalue.onchange = function() {
    phantom.isotropicRegions.source[index].setCenter('y', yvalue.value);
  }
  ypos.appendChild(yvalue);
  positionul.appendChild(ypos);

  var zpos = document.createElement("LI");
  var zposlabel = document.createElement("LABEL");
  zposlabel.innerHTML = "z ";
  zpos.appendChild(zposlabel);
  var zvalue = document.createElement("INPUT");
  zvalue.id = 'zvalue';
  zvalue.style.width = "60px";
  zvalue.type = "number";
  zvalue.step = .1;
  zvalue.value = phantom.isotropicRegions.source[index].center[2];
  zvalue.onchange = function() {
    phantom.isotropicRegions.source[index].setCenter('z', zvalue.value);
  }
  zpos.appendChild(zvalue);
  positionul.appendChild(zpos);

  regionprops.appendChild(position);

  field.appendChild(regionprops);
}
