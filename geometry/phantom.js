// Phantom class includes all the data related to the Phantom.
function Phantom() {
  this.fibers = {
    source: [],
    tube: [],
    skeleton: [],
  }
  this.isotropicregions = {
    source: [],
    sphere: [],
  }
}

Phantom.prototype = {
  AddFiber: function(fiber) {
    this.fibers.source.push(fiber);
    this.fibers.tube.push(new FiberTube(fiber));
    this.fibers.skeleton.push(new FiberSkeleton(fiber));

    var n = this.fibers.source.length;
    fiber.AddObserver(this.fibers.tube[n]);
    fiber.AddObserver(this.fibers.skeleton[n]);
  },
  length: function() {
    var length = 0;
    for (var i = 0; i < this.fibers.source.length; i++) {
      if (this.fibers.source[i].length > length) length = this.fibers.source[i].length;
    }
    return length;
  },
  AddIsotropicRegion: function(region) {
    this.isotropicregions.source.push(region);
    this.isotropicregions.sphere.push(new IsotropicRegion(region));

    var n = this.isotropicregions.source.length + 1;
    region.AddObserver(this.isotropicregions.sphere[n]);
  },
  fadeAll: function(opacity) {
    if ((opacity === undefined) || (opacity > 1) || (opacity < 0)) {
      opacity = .4;
    }
    for (var i = 0; i < this.fibers.tube.length; i++) {
      this.fibers.tube.mesh.material.opacity = opacity;
    }
    for (var i = 0; i < this.isotropicregions.sphere.length; i++) {
      this.fisotropicregions.sphere.mesh.material.opacity = opacity;
    }
    render();
  },
  unfadeAll: function() {
    for (var i = 0; i < this.fibers.tube.length; i++) {
      this.fibers.tube.mesh.material.opacity = 1;
    }
    for (var i = 0; i < this.isotropicregions.sphere.length; i++) {
      this.fisotropicregions.sphere.mesh.material.opacity = 1;
    }
    render();
  },
  addToScene: function(scene) {
    scene.children.forEach(function(object){
      scene.remove(object);
    });
    this.fibers.tube.forEach(function(tube) {
      scene.add(tube.mesh)
    });
    this.isotropicregions.sphere.forEach(function(sphere) {
      scene.add(sphere.mesh)
    });
    render();
  },
  addAsSkeleton: function(scene) {
    scene.children.forEach(function(object){
      scene.remove(object);
    });
    this.fibers.skeleton.forEach(function(skeleton) {
      scene.add(skeleton.line, skeleton.spheres)
    });
    this.isotropicregions.sphere.forEach(function(sphere) {
      scene.add(sphere.mesh)
    });
    render();
  },
}
