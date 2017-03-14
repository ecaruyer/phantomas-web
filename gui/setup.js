var guiStatus;

function GuiStatus() {
  /* Using two properties:
    editingFiber -> fiber currently being edited
    editingCP -> CP of the fiber in current edition
    editingRegion -> region currently being edited.
  editingFiber and editingRegion must never be defined at the same time.

  Featuring three methods:
    editing, which recieves as input:
      element, with 'fiber', 'CP' or 'region' as string value.
      index, which specifies its index
    viewing, which removes any editing state. Constructor leaves status this way.
    retrieve, which brings back the state in which it the editor was
*/
    this.editingFiber = undefined;
    this.editingCP = undefined;
    this.editingRegion = undefined;
}
GuiStatus.prototype = {
  editing: function(element, index) {
    switch (element) {
      case 'fiber':
        this.viewing();
        this.editingFiber = index;
        break;
      case 'CP':
        if (this.editingFiber === undefined) {
          console.error('Tried to edit CP with any fiber in edit!');
          break;
        }
        this.editingCP = index;
        break;
      case 'region':
        this.viewing();
        this.editingRegion = index;
        break;
      default: console.error('Element string in status was not correct');
    }
  },
  retrieve: function() {
    if (this.editingFiber !== undefined) {
      fiberSelectClick(this.editingFiber, true);
      if (this.editingCP !== undefined) {
        cpSelectClick(this.editingCP)
      }
    } else if (this.editingRegion !== undefined) {
      regionSelectClick(this.editingRegion, true)
    } else {
      phantom.addToScene(scene);
    }
  },
  apply: function(element, index) {
    this.editing(element, index);
    this.retrieve();
  },
  viewing: function() {
    this.editingFiber = undefined;
    this.editingCP = undefined;
    this.editingRegion = undefined;
  }
}

function countDocumentLines() {
  function getLineHeight(element){
    var temp = document.createElement(element.nodeName);
    temp.setAttribute("style","margin:0px;padding:0px;font-family:"+element.style.fontFamily+";font-size:"+element.style.fontSize);
    temp.innerHTML = "test";
    temp = element.parentNode.appendChild(temp);
    var ret = temp.clientHeight;
    temp.parentNode.removeChild(temp);
    return ret;
  }
  var divHeight = document.getElementById('container').offsetHeight;
  var lineHeight = getLineHeight(document.getElementById('container'));
  var lines = divHeight / lineHeight;
  return lines;
}

function setupGUI() {
  resizeGUI();
  guiStatus =  new GuiStatus();

  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");

  if (phantom.fibers.source.length > 0) {
    // Add *none* option
    var option = document.createElement("option");
    option.text = '*none*'
    option.selected = true;
    // If any fiber is being edited, move to non-edit mode
    option.onclick = function() {
      if (guiStatus.editingRegion === undefined) {
        guiStatus.viewing();
        guiStatus.retrieve();
      };
    };
    fiberSelector.options.add(option);
    fiberSelector.disabled = false;

    // Add the rest of the options
    phantom.fibers.source.forEach( function(fiber, index) {
      var backgroundColor = phantom.fibers.tube[index].color;

      var option = document.createElement("option");
      var selectColorSpan = document.createElement("span");
      var selectTextSpan = document.createElement("span");
      selectColorSpan.style.color = backgroundColor.getStyle();
      selectColorSpan.innerHTML = '&#9632;&nbsp;';

      selectTextSpan.innerHTML = fiber.controlPoints.length.toString() + " points";

      option.appendChild(selectColorSpan);
      option.appendChild(selectTextSpan);

      option.onmouseover = function() {phantom.fiberHighlight(index);};
      option.onclick = function() {fiberSelectClick(index);};
      fiberSelector.options.add(option);
    });
  } else {
    fiberSelector.disabled = true;
  }

  if (phantom.isotropicRegions.source.length > 0) {
    // Add *none* option
    regionSelector.selectedIndex = 0;
    var option = document.createElement("option");
    option.text = '*none*'
    option.selected = true;
    // If any fiber is being edited, move to non-edit mode
    option.onclick = function() {
      if (guiStatus.editingFiber === undefined) {
        guiStatus.viewing();
        guiStatus.retrieve();
      };
    };
    regionSelector.options.add(option);
    regionSelector.disabled = false;

    // Add the rest of the options
    phantom.isotropicRegions.source.forEach( function(region, index) {
      var backgroundColor = phantom.isotropicRegions.sphere[index].color;

      var option = document.createElement("option");
      var selectColorSpan = document.createElement("span");
      var selectTextSpan = document.createElement("span");
      selectColorSpan.style.color = backgroundColor.getStyle();
      selectColorSpan.innerHTML = '&#9632;&nbsp;';

      selectTextSpan.innerHTML = "radius " + region.radius.toString();

      option.appendChild(selectColorSpan);
      option.appendChild(selectTextSpan);

      option.onmouseover = function() {phantom.regionHighlight(index);};
      option.onclick = function() {regionSelectClick(index);};
      regionSelector.options.add(option);
    });
  } else {
    regionSelector.disabled = true;
  }
}

// Resizes selector objects so those just take specified height percentage
function resizeGUI() {
  // Space is the height amount in screen heights that selector objects will take.
  var height = .6;

  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");

  var fiberNumber = phantom.fibers.source.length + 1;
  var regionNumber = phantom.isotropicRegions.source.length + 1;

  var maxsize = Math.floor( countDocumentLines() * height/2 );
  var minsize = 2;

  fiberSelector.size = Math.min(maxsize, Math.max(fiberNumber, minsize));
  regionSelector.size = Math.min(maxsize, Math.max(regionNumber, minsize));

  if ((fiberSelector.size + regionSelector.size) < maxsize * 2) {
    if (fiberNumber > fiberSelector.size) {
      fiberSelector.size = maxsize * 2 - regionSelector.size;
    }
    if (regionNumber > regionSelector.size) {
      regionSelector.size = maxsize * 2 - fiberSelector.size;
    }
  }
}
