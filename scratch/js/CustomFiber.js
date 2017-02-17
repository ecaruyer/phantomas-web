// colors is a color library for random color generation in representations
colors = [0xFF1E00, 0xFFB300, 0x1533AD, 0x00BF32, 0xBF4030,
          0xBF9430, 0x2C3D82, 0x248F40, 0xA61300, 0xA67400,
          0x071C71, 0x007C21, 0xFF5640, 0xFFC640, 0x4965D6,
          0x38DF64, 0xFF8373, 0xFFD573, 0x6F83D6, 0x64DF85,
          0xFF5600, 0xFF7C00, 0x04859D, 0x00AA72, 0x60D4AE,
          0xBF6030, 0xBF7630, 0x206876, 0x207F60, 0x5FBDCE,
          0xA63800, 0xA65100, 0x015666, 0x006E4A, 0xFFB773,
          0xFF8040, 0xFF9D40, 0x37B6CE, 0x35D4A0, 0xFFA273];

/* FiberSkeleton creates 3D representation of control points and fiber path
  from a given fiber.
  Input: fiber - FiberSource object.

  Main properties:
    .line - the thread representing the path. Ready for scene.add.
    .spheres - the mesh of all the spheres representing the control points.
          ready for scene.add.

  Other properties:
    .fiber - The fiber from which the representation constructed (FiberSource)
    .segments - The amount of length segments in which the fiber is divided
        for representation. By default, 1.5 times the length of the fiber.
*/
function FiberSkeleton(fiber) {
  this.fiber = fiber;
  points = fiber.control_points;
  this.segments = Math.floor(fiber.length*1.5);
  discrete_points = new Float32Array(3*this.segments+3);
  for (var i = 0; i <= this.segments; i++) {
    discrete_points.set([fiber.interpolate(i/this.segments)[0][0],
                         fiber.interpolate(i/this.segments)[0][1],
                         fiber.interpolate(i/this.segments)[0][2]], 3*i);
  }
  var trajectory = new THREE.BufferGeometry();
  trajectory.addAttribute('position',
              new THREE.BufferAttribute(discrete_points, 3));
  var thread = new THREE.LineBasicMaterial(
    { color:colors[Math.floor(Math.random()*colors.length)], linewidth: 1 } );
  this.line = new THREE.Line(trajectory, thread);

  var sphere = new THREE.SphereGeometry( .4 * fiber.scale, 32, 32 );
  var sphereGeometry = new THREE.Geometry();
  var meshes = [];
  for (var i = 0; i < points.length; i++) {
    meshes[i] = new THREE.Mesh(sphere);
    meshes[i].position.set(points[i][0] * fiber.scale,
              points[i][1] * fiber.scale, points[i][2] * fiber.scale);
    meshes[i].updateMatrix();
    sphereGeometry.merge(meshes[i].geometry, meshes[i].matrix);
  }
  var surface = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  this.spheres = new THREE.Mesh(sphereGeometry, surface);
}
FiberSkeleton.prototype.constructor = FiberSkeleton;

/* FiberTube creates a 3D representation of a given fiber in a tubular form
 of given radius.
 Inputs: fiber - FiberSource object.
         radius - scalar. By default, .5 (recommended radius for scale=1)

 Main properties:
   .mesh - the mesh of the fiber Ready for scene.add.

 Other properties:
   .fiber - The fiber from which the representation constructed (FiberSource)
   .curve - THREE.Curve object used for representation
   .segments - Array of two scalars:
            [0]: The amount of length segments in which the fiber is divided
              for representation. By default, 3 times the length of the fiber.
            [1]: The amount of radius segments in which the tube is divided
              for representation. By default, 64.
 */
function FiberTube(fiber, radius) {
  this.fiber = fiber;
  this.curve = Object.create(THREE.Curve.prototype);
  this.curve.getPoint = function(t) {
      var tx = fiber.interpolate(t)[0][0];
      var ty = fiber.interpolate(t)[0][1];
      var tz = fiber.interpolate(t)[0][2];
  return new THREE.Vector3(tx, ty, tz);
  }
  this.segments = [Math.floor(fiber.length*3), 64];
  if (radius === undefined) {
    radius = .5;
  }
  this.radius = radius;
  var geometry = new THREE.TubeGeometry(this.curve,
                            this.segments[0], this.radius, this.segments[1]);
  var material = new THREE.MeshPhongMaterial(
    { color:colors[Math.floor(Math.random()*colors.length)],
                                                shading: THREE.FlatShading } );
  this.mesh = new THREE.Mesh(geometry, material);
}
FiberSkeleton.prototype.constructor = FiberTube;
