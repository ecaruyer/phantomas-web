// Checks if there is any line in the scene (any fiber in skeleton mode)
function checkSkeleton() {
  var skeleton = false;
  scene.children.forEach( function(object){
    if (object.type == "Line") {
      skeleton = true;
    }
  });
  return skeleton;
}

// SWITCH VIEW BUTTON
// Swithes 'preview mode' which will allow the user to display the phantom in unfaded mode while editing
function switchViewButton() {
  var button = document.getElementById('switchViewButton');
  if (!guiStatus.previewing) {
    phantom.addToScene(scene);
    button.value = "Back";
    guiStatus.previewing = true;
  } else {
    guiStatus.previewing = false;
    guiStatus.retrieve();
    button.value = "Preview";
  }
}

// disable booleans must be true when the user does not click directly the option.
// This saves resources by not rebuilding editingGUI and does not reclick selectors, which would be annoying.
function fiberSelectClick(index, notclicked) {
  guiStatus.editing('fiber', index);
  if (!notclicked) {
    document.getElementById("regionSelector").selectedIndex = 0;
    fiberEdit(index);
  }
  phantom.revealSkeleton(scene, index);
}
function regionSelectClick(index, notclicked) {
  guiStatus.editing('region', index);
  if (!notclicked) {
    document.getElementById("fiberSelector").selectedIndex = 0;
    regionEdit(index);
  }
  phantom.addToScene(scene);
  phantom.regionHighlight(index);
}


// PLANE SELECTORS
function moveCameraXY() {
  camera.up = new THREE.Vector3(0, 1, 0);
  controls.target = new THREE.Vector3(0, 0, 0);
  // if (camera.position.z == phantom.radius()*1.5) {
    camera.position.set(0, 0, 0);
    camera.position.z = phantom.radius()*1.5;
  // }
  // else {
  //   camera.position.set(0, 0, 0);
  //   camera.position.z = phantom.radius()*1.5;
  // }
}
function moveCameraXZ() {
  camera.up = new THREE.Vector3(0, 0, 1);
  controls.target = new THREE.Vector3(0, 0, 0);
  // if (camera.position.y == phantom.radius()*1.5) {
    camera.position.set(0, 0, 0);
    camera.position.y = phantom.radius()*-1.5;
  // }
  // else {
  //   camera.position.set(0, 0, 0);
  //   camera.position.y = phantom.radius()*-1.5;
  // }
}
function moveCameraZY() {
  camera.up = new THREE.Vector3(0, 1, 0);
  controls.target = new THREE.Vector3(0, 0, 0);
  // if (camera.position.x == phantom.radius()*1.5) {
    camera.position.set(0, 0, 0);
    camera.position.x = phantom.radius()*-1.5;
  // }
  // else {
  //   camera.position.set(0, 0, 0);
  //   camera.position.x = phantom.radius()*-1.5;
  // }
}
