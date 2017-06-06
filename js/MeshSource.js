/**@overview Contains Class definitions for {@link FiberSkeleton}, {@link FiberTube} and {@link IsotropicRegion}.*/

function FiberSkeleton(fiber, parameters) {
  /** @class FiberSkeleton
    * @classdesc FiberSkeleton creates 3D representation of control points and fiber path
      from a given fiber.<br>
      Subject-Observer pattern must be enabled from its {@link FiberSource} reference and fired from subject with {@link FiberSkeleton.refresh|refresh();}.
    * @property {THREE.Line} line The thread representing the path. Ready for {@link scene}.add.
    * @property {THREE.Mesh} spheres Big mesh containing all control-point marking spheres. Ready for {@link scene}.add.
    * @property {FiberSource} fiber Reference to source fiber object.
    * @property {THREE.Color} color Color of the thread.
    * @property {Number} sphereSegments Amount of segments (in each dimension) each controlpoint sphere will feature.
    * @property {Number} lineSegments Amount of segments the thread will feature.
    *
    * @param {FiberSource} fiber Reference fiber.
    * @param {Object} [parameters] Optional parameters
    * @param {Number} [parameters.lineSegments=256] Number of axial segments to feature in line's {@link FiberSkeleton}
    * @param {Number} [parameters.sphereSegments=32] Number of radial segments to feature in each control point of {@link FiberSkeleton}
    * @param {THREE.Color} [parameters.color] Color of the thread. If not specified, generated randomly from {@link colors}.
    */
  this.fiber = fiber;
  this.points = fiber.controlPoints; //Private property

  // Assign either specified parameters or default values
  if (!parameters) var parameters = [];
  if (parameters.color === undefined) {
    this.color = fiber.color;
  } else {
    this.color = parameters.color;
  }
  if (parameters.lineSegments === undefined) {
    this.lineSegments = 256;
  } else {
    this.lineSegments = parameters.lineSegments;
  }
  if (parameters.sphereSegments === undefined) {
    this.sphereSegments = 32;
  } else {
    this.sphereSegments = parameters.sphereSegments;
  }

  // Create line thread
  // Interpolate points for THREE.BufferAttribute needs
  discretePoints = new Float32Array(3 * this.lineSegments + 3);
  for (var i = 0; i <= this.lineSegments; i++) {
    discretePoints.set([fiber.interpolate(i / this.lineSegments)[0][0],
      fiber.interpolate(i / this.lineSegments)[0][1],
      fiber.interpolate(i / this.lineSegments)[0][2]
    ], 3 * i);
  }
  // Create trajectory
  var trajectory = new THREE.BufferGeometry();
  trajectory.addAttribute('position', new THREE.BufferAttribute(discretePoints, 3));
  // Create thread material
  var thread = new THREE.LineBasicMaterial({
    color: this.color,
    linewidth: 1
  });
  // / Build line
  this.line = new THREE.Line(trajectory, thread);

  // Create sphere mesh for controlPoints
  // sphere is the prototype sphere
  var sphere = new THREE.SphereGeometry(fiber.radius / 5, this.sphereSegments, this.sphereSegments);
  var sphereGeometry = new THREE.Geometry();
  // All spheres to be added are meshed in one single geometry
  var meshes = [];
  for (var i = 0; i < this.points.length; i++) {
    meshes[i] = new THREE.Mesh(sphere);
    meshes[i].position.set(this.points[i][0], this.points[i][1], this.points[i][2]);
    meshes[i].updateMatrix();
    sphereGeometry.merge(meshes[i].geometry, meshes[i].matrix);
  }
  var surface = new THREE.MeshBasicMaterial({
    color: 0xffff00
  });
  // Build spheres mesh
  this.spheres = new THREE.Mesh(sphereGeometry, surface);
}

FiberSkeleton.prototype.refresh = function() {
  /** @function refresh
   * @memberof FiberSkeleton
   * @desc Updates thread and spheres position from self properties. Must be fired when those change.
   */
  // Spheres mesh must be built again
  var sphere = new THREE.SphereGeometry(this.fiber.radius / 5, this.sphereSegments, this.sphereSegments);
  var sphereGeometry = new THREE.Geometry();
  var meshes = [];
  for (var i = 0; i < this.points.length; i++) {
    meshes[i] = new THREE.Mesh(sphere);
    meshes[i].position.set(this.points[i][0], this.points[i][1], this.points[i][2]);
    meshes[i].updateMatrix();
    sphereGeometry.merge(meshes[i].geometry, meshes[i].matrix);
  }
  this.spheres.geometry = sphereGeometry;

  // Thread trajectory must be built again as well
  var discretePoints = new Float32Array(3 * this.lineSegments + 3);
  for (var i = 0; i <= this.lineSegments; i++) {
    discretePoints.set([this.fiber.interpolate(i / this.lineSegments)[0][0],
      this.fiber.interpolate(i / this.lineSegments)[0][1],
      this.fiber.interpolate(i / this.lineSegments)[0][2]
    ], 3 * i);
  }
  var trajectory = new THREE.BufferGeometry();
  trajectory.addAttribute('position', new THREE.BufferAttribute(discretePoints, 3));
  this.line.geometry = trajectory;
  // Line color is to be kept
  this.line.material.color = this.color;
}

