// loadFibers returns a FiberSource array of fibers contained in a JSON file.
function loadPhantom( path ) {
  var request = new XMLHttpRequest();
  request.overrideMimeType("text/plain");
  request.open("get", path, false);
  request.send(null);

  var phantom = new Phantom();
  var loadedfibers = JSON.parse(request.response).fiber_geometries;
  var loadedregions = JSON.parse(request.response).isotropic_regions;

  // Objects will be added in Phantom
  for (var property in loadedfibers) {
    if (loadedfibers.hasOwnProperty(property)) {
      var fiber = loadedfibers[property.toString()];
      // Control points need to be transleted to array-of-arrays form
      var newcp = [];
      for (var i = 0; i < fiber.control_points.length; i = i + 3) {
        newcp.push([fiber.control_points[i],
                    fiber.control_points[i+1],
                    fiber.control_points[i+2]]);
      }
      phantom.AddFiber(new FiberSource(newcp, fiber.tangents, fiber.radius));
    }
  }
  for (var property in loadedregions) {
    if (loadedregions.hasOwnProperty(property)) {
      var region = loadedregions[property.toString()];
      phantom.AddIsotropicRegion(new IsotropicRegionSource(region.center, region.radius));
    }
  }

  // log an error in case fibers or regions were not found.
  if (phantom.isotropicregions.source.length == 0) console.warn('Any region found in file '+path);
  if (phantom.fibers.source.length == 0) console.warn('Any fiber found in file '+path);
  return phantom;
}
