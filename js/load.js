/** @function loadPhantom
 * @desc Loads a Phantom contained in a JSON file and puts it into the scene.<br>
 * Contains all the functions necessary to translate Phantomas' JSON structure
 * to {@link FiberSource} parameters.
 * @param {String} string
 * The string containing the parsed phantom variable.
 * @return {Phantom} The phantom ready to be added to the scene.
 */
function loadPhantom(string) {
  var phantom = new Phantom();
  var loadedFibers = JSON.parse(string).fiber_geometries;
  var loadedRegions = JSON.parse(string).isotropic_regions;
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
        newcp.push([roundToPrecision(fiber.control_points[i]),
          roundToPrecision(fiber.control_points[i + 1]),
          roundToPrecision(fiber.control_points[i + 2])
        ]);
      }
      phantom.addFiber(new FiberSource(newcp, fiber.tangents, roundToPrecision(fiber.radius), fiber.color), parameters);
    }
  }
  for (var property in loadedRegions) {
    if (loadedRegions.hasOwnProperty(property)) {
      var region = loadedRegions[property.toString()];
      phantom.addIsotropicRegion(new IsotropicRegionSource(region.center, roundToPrecision(region.radius), region.color), parameters);
    }
  }

  // log an error in case fibers or regions were not found.
  if (phantom.isotropicRegions.source.length == 0) console.warn('Any region found in file');
  if (phantom.fibers.source.length == 0) console.warn('Any fiber found in file');
  return phantom;
}
