var request, mesh, renderer, scene, camera, directionalLight, controls, phantom;
var path = "examples/60crossing_3bundles.txt";

init();


function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame( animate );
  controls.update();
}

function init() {
  request = new XMLHttpRequest();
  request.overrideMimeType("text/plain");
  request.open("get", path, true);
  request.onreadystatechange = function() {
    if ( (request.readyState === 4) && (request.status === 200) ) {
      show();
      setupGUI();
      }
    };
  request.send(null);
}

function show() { // The rendering engine is initialized
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

  // Load phantom and add it in the scene
  phantom = loadPhantom( request );
  phantom.highlightOpacity = .2;
  phantom.addToScene(scene);
  camera.position.z = phantom.radius()*1.5;

  renderer.render(scene, camera);

  // KeyPress consecution loop for features show.

  // Add mouse control to the camera
  controls = new THREE.TrackballControls( camera );
  controls.enableZoom = true;
  controls.rotateSpeed = 2.5;
  controls.zoomSpeed = 1;
  controls.noPan = true;
  controls.addEventListener('change', render);

  window.addEventListener( 'resize', onWindowResize, false );
  function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  }
  animate();
}
