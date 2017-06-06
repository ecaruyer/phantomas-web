/** @overview Contains THREE.js functions responsible of the Drag and Dropping feature.
 */

function dragAndDrop() {
  /** @function dragAndDrop
   * @desc Builds or resets Drag and Drop interactive controls in the scene.
   */

  var control = new THREE.TransformControls(camera, renderer.domElement);
  control.name = 'dragAndDrop';
  scene.removeControls();

  if (guiStatus.editingFiber+1) {

    scene.removeCPHighlight();
    var object = phantom.cpHighlight(guiStatus.editingFiber, guiStatus.editingCP, 'green');

    control.addEventListener('change', function() {
      var pos = this.object.position;
      pos.x = roundToPrecision(pos.x);
      pos.y = roundToPrecision(pos.y);
      pos.z = roundToPrecision(pos.z);

      document.getElementById('xvalue').value = pos.x;
      document.getElementById('yvalue').value = pos.y;
      document.getElementById('zvalue').value = pos.z;
      render();

      document.getElementById('guiFiberLength').innerHTML = roundToPrecision(phantom.fibers.source[guiStatus.editingFiber].length);
    });

    control.addEventListener('mouseUp', function() {
      var pos = object.position;
      phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'x', pos.x, true);
      phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'y', pos.y, true);
      phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'z', pos.z);
    });

  } else if (guiStatus.editingRegion+1) {
    var object = phantom.isotropicRegions.sphere[guiStatus.editingRegion].mesh;

    control.addEventListener('change', function() {
      var pos = this.object.position;
      pos.x = roundToPrecision(pos.x);
      pos.y = roundToPrecision(pos.y);
      pos.z = roundToPrecision(pos.z);

      document.getElementById('xvalue').value = pos.x;
      document.getElementById('yvalue').value = pos.y;
      document.getElementById('zvalue').value = pos.z;
      render();
    });

    control.addEventListener('mouseUp', function() {
      var pos = object.position;
      phantom.isotropicRegions.source[guiStatus.editingRegion].setCenter('x', pos.x, true);
      phantom.isotropicRegions.source[guiStatus.editingRegion].setCenter('y', pos.y, true);
      phantom.isotropicRegions.source[guiStatus.editingRegion].setCenter('z', pos.z);
    });
  }

  control.attach(object);
  scene.add(control);
  render();
}

THREE.Scene.prototype.removeControls = function() {
  /** @method removeControls
   * @memberof module:THREE.Scene
   * @desc Removes all Drag and Drop controls present in the Scene.
   */
  var remove = [];
  var scene = this;
  scene.children.forEach(function(object) {
    if (object.name == 'dragAndDrop') {
      remove.push(object);
    }
  });
  remove.forEach(function(object) {
    object.dispose();
    scene.remove(object);
  });
  render();
}
