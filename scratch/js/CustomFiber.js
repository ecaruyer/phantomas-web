colors = [0xFF1E00, 0xFFB300, 0x1533AD, 0x00BF32, 0xBF4030,
          0xBF9430, 0x2C3D82, 0x248F40, 0xA61300, 0xA67400,
          0x071C71, 0x007C21, 0xFF5640, 0xFFC640, 0x4965D6,
          0x38DF64, 0xFF8373, 0xFFD573, 0x6F83D6, 0x64DF85,
          0xFF5600, 0xFF7C00, 0x04859D, 0x00AA72, 0x60D4AE,
          0xBF6030, 0xBF7630, 0x206876, 0x207F60, 0x5FBDCE,
          0xA63800, 0xA65100, 0x015666, 0x006E4A, 0xFFB773,
          0xFF8040, 0xFF9D40, 0x37B6CE, 0x35D4A0, 0xFFA273];

// Declaration of object Fiber
function Fiber(points,scale,radius,tangents){
  this.points=points;
  this.scale = (scale === undefined) ? 1 : scale;
  this.radius = (radius === undefined) ? 2 : radius;
  this.path = new FiberSource(points,tangents,scale);
  this.color = colors[Math.floor(Math.random()*colors.length)];
  this.segments = Math.floor(this.path.length*1.5);
}

Fiber.prototype = Object.create(THREE.Curve.prototype);
Fiber.prototype.constructor = Fiber;

Fiber.prototype.getPoint = function(t) {
  var tx = this.path.interpolate([t])[0][0]
  var ty = this.path.interpolate([t])[0][1]
  var tz = this.path.interpolate([t])[0][2]
  return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
};
// end of declaration of Fiber

/* skeletonFiber adds to the scene a line displaying the fiber's skeleton
   with visual control points as spheres.*/
function addFiberSkeleton(scene,points,scale,tangents) {
  var path = new FiberSource(points,tangents,scale);
  segments=Math.floor(path.length*1.5); console.log(path.interpolate([.5]));
  discrete_points=new Float32Array(3*segments+3);
  for (var i = 0; i <= segments; i++) {
    discrete_points.set([path.interpolate([i/segments])[0][0],
                         path.interpolate([i/segments])[0][1],
                         path.interpolate([i/segments])[0][2]],3*i);
  };
  var trajectory = new THREE.BufferGeometry(path);
  trajectory.addAttribute('position',new THREE.BufferAttribute(discrete_points,3));
  var thread = new THREE.LineBasicMaterial( { color:colors[Math.floor(Math.random()*colors.length)]
                                               ,linewidth: 1 } );
  var line = new THREE.Line(trajectory, thread);
  scene.add(line)

  var geometry = new THREE.SphereGeometry( .5, 32, 32 );
  var surface = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  var spheres=[];
  for (var i = 0; i < points.length; i++) {
    // sphere.position = new THREE.Vector3(points[i][0],points[i][1],points[i][2]);
    spheres[i] = new THREE.Mesh( geometry,surface );
    spheres[i].position.set(points[i][0],points[i][1],points[i][2]);
    scene.add(spheres[i]);
  }
  return scene;
}

// newFiber returns a mesh displaying the fiber in a tubular form
function newFiberMesh(points,scale,radius,tangents) {
  var path = new Fiber(points,scale,radius,tangents);
  var geometry = new THREE.TubeGeometry(path,path.segments,path.radius,path.radius*16);
  var material = new THREE.MeshPhongMaterial( { color:path.color,
                                                shading: THREE.FlatShading } );
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
