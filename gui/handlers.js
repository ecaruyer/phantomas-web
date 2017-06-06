/**@overview Contains handlers for UI elements.*/
/**@module GUI Handlers*/

// SWITCH VIEW BUTTON
// Swithes 'preview mode' which will allow the user to display the phantom in unfaded mode while editing
function switchViewButton() {
  /** @function switchViewButton
   * @memberof module:GUI Handlers
   * @desc Handler for preview button. Switches fade of the scene.
   */
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

  if (guiStatus.dragAndDropping) {
    dragAndDrop();
  }
}

// disable booleans must be true when the user does not click directly the option.
// This saves resources by not rebuilding editingGUI and does not reclick selectors, which would be annoying.
function fiberSelectClick(index, notclicked) {
  /** @function fiberSelectClick
    * @memberof module:GUI Handlers
    * @param {Number} index Index of the fiber in {@link Phantom} array.
    * @param {Boolean} [notclicked=false] If true, does not change UI or {@link guiStatus}
    object. Useful when changing the scene or previewing.
    * @desc Events to be fired when a fiber was selected in the list.
    <br>May be called to tweak the scene.
    */
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
  /** @function regionSelectClick
    * @memberof module:GUI Handlers
    * @param {Number} index Index of the isotropic region in {@link Phantom} array.
    * @param {Boolean} [notclicked=false] If true, does not change UI or {@link guiStatus}
    object. Useful when changing the scene or previewing.
    * @desc Events to be fired when an isotropic region was selected in the list.
    <br>May be called to tweak the scene.
    */
  guiStatus.editing('region', index);
  if (!notclicked) {
    guiStatus.editing('region', index);
    regionEdit(index);
  }
  phantom.addToScene(scene);
  phantom.regionHighlight(index);
}

function cpSelectClick(fiberindex, cpindex, notclicked) {
  /** @function cpSelectClick
    * @memberof module:GUI Handlers
    * @param {Number} index Index of the fiber in {@link Phantom} array.
    * @param {Number} cp Index of the control point in {@link FiberSource} array.
    * @param {Boolean} [notclicked=false] If true, does not change UI or {@link guiStatus}
    object. Useful when changing the scene or previewing.
    * @desc Events to be fired when a control point was selected in the list.
    <br>May be called to tweak the scene.
    */
  if (!notclicked) {
    guiStatus.formerCP = phantom.fibers.source[fiberindex].controlPoints[cpindex].slice(0);
    guiStatus.dragAndDropping = false;
    cpEdit(cpindex);
  }
  phantom.cpHighlight(fiberindex, cpindex, 'red');
  phantom.cpHighlight(fiberindex, cpindex, 'green');
  guiStatus.editing('CP', cpindex);
  scene.removeControls();
}

// NEW MESH BUTTONS
function newFiberClick() {
  /** @function newFiberClick
   * @memberof module:GUI Handlers
   * @desc Fires the creation of a new fiber and goes into edition.
   */
  phantom.newFiber();
  phantom.addToScene(scene);

  setupGUI();
  selectOption(document.getElementById("fiberSelector"), phantom.fibers.source.length);
  fiberSelectClick(phantom.fibers.source.length - 1);
}

function newIsotropicRegionClick() {
  /** @function newIsotropicRegionClick
   * @memberof module:GUI Handlers
   * @desc Fires the creation of a new isotropic region and goes into edition.
   */

  phantom.newIsotropicRegion();
  phantom.addToScene(scene);

  setupGUI();
  selectOption(document.getElementById("regionSelector"), phantom.isotropicRegions.source.length);
  regionSelectClick(phantom.isotropicRegions.source.length - 1);
}

// REMOVE MESH
function removeFiberClick() {
  /** @function removeFiberClick
   * @memberof module:GUI Handlers
   * @desc Fires the removal of a fiber and quits edition. Prompts the user for confirmation.
   */
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
  /** @function removeIsotropicRegionClick
   * @memberof module:GUI Handlers
   * @desc Fires the removal of an isotropic region and quits edition. Prompts the user for confirmation.
   */
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
  /** @function newCPclick
   * @memberof module:GUI Handlers
   * @param {Number} index Index of the fiber in {@link Phantom} array.
   * @param {Number} index Index of the control point in {@link FiberSource} array.
   * @desc Fires the addition of a new Control Point after the current one. Gets into edit.
   */
  // Control point was yet created by hover function; it just needs to be formerly added.
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
  /** @function newCPonmouseover
   * @memberof module:GUI Handlers
   * @param {Number} index Index of the fiber in {@link Phantom} array.
   * @param {Number} cp Index of the control point in {@link FiberSource} array.
   * @desc Hover for new control point button. Simulates in the scene the addition of a new control point in green color.
   */
  phantom.addCP(fiber, cp);
  phantom.addToScene(scene);
  fiberSelectClick(fiber, true);
  phantom.cpHighlight(fiber, cp, 'red');
  phantom.cpHighlight(fiber, cp + 1, 'green');
  document.getElementById('guiFiberLength').innerHTML = roundToPrecision(phantom.fibers.source[guiStatus.editingFiber].length);
}

function newCPonmouseout(fiber, cp) {
  /** @function newCPonmouseout
   * @memberof module:GUI Handlers
   * @param {Number} index Index of the fiber in {@link Phantom} array.
   * @param {Number} cp Index of the control point in {@link FiberSource} array.
   * @desc Restores the scene after unhover in new control point button.
   * @returns {FiberSource} Actual source object.
   */
  phantom.removeCP(fiber, cp + 1);
  phantom.addToScene(scene);
  guiStatus.retrieve();
  var source = phantom.fibers.source[guiStatus.editingFiber];
  document.getElementById('guiFiberLength').innerHTML = roundToPrecision(source.length);

  return source;
}

function removeCPclick(fiber, cp) {
  /** @function removeCPclick
   * @memberof module:GUI Handlers
   * @desc Fires the removal of a control point and quits edition. Prompts the user for confirmation.
   */
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

// AXES TOGGLE
function toggleAxes() {
  /** @function toggleAxes
   * @memberof module:GUI Handlers
   * @desc Toogle axes view button. Switches between showing or removing in the scene.
   */
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
// PLANE SELECTORS
// Double click for inverted axis was commented for it to be disabled for the moment. Found it annoying when attempting to move points.
function moveCameraXY() {
  /** @function moveCameraXY
   * @memberof module:GUI Handlers
   * @desc Moves view to the XY plane.
   */
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
  /** @function moveCameraXZ
   * @memberof module:GUI Handlers
   * @desc Moves view to the XZ plane.
   */
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
  /** @function moveCameraZY
   * @memberof module:GUI Handlers
   * @desc Moves view to the ZY plane.
   */
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


// OPACITY
function opacitySelectChange(selector) {
  /** @function opacitySelectChange
   * @memberof module:GUI Handlers
   * @param {DOM} selector Opacity selector DOM element.
   * @desc Fired when value in the opacity selector is changed. Corrects the value and fires the scene change.
   */
  // Make the value stay between min and max.
  if (Number(selector.value) > Number(selector.max)) {
    selector.value = selector.max;
  } else if (Number(selector.value) < Number(selector.min)) {
    selector.value = selector.min;
  }
  // Allow custom step; do not allow decimal values.
  selector.value = Math.round(Number(selector.value));

  phantom.highlightOpacity = selector.value / 100;
  guiStatus.retrieve();
}

function saveClick() {
  /** @function saveClick
   * @memberof module:GUI Handlers
   * @desc Pushes the download of the current Phantom.
   */
  pushDownload(phantom.export());
}
