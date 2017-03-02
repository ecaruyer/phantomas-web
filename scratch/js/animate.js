// An example of how to use Three.js to display a tubular shape.
var mesh, renderer, scene, camera, directionalLight, controls;
init();
animate();

function render() {
  renderer.render(scene, camera);
}
function animate() {
  requestAnimationFrame( animate );
  controls.update();
}


// Generate N random points for constructing fiber. Points between [-1,10]
function randomPoints(N) {
  array = [];
  for (var i = 0; i < N; i++) {
    array[i] = [Math.floor(Math.random()*20-10),
                Math.floor(Math.random()*20-10),
                Math.floor(Math.random()*20-10)]
  }
  return array;
}

function init() {

  // The rendering engine is initialized
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // It is appended to the div container in the HTML5 tree
  document.getElementById('container').appendChild(renderer.domElement);
  var k=0;

  // We create a scene and a camera. Position is to be corrected further in the code.
  camera = new THREE.PerspectiveCamera(50,
                                       window.innerWidth / window.innerHeight,
                                       1,
                                       10000);
  camera.position.set(0, 0, 0);

  // Create, the scene and add cameras, lights.
  scene = new THREE.Scene();
  scene.add(camera);
  scene.add(new THREE.AmbientLight( 0xffffff, .5 ) );
  // Directional lights are added in all directions
  for (var x = -100; x <= 100; x=x+200) {
    for (var y = -100; y <= 100; y=y+200) {
      for (var z = -100; z <= 100; z=z+20) {
        var directionalLight = new THREE.DirectionalLight(0x555555, .15);
        directionalLight.position.x = x;
        directionalLight.position.y = y;
        directionalLight.position.z = z;
        scene.add(directionalLight);
      }
    }
  }
  var path = "examples/isbi_challenge_2013.txt";
  var fibers = loadFibers(path);
  for (var i = 0; i < fibers.length; i++) {
    var tube = new FiberTube(fibers[i], fibers[i].radius);
    if (camera.position.z/1.5 < fibers[i].length)
        camera.position.z = fibers[i].length*1.5;
    scene.add(tube.mesh);
  }
  var regions = loadRegions(path);
  for (var i = 0; i < regions.length; i++) {
    var region = new IsotropicRegion(regions[i]);
    scene.add(region.mesh);
  }

  renderer.render(scene, camera);

  // Add mouse control to the camera
  controls = new THREE.TrackballControls( camera );
  controls.enableZoom = true;
  controls.rotateSpeed = 2.5;
  controls.zoomSpeed = 1;
  controls.noPan=true;
  controls.addEventListener('change', render);
}
