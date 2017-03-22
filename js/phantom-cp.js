Phantom.prototype.addCP = function(fiberindex, cpbefore, add) {
  var fiber = this.fibers.source[fiberindex];
  var newts = (fiber.ts[cpbefore] + fiber.ts[cpbefore + 1]) / 2;
  var newcp = fiber.interpolate(newts)[0];
  fiber.controlPoints.splice(cpbefore + 1, 0, newcp);

  var parameters = {
    nbElements: this.fibers.source.length + this.isotropicRegions.source.length
  };

  if (add) {
    phantom.addFiber(fiber, parameters, fiberindex);

    phantom.addToScene(scene);
    guiStatus.editing('CP', cpbefore + 1);
    guiStatus.retrieve();
    exitCPedit();
    cpSelectClick(fiberindex, cpbefore + 1);
    document.getElementById("cpSelector").selectedIndex = cpbefore + 2;

  } else {
    // // Just preview
    // scene.removeCPHighlight();
    // var geometry = new THREE.SphereGeometry(fiber.radius/4, 16, 16);
    // var surface = new THREE.MeshBasicMaterial();
    // var mesh = new THREE.Mesh(geometry, surface);
    // mesh.position.set(newcp[0], newcp[1], newcp[2]);
    // mesh.material.color = new THREE.Color(0x00FF00);
    // mesh.isBlueHighlight = true;
    // mesh.isHighlight = true;
    // scene.add(mesh);
    // render();
  }
}
