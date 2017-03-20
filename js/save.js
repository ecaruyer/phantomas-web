ParsableFiber = function(control_points, tangents, radius) {
  this.control_points = control_points;
  this.tangents = tangents;
  this.radius = Number(radius);
}
ParsableRegion = function(center, radius) {
  this.center = center;
  this.radius = Number(radius);
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

    var tangents = source.tangents;
    var radius = source.radius;

    var parsable_fiber = new ParsableFiber(control_points, tangents, radius);
    var parsed_fiber = JSON.stringify(parsable_fiber);
    parsable_phantom.fiber_geometries[index.toString()] = parsed_fiber;
  });

  this.isotropicRegions.source.forEach( function(source, index) {
    var parsable_region = new ParsableRegion(source.center, source.radius);

    var parsed_region = JSON.stringify(parsable_region);
    parsable_phantom.isotropic_regions[index.toString()] = parsed_region;
  });

  var parsed_phantom = JSON.stringify(parsable_phantom);

  return parsed_phantom;
}

// From http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
pushDownload = function(content) {
  console.log(content);
  var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
  var newWindow = window.open(uriContent, 'phantom.txt');
}
