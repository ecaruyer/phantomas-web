function editExit() {
  document.getElementById('editGUI').innerHTML = "";
}
function fiberEdit( index ) {
  var editGUI = document.getElementById('editGUI');
  editGUI.innerHTML = "";
  editGUI.style = "list-style-type: none";
  var field = document.createElement("FIELDSET");
  editGUI.appendChild(field);
  var fiberprops = document.createElement("UL");

  // NUMBER OF CONTROL POINTS AND COLOR
  var controlPointsAndColor = document.createElement("LEGEND");
  var colorSpan = document.createElement("span");
  colorSpan.style.color = phantom.fibers.tube[index].color.getStyle();
  colorSpan.style.fontSize = 'x-large';
  colorSpan.innerHTML = '&nbsp;&nbsp;&#9632;';

  var controlPointsSpan = document.createElement("span");
  controlPointsSpan.innerHTML = phantom.fibers.source[index].controlPoints.length + " Points";

  controlPointsAndColor.appendChild(controlPointsSpan);
  controlPointsAndColor.appendChild(colorSpan);

  field.appendChild(controlPointsAndColor);

  // LENGTH
  var length = document.createElement("LI");
  length.innerHTML = Math.floor(phantom.fibers.source[index].length * 10) / 10 + " units long"
  fiberprops.appendChild(length);

  // RADIUS
  var radius = document.createElement("LI");
  var radiuslabel = document.createElement("LABEL");
  radiuslabel.innerHTML = "Radius: ";
  var geometry = phantom.fibers.tube[index].mesh.geometry;

  var radiusvalue = document.createElement("INPUT");
  radiusvalue.style.width = "50px";
  radiusvalue.type = "number";
  radiusvalue.min = 0;
  radiusvalue.step = .1;
  radiusvalue.value = phantom.fibers.source[index].radius;
  radiusvalue.onchange = function() {
    phantom.fibers.source[index].radius = this.value;
    phantom.fibers.source[index].notify();
  }

  radius.appendChild(radiuslabel);
  radius.appendChild(radiusvalue);
  fiberprops.appendChild(radius);

  // TANGENTS
  var tangentslabel = document.createElement("LABEL");
  tangentslabel.innerHTML = "Tangents: ";

  var tangents = document.createElement("SELECT");
  tangents.onchange = function() {
    phantom.fibers.source[index].tangents = this.value;
    phantom.fibers.source[index].polyCalc();
    phantom.fibers.source[index].notify();
  }
  var symmetric = document.createElement("OPTION");
  symmetric.value = "symmetric";
  symmetric.innerHTML = "Symmetric";
  tangents.options.add(symmetric);
  var incoming = document.createElement("OPTION");
  incoming.value = "incoming";
  incoming.innerHTML = "Incoming";
  tangents.options.add(incoming);
  var outgoing = document.createElement("OPTION");
  outgoing.value = "outgoing";
  outgoing.innerHTML = "Outgoing";
  tangents.options.add(outgoing);

  tangents.value = phantom.fibers.source[index].tangents;
  fiberprops.appendChild(tangentslabel);
  fiberprops.appendChild(tangents);

  field.appendChild(fiberprops);
}
function regionEdit(index) {
  var editGUI = document.getElementById('editGUI');
  editGUI.innerHTML = "";
  editGUI.style = "list-style-type: none";
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
  var positionli = document.createElement("LI");
  position.appendChild(positionli);

  var positionul = document.createElement("UL");

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

  // positionli.appendChild(positionlabel);
  positionli.appendChild(positionul);
  regionprops.appendChild(position);

  field.appendChild(regionprops);
}
