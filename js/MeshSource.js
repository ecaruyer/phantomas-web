/* FiberSkeleton creates 3D representation of control points and fiber path
  from a given fiber.
  Subject-Observer pattern must be enabled and fired from subject with .refresh();
  Input: fiber - FiberSource object.
         parameters object (not compulsory):
          .color
          .lineSegments
          .sphereSegments

  Main properties:
    .line - the thread representing the path. Ready for scene.add.
    .spheres - the mesh of all the spheres representing the control points.
          ready for scene.add.

  Other properties:
    .fiber - The fiber from which the representation constructed (FiberSource)
    .lineSegments - The amount of length segments in which the fiber is divided
        for representation. By default, 256.
    .sphereSegments - The amount of segments each controlpoint sphere will have
    .color - color of the thread

  Methods:
    .refresh() - Updates meshes after fiber change. No input no output.

*/
function FiberSkeleton(fiber, parameters) {
  this.fiber = fiber;
  this.points = fiber.controlPoints;

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
  discretePoints = new Float32Array(3*this.lineSegments+3);
  for (var i = 0; i <= this.lineSegments; i++) {
    discretePoints.set([fiber.interpolate(i/this.lineSegments)[0][0],
                         fiber.interpolate(i/this.lineSegments)[0][1],
                         fiber.interpolate(i/this.lineSegments)[0][2]], 3*i);
  }
  // Create trajectory
  var trajectory = new THREE.BufferGeometry();
  trajectory.addAttribute('position', new THREE.BufferAttribute(discretePoints, 3));
  // Create thread material
  var thread = new THREE.LineBasicMaterial({ color:this.color, linewidth: 1 });
  // / Build line
  this.line = new THREE.Line(trajectory, thread);

  // Create sphere mesh for controlPoints
  // sphere is the prototype sphere
  var sphere = new THREE.SphereGeometry(fiber.radius/5, this.sphereSegments, this.sphereSegments);
  var sphereGeometry = new THREE.Geometry();
  // All spheres to be added are meshed in one single geometry
  var meshes = [];
  for (var i = 0; i < this.points.length; i++) {
    meshes[i] = new THREE.Mesh(sphere);
    meshes[i].position.set(this.points[i][0], this.points[i][1], this.points[i][2]);
    meshes[i].updateMatrix();
    sphereGeometry.merge(meshes[i].geometry, meshes[i].matrix);
  }
  var surface = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  // Build spheres mesh
  this.spheres = new THREE.Mesh(sphereGeometry, surface);
}

FiberSkeleton.prototype.refresh = function() {
  // Spheres mesh must be built again
  var sphere = new THREE.SphereGeometry(this.fiber.radius/5, this.sphereSegments, this.sphereSegments);
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
  var discretePoints = new Float32Array(3*this.lineSegments+3);
  for (var i = 0; i <= this.lineSegments; i++) {
    discretePoints.set([this.fiber.interpolate(i/this.lineSegments)[0][0],
                         this.fiber.interpolate(i/this.lineSegments)[0][1],
                         this.fiber.interpolate(i/this.lineSegments)[0][2]], 3*i);
  }
  var trajectory = new THREE.BufferGeometry();
  trajectory.addAttribute('position', new THREE.BufferAttribute(discretePoints, 3));
  this.line.geometry = trajectory;
  // Line color is to be kept
  this.line.material.color = this.color;
}


/* FiberTube creates a 3D representation of a given fiber in a tubular form
 of given radius.
 Subject-Observer pattern must be enabled and fired from subject with .refresh();
 Inputs: fiber - FiberSource object.
           parameters object (not compulsory):
            .color
            .axialSegments
            .radialSegments


 Main properties:
   .mesh - the mesh of the fiber Ready for scene.add.

 Other properties:
   .fiber - The fiber from which the representation constructed (FiberSource)
   .curve - THREE.Curve object used for representation
   .axialSegments and .radialSegments: The segments that make up the tube in
      each dimension. Default is 256 and 64.
   .color - color of the tube

  Methods:
   .refresh() - Updates mesh after fiber change. No input no output.
 */
function FiberTube(fiber, parameters) {
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
  this.curve = Object.create(THREE.Curve.prototype);
  // .getPoint must be part of curve object
  this.curve.getPoint = function(t) {
      var tx = fiber.interpolate(t)[0][0];
      var ty = fiber.interpolate(t)[0][1];
      var tz = fiber.interpolate(t)[0][2];
  return new THREE.Vector3(tx, ty, tz);
  }
  // Geometry and materials are created
  var geometry = new THREE.TubeGeometry(this.curve,
                        this.axialSegments , radius, this.radialSegments);
  var material = new THREE.MeshPhongMaterial( { color:this.color, shading: THREE.FlatShading } );
  // Transparency must be enabled so to be able to fade the tube
  material.transparent = true;
  // Double side is needed so a tube appareance is acquired
  material.side = THREE.DoubleSide;
  this.mesh = new THREE.Mesh(geometry, material);
}
FiberTube.prototype.refresh = function() {
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

  var geometry = new THREE.SphereGeometry( source.radius, this.widthSegments, this.heightSegments );
  var material = new THREE.MeshPhongMaterial( { color:this.color, shading: THREE.FlatShading } );
  // Transparency must be enabled so to be able to fade the tube
  material.transparent = true;
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.set(source.center[0], source.center[1], source.center[2]);
}
IsotropicRegion.prototype.refresh = function() {
    this.mesh.geometry = new THREE.SphereGeometry( this.source.radius, this.widthSegments, this.heightSegments );
    this.mesh.position.set(this.source.center[0], this.source.center[1], this.source.center[2]);
}
