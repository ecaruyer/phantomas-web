function moveCameraXY() {
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
  if (camera.position.x == phantom.radius()*1.5) {
    camera.position.set(0, 0, 0);
    camera.position.x = phantom.radius()*-1.5;
  }
  else {
    camera.position.set(0, 0, 0);
    camera.position.x = phantom.radius()*1.5;
  }
}