function FiberTube(fiber, parameters) {
  /** @class FiberTube
    * @classdesc FiberTube creates a 3D representation of a given fiber in a tubular shape
     of given radius.
    <br>Subject-Observer pattern must be enabled from its {@link FiberSource} reference and fired from subject with {@link FiberSkeleton.refresh|refresh();}.
    * @property {THREE.Mesh} mesh Mesh containing the fiber's tubular shape. Ready for {@link scene}.add.
    * @property {FiberSource} fiber Reference to source fiber object.
    * @property {THREE.Color} color Color of the tube.
    * @property {Number} axialSegments Amount of segments to feature in the tube mesh.
    * @property {Number} radialSegments Amount of radial segments to feature in the tube mesh.
    *
    * @param {FiberSource} fiber Reference fiber.
    * @param {Object} [parameters] Optional parameters
    * @param {Number} [parameters.axialSegments=256] Number of axial segments to feature in the tube mesh.
    * @param {Number} [parameters.radialSegments=64] Number of radial segments to feature in the tube mesh.
    * @param {THREE.Color} [parameters.color] Color of the thread. If not specified, generated randomly from {@link colors}.
    */

  this.fiber = fiber;
  // Check if radius was specified. If not, set default.
  if (this.fiber.radius === undefined) this.fiber.radius = 1;
  var radius = this.fiber.radius;
  // Assign either specified parameters or default values
  if (!parameters) var parameters = [];
  if (parameters.color === undefined) {
    this.color = fiber.color;
  } else {
    this.color = parameters.color;
  }
  if (parameters.axialSegments === undefined) {
    this.axialSegments = 256;
  } else {
    this.axialSegments = parameters.axialSegments;
  }
  if (parameters.radialSegments === undefined) {
    this.radialSegments = 64;
  } else {
    this.radialSegments = parameters.radialSegments;
  }

  //Curve is part of tube geometry
  this.curve = Object.create(THREE.Curve.prototype); //Private property
  // .getPoint must be part of curve object
  this.curve.getPoint = function(t) {
    var tx = fiber.interpolate(t)[0][0];
    var ty = fiber.interpolate(t)[0][1];
    var tz = fiber.interpolate(t)[0][2];
    return new THREE.Vector3(tx, ty, tz);
  }
  // Geometry and materials are created
  var geometry = new THREE.TubeGeometry(this.curve,
    this.axialSegments, radius, this.radialSegments);
  var material = new THREE.MeshPhongMaterial({
    color: this.color,
    shading: THREE.FlatShading
  });
  // Transparency must be enabled so to be able to fade the tube
  material.transparent = true;
  // Double side is needed so a tube appareance is acquired
  material.side = THREE.DoubleSide;
  this.mesh = new THREE.Mesh(geometry, material);
}
FiberTube.prototype.refresh = function() {
  /** @function refresh
   * @memberof FiberTube
   * @desc Updates tube shape and position from self properties. Must be fired when those change.
   */
  this.mesh.geometry = new THREE.TubeGeometry(this.curve,
    this.axialSegments, this.fiber.radius, this.radialSegments);
}

/* IsotropicRegion creates a mesh from an IsotropicRegionSource.
  Subject-Observer pattern must be enabled and fired from subject with .refresh();
  Input: source - IsotropicRegionSource
          parameters object (not compulsory):
           .color
           .widthSegments
           .heightSegments


  Main properties:
    .mesh - the mesh of the region ready for scene.add.

  Other properties:
    .source - The region from which the representation constructed (IsotropicRegionSource)
    .widthSegments and .heightSegments: The segments that make up the sphere in
       each dimension. Default is 128.
    .color - color of the sphere

   Methods:
    .refresh() - Updates mesh after source change. No input no output.
*/
function IsotropicRegion(source, parameters) {
  /** @class IsotropicRegion
    * @classdesc IsotropicRegion creates a 3D representation of an Isotropic Region.
    <br>Subject-Observer pattern must be enabled from its {@link FiberSource} reference and fired from subject with {@link FiberSkeleton.refresh|refresh();}.
    * @property {THREE.Mesh} mesh Mesh containing the Isotropic Region sphere. Ready for {@link scene}.add.
    * @property {IsotropicRegionSource} fiber Reference to source fiber object.
    * @property {THREE.Color} color Color of the sphere.
    * @property {Number} widthSegments Amount of width segments to feature in the sphere mesh.
    * @property {Number} heightSegments Amount of height segments to feature in the sphere mesh.
    *
    * @param {IsotropicRegionSource} source Reference Isotropic Region.
    * @param {Object} [parameters] Optional parameters
    * @param {Number} [parameters.widthSegments=128] Number of width segments to feature in the sphere mesh.
    * @param {Number} [parameters.heightSegments=128] Number of height segments to feature in the sphere mesh.
    * @param {THREE.Color} [parameters.color] Color of the thread. If not specified, generated randomly from {@link colors}.
    */

  this.source = source;

  // Assign either specified parameters or default values
  if (!parameters) var parameters = [];
  if (parameters.color === undefined) {
    this.color = source.color;
  } else {
    this.color = parameters.color;
  }
  if (parameters.widthSegments === undefined) {
    this.widthSegments = 128;
  } else {
    this.widthSegments = parameters.widthSegments;
  }
  if (parameters.heightSegments === undefined) {
    this.heightSegments = 128;
  } else {
    this.heightSegments = parameters.heightSegments;
  }

  var geometry = new THREE.SphereGeometry(source.radius, this.widthSegments, this.heightSegments);
  var material = new THREE.MeshPhongMaterial({
    color: this.color,
    shading: THREE.FlatShading
  });
  // Transparency must be enabled so to be able to fade the tube
  material.transparent = true;
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.set(source.center[0], source.center[1], source.center[2]);
}
IsotropicRegion.prototype.refresh = function() {
  /** @function refresh
   * @memberof IsotropicRegion
   * @desc Updates sphere position and radius from self properties. Must be fired when those change.
   */
  this.mesh.geometry = new THREE.SphereGeometry(this.source.radius, this.widthSegments, this.heightSegments);
  this.mesh.position.set(this.source.center[0], this.source.center[1], this.source.center[2]);
}
