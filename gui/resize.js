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


// Resizes selector objects so those just take specified height percentage
function resizeGUI() {
  // Space is the height amount in screen heights that selector objects will take.
  var lines = countDocumentLines() - 5;

  if (guiStatus.editingFiber + 1) {
    lines -= 10;
  } else if (guiStatus.editingRegion + 1) {
    lines -= 14;
  }

  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");
  var leftGUI = document.getElementById("leftGUI");

  fiberSelector.style.width = (leftGUI.offsetWidth - 10).toString() + 'px';
  regionSelector.style.width = (leftGUI.offsetWidth - 10).toString() + 'px';

  var fiberNumber = phantom.fibers.source.length + 1;
  var regionNumber = phantom.isotropicRegions.source.length + 1;

  var minsize = 3;

  fiberSelector.size = Math.min( Math.max(lines - regionNumber, minsize), fiberNumber);
  regionSelector.size = Math.min( Math.max(lines - fiberNumber, minsize), regionNumber);

}
