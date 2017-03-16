// Returns amout of window height in text lines
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
  var lines = Math.floor(divHeight / lineHeight);
  return lines;
}


// Resizes selector objects so those fit in the screen
function resizeGUI() {
  // Lines is the height amount in lines left for the gui elements.
  var lines = countDocumentLines() - 5;
  var leftGUI = document.getElementById("leftGUI");
  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");

  // The resizable elements are selectors. We subtract space taken by other gui elements if those are present.
  // added 1 to editing properties so that when 0 those do not return false
  if (guiStatus.editingFiber + 1) {
    lines -= 12 + Math.max(phantom.fibers.source[guiStatus.editingFiber].controlPoints.length + 1, 7);
    // cpSelector must be resized as well. If it is to be created, it will not be available and will resize by itself.
    if (document.getElementById('cpSelector')) document.getElementById('cpSelector').style.width = (leftGUI.offsetWidth - 10).toString() + 'px';
  } else if (guiStatus.editingRegion + 1) {
    lines -= 14;
  }


  // Width is subtracted 10 pixels for allowing space to scrollbar.
  fiberSelector.style.width = (leftGUI.offsetWidth - 10).toString() + 'px';
  regionSelector.style.width = (leftGUI.offsetWidth - 10).toString() + 'px';

  // +1 is due to *none* option
  var fiberNumber = phantom.fibers.source.length + 1;
  var regionNumber = phantom.isotropicRegions.source.length + 1;

  var minsize = 3;

  fiberSelector.size = Math.min( Math.max(lines - regionNumber, minsize), fiberNumber);
  regionSelector.size = Math.min( Math.max(lines - fiberNumber, minsize), regionNumber);

}
