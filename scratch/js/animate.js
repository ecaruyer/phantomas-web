// An example of how to use Three.js to display a tubular shape.
var points=[[-9,5,-6],[5,8,-4],[4,-2,8],[7,2,-5],[2,3,-9],[-7,-5,-2],[-1,9,2]];
var mesh, renderer, scene, camera;
init();


function render() {
  renderer.render(scene, camera);
}


function init(){
  // The rendering engine is initialized
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // It is appended to the div container in the HTML5 tree
  document.getElementById('container').appendChild(renderer.domElement);

  // We create a scene and a camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50,
                                       window.innerWidth / window.innerHeight,
                                       1,
                                       10000);
  camera.position.set(0, 0, 100);
  scene.add(camera);
  // scene.add(newFiber(points,4));
  scene=addFiberSkeleton(scene,points,5);

  // Lights
  scene.add(new THREE.AmbientLight( 0x888888 ) );
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random() - 0.5;
  directionalLight.position.z = Math.random() - 0.5;
  directionalLight.position.normalize();
  scene.add(directionalLight);

  // Where the scene is actually rendered
  renderer.render(scene, camera);

  // Add mouse control to the camera
  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.addEventListener('change', render);
  controls.enableZoom = true;
}
