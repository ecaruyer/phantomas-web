/**@overview Contains functions regarding the fiber edition GUI.*/

function fiberEdit(index) {
  /** @function fiberEdit
   * @memberof module:GUI Construction
   * @param {Number} index The index in the array of the fiber to edit.
   * @desc Adds the fiber edition GUI.
   */
  scene.removeCPHighlight(true);

  // editGUI is emptied
  var editGUI = document.getElementById('editGUI');
  editGUI.innerHTML = "";
  editGUI.style = "list-style-type: none";

  // REMOVE BUTTON
  var removebutton = document.createElement("BUTTON");
  removebutton.style.float = "right";
  removebutton.innerHTML = "Remove Fiber";
  removebutton.id = "removebutton";
  removebutton.title = "Remove Fiber (Del)"
  removebutton.className = "w3-btn w3-hover-red w3-border w3-border-white"
  removebutton.onclick = function() {
    removeFiberClick()
  };
  editGUI.appendChild(removebutton);
  editGUI.appendChild(document.createElement("BR"));
  editGUI.appendChild(document.createElement("BR"));

  // PROPERTY FIELD
  var field = document.createElement("FIELDSET");
  editGUI.appendChild(field);
  var fiberprops = document.createElement("UL");

  // NUMBER OF CONTROL POINTS AND COLOR
  var controlPointsAndColor = document.createElement("LEGEND");
  var colorSpan = document.createElement("span");
  colorSpan.style.color = phantom.fibers.tube[index].color.getStyle();
  colorSpan.style.fontSize = 'x-large';
  colorSpan.innerHTML = '&#9632;&nbsp;&nbsp;';

  var controlPointsSpan = document.createElement("span");
  controlPointsSpan.id = 'guiFiberTitle';
  var nameInput = document.createElement("INPUT");
  nameInput.type = 'text';
  nameInput.value = phantom.fibers.source[index].name;
  nameInput.className = "nameField";
  // Disable key bindings when writing
  nameInput.onkeyup = function(event) {
    event.stopPropagation();
  };
  nameInput.onchange = function() {
    phantom.fibers.source[index].name = this.value;
    document.getElementById('fiberSelector').childNodes[index + 1].childNodes[1].innerHTML = this.value;
  };

  controlPointsSpan.appendChild(nameInput);
  controlPointsAndColor.appendChild(colorSpan);
  controlPointsAndColor.appendChild(controlPointsSpan);

  field.appendChild(controlPointsAndColor);

  // LENGTH
  var length = document.createElement("LI");
  var lengthspan = document.createElement("SPAN");
  length.appendChild(lengthspan);

  lengthspan.id = "guiFiberLength";
  lengthspan.innerHTML = Math.floor(phantom.fibers.source[index].length * 10) / 10;

  length.innerHTML += " units long";
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
  radiusvalue.step = Math.pow(10, -precision);
  radiusvalue.value = phantom.fibers.source[index].radius;
  radiusvalue.onchange = function() {
    this.value = roundToPrecision(Math.max(1 / (10 * precision), Math.abs(this.value))); //Radius cannot be negative, must be at least precision value.
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
  tangents.style.margin = '3px';
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
  editGUI.appendChild(document.createElement("BR"));

  field.appendChild(fiberprops);

  addCPselect();
}

// This is a separate function so it may be refreshed independently
function addCPselect() {
  /** @function addCPselect
    * @memberof module:GUI Construction
    * @desc Adds the control point selector UI for the current fiber.
    <br>Built in a separate function so it may be refreshed independently.
    */

  var editGUI = document.getElementById('editGUI');

  // Control Points edition table creation.
  var table = document.createElement("TABLE");
  table.id = 'cpTable';
  // This creates a of the former CP to be used for the Undo Button.
  phantom.fibers.source[guiStatus.editingFiber].controlPoints.slice(0);
  editGUI.appendChild(table);
  // This table contains two cells: left for CP select list and right for edit field (when editing)
  var tr = document.createElement("TR");
  table.appendChild(tr);
  var td1 = document.createElement("TD");
  tr.appendChild(td1);
  var td2 = document.createElement("TD");
  tr.appendChild(td2);
  td2.id = "cpEditor";

  // CONTROL POINTS SELECTION LIST
  var cplist = document.createElement("UL");
  cplist.className = 'enabledList';
  var fiberindex = guiStatus.editingFiber;
  // cplist.size = phantom.fibers.source[fiberindex].controlPoints.length + 1;
  cplist.id = 'cpSelector';
  cplist.style.width = '60px'
  cplist.onmouseenter = function() {
    if (cplist.childNodes[0].className == 'optionUnselected') {
      scene.removeCPHighlight();
      cpEdit(guiStatus.editingCP);
    } else {
      scene.removeCPHighlight(true);
    }
  };
  cplist.onmouseleave = function() {
    guiStatus.retrieve();
  }

  // *n* option
  var option = document.createElement("LI");
  option.innerHTML = '*n*'
  option.title = "Exit edit (Esc)"
  option.className = 'optionSelected';
  option.onmouseenter = function() {
    optionOnMouseOver(this);
  }
  option.onmouseleave = function() {
    optionOnMouseLeave(this);
  }
  option.onclick = function() {
    exitCPedit();
    optionSelect(this);
  };
  cplist.appendChild(option);

  // Each CP option
  phantom.fibers.source[fiberindex].controlPoints.forEach(
    function(point, index) {
      var option = document.createElement("LI");
      option.innerHTML = index.toString();
      option.className = 'optionUnselected';

      option.onmouseenter = function() {
        phantom.cpHighlight(fiberindex, index, 'blue');
        optionOnMouseOver(this);
      };
      option.onmouseleave = function() {
        optionOnMouseLeave(this);
      };
      option.onclick = function() {
        cpSelectClick(fiberindex, index);
        optionSelect(this);
      };

      cplist.appendChild(option);
    }
  );
  td1.appendChild(cplist);

  resizeGUI();
}
