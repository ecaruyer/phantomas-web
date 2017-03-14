function fiberEdit( index ) {
  var editGUI = document.getElementById('editGUI');
  editGUI.innerHTML = "";
  editGUI.style = "list-style-type: none";
  var fiberprops = document.createElement("UL");

  // NUMBER OF CONTROL POINTS AND COLOR
  var controlPointsAndColor = document.createElement("LI");
  var colorSpan = document.createElement("span");
  colorSpan.style.color = phantom.fibers.tube[index].color.getStyle();
  colorSpan.innerHTML = '&nbsp;&nbsp;&#9632;';

  var controlPointsSpan = document.createElement("span");
  controlPointsSpan.innerHTML = phantom.fibers.source[index].controlPoints.length + " Points";

  controlPointsAndColor.appendChild(controlPointsSpan);
  controlPointsAndColor.appendChild(colorSpan);

  fiberprops.appendChild(controlPointsAndColor);

  // LENGTH
  var length = document.createElement("LI");
  length.innerHTML = Math.floor(phantom.fibers.source[index].length * 10) / 10 + " units long"
  fiberprops.appendChild(length);

  // RADIUS
  var radius = document.createElement("LI");
  var radiuslabel = document.createElement("LABEL");
  radiuslabel.innerHTML = "Radius ";
  // index ++;
  var geometry = phantom.fibers.tube[index].mesh.geometry;

  var radiusvalue = document.createElement("INPUT");
  radiusvalue.style.width = "45px";
  radiusvalue.id = "radius";
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

  editGUI.appendChild(fiberprops);
}
