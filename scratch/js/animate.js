// An example of how to use Three.js to display a tubular shape.
var mesh, renderer, scene, camera, directionalLight;
init();

function render() {
  renderer.render(scene, camera);
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

  // We create a scene and a camera
  camera = new THREE.PerspectiveCamera(50,
                                       window.innerWidth / window.innerHeight,
                                       1,
                                       10000);

  // Create, the scene and add cameras, lights.
  scene = new THREE.Scene();
  scene.add(camera);
  scene.add(new THREE.AmbientLight( 0x888888 ) );
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random() - 0.5;
  directionalLight.position.z = Math.random() - 0.5;
  directionalLight.position.normalize();
  scene.add(directionalLight);

  // Add the fiber and position camera
  var fiber = new FiberSource(randomPoints(4));
  var skeleton = new FiberSkeleton(fiber);
  scene.add(skeleton.line, skeleton.spheres)
  var tube = new FiberTube(fiber);
  // Timeout: In 5 secs from load, skeleton to turn into a tube fiber.
  setTimeout(function(){
    scene.add(tube.mesh);
    scene.remove(skeleton.spheres, skeleton.line)
    render()
  }, 5000);
  camera.position.set(0, 0, 40 * fiber.scale);

  renderer.render(scene, camera);

  // Add mouse control to the camera
  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.addEventListener('change', render);
  controls.enableZoom = true;
}
