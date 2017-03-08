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
