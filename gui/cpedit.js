function cpEdit(index) {
  var fiber = phantom.fibers.source[guiStatus.editingFiber];
  var cp = fiber.controlPoints[index];
  var cpSelect = document.getElementById('cpSelector');
  var editGUI = document.getElementById('editGUI');
  if (!(guiStatus.editingCP + 1)) {
    guiStatus.editingCP = index;
    editGUI.removeChild(cpSelect);
  } else {
    editGUI.removeChild(document.getElementById('cpEditor'));
  }
  cpSelect.style.width = '50px'

  var table = document.createElement("TABLE");
  table.id = 'cpEditor';
  editGUI.appendChild(table);
  var tr = document.createElement("TR");
  table.appendChild(tr);
  var td1 = document.createElement("TD");
  td1.appendChild(cpSelect);
  tr.appendChild(td1);
  var td2 = document.createElement("TD");
  tr.appendChild(td2);

  var field = document.createElement("FIELDSET");
  td2.appendChild(field);

  var title = document.createElement("LEGEND");
  title.innerHTML = ' ' + index.toString(); + ' ';
  field.appendChild(title);

  // POSITION PROPERTIES
  var position = document.createElement("UL");
  field.appendChild(position);

  var xpos = document.createElement("LI");
  var xposlabel = document.createElement("LABEL");
  xposlabel.innerHTML = "x ";
  xpos.appendChild(xposlabel);
  var xvalue = document.createElement("INPUT");
  xvalue.id = 'xvalue';
  xvalue.style.width = "55px";
  xvalue.type = "number";
  xvalue.step = .1;
  xvalue.value = cp[0];
  xvalue.onchange = function() {
    fiber.setControlPoint(index, 'x', Number(this.value));
    phantom.cpHighlight(guiStatus.editingFiber, index, 'blue');
  }
  xpos.appendChild(xvalue);
  position.appendChild(xpos);

  var ypos = document.createElement("LI");
  var yposlabel = document.createElement("LABEL");
  yposlabel.innerHTML = "y ";
  ypos.appendChild(yposlabel);
  var yvalue = document.createElement("INPUT");
  yvalue.id = 'yvalue';
  yvalue.style.width = "59px";
  yvalue.type = "number";
  yvalue.step = .1;
  yvalue.value = cp[1];
  yvalue.onchange = function() {
    fiber.setControlPoint(index, 'y', Number(this.value));
    phantom.cpHighlight(guiStatus.editingFiber, index, 'blue');
  }
  ypos.appendChild(yvalue);
  position.appendChild(ypos);

  var zpos = document.createElement("LI");
  var zposlabel = document.createElement("LABEL");
  zposlabel.innerHTML = "z ";
  zpos.appendChild(zposlabel);
  var zvalue = document.createElement("INPUT");
  zvalue.id = 'zvalue';
  zvalue.style.width = "55px";
  zvalue.type = "number";
  zvalue.step = .1;
  zvalue.value = cp[2];
  zvalue.onchange = function() {
    fiber.setControlPoint(index, 'z', Number(this.value));
    phantom.cpHighlight(guiStatus.editingFiber, index, 'blue');
  }
  zpos.appendChild(zvalue);
  position.appendChild(zpos);
}
