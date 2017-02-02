// An example of how to use Three.js to display a tubular shape.

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
  
  // We create a line and a tubular mesh around that centerline
  var path = new CustomSinCurve(10);
  var geometry = new THREE.TubeGeometry(path, 50, 2, 16, false);
  var material = new THREE.MeshPhongMaterial( { color:0xffffff, 
                                                shading: THREE.FlatShading } );
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);


  // Lights
  scene.add(new THREE.AmbientLight( 0x111111 ) );
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.125);
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
