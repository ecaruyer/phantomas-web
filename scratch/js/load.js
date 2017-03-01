// loadFibers returns a FiberSource array of fibers contained in a JSON file.
function loadFibers( path ) {
  var request = new XMLHttpRequest();
  request.overrideMimeType("text/plain");
  request.open("get", path, false);
  request.send(null);
  // Only geometries are loaded for the moment
  var loaded = JSON.parse(request.response).fiber_geometries;

  // Return will be a FiberSource array for each fiber geometry.
  var fibers = [];
  for (var property in loaded) {
    if (loaded.hasOwnProperty(property)) {
      var fiber = loaded[property.toString()];
      // Control points need to be transleted to array-of-arrays form
      var newcp = [];
      for (var i = 0; i < fiber.control_points.length; i = i + 3) {
        newcp.push([fiber.control_points[i],
                    fiber.control_points[i+1],
                    fiber.control_points[i+2]]);
      }
      fibers.push(new FiberSource(newcp, fiber.tangents));
      fibers[fibers.length-1].radius = fiber.radius;
    }
  }
  // log an error in case fibers were not found.
  if (fibers.length == 0) console.error('Any fiber found in file'+path);
  return fibers;
}
