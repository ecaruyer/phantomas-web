Phantom.prototype.addCP = function(fiberindex, cpbefore, add) {
  var fiber = this.fibers.source[fiberindex];

  var newts = (fiber.ts[cpbefore] + fiber.ts[cpbefore + 1]) / 2;
  var newcp = fiber.interpolate(newts)[0];

  if (add) {
    fiber.controlPoints.splice(cpbefore + 1, 0, newcp);
    phantom.addToScene(scene);
    exitCPedit();
    cpEdit(cpbefore +1);
  } else {
    // Just preview
    scene.removeCPHighlight();
    var geometry = new THREE.SphereGeometry(fiber.radius/4, 16, 16);
    var surface = new THREE.MeshBasicMaterial();
    var mesh = new THREE.Mesh(geometry, surface);
    mesh.position.set(newcp[0], newcp[1], newcp[2]);
    mesh.material.color = new THREE.Color(0x00FF00);
    scene.add(mesh);
    render();
  }
}
