function cpEdit(index) {
  var fiber = phantom.fibers.source[guiStatus.editingFiber];
  var cp = fiber.controlPoints[index];
  var former = guiStatus.formerCP;
  var cpEditor = document.getElementById("cpEditor");

  var field = document.createElement("FIELDSET");
  field.id = "cpEditField";
  cpEditor.innerHTML = "";
  cpEditor.appendChild(field);

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
  xvalue.style.width = "65px";
  xvalue.type = "number";
  xvalue.step = .1;
  xvalue.value = cp[0];
  xvalue.onchange = function() {cpValueOnChange(index, 'x', this.value)};
  xpos.appendChild(xvalue);
  position.appendChild(xpos);

  var ypos = document.createElement("LI");
  var yposlabel = document.createElement("LABEL");
  yposlabel.innerHTML = "y ";
  ypos.appendChild(yposlabel);
  var yvalue = document.createElement("INPUT");
  yvalue.id = 'yvalue';
  yvalue.style.width = "65px";
  yvalue.type = "number";
  yvalue.step = .1;
  yvalue.value = cp[1];
  yvalue.onchange = function() {cpValueOnChange(index, 'y', this.value)};
  ypos.appendChild(yvalue);
  position.appendChild(ypos);

  var zpos = document.createElement("LI");
  var zposlabel = document.createElement("LABEL");
  zposlabel.innerHTML = "z ";
  zpos.appendChild(zposlabel);
  var zvalue = document.createElement("INPUT");
  zvalue.id = 'zvalue';
  zvalue.style.width = "65px";
  zvalue.type = "number";
  zvalue.step = .1;
  zvalue.value = cp[2];
  zvalue.onchange = function() {cpValueOnChange(index, 'z', this.value)};
  zpos.appendChild(zvalue);
  position.appendChild(zpos);

  var buttons = document.createElement("LI");
  buttons.style.textAlign = 'right';
  position.appendChild(buttons);

  var undobutton = document.createElement("BUTTON");
  undobutton.innerHTML = "Undo";
  if (
    former[0] == Number(xvalue.value) &&
    former[1] == Number(yvalue.value) &&
    former[2] == Number(zvalue.value)
  ) {
    undobutton.disabled = true;
  } else {
    phantom.cpHighlight(guiStatus.editingFiber, index, 'blue');
  }

  undobutton.onclick = function() {
    cpValueOnChange(index, 'x', former[0]);
    xvalue.value = former[0];
    cpValueOnChange(index, 'y', former[1]);
    yvalue.value = former[1];
    cpValueOnChange(index, 'z', former[2]);
    zvalue.value = former[2];

    scene.removeCPHighlight();
    this.disabled = true;
  }
  buttons.appendChild(undobutton);

  function cpValueOnChange(index, axis, value) {
    fiber.setControlPoint(index, axis, Number(value));
    phantom.cpHighlight(guiStatus.editingFiber, index, 'blue');
    document.getElementById('fiberLength').innerHTML = Math.floor(phantom.fibers.source[guiStatus.editingFiber].length * 10) / 10;
    undobutton.disabled = false;
  }
}

function exitCPedit() {
  var editGUI = document.getElementById('editGUI');
  var cpTable = document.getElementById("cpTable");

  editGUI.removeChild(cpTable);
  scene.removeCPHighlight(true);
  guiStatus.editing('CP', undefined);

  addCPselect();
  resizeGUI();
}
