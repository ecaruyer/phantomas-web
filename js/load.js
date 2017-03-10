// loadFibers returns a FiberSource array of fibers contained in a JSON file.
function loadPhantom( request ) {
  var phantom = new Phantom();
  var loadedFibers = JSON.parse(request.response).fiber_geometries;
  var loadedRegions = JSON.parse(request.response).isotropic_regions;
  // Send number of elements as parameters to addFiber and addIsotropicRegion
  nbLoads = 0;
  if (loadedFibers) nbLoads += Object.keys(loadedFibers).length;
  if (loadedRegions) nbLoads += Object.keys(loadedRegions).length;
  var parameters = {
    nbElements: nbLoads
  };

  // Objects will be added in Phantom
  for (var property in loadedFibers) {
    if (loadedFibers.hasOwnProperty(property)) {
      var fiber = loadedFibers[property.toString()];
      // Control points need to be transleted to array-of-arrays form
      var newcp = [];
      for (var i = 0; i < fiber.control_points.length; i = i + 3) {
        newcp.push([fiber.control_points[i],
                    fiber.control_points[i+1],
                    fiber.control_points[i+2]]);
      }
      phantom.addFiber(new FiberSource(newcp, fiber.tangents, fiber.radius), parameters);
    }
  }
  for (var property in loadedRegions) {
    if (loadedRegions.hasOwnProperty(property)) {
      var region = loadedRegions[property.toString()];
      phantom.addIsotropicRegion(new IsotropicRegionSource(region.center, region.radius), parameters);
    }
  }

  // log an error in case fibers or regions were not found.
  if (phantom.isotropicRegions.source.length == 0) console.warn('Any region found in file '+path);
  if (phantom.fibers.source.length == 0) console.warn('Any fiber found in file '+path);
  return phantom;
}
