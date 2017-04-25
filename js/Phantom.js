/** @overview Contains {@link Phantom} definition and added methods to {@link THREE.Scene} prototype.*/
/** @module THREE*/

// Adding a scene method that removes all phantoms present.
// This way, cameras and lights are never removed.
/** @class Scene
  * @memberof module:THREE
  * @classdesc THREE.js class for a Scene. {@link https://threejs.org/docs/index.html?q=sce#Reference/Scenes/Scene|Link to THREE.js documentation}
  */
THREE.Scene.prototype.removePhantom = function() {
/** @method removePhantom
  * @memberof module:THREE.Scene
  * @desc Removes all Phantoms present in the Scene, leaving everything not being part of a Phantom.
  */
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
  /** @method removeCPHighlight
    * @memberof module:THREE.Scene
    * @desc Removes Control Point highlights. By default, only blue colored highlights, used
    * when hover.
    * @param {boolean} [all] If true, removes red and green colored highlight as well.
    */
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

function Phantom() {
  /** @class Phantom
    * @global
    * @classdesc Includes all data regarding a Phantom and methods to modify its appareance.

    * @property {Object} fibers Contains all objects for Fiber definition and representation.
    * @property {FiberSource[]} fibers.source FiberSource for each fiber bundle.
    * @property {FiberTube[]}  fibers.tube FiberTube for each fiber bundle. Must have same index as <i>source</i>
    * @property {FiberSkeleton[]}  fibers.skeleton FiberSkeleton for each fiber bundle. Must have same index as <i>source</i>

    * @property {Object} isotropicRegions Contains all objects for Isotropic Region definition and representation.
    * @property {IsotropicRegionSource[]} isotropicRegions.source IsotropicRegionSource for each region bundle.
    * @property {IsotropicRegion[]}  isotropicRegions.sphere IsotropicRegion for each region bundle. Must have same index as <i>source</i>

    * @property {Number} highlightOpacity=0.1 The base opacity for fading meshes in the scene. Over 1.
    * @property {THREE.Color} highlightColor=null The color to be taken by highlighted objects. By default, <i>null</i>, thus color does not change.
    */
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
  /** @function addFiber
    * @memberof Phantom
    * @desc Adds a Fiber to the Phantom, by creating their {@link FiberTube} and {@link FiberSkeleton}.
    * @param {FiberSource} fiber Fiber to be added to the Phantom.
    * @param {Object} [parameters] Optional object containing different optional parameters. Those parameters
    may be the ones to be specified in classes {@link FiberTube} and {@link FiberSkeleton} constructor.
    <br>If only nbElements is defined, sets the rest of those parameters by itself, looking at the
    constant {@link meshConstraints}.
    * @param {Number} [parameters.nbElements] Number of elements to feature in the whole Phantom.
    This allows the function to limit by itself the amout of segments present in the scene. Configurable via constant {@link meshConstraints}. <br>Only taken into
    account if any parameter regarding segments is defined.
    * @param {Number} [replaceindex] If specified, replaces the Fiber yet present in this same index.
    */

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
  /** @function addCP
    * @memberof Phantom
    * @desc Adds a new Control Point to a specified Fiber in the Phantom.
    <br>No position is specified; control point is added over the trajectory in between two existing control points.
    <br>Will {@link render}.
    * @param {Number} fiberindex Index of the fiber in which the control point is to be added to.
    * @param {Number} cpbefore Index of the control point in which the new one is to be added after.
    */
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
    /** @function removeCP
      * @memberof Phantom
      * @desc Removes an existing Control Point of a specified Fiber in the Phantom.
      <br>Will {@link render}.
      * @param {Number} fiberindex Index of the fiber in which the control point is to be removed.
      * @param {Number} cp Index of the control point to be removed.
      */
    var fiber = this.fibers.source[fiberindex];
    fiber.controlPoints.splice(cp, 1);
    var parameters = {
      nbElements: this.fibers.source.length + this.isotropicRegions.source.length
    };
    phantom.addFiber(fiber, parameters, fiberindex);
  },
  addIsotropicRegion: function(region, parameters) {
    /** @function addIsotropicRegion
      * @memberof Phantom
      * @desc Adds a Fiber to the Phantom, by creating their {@link IsotropicRegion}.
      * @param {IsotropicRegionSource} region Fiber to be added to the Phantom.
      * @param {Object} [parameters] Optional object containing different optional parameters. Those parameters
      may be the ones to be specified in class {@link IsotropicRegion} constructor.
      <br>If only nbElements is defined, sets the rest of those parameters by itself, looking at the
      constant {@link meshConstraints}.
      * @param {Number} [parameters.nbElements] Number of elements to feature in the whole Phantom.
      This allows the function to limit by itself the amout of segments present in the scene. Configurable via constant {@link meshConstraints}. <br>Only taken into
      account if any parameter regarding segments is defined.
      */

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
    /** @function radius
      * @memberof Phantom
      * @desc Provides the radius of the Phantom, understood as the distance from the center
      to the most distant bundle.
      * @returns {Number} Radius of the Phantom.
      */
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
    if (maxdist == 0) { var nofibers = true; }
    for (var i = 0; i < this.isotropicRegions.source.length; i++) {
      var region = this.isotropicRegions.source[i];
      var dist = Math.sqrt(
        Math.pow(region.center[0],2) +
        Math.pow(region.center[1],2) +
        Math.pow(region.center[2],2)
      ) + region.radius;
      if (dist > maxdist) {maxdist = dist}
    }
    if (nofibers) {
      if (maxdist > 0) {
        maxdist *= 5;
      } else {
        maxdist = 1;
      }
    }
    return maxdist;
  },
  newFiber: function() {
    /** @function newFiber
      * @memberof Phantom
      * @desc Creates a new <i>blank</i> fiber in the scene.
      <br>The fiber features two points in X axis with {@link Phantom.radius|phantom's radius} distance.
      <br>Will {@link render}.
      */

    // New fiber will feature two points, following the x axis.
    var cp = [
      [-1 * roundToPrecision(this.radius()), 0, 0],
      [roundToPrecision(this.radius()), 0, 0],
    ];
    var radius = roundToPrecision(this.radius() / 10);
    // Add nbElements in parameters so this.addFiber calculates segments by itself
    var parameters = {
      nbElements: this.fibers.source.length + this.isotropicRegions.source.length
    };

    this.addFiber(new FiberSource(cp, 'symmetric', radius), parameters);
  },
  newIsotropicRegion: function() {
    /** @function newIsotropicRegion
      * @memberof Phantom
      * @desc Creates a new <i>blank</i> isotropic region in the scene.
      <br>The isotropic region will be centered in the scene and have 1/5 of {@link Phantom.radius|phantom's radius} as radius.
      <br>Will {@link render}.
      */

    // New region is to stay in the center. Radius is set to be a fifth of phantom radius.
    var center = [0, 0, 0];
    var radius = roundToPrecision(this.radius() / 5);
    // Add nbElements in parameters so this.addIsotropicRegion calculates segments by itself
    var parameters = {
      nbElements: this.fibers.source.length + this.isotropicRegions.source.length
    };

    this.addIsotropicRegion(new IsotropicRegionSource(center, radius), parameters);
  },
  resetColors: function(){
    /** @function resetColors
      * @memberof Phantom
      * @desc Resets color of all bundles. Important when unhighlighting with {@link Phantom#highlightColor|highlightColor} being defined.
      <br>Will {@link render}.
      */

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
    /** @function fadeAll
      * @memberof Phantom
      * @param {Number} [opacity=Phantom.highlightOpacity] Opacity to fade to (over 1)
      * @desc Fades all bundles to given opacity.
      <br>Will {@link render}.
      */

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
    /** @function unfadeAll
      * @memberof Phantom
      * @desc Unfades all bundles, setting opacity to 1.
      <br>Will {@link render}.
      */

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
    /** @function addToScene
      * @memberof Phantom
      * @param {THREE.Scene} scene Scene in which the Phantom will be added to.
      * @desc Adds all Phantom bundles to given scene.
      <br>Will {@link render}.
      */

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
    /** @function addAsSkeleton
      * @memberof Phantom
      * @param {THREE.Scene} scene Scene in which the Phantom will be added to.
      * @desc Adds all Phantom bundles to given scene in a Skeleton form..
      <br>Will {@link render}.
      */

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
    /** @function fiberHighlight
      * @memberof Phantom
      * @param {Number} n Index of the fiber to highlight.
      * @desc Fades all but the given fiber. Highlight opacity cannot be specified.
      <br>Will {@link render}.
      */

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
  regionHighlight: function(n) {
    /** @function regionHighlight
      * @memberof Phantom
      * @param {Number} n Index of the region to highlight.
      * @desc Fades all but the given region. Highlight opacity cannot be specified.
      <br>Will {@link render}.
      */

    // Fade all but wanted region
    this.fadeAll();
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
    /** @function cpHighlight
      * @memberof Phantom
      * @desc Overlays a colored slightly bigger sphere over a control point. Used for
      the user focusing in this element.
      <br>Will {@link render}.
      * @returns {THREE.MeshBasicMaterial} The highlight mesh
      * @param {Number} fiberindex Index of the fiber containing the control point to highlight.
      * @param {Number} controlpointindex Index of the control point to highlight.
      * @param {String} mode Highlight mode:
      <ul>
      <li>'red': Red color. This is the only one not be removed by {@link THREE.Scene.removeCPHighlight} unless specified.
      <li>'blue': Blue color.
      <li>'green': Green color.</ul>
      */

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
        mesh.scale.x = 0.9;
        mesh.scale.y = 0.9;
        mesh.scale.z = 0.9;
        // this will be later used for filtering which points are to be removed.
        mesh.isBlueHighlight = true;
        break;
      default: // Should not happen!
        console.error('Incorrect cpHighlight mode! Was set as ' + mode);
        mesh.material.color = new THREE.Color(0xFFFFFF)
    }

    scene.add(mesh);
    render();

    return mesh;
  },
  revealSkeleton: function(scene, n) {
  /** @function revealSkeleton
    * @memberof Phantom
    * @desc Adds Phantom to the scene and fades all by adding a Skeleton fiber to a
    given fiber. This fiber's tube will feature twice the default opacity for making the user stay focus.
    <br>Will {@link render}.
    * @param {THREE.Scene} scene Scene in which the Phantom will be added to.
    * @param {Number} n Index of the fiber to highlight.
    */
    this.addToScene(scene);
    this.fadeAll();
    // Focus fiber is faded more so that thread can be seen with any problem
    this.fibers.tube[n].mesh.material.opacity = this.highlightOpacity*2;
    this.fibers.tube[n].mesh.renderOrder = -1;
    scene.add(this.fibers.skeleton[n].line, this.fibers.skeleton[n].spheres);
    // Render so changes are made visible
    render();
  }
}
