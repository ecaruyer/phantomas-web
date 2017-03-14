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
function switchFiberViewMode() {
  if (checkSkeleton()) {
    phantom.addToScene(scene);
  }
  else {
    phantom.addAsSkeleton(scene);
  }
}

// disable booleans must be true when the user does not click directly the option
function fiberSelectClick(index, notclicked) {
  if (!notclicked) {
    document.getElementById("regionSelector").selectedIndex = 0;
    fiberEdit(index);
  }
  phantom.revealSkeleton(scene, index);
  guiStatus.editing('fiber', index);
}
function regionSelectClick(index, disableFiberSelect) {
  if (!disableFiberSelect) {document.getElementById("fiberSelector").selectedIndex = 0;}
  phantom.addToScene(scene);
  phantom.regionHighlight(index, .05);
  guiStatus.editing('region', index);
}


// PLANE SELECTORS
function moveCameraXY() {
  camera.up = new THREE.Vector3(0, 1, 0);
  controls.target = new THREE.Vector3(0, 0, 0);
  if (camera.position.z == phantom.radius()*1.5) {
    camera.position.set(0, 0, 0);
    camera.position.z = phantom.radius()*-1.5;
  }
  else {
    camera.position.set(0, 0, 0);
    camera.position.z = phantom.radius()*1.5;
  }
}
function moveCameraXZ() {
  camera.up = new THREE.Vector3(0, 0, 1);
  controls.target = new THREE.Vector3(0, 0, 0);
  if (camera.position.y == phantom.radius()*1.5) {
    camera.position.set(0, 0, 0);
    camera.position.y = phantom.radius()*-1.5;
  }
  else {
    camera.position.set(0, 0, 0);
    camera.position.y = phantom.radius()*1.5;
  }
}
function moveCameraYZ() {
  camera.up = new THREE.Vector3(0, 1, 0);
  controls.target = new THREE.Vector3(0, 0, 0);
  if (camera.position.x == phantom.radius()*1.5) {
    camera.position.set(0, 0, 0);
    camera.position.x = phantom.radius()*-1.5;
  }
  else {
    camera.position.set(0, 0, 0);
    camera.position.x = phantom.radius()*1.5;
  }
}
