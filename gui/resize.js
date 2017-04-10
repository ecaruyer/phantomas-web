/**@overview Contains resizeGUI() function*/
/**@module GUI Managers*/

// Resizes selector objects so those fit in the screen
function resizeGUI() {
/** @function resizeGUI
  * @memberof module:GUI Managers
  * @desc Resizes element selector lists so those just take the amount of space
  left in the screen. This avoids overflows and maintains the page size same as
  the window size.
  <br>Called when elements are added or removed and when window is resized.
  */
  
  // PRIVATE FUNCTION Returns amout of window height in text lines
  function countDocumentLines() {
    // From http://stackoverflow.com/questions/4392868/javascript-find-divs-line-height-not-css-property-but-actual-line-height
    function getLineHeight(element){
      var temp = document.createElement(element.nodeName);
      temp.setAttribute("style","margin:0px;padding:0px;font-family:"+element.style.fontFamily+";font-size:"+element.style.fontSize);
      temp.innerHTML = "test";
      temp = element.parentNode.appendChild(temp);
      var ret = temp.clientHeight;
      temp.parentNode.removeChild(temp);
      return ret;
    }
    var divHeight = window.innerHeight;
    var lineHeight = getLineHeight(document.getElementById('leftGUI'));
    var lines = Math.floor(divHeight / lineHeight);
    return lines;
  }

  // Lines is the height amount in lines left for the gui elements.
  var lines = countDocumentLines() - 9;
  var leftGUI = document.getElementById("leftGUI");
  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");

  // Width is subtracted 10 pixels for allowing space to scrollbar.
  fiberSelector.style.width = (leftGUI.offsetWidth - 15).toString() + 'px';
  regionSelector.style.width = (leftGUI.offsetWidth - 15).toString() + 'px';

  // The resizable elements are selectors. We subtract space taken by other gui elements if those are present.
  if (guiStatus.editingFiber !== undefined) {
    lines -= 12 + Math.max(phantom.fibers.source[guiStatus.editingFiber].controlPoints.length + 1, 12);
    var cpEditor = document.getElementById("cpEditor");
    cpEditor.style.width = (leftGUI.offsetWidth - 65).toString() + 'px';
  } else if (guiStatus.editingRegion !== undefined) {
    lines -= 16;
  }

  // +1 is due to *none* option.
  var fiberNumber = (phantom.fibers.source.length + 1)
  var regionNumber = (phantom.isotropicRegions.source.length + 1)

  var minsize = 3;

  // Final size to be between total number of elements (no select scroll) and minsize
  // 1.2 factor is due to line height correction
  fiberSelector.style.height = (Math.min( Math.max(lines - regionNumber, minsize), fiberNumber) * 1.2).toString() + 'em';
  regionSelector.style.height = (Math.min( Math.max(lines - fiberNumber, minsize), regionNumber) * 1.2).toString() + 'em';
}
