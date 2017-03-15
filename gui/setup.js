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
        guiStatus.unediting();
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
        guiStatus.unediting();
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
