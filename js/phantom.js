// Adding a scene method that removes all phantoms present.
// This way, cameras and lights are never removed.
THREE.Scene.prototype.removePhantom = function() {
  var objects = [];
  this.children.forEach( function(object){
    if (((object.type == 'Mesh') || (object.type == "Line")) && (!object.isHighlight)) {
      objects.push(object);
    }
  });

  var scene = this;
  // If removed inside scene's forEach, length is changed and so algorithm may skip some objects removal.
  objects.forEach( function(object) {
    scene.remove(object);
  });

  this.removeCPHighlight(true);
}

// All boolean makes red points to be removed if true.
THREE.Scene.prototype.removeCPHighlight = function(all) {
  var objects = [];
  this.children.forEach( function(object){
    if (object.isHighlight) {
      if (object.isBlueHighlight) {
        objects.push(object);
      } else if (all) {
        objects.push(object);
      }
    }
  });

  var scene = this;
  // If removed inside scene's forEach, length is changed and so algorithm may skip some objects removal.
  objects.forEach( function(object) {
    scene.remove(object);
  });
  render();
}

/** @class Phantom 
  This class includes all the data related to the Phantom.

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
      Parameters are the ones set for SkeletonTube and TubeSource classes.
      If not specified and nbElements as number of Fibers, addFiber decides parameters for best reliability.
    addIsotropicRegion: Adds IsotropicRegionSource (input). Builds sphere.
     Parameters are the ones set for IsotropicRegion class.
     Parameters are the ones set for SkeletonTube and TubeSource classes.
     If not specified and nbElements as number of Fibers, addIsotropicRegion decides parameters for best reliability.
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
  this.highlightOpacity = 0.1;
  this.highlightColor = null;
}

Phantom.prototype = {
  addFiber: function(fiber, parameters, replaceindex) {
    /* If not specified, set segments constraint so renderer is stable in browser
    This grabs nbElements thrown by load function and sets the number of segments
    each mesh will feature, taking values from global variable meshConstraints (main.js) */
    if (!parameters) var parameters = [];
    if ((parameters.nbElements) && (!parameters.axialSegments) && (!parameters.radialSegments)) {
      parameters.axialSegments = Math.min(Math.floor(meshConstraints.maxTotalAxialSegments / parameters.nbElements), meshConstraints.maxMeshAxialSegments);
      parameters.radialSegments = Math.min(Math.floor(meshConstraints.maxTotalRadialSegments / parameters.nbElements), meshConstraints.maxMeshRadialSegments);
    }
    if ((parameters.nbElements) && (!parameters.lineSegments) && (!parameters.sphereSegments)) {
      parameters.axialSegments = Math.min(Math.floor(meshConstraints.maxTotalLineSegments / parameters.nbElements), meshConstraints.maxMeshLineSegments);
      parameters.sphereSegments = Math.min(Math.floor(meshConstraints.maxTotalSkeletonSphereSegments / parameters.nbElements), meshConstraints.maxTotalSkeletonSphereSegments);
    }

    if (replaceindex !== undefined) {

      this.fibers.source[replaceindex] = new FiberSource(fiber.controlPoints, fiber.tangents, fiber.radius, fiber.color);
      this.fibers.skeleton[replaceindex] = new FiberSkeleton(this.fibers.source[replaceindex], parameters);
      this.fibers.tube[replaceindex] = new FiberTube(this.fibers.source[replaceindex], parameters);

      this.fibers.source[replaceindex].addObserver(this.fibers.tube[replaceindex]);
      this.fibers.source[replaceindex].addObserver(this.fibers.skeleton[replaceindex]);

    } else {

      this.fibers.source.push(fiber);
      this.fibers.skeleton.push(new FiberSkeleton(fiber, parameters));
      this.fibers.tube.push(new FiberTube(fiber, parameters));
      parameters.color = undefined;
      // Skeleton and Tube added as observers.
      fiber.addObserver(this.fibers.tube[this.fibers.tube.length-1]);
      fiber.addObserver(this.fibers.skeleton[this.fibers.skeleton.length-1]);

    }

  },
  addCP: function(fiberindex, cpbefore) {
    var fiber = this.fibers.source[fiberindex];
    var newts = (fiber.ts[cpbefore] + fiber.ts[cpbefore + 1]) / 2;
    var newcp = fiber.interpolate(newts)[0];
    newcp.forEach( function(coordinate, index) {
      newcp[index] = roundToPrecision(coordinate);
    });
    fiber.controlPoints.splice(cpbefore + 1, 0, newcp);

    var parameters = {
      nbElements: this.fibers.source.length + this.isotropicRegions.source.length
    };
    phantom.addFiber(fiber, parameters, fiberindex);
  },
  removeCP: function(fiberindex, cp) {
    var fiber = this.fibers.source[fiberindex];
    fiber.controlPoints.splice(cp, 1);
    var parameters = {
      nbElements: this.fibers.source.length + this.isotropicRegions.source.length
    };
    phantom.addFiber(fiber, parameters, fiberindex);
  },
  addIsotropicRegion: function(region, parameters) {
    /* If not specified, set segments constrainct so renderer is stable in browser
    This grabs nbElements thrown by load function and sets the number of segments
    each mesh will feature, from global variable meshConstraints (main.js) */
    if (!parameters) var parameters = [];
    if ((parameters.nbElements) && (!parameters.heightSegments) && (!parameters.widthSegments)) {
      parameters.heightSegments = Math.min(Math.floor(meshConstraints.maxTotalIsotropicRegionSegments / parameters.nbElements), meshConstraints.maxMeshIsotropicRegionSegments);
      parameters.widthSegments = Math.min(Math.floor(meshConstraints.maxTotalIsotropicRegionSegments / parameters.nbElements), meshConstraints.maxMeshIsotropicRegionSegments);
    }

    this.isotropicRegions.source.push(region);
    this.isotropicRegions.sphere.push(new IsotropicRegion(region, parameters));

    region.addObserver(this.isotropicRegions.sphere[this.isotropicRegions.sphere.length-1]);
  },
  radius: function() {
    var maxdist = 0;
    // Return is the farthest point from the center
    for (var i = 0; i < this.fibers.source.length; i++) {
      var cp = this.fibers.source[i].controlPoints;
      for (var j = 0; j < cp.length; j++) {
        var dist = Math.sqrt(
          Math.pow(cp[j][0],2) +
          Math.pow(cp[j][1],2) +
          Math.pow(cp[j][2],2)
        );
        if (dist > maxdist) {maxdist = dist}
      }
    }
    for (var i = 0; i < this.isotropicRegions.source.length; i++) {
      var region = this.isotropicRegions.source[i];
      var dist = Math.sqrt(
        Math.pow(region.center[0],2) +
        Math.pow(region.center[1],2) +
        Math.pow(region.center[2],2)
      ) + region.radius;
      if (dist > maxdist) {maxdist = dist}
    }
    return maxdist;
  },
  newFiber: function() {
    // New fiber will feature two points, following the x axis.
    var cp = [
      [Math.floor(-1 * this.radius() * 10) / 10, 0, 0],
      [Math.floor(this.radius() * 10) / 10, 0, 0],
    ];
    var radius = Math.floor(this.radius() * 10) / 100;
    // Add nbElements in parameters so this.addFiber calculates segments by itself
    var parameters = {
      nbElements: this.fibers.source.length + this.isotropicRegions.source.length
    };

    this.addFiber(new FiberSource(cp, 'symmetric', radius), parameters);
  },
  newIsotropicRegion: function() {
    // New region is to stay in the center. Radius is set to be a fifth of phantom radius.
    var center = [0, 0, 0];
    var radius = Math.floor(this.radius() * 10) / 50;
    // Add nbElements in parameters so this.addIsotropicRegion calculates segments by itself
    var parameters = {
      nbElements: this.fibers.source.length + this.isotropicRegions.source.length
    };

    this.addIsotropicRegion(new IsotropicRegionSource(center, radius), parameters);
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
      this.fibers.tube[i].mesh.renderOrder = 0;
    }
    for (var i = 0; i < this.isotropicRegions.sphere.length; i++) {
      this.isotropicRegions.sphere[i].mesh.material.opacity = 1;
      this.isotropicRegions.sphere[i].mesh.renderOrder = 0;
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
    this.fibers.tube[n].mesh.renderOrder = -1;
    // If custom highlight color, apply.
    if (this.highlightColor) {
      this.fibers.tube[n].mesh.material.color = this.highlightColor;
    }
    // Render so changes are made visible
    render();
  },
  regionHighlight: function(n, fadeLevel) {
    // Fade all but wanted region
    this.fadeAll(fadeLevel);
    this.isotropicRegions.sphere[n].mesh.material.opacity = 1;
    this.isotropicRegions.sphere[n].mesh.renderOrder = -1;
    // If custom highlight color, apply.
    if (this.highlightColor) {
      this.fibers.tube[n].mesh.material.color = this.highlightColor;
    }
    // Render so changes are made visible
    render();
  },
  cpHighlight: function(fiberindex, controlpointindex, mode) {
    scene.removeCPHighlight();
    var fiber = phantom.fibers.source[fiberindex];
    var cp = fiber.controlPoints[controlpointindex];

    var geometry = new THREE.SphereGeometry(fiber.radius/4, 16, 16);
    var surface = new THREE.MeshBasicMaterial();

    var mesh = new THREE.Mesh(geometry, surface);
    mesh.isHighlight = true;
    mesh.position.set(cp[0], cp[1], cp[2]);

    switch (mode) {
      case 'blue':
        mesh.material.color = new THREE.Color(0x0000FF)
        // this will be later used for filtering which points are to be removed.
        mesh.isBlueHighlight = true;
        break;
      case 'red':
        scene.removeCPHighlight(true);
        mesh.material.color = new THREE.Color(0xFF0000)
        mesh.position.set(guiStatus.formerCP[0], guiStatus.formerCP[1], guiStatus.formerCP[2]);
        break;
      case 'green':
        mesh.material.color = new THREE.Color(0x00FF00);
        // this will be later used for filtering which points are to be removed.
        mesh.isBlueHighlight = true;
        break;
      default: // Should not happen!
        console.error('Incorrect cpHighlight mode! Was set as ' + mode);
        mesh.material.color = new THREE.Color(0xFFFFFF)
    }

    scene.add(mesh);
    render();
  },
  revealSkeleton: function(scene, n) {
    this.addToScene(scene);
    this.fadeAll();
    // Focus fiber is faded more so that thread can be seen with any problem
    this.fibers.tube[n].mesh.material.opacity = this.highlightOpacity*4;
    this.fibers.tube[n].mesh.renderOrder = -1;
    scene.add(this.fibers.skeleton[n].line, this.fibers.skeleton[n].spheres);
    // Render so changes are made visible
    render();
  }
}
