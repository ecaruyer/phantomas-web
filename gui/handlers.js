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
    button.className = 'w3-button w3-aqua w3-hover-cyan w3-border w3-block w3-ripple';
    guiStatus.previewing = true;
  } else {
    guiStatus.previewing = false;
    guiStatus.retrieve();
    button.className = 'w3-btn w3-hover-aqua w3-border w3-block w3-ripple';
    button.value = "Preview";
  }
}

// disable booleans must be true when the user does not click directly the option.
// This saves resources by not rebuilding editingGUI and does not reclick selectors, which would be annoying.
function fiberSelectClick(index, notclicked) {
  if (!notclicked) {
    guiStatus.editing('fiber', index);
    fiberEdit(index);
  } else {
    // We only want CP edition to be undefined when actually clicked!
    guiStatus.editingFiber = index;
  }
  phantom.revealSkeleton(scene, index);
}
function regionSelectClick(index, notclicked) {
  guiStatus.editing('region', index);
  if (!notclicked) {
    guiStatus.editing('region', index);
    regionEdit(index);
  }
  phantom.addToScene(scene);
  phantom.regionHighlight(index);
}
function cpSelectClick(fiberindex, cpindex, notclicked) {
  // Made changes are updated in guiStatus undo history store
  if (!notclicked) {
    guiStatus.formerCP = phantom.fibers.source[fiberindex].controlPoints[cpindex].slice(0);
  }
  phantom.cpHighlight(fiberindex, cpindex, 'red');
  cpEdit(cpindex);
  guiStatus.editing('CP', cpindex);
}

// NEW MESH BUTTONS
function newFiberClick() {
  phantom.newFiber();
  phantom.addToScene(scene);

  setupGUI();
  selectOption(document.getElementById("fiberSelector"), phantom.fibers.source.length);
  fiberSelectClick(phantom.fibers.source.length - 1);
}

function newIsotropicRegionClick() {
  phantom.newIsotropicRegion();
  phantom.addToScene(scene);

  setupGUI();
  selectOption(document.getElementById("regionSelector"), phantom.isotropicRegions.source.length);
  regionSelectClick(phantom.isotropicRegions.source.length - 1);
}

// REMOVE MESH
function removeFiberClick() {
  if (window.confirm("Are you sure you want to remove this fiber? This action cannot be undone.")) {
    var index = guiStatus.editingFiber;
    phantom.fibers.source.splice(index, 1);
    phantom.fibers.tube.splice(index, 1);
    phantom.fibers.skeleton.splice(index, 1);

    phantom.addToScene(scene);
    setupGUI();
  }
}
function removeIsotropicRegionClick() {
  if (window.confirm("Are you sure you want to remove this isotropic region? This action cannot be undone.")) {
    var index = guiStatus.editingRegion;
    phantom.isotropicRegions.source.splice(index, 1);
    phantom.isotropicRegions.sphere.splice(index, 1);

    phantom.addToScene(scene);
    setupGUI();
  }
}

// CP ADD+REMOVE
function newCPclick(fiber, cp) {
  // Fiber was added by newCPonmouseover
  phantom.addToScene(scene);
  guiStatus.editing('CP', cp + 1);
  guiStatus.retrieve();
  exitCPedit();
  cpSelectClick(fiber, cp + 1);
  selectOption(document.getElementById("cpSelector"), cp + 2);
  document.getElementById("guiFiberTitle").innerHTML = phantom.fibers.source[guiStatus.editingFiber].controlPoints.length + " Points";
  document.getElementById('fiberSelector').childNodes[guiStatus.editingFiber + 1].childNodes[1].innerHTML = phantom.fibers.source[guiStatus.editingFiber].controlPoints.length + " points";
}
function newCPonmouseover(fiber, cp) {
  phantom.addCP(fiber, cp);
  phantom.addToScene(scene);
  fiberSelectClick(fiber, true)
  phantom.cpHighlight(fiber, cp, 'red');
  phantom.cpHighlight(fiber, cp + 1, 'green');
  document.getElementById('guiFiberLength').innerHTML = roundToPrecision(phantom.fibers.source[guiStatus.editingFiber].length);
}
function newCPonmouseout(fiber, cp) {
  phantom.removeCP(fiber, cp + 1);
  phantom.addToScene(scene);
  guiStatus.retrieve();
  document.getElementById('guiFiberLength').innerHTML = roundToPrecision(phantom.fibers.source[guiStatus.editingFiber].length);
}

function removeCPclick(fiber, cp) {
  if (window.confirm("Are you sure you want to remove this control point? This action cannot be undone.")) {
    phantom.removeCP(fiber, cp);
    phantom.addToScene(scene);
    guiStatus.editing('CP', undefined);
    guiStatus.retrieve();
    exitCPedit();
    document.getElementById('guiFiberLength').innerHTML = roundToPrecision(phantom.fibers.source[guiStatus.editingFiber].length);
    document.getElementById("guiFiberTitle").innerHTML = phantom.fibers.source[guiStatus.editingFiber].controlPoints.length + " Points";
    document.getElementById('fiberSelector').childNodes[guiStatus.editingFiber + 1].childNodes[1].innerHTML = phantom.fibers.source[guiStatus.editingFiber].controlPoints.length + " points";
  }
}

// PLANE SELECTORS
// Double click for inverted axis was commented for it to be disabled for the moment. Found it annoying when attempting to move points.
function moveCameraXY() {
  camera.up = new THREE.Vector3(0, 1, 0);
  controls.target = new THREE.Vector3(0, 0, 0);
  // if (camera.position.z == phantom.radius()*1.5) {
    camera.position.set(0, 0, 0);
    camera.position.z = phantom.radius() * 2 * 1.5;
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
    camera.position.y = phantom.radius() * 2 * -1.5;
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
    camera.position.x = phantom.radius() * 2 * -1.5;
  // }
  // else {
  //   camera.position.set(0, 0, 0);
  //   camera.position.x = phantom.radius()*-1.5;
  // }
}

// AXES TOGGLE
function toggleAxes() {
  button = document.getElementById('toggleAxesButton');
  name = 'axes';
  var length = phantom.radius() * 1.5;

  if (scene.getObjectByName(name)) {
    scene.remove(scene.getObjectByName(name))
    button.className = 'w3-btn w3-border w3-hover-deep-purple w3-block w3-ripple';
  } else {
    var axes = buildAxes(length);
    axes.name = name;
    scene.add(axes);
    button.className = 'w3-button w3-deep-purple w3-hover-indigo w3-border w3-block w3-ripple';
  }
  render();
}


function saveClick() {
  pushDownload(phantom.export());
}
