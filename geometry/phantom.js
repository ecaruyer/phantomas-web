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
  this.highlightopacity = .3;
  this.highlightcolor = null;
}

Phantom.prototype = {
  AddFiber: function(fiber) {
    this.fibers.source.push(fiber);
    this.fibers.tube.push(new FiberTube(fiber));
    this.fibers.skeleton.push(new FiberSkeleton(fiber));
    this.fibers.tube[this.fibers.tube.length-1].color =
      this.fibers.skeleton[this.fibers.skeleton.length-1].color;
    this.fibers.tube[this.fibers.tube.length-1].refresh();

    fiber.AddObserver(this.fibers.tube[this.fibers.tube.length-1]);
    fiber.AddObserver(this.fibers.skeleton[this.fibers.skeleton.length-1]);
  },
  radius: function() {
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
  resetColors: function(){
    for (var i = 0; i < this.fibers.tube.length; i++) {
      this.fibers.tube[i].mesh.material.color = this.fibers.tube[i].color;
    }
    for (var i = 0; i < this.isotropicregions.sphere.length; i++) {
      this.isotropicregions.sphere[i].mesh.material.color = this.isotropicregions.sphere[i].color;
    }
    render();
  },
  fadeAll: function(opacity) {
    if (this.highlightcolor) this.resetColors();
    if ((opacity === undefined) || (opacity > 1) || (opacity < 0)) {
      opacity = this.highlightopacity;
    }
    for (var i = 0; i < this.fibers.tube.length; i++) {
      this.fibers.tube[i].mesh.material.opacity = opacity;
    }
    for (var i = 0; i < this.isotropicregions.sphere.length; i++) {
      this.isotropicregions.sphere[i].mesh.material.opacity = opacity;
    }
    render();
  },
  unfadeAll: function() {
    if (this.highlightcolor) this.resetColors();
    for (var i = 0; i < this.fibers.tube.length; i++) {
      this.fibers.tube[i].mesh.material.opacity = 1;
    }
    for (var i = 0; i < this.isotropicregions.sphere.length; i++) {
      this.isotropicregions.sphere[i].mesh.material.opacity = 1;
    }
    render();
  },
  addToScene: function(scene) {
    scene.removephantom();
    this.fibers.tube.forEach(function(tube) {
      scene.add(tube.mesh)
    });
    this.isotropicregions.sphere.forEach(function(sphere) {
      scene.add(sphere.mesh)
    });
    render();
  },
  addAsSkeleton: function(scene) {
    this.addToScene(scene);
    this.fadeAll(this.highlightopacity*.75);
    this.fibers.skeleton.forEach(function(skeleton) {
      scene.add(skeleton.line, skeleton.spheres)
    });
    render();
  },
  fiberhighlight: function(n) {
    this.fadeAll();
    this.fibers.tube[n].mesh.material.opacity = 1;
    if (this.highlightcolor) {
      this.fibers.tube[n].mesh.material.color = this.highlightcolor;
    }
    render();
  },
  regionhighlight: function(n) {
    this.fadeAll();
    this.isotropicregions.sphere[n].mesh.material.opacity = 1;
    if (this.highlightcolor) {
      this.fibers.tube[n].mesh.material.color = this.highlightcolor;
    }
    render();
  },
  revealskeleton: function(scene, n) {
    this.fadeAll();
    this.fibers.tube[n].mesh.material.opacity = this.highlightopacity*2;
    scene.add(this.fibers.skeleton[n].line, this.fibers.skeleton[n].spheres);
    render();
  }
}
