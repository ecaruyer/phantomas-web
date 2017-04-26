function dragAndDrop() {
  var control = new THREE.TransformControls(camera, renderer.domElement);

  scene.removeControls();
  scene.removeCPHighlight();
  control.object = phantom.cpHighlight(guiStatus.editingFiber, guiStatus.editingCP, 'green');

  control.name = 'dragAndDrop';
  this.control = control;
  this.object = this.control.object;

  this.control.addEventListener('change', function() {
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

  this.control.addEventListener('mouseUp', function() {
    var pos = this.object.position;
    phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'x', pos.x);
    phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'y', pos.y);
    phantom.fibers.source[guiStatus.editingFiber].setControlPoint(guiStatus.editingCP, 'z', pos.z);
  });


  control.attach(this.object);
  scene.add(this.control);
  render();
}

THREE.Scene.prototype.removeControls = function() {
  var remove = [];
  scene.children.forEach(function(object) {
    if (object.name == 'dragAndDrop') {
      remove.push(object);
    }
  });
  remove.forEach( function(object) {
    object.dispose();
    scene.remove(object);
  });
  render();
}
