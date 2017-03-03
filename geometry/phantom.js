// Phantom class includes all the data related to the Phantom.
function Phantom() {
  this.fibers = {
    source: [],
    tube: [],
    skeleton = [],
  }
  this.isotropicregions = {
    source: [],
    sphere: [],
  }
}

Phantom.prototype = {
  AddFiber = function(fiber) {
    this.fibers.source.push(fiber);
    this.fibers.tube.push(new FiberTube(fiber));
    this.fibers.skeleton.push(new FiberSkeleton(fiber));

    var n = this.fibers.source.length;
    fiber.AddObserver(this.fibers.tube[n]);
    fiber.AddObserver(this.fibers.skeleton[n]);
  },
  AddIsotropicRegion = function(region) {
    this.isotropicregions.source.push(region);
    this.isotropicregions.sphere.push(new IsotropicRegion(region));

    var n = this.isotropicregions.source.length + 1;
    region.AddObserver(this.isotropicregions.sphere[n]);
  },
  fadeAll = function(opacity) {
    if (opacity === undefined) {
      opacity = .4;
    }
    for (var i = 0; i < this.fibers.tube.length; i++) {
      this.fibers.tube.mesh.material.opacity = opacity;
    }
    for (var i = 0; i < this.isotropicregions.sphere.length; i++) {
      this.fisotropicregions.sphere.mesh.material.opacity = opacity;
    }
    render();
  }

}
