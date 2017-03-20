ParsableFiber = function(control_points, tangents, radius, color) {
  this.control_points = control_points;
  this.tangents = tangents;
  this.radius = Number(radius);
  this.color = Number(color.getHex());
}
ParsableRegion = function(center, radius, color) {
  this.center = center;
  this.radius = Number(radius);
  this.color = Number(color.getHex());
}


Phantom.prototype.export = function() {
  var parsable_phantom = new Object;
  parsable_phantom.fiber_geometries = new Object;
  parsable_phantom.isotropic_regions = new Object;

  this.fibers.source.forEach( function(source, index) {
    var control_points = [];
    source.controlPoints.forEach( function(cp) {
      cp.forEach( function(element){
        control_points.push(element);
      });
    });

    var parsable_fiber = new ParsableFiber(control_points, source.tangents, source.radius, source.color);
    parsable_phantom.fiber_geometries[index.toString()] = parsable_fiber;
  });

  this.isotropicRegions.source.forEach( function(source, index) {
    var parsable_region = new ParsableRegion(source.center, source.radius, source.color);
    parsable_phantom.isotropic_regions[index.toString()] = parsable_region;
  });

  // null,2 automatically indents json file
  var parsed_phantom = JSON.stringify(parsable_phantom, null, 2);

  return parsed_phantom;
}

// From http://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
pushDownload = function(content) {
  var uriContent = "data:text/json;charset=utf-8," + encodeURIComponent(content);
  var dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute("href", uriContent);
  dlAnchorElem.setAttribute("download", "phantom_save.json");
  dlAnchorElem.click();
}
