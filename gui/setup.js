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
  if (phantom.fibers.source.length > 0) {
    var fiberSelector = document.getElementById("fiberSelector");
    phantom.fibers.source.forEach( function(fiber, index) {
      var backgroundColor = phantom.fibers.tube[index].color;
      if (backgroundColor.getHSL().l > 0.4) {
        var textColor = new THREE.Color(0x000000);
      } else {
        var textColor = new THREE.Color(0xFFFFFF);
      }
      
      var string = '\n<option style="background-color:';
      string += backgroundColor.getStyle();
      string +='; color:'
      string += textColor.getStyle();
      string +='" onmouseover="phantom.fiberHighlight(';
      string += index.toString();
      string += ');">';
      string += index.toString();
      string += ': ';
      string += fiber.controlPoints.length.toString();
      string += ' Points</option>\n';
      fiberSelector.innerHTML += string;
    });
  } else {
    fiberSelector.innerHTML = '<option>(any)</option>';
  }

  var regionSelector = document.getElementById("regionSelector");
  if (phantom.isotropicRegions.source.length > 0) {
    phantom.isotropicRegions.source.forEach( function(region, index) {
      var backgroundColor = phantom.isotropicRegions.sphere[index].color;
      if (backgroundColor.getHSL().l > 0.4) {
        var textColor = new THREE.Color(0x000000);
      } else {
        var textColor = new THREE.Color(0xFFFFFF);
      }

      var string = '\n<option style="background-color:';
      string += backgroundColor.getStyle();
      string +='; color:'
      string += textColor.getStyle();
      string += '" onmouseover="phantom.regionHighlight(';
      string += index.toString();
      string += ');">';
      string += index.toString();
      string += ': ';
      string += region.center.toString();
      string += '</option>\n';
      regionSelector.innerHTML += string;
    });
  } else {
    regionSelector.innerHTML = '<option>(any)</option>';
  }
}

// Resizes selector objects so those just take specified height percentage
function resizeGUI() {
  // Space is the height amount in screen heights that selector objects will take.
  var height = .6;

  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");

  var fiberNumber = phantom.fibers.source.length;
  var regionNumber = phantom.isotropicRegions.source.length;

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
