/**@overview Code creating and removing the Control Point edition UI*/

function cpEdit(index) {
  /** @function cpEdit
   * @memberof module:GUI Construction
   * @desc Constructs the Control Point edition UI for a given index of a control point.
   * @param {Number} index The index of the Control Point to edit.
   */
  var fiber = phantom.fibers.source[guiStatus.editingFiber];
  var cp = fiber.controlPoints[index];
  var former = guiStatus.formerCP;
  var cpEditor = document.getElementById("cpEditor");

  // The edit field is appended to the second CPedit table
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

  // Called on each CP position selector
  function cpValueOnChange(index, axis, value) {
    fiber.setControlPoint(index, axis, Number(value));
    // scene.removeCPHighlight();
    phantom.cpHighlight(guiStatus.editingFiber, index, 'green');
    document.getElementById('guiFiberLength').innerHTML = roundToPrecision(fiber.length);
    undobutton.disabled = false;
    if (guiStatus.dragAndDropping) {
      dragAndDrop();
    }
  }

  var xpos = document.createElement("LI");
  var xposlabel = document.createElement("LABEL");
  xposlabel.innerHTML = "x ";
  xpos.appendChild(xposlabel);
  var xvalue = document.createElement("INPUT");
  xvalue.id = 'xvalue';
  xvalue.className = "w3-input w3-border field";
  xvalue.style.width = "65px";
  xvalue.style.marginTop = xvalue.style.marginBottom = "2px";
  xvalue.type = "number";
  xvalue.step = Math.pow(10, -precision);;
  xvalue.value = cp[0];
  xvalue.onchange = function() {
    this.value = roundToPrecision(this.value);
    cpValueOnChange(index, 'x', this.value);
  };
  xvalue.onkeyup = function(event) {
    event.stopPropagation();
    if (event.keyCode == 13) {
      this.blur();
    }
  };
  xpos.appendChild(xvalue);
  position.appendChild(xpos);

  var ypos = document.createElement("LI");
  var yposlabel = document.createElement("LABEL");
  yposlabel.innerHTML = "y ";
  ypos.appendChild(yposlabel);
  var yvalue = document.createElement("INPUT");
  yvalue.id = 'yvalue';
  yvalue.className = "w3-input w3-border field";
  yvalue.style.width = "65px";
  yvalue.style.marginTop = yvalue.style.marginBottom = "2px";
  yvalue.type = "number";
  yvalue.step = Math.pow(10, -precision);
  yvalue.value = cp[1];
  yvalue.onchange = function() {
    this.value = roundToPrecision(this.value);
    cpValueOnChange(index, 'y', this.value);
  };
  yvalue.onkeyup = xvalue.onkeyup;
  ypos.appendChild(yvalue);
  position.appendChild(ypos);

  var zpos = document.createElement("LI");
  var zposlabel = document.createElement("LABEL");
  zposlabel.innerHTML = "z ";
  zpos.appendChild(zposlabel);
  var zvalue = document.createElement("INPUT");
  zvalue.id = 'zvalue';
  zvalue.className = "w3-input w3-border field";
  zvalue.style.width = "65px";
  zvalue.style.marginTop = zvalue.style.marginBottom = "2px";
  zvalue.type = "number";
  zvalue.step = Math.pow(10, -precision);
  zvalue.value = cp[2];
  zvalue.onchange = function() {
    this.value = roundToPrecision(this.value);
    cpValueOnChange(index, 'z', this.value);
  };
  zvalue.onkeyup = xvalue.onkeyup;
  zpos.appendChild(zvalue);
  position.appendChild(zpos);

  // Buttons under position selectors
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
    undobutton.disabled = false;
    if (!guiStatus.dragAndDropping) {
      guiStatus.dragAndDropping = true;
      this.className = 'w3-btn w3-yellow w3-hover-khaki w3-border w3-ripple w3-small';
      dragAndDrop();
    } else {
      guiStatus.dragAndDropping = false;
      this.className = 'w3-btn w3-hover-yellow w3-border w3-border-white w3-small w3-ripple'
      xvalue.disabled = false;
      yvalue.disabled = false;
      zvalue.disabled = false;
      scene.removeControls();
    }
  }
  buttons.appendChild(ddbutton);


  var undobutton = document.createElement("BUTTON");
  undobutton.id = 'cpUndoButton';
  undobutton.tile = "Undo (U)";
  undobutton.className = 'w3-btn w3-hover-blue w3-border-top w3-border-bottom w3-border-right w3-border-white w3-small'
  undobutton.style = ddbutton.style;
  undobutton.innerHTML = '<i class="icons">&#xE900;</i>';
  // If nothing to undo, button is disabled. If something to, greenpoint of editing is shown.
  if (
    former[0] == Number(xvalue.value) &&
    former[1] == Number(yvalue.value) &&
    former[2] == Number(zvalue.value)
  ) {
    undobutton.disabled = true;
  }

  // guiStatus.former created earlier is recovered when undoing.
  undobutton.onclick = function() {
    scene.removeControls();

    xvalue.value = former[0];
    xvalue.onchange();
    yvalue.value = former[1];
    yvalue.onchange();
    zvalue.value = former[2];
    zvalue.onchange();

    if (guiStatus.dragAndDropping) {
      dragAndDrop();
    } else {
      this.disabled = true;
    }
  }
  buttons.appendChild(undobutton);

  // ADD+REMOVE
  buttons.appendChild(document.createElement("BR"));

  var newcpbutton = document.createElement("BUTTON");
  newcpbutton.style.float = "right";
  newcpbutton.className = 'w3-btn w3-hover-green w3-border w3-border-white w3-small w3-ripple'
  newcpbutton.innerHTML = "New CP";
  newcpbutton.onmouseenter = function() {
    newCPonmouseover(guiStatus.editingFiber, guiStatus.editingCP);
  };
  newcpbutton.onmouseleave = function() {
    fiber = newCPonmouseout(guiStatus.editingFiber, guiStatus.editingCP);
  } // It is necessary to renovate the reference
  newcpbutton.onclick = function() {
    newCPclick(guiStatus.editingFiber, guiStatus.editingCP);
  }


  var removecpbutton = document.createElement("BUTTON");
  removecpbutton.style.float = "right";
  removecpbutton.className = 'w3-btn w3-hover-red w3-border-top w3-border-bottom w3-border-right w3-border-white w3-small w3-ripple'
  removecpbutton.innerHTML = "Remove CP";
  removecpbutton.id = 'removecpbutton';
  removecpbutton.title = "Remove CP (Del)"
  removecpbutton.onclick = function() {
    removeCPclick(guiStatus.editingFiber, guiStatus.editingCP);
  }

  // As style is float, must be appended from right to left
  buttons.appendChild(removecpbutton);
  buttons.appendChild(newcpbutton);

  if (!((index != 0) & (index + 1 < fiber.controlPoints.length))) {
    removecpbutton.disabled = true;
  }
  if (!(index + 1 < fiber.controlPoints.length)) {
    newcpbutton.disabled = true;
  }
}

// Removes the whole CP edit field and creates a new one (except the CP edit field). Useful when attempting to refresh.
function exitCPedit() {
  /** @function exitCPedit
    * @memberof module:GUI Construction
    * @desc Removes former Control Point edition UI.
    <br>Restores {@link guiStatus}.
    */
  var editGUI = document.getElementById('editGUI');
  var cpTable = document.getElementById("cpTable");

  editGUI.removeChild(cpTable);
  scene.removeControls();
  scene.removeCPHighlight(true);
  guiStatus.editing('CP', undefined);

  addCPselect();
  resizeGUI();
}
