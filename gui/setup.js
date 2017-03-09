function setupGUI() {
  var fiberSelector = document.getElementById("fiberSelector");
  phantom.fibers.source.forEach( function(fiber, index) {
    var backgroundColor = phantom.fibers.tube[index].color;
    var textColor = backgroundColor.clone();
    var hsl = textColor.getHSL();
    textColor.setHSL(((hsl.h*360 + 90) % 360)/360, hsl.s, .2);

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

  var regionSelector = document.getElementById("regionSelector");
  phantom.isotropicRegions.source.forEach( function(region, index) {
    var backgroundColor = phantom.isotropicRegions.sphere[index].color;
    var textColor = backgroundColor.clone();
    var hsl = textColor.getHSL();
    textColor.setHSL(((hsl.h*360 + 90) % 360)/360, hsl.s, .2);

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
}
