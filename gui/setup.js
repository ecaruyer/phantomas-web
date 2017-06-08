/** @overview Contains basic GUI constructors.*/
/** @module GUI Construction */
/** @var {guiStatus} guiStatus
 * @desc Global variable indicating the current task the GUI is performing.
 */
var guiStatus;

function setupGUI() {
  /** @function setupGUI
    * @memberof module:GUI Construction
    * @desc Constructs basic-static GUI when no action has taken place yet.
    Defines {@link guiStatus} global variable.
    <br>Adds event listeners to window object for keyboard bindings.
    */
  guiStatus = new GuiStatus();
  resizeGUI();

  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");
  // Empty them - this function might be called for GUIupdating
  fiberSelector.innerHTML = "";
  regionSelector.innerHTML = "";

  if (phantom.fibers.source.length > 0) {
    // Add *none* option
    var option = document.createElement("LI");
    option.innerHTML = '*none*'
    option.title = "Exit edit (Esc)"
    option.className = 'optionSelected';
    // If any fiber is being edited, move to non-edit mode
    option.onclick = function() {
      if (guiStatus.editingRegion === undefined) {
        guiStatus.unediting();
        guiStatus.retrieve();
        optionSelect(this);
      };
      resizeGUI();
    };
    option.onmouseenter = function() {
      phantom.addToScene(scene);
      optionOnMouseOver(this);
    };
    option.onmouseleave = function() {
      optionOnMouseLeave(this);
    };
    fiberSelector.appendChild(option);
    fiberSelector.className = 'enabledList';

    // Add the rest of the options
    phantom.fibers.source.forEach(function(fiber, index) {
      var backgroundColor = fiber.color;

      var option = document.createElement("LI");
      var selectColorSpan = document.createElement("span");
      var selectTextSpan = document.createElement("span");
      selectColorSpan.style.color = backgroundColor.getStyle();
      selectColorSpan.innerHTML = '&#9632;&nbsp;';

      selectTextSpan.innerHTML = fiber.name;

      option.appendChild(selectColorSpan);
      option.appendChild(selectTextSpan);
      option.className = 'optionUnselected';

      option.onmouseenter = function() {
        phantom.fiberHighlight(index);
        optionOnMouseOver(this);
      };
      option.onmouseleave = function() {
        optionOnMouseLeave(this);
      };
      option.onclick = function() {
        fiberSelectClick(index);
        optionSelect(this)
      };
      fiberSelector.appendChild(option);
    });
  } else {
    var option = document.createElement("LI");
    option.innerHTML = '(any)';
    fiberSelector.appendChild(option);
    fiberSelector.className = 'disabledList';
  }

  if (phantom.isotropicRegions.source.length > 0) {
    // Add *none* option
    var option = document.createElement("LI");
    option.innerHTML = '*none*'
    option.title = "Exit edit (Esc)"
    option.className = 'optionSelected';
    // If any fiber is being edited, move to non-edit mode
    option.onclick = function() {
      if (guiStatus.editingFiber === undefined) {
        guiStatus.unediting();
        guiStatus.retrieve();
        optionSelect(this);
      };
      resizeGUI();
    };
    option.onmouseenter = function() {
      phantom.addToScene(scene);
      optionOnMouseOver(this);
    };
    option.onmouseleave = function() {
      optionOnMouseLeave(this);
    };
    regionSelector.appendChild(option);
    regionSelector.className = 'enabledList';

    // Add the rest of the options
    phantom.isotropicRegions.source.forEach(function(region, index) {
      var backgroundColor = region.color;

      var option = document.createElement("LI");
      option.className = 'optionUnselected';
      var selectColorSpan = document.createElement("span");
      var selectTextSpan = document.createElement("span");
      selectColorSpan.style.color = backgroundColor.getStyle();
      selectColorSpan.innerHTML = '&#9632;&nbsp;';

      selectTextSpan.innerHTML = region.name;

      option.appendChild(selectColorSpan);
      option.appendChild(selectTextSpan);

      option.onmouseover = function() {
        phantom.regionHighlight(index);
        optionOnMouseOver(this);
      };
      option.onmouseleave = function() {
        optionOnMouseLeave(this);
      };
      option.onclick = function() {
        regionSelectClick(index);
        optionSelect(this)
      };
      regionSelector.appendChild(option);
    });
  } else {
    // var option = document.createElement("LI");
    regionSelector.innerHTML = '(any)'
    // regionSelector.appendChild(option);
    regionSelector.className = 'disabledList';
  }

  // Add keyboard shortcuts
  window.addEventListener('keyup', function(e) {
    if (document.hasFocus()) { //Prevents events from firing when not being focused on the app
      switch (e.keyCode) {
        case 27: //Esc
          if (guiStatus.editingFiber + 1) {
            if (guiStatus.editingCP + 1) {
              document.getElementById('cpSelector').childNodes[0].onclick();
              optionOnMouseLeave(document.getElementById('cpSelector').childNodes[0]);
            } else {
              fiberSelector.childNodes[0].onclick();
              optionOnMouseLeave(fiberSelector.childNodes[0]);
            }
          }
          if (guiStatus.editingRegion + 1) {
            regionSelector.childNodes[0].onclick();
            optionOnMouseLeave(regionSelector.childNodes[0]);
          }
          break;
        case 80: //P
          if (guiStatus.editingFiber | guiStatus.editingRegion) {
            switchViewButton();
          }
          break;
        case 65: //A
          toggleAxes();
          break;
        case 88: //X
          moveCameraZY();
          break;
        case 89: //Y
          moveCameraXZ();
          break;
        case 90: //Z
          moveCameraXY();
          break;
        case 83: //S
          saveClick();
          break;
        case 87: //W
          document.getElementById('skeletonButton').onclick();
          break;
        case 68: //D
          if (document.getElementById('ddbutton')) { //If does not exist, won't fire.
            document.getElementById('ddbutton').onclick();
          }
          break;
        case 46: //Del
          if (guiStatus.editingFiber + 1) {
            if (guiStatus.editingCP + 1) {
              if (document.getElementById('removecpbutton')) { //If does not exist, won't fire.
                document.getElementById('removecpbutton').onclick();
              }
            } else {
              removeFiberClick();
            }
          } else if (guiStatus.editingRegion + 1) {
            removeIsotropicRegionClick();
          }
          break;
        case 85: //U
          if (document.getElementById('cpUndoButton')) {
            if (!document.getElementById('cpUndoButton').disabled) {
              document.getElementById('cpUndoButton').click();
            }
          }
      }
    }
  });

  document.getElementById('opacitySelector').value = phantom.highlightOpacity * 100;
  editExit();
}

// Add element buttons are only available when no element is being edited
function editExit() {
  /** @function editExit
   * @memberof module:GUI Construction
   * @desc Removes any edition UI. Adds new element buttons.
   */
  scene.remove(dragAndDrop); //In case of being present
  var editGUI = document.getElementById('editGUI');
  editGUI.innerHTML = ""


  var newfiberbutton = document.createElement("BUTTON");
  newfiberbutton.style.float = "right";
  newfiberbutton.innerHTML = "New Fiber";
  newfiberbutton.className = "w3-btn w3-hover-green w3-border w3-border-white"
  newfiberbutton.onclick = function() {
    newFiberClick()
  };

  var newregionbutton = document.createElement("BUTTON");
  newregionbutton.style.float = "right";
  newregionbutton.innerHTML = "New Region";
  newregionbutton.className = "w3-btn w3-hover-green w3-border w3-border-white"
  newregionbutton.onclick = function() {
    newIsotropicRegionClick()
  };

  // As style is float, must be appended from right to left
  editGUI.appendChild(newregionbutton);
  editGUI.appendChild(newfiberbutton);
}
