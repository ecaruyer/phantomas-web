// Add element buttons are only available when no element is being edited
function editExit() {
  var editGUI = document.getElementById('editGUI');
  editGUI.innerHTML = ""


  var newfiberbutton = document.createElement("BUTTON");
  newfiberbutton.style.float = "right";
  newfiberbutton.innerHTML = "New Fiber";
  newfiberbutton.onclick = function() { newFiberClick() };

  var newregionbutton = document.createElement("BUTTON");
  newregionbutton.style.float = "right";
  newregionbutton.innerHTML = "New Region";
  newregionbutton.onclick = function() { newIsotropicRegionClick() };

  // As style is float, must be appended from right to left
  editGUI.appendChild(newregionbutton);
  editGUI.appendChild(newfiberbutton);
}

function optionOnMouseOver(option) {
  if (option.className == 'optionSelected') {
    option.className = 'optionSelectedAndOnMouseOver';
  } else {
    option.className = 'optionOnMouseOver';
  }
}
function removeOnMouseOver() {
  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");
  var fiberoptions = Array.from(fiberSelector.childNodes);
  var regionoptions = Array.from(regionSelector.childNodes);

  fiberoptions.forEach( function( element ) {
    if (element.className == 'optionOnMouseOver') {
      element.className = 'optionUnselected';
    } else if (element.className == 'optionSelectedAndOnMouseOver'){
      element.className = 'optionSelected';
    }
  });
  regionoptions.forEach( function( element ) {
    if (element.className == 'optionOnMouseOver') {
      element.className = 'optionUnselected';
    } else if (element.className == 'optionSelectedAndOnMouseOver'){
      element.className = 'optionSelected';
    }
  });
}
function optionSelect(option) {
  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");
  var fiberoptions = Array.from(fiberSelector.childNodes);
  var regionoptions = Array.from(regionSelector.childNodes);

  fiberoptions.forEach( function( element ) {
    element.className = 'optionUnselected';
  });
  regionoptions.forEach( function( element ) {
    element.className = 'optionUnselected';
  });

  option.className = 'optionSelectedAndOnMouseOver'
  if (option.parentNode == fiberSelector) {
    regionoptions[0].className = 'optionSelected';
  } else {
    fiberoptions[0].className = 'optionSelected';
  }
}

function selectOption(list, number) {
  var options = Array.from(list.childNodes);
  optionSelect(options[number]);
}
