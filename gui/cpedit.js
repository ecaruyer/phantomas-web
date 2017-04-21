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
    phantom.cpHighlight(guiStatus.editingFiber, index, 'green');
    document.getElementById('guiFiberLength').innerHTML = roundToPrecision(phantom.fibers.source[guiStatus.editingFiber].length);
    undobutton.disabled = false;
  }

  var xpos = document.createElement("LI");
  var xposlabel = document.createElement("LABEL");
  xposlabel.innerHTML = "x ";
  xpos.appendChild(xposlabel);
  var xvalue = document.createElement("INPUT");
  xvalue.id = 'xvalue';
  xvalue.style.width = "65px";
  xvalue.type = "number";
  xvalue.step = Math.pow(10, -precision);;
  xvalue.value = cp[0];
  xvalue.onchange = function() {
    this.value = roundToPrecision(this.value);
    cpValueOnChange(index, 'x', this.value);
  };
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
  yvalue.step = Math.pow(10, -precision);
  yvalue.value = cp[1];
  yvalue.onchange = function() {
    this.value = roundToPrecision(this.value);
    cpValueOnChange(index, 'y', this.value);
  };
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
  zvalue.step = Math.pow(10, -precision);
  zvalue.value = cp[2];
  zvalue.onchange = function() {
    this.value = roundToPrecision(this.value);
    cpValueOnChange(index, 'z', this.value);
  };
  zpos.appendChild(zvalue);
  position.appendChild(zpos);

  // Buttons under position selectors
  var buttons = document.createElement("LI");
  position.appendChild(buttons);
  buttons.innerHTML = "&nbsp;&nbsp;&nbsp;"

  var ddbutton = document.createElement("BUTTON");
  ddbutton.id = 'ddbutton';
  ddbutton.className = 'w3-btn w3-hover-yellow w3-border w3-border-white w3-small w3-ripple'
  ddbutton.tile = "Drag and Drop point to edit it";
  ddbutton.innerHTML = '<i class="icons">&#xE901;</i>';
  ddbutton.onclick = function() {
    if (!this.active) {
      this.active = true;
      this.className = 'w3-btn w3-yellow w3-hover-khaki w3-border w3-ripple w3-small';
      xvalue.disabled = true;
      yvalue.disabled = true;
      zvalue.disabled = true;
      xvalue.onchange();
      dragAndDrop();
    } else {
      this.active = false;
      this.className = 'w3-btn w3-hover-yellow w3-border w3-border-white w3-small w3-ripple'
      xvalue.disabled = false;
      yvalue.disabled = false;
      zvalue.disabled = false;
      scene.remove(control);
      render();
    }
  }
  buttons.appendChild(ddbutton);


  var undobutton = document.createElement("BUTTON");
  undobutton.id = 'cpUndoButton';
  undobutton.tile = "Undo (U)";
  undobutton.className = 'w3-btn w3-hover-blue w3-border w3-border-white w3-small'
  undobutton.style = 'margin-bottom: 10px';
  undobutton.innerHTML = '<i class="icons">&#xE900;</i>';
  // If nothing to undo, button is disabled. If something to, bluepoint of editing is shown.
  if (
    former[0] == Number(xvalue.value) &&
    former[1] == Number(yvalue.value) &&
    former[2] == Number(zvalue.value)
  ) {
    undobutton.disabled = true;
  } else {
    phantom.cpHighlight(guiStatus.editingFiber, index, 'green');
  }

  // guiStatus.former created earlier is recovered when undoing.
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

  // ADD+REMOVE
  buttons.appendChild(document.createElement("BR"));

  var newcpbutton = document.createElement("BUTTON");
  newcpbutton.style.float = "right";
  newcpbutton.className = 'w3-btn w3-hover-green w3-border w3-border-white w3-small w3-ripple'
  newcpbutton.innerHTML = "New CP";
  newcpbutton.onmouseenter = function() { newCPonmouseover(guiStatus.editingFiber, guiStatus.editingCP); };
  newcpbutton.onmouseleave = function() { newCPonmouseout(guiStatus.editingFiber, guiStatus.editingCP);  }
  newcpbutton.onclick = function() { newCPclick(guiStatus.editingFiber, guiStatus.editingCP); }

  var removecpbutton = document.createElement("BUTTON");
  removecpbutton.style.float = "right";
  removecpbutton.className = 'w3-btn w3-hover-red w3-border w3-border-white w3-small w3-ripple'
  removecpbutton.innerHTML = "Remove CP";
  removecpbutton.id = 'removecpbutton';
  removecpbutton.title = "Remove CP (Del)"
  removecpbutton.onclick = function() { removeCPclick(guiStatus.editingFiber, guiStatus.editingCP); }

  // As style is float, must be appended from right to left
  if ((index != 0) & (index + 1 < fiber.controlPoints.length)) {
    buttons.appendChild(removecpbutton);
  }
  if (index + 1 < fiber.controlPoints.length) {
    buttons.appendChild(newcpbutton);
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
  scene.removeCPHighlight(true);
  guiStatus.editing('CP', undefined);

  addCPselect();
  resizeGUI();
}

function dragAndDrop() {
  control = new THREE.TransformControls(camera, renderer.domElement);
  scene.children.forEach(function(object) {
    if (object.isHighlight) {
      if (object.material.color.getHex() == 0x00FF00) {
        control.object = object;
      }
    }
  });

  control.addEventListener('change', function() {
    var pos = this.object.position;
    pos.x = roundToPrecision(pos.x);
    pos.y = roundToPrecision(pos.y);
    pos.z = roundToPrecision(pos.z);

    document.getElementById('xvalue').value = pos.x;
    document.getElementById('yvalue').value = pos.y;
    document.getElementById('zvalue').value = pos.z;
    render();
  });

  control.addEventListener('mouseUp', function() {
    var pos = this.object.position;
    phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'x', pos.x);
    phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'y', pos.y);
    phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'z', pos.z);
  })


  control.attach(control.object);
  scene.add(control);
  render();
}
