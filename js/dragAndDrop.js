/** @overview Contains THREE.js functions responsible of the Drag and Dropping feature.
 */

function dragAndDrop() {
  /** @function dragAndDrop
   * @desc Builds or resets Drag and Drop interactive controls in the scene.
   */

  var control = new THREE.TransformControls(camera, renderer.domElement);

  scene.removeControls();
  scene.removeCPHighlight();
  var object = phantom.cpHighlight(guiStatus.editingFiber, guiStatus.editingCP, 'green');

  control.name = 'dragAndDrop';

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
    phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'x', pos.x);
    phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'y', pos.y);
    phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'z', pos.z);
  });


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
