// Adding a scene method that removes all phantoms present.
// This way, cameras and lights are never removed.
THREE.Scene.prototype.removePhantom = function() {
  var objects = [];
  this.children.forEach( function(object){
    if ((object.type == 'Mesh') || (object.type == "Line")) {
      objects.push(object);
    }
  });
  // If removed inside scene's forEach, length is changed and so algorithm may skip some objects removal.
  objects.forEach( function(object) {
    scene.remove(object);
  });
}

/* Phantom class includes all the data related to the Phantom.
  CONTENTS:
    .fibers: contains all data for all fibers present in the Phantom
      .fibers.source: array of sources for the fibers (FiberSource)
      .fibers.tube: array of tubes for the fibers (FiberTube)
      .fibers.skeleton: array of skeletons for the fibers (FiberSkeleton)

    .isotropicRegions: contains all data for all isotropic regions present in the Phantom
      .isotropicRegions.source: array of sources for the regions (IsotropicRegionSource)
      .isotropicRegions.sphere: array of builders for the regions (IsotropicRegion)

  Fibers and Isotropic Regions related source and builders are supposed to stay in the
  same position of the array as their respectives.

  PROPERTIES:
    .highlightOpacity, by default .3. Opacity that background meshes will adopt when
      highlighting one particular mesh.
    .highlightColor, by default null. Color that the highlighted mesh will adopt when
      highlighted. If null, meshes are adopting their own color.

  METHODS:
    addFiber: Adds a FiberSource (input) to the phantom. Automatically builds skeleton and tube.
    addIsotropicRegion: Adds IsotropicRegionSource (input). Builds sphere.
    radius: Returns an approximate radius of the phantom. Usually used for positioning camera.
    resetColors: Brings original color back to meshes
    fadeAll: Fades all the meshes. Optional input: wanted opacity.
    unfadeAll: Unfades all the meshes
    addToScene: Adds the Phantom to a given scene (input)
    addAsSkeleton: Adds the Phantom to a given scene in Skeleton form (input)
    fiberHighlight: Highlights fiber. Input is the position of the fiber in its array.
    regionHighlight: Highlights region. Input is the position of the region in its array.
    revealSkeleton: Reveals skeleton structure for a fiber. Inputs: (scene, fiberposition)
*/
function Phantom() {
  this.fibers = {
    source: [],
    tube: [],
    skeleton: []
  }
  this.isotropicRegions = {
    source: [],
    sphere: []
  }
  this.highlightOpacity = .3;
  this.highlightColor = null;
}

Phantom.prototype = {
  addFiber: function(fiber) {
    this.fibers.source.push(fiber);
    this.fibers.tube.push(new FiberTube(fiber));
    this.fibers.skeleton.push(new FiberSkeleton(fiber));
    // Skeleton's thread and fiber's tube will adopt the same color
    this.fibers.tube[this.fibers.tube.length-1].mesh.material.color =
      this.fibers.skeleton[this.fibers.skeleton.length-1].color;
    this.fibers.tube[this.fibers.tube.length-1].color =
      this.fibers.skeleton[this.fibers.skeleton.length-1].color;
    console.log(this.fibers.tube[this.fibers.tube.length-1].color.getHex());
    console.log(this.fibers.skeleton[this.fibers.skeleton.length-1].color.getHex());
    // Skeleton and Tube added as observers.
    fiber.addObserver(this.fibers.tube[this.fibers.tube.length-1]);
    fiber.addObserver(this.fibers.skeleton[this.fibers.skeleton.length-1]);
  },
  addIsotropicRegion: function(region) {
    this.isotropicRegions.source.push(region);
    this.isotropicRegions.sphere.push(new IsotropicRegion(region));

    region.addObserver(this.isotropicRegions.sphere[this.isotropicRegions.sphere.length]);
  },
  radius: function() {
    var length = 0;
    // Return is essentially the longest fiber
    for (var i = 0; i < this.fibers.source.length; i++) {
      if (this.fibers.source[i].length > length) length = this.fibers.source[i].length;
    }
    return length;
  },
  resetColors: function(){
    // Color contained in their objects is given back to material's meshes.
    for (var i = 0; i < this.fibers.tube.length; i++) {
      this.fibers.tube[i].mesh.material.color = this.fibers.tube[i].color;
    }
    for (var i = 0; i < this.isotropicRegions.sphere.length; i++) {
      this.isotropicRegions.sphere[i].mesh.material.color = this.isotropicRegions.sphere[i].color;
    }
    // Render so changes are made visible
    render();
  },
  fadeAll: function(opacity) {
    // Only reset colors if custom highlightColor is enabled
    if (this.highlightColor) this.resetColors();
    // Set default opacity in case none is specified
    if ((opacity === undefined) || (opacity > 1) || (opacity < 0)) {
      opacity = this.highlightOpacity;
    }
    for (var i = 0; i < this.fibers.tube.length; i++) {
      this.fibers.tube[i].mesh.material.opacity = opacity;
    }
    for (var i = 0; i < this.isotropicRegions.sphere.length; i++) {
      this.isotropicRegions.sphere[i].mesh.material.opacity = opacity;
    }
    // Render so changes are made visible
    render();
  },
  unfadeAll: function() {
    // Only reset colors if custom highlightColor is enabled
    if (this.highlightColor) this.resetColors();
    // Opacity 1 is given back
    for (var i = 0; i < this.fibers.tube.length; i++) {
      this.fibers.tube[i].mesh.material.opacity = 1;
    }
    for (var i = 0; i < this.isotropicRegions.sphere.length; i++) {
      this.isotropicRegions.sphere[i].mesh.material.opacity = 1;
    }
    // Render so changes are made visible
    render();
  },
  addToScene: function(scene) {
    // Scene is cleared so that present meshes do not disturb
    scene.removePhantom();
    this.unfadeAll();
    this.fibers.tube.forEach(function(tube) {
      scene.add(tube.mesh)
    });
    this.isotropicRegions.sphere.forEach(function(sphere) {
      scene.add(sphere.mesh)
    });
    // Render so changes are made visible
    render();
  },
  addAsSkeleton: function(scene) {
    // Phantom is added as faded tubes. Opacity 75% than default.
    this.addToScene(scene);
    this.fadeAll(this.highlightOpacity*.75);
    // Skeleton structure added
    this.fibers.skeleton.forEach(function(skeleton) {
      scene.add(skeleton.line, skeleton.spheres)
    });
    // Render so changes are made visible
    render();
  },
  fiberHighlight: function(n) {
    // Fade all but wanted fiber
    this.fadeAll();
    this.fibers.tube[n].mesh.material.opacity = 1;
    // If custom highlight color, apply.
    if (this.highlightColor) {
      this.fibers.tube[n].mesh.material.color = this.highlightColor;
    }
    // Render so changes are made visible
    render();
  },
  regionHighlight: function(n) {
    // Fade all but wanted region
    this.fadeAll();
    this.isotropicRegions.sphere[n].mesh.material.opacity = 1;
    // If custom highlight color, apply.
    if (this.highlightColor) {
      this.fibers.tube[n].mesh.material.color = this.highlightColor;
    }
    // Render so changes are made visible
    render();
  },
  revealSkeleton: function(scene, n) {
    this.fadeAll();
    // Focus fiber is faded more so that thread can be seen with any problem
    this.fibers.tube[n].mesh.material.opacity = this.highlightOpacity*2;
    scene.add(this.fibers.skeleton[n].line, this.fibers.skeleton[n].spheres);
    // Render so changes are made visible
    render();
  }
}
