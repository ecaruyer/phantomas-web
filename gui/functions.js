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


// FIBER OPTION SELECTOR
function fiberSelectOnMouseOut() {
  if (checkSkeleton()) {
    phantom.fadeAll();
  }
  else {
    phantom.unfadeAll();
  }
}

// PLANE SELECTORS
function moveCameraXY() {
  camera.up = new THREE.Vector3(0, 1, 0);
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
  if (camera.position.x == phantom.radius()*1.5) {
    camera.position.set(0, 0, 0);
    camera.position.x = phantom.radius()*-1.5;
  }
  else {
    camera.position.set(0, 0, 0);
    camera.position.x = phantom.radius()*1.5;
  }
}
