// An example of how to use Three.js to display a tubular shape.
var mesh, renderer, scene, camera, directionalLight, controls, phantom;
init();
animate();

function render() {
  renderer.render(scene, camera);
}
function animate() {
  requestAnimationFrame( animate );
  controls.update();
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

  // Load phantom and add it in the scene
  phantom = loadPhantom("examples/3Dfanning_13bundles.txt");
  phantom.highlightopacity = .2;
  phantom.addToScene(scene);
  camera.position.z = phantom.radius()*1.5;

  renderer.render(scene, camera);

  // KeyPress consecution loop for features show.
  var presscount = 0;
  keypress = function() {
    if (presscount/2 < phantom.fibers.source.length) {
      if (presscount % 2 == 0) {
        phantom.addToScene(scene);
        phantom.fiberhighlight(presscount/2);
        presscount++;
      }
      else {
        phantom.addToScene(scene);
        phantom.revealskeleton(scene, (presscount-1)/2);
        presscount++;
      }
    }
    else if (presscount/2-phantom.fibers.source.length < phantom.isotropicregions.source.length) {
      phantom.addToScene(scene);
      phantom.regionhighlight(presscount/2-phantom.fibers.source.length);
      presscount+=2;
    }
    else if (presscount/2-phantom.fibers.source.length == phantom.isotropicregions.source.length) {
      scene.removephantom();
      phantom.addAsSkeleton(scene)
      presscount++;
    }
    else {
      scene.removephantom();
      phantom.addToScene(scene);
      phantom.unfadeAll();
      presscount = 0;
    }
  }
  window.addEventListener('keypress', keypress);

  // Add mouse control to the camera
  controls = new THREE.TrackballControls( camera );
  controls.enableZoom = true;
  controls.rotateSpeed = 2.5;
  controls.zoomSpeed = 1;
  controls.noPan=true;
  controls.addEventListener('change', render);
}
