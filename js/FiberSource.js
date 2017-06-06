/** @overview Contains Class definitions for {@link FiberSource} and {@link IsotropicRegionSource}. */

/** @constant colors
 * @desc An HEX array used as a color library for random generation.
 */
var colors = [0xFF1E00, 0xFFB300, 0x1533AD, 0x00BF32, 0xBF4030,
  0xBF9430, 0x2C3D82, 0x248F40, 0xA61300, 0xA67400,
  0x071C71, 0x007C21, 0xFF5640, 0xFFC640, 0x4965D6,
  0x38DF64, 0xFF8373, 0xFFD573, 0x6F83D6, 0x64DF85,
  0xFF5600, 0xFF7C00, 0x04859D, 0x00AA72, 0x60D4AE,
  0xBF6030, 0xBF7630, 0x206876, 0x207F60, 0x5FBDCE,
  0xA63800, 0xA65100, 0x015666, 0x006E4A, 0xFFB773,
  0xFF8040, 0xFF9D40, 0x37B6CE, 0x35D4A0, 0xFFA273
];


function FiberSource(controlPoints, tangents, radius, color) {
  /** @class FiberSource
  * @classdesc A fiber bundle in Phantomas is defined as a cylindrical tube wrapped around
  its centerline. The centerline itself is a continuous curve in 3D, and can be
  simply created from a few control points. All the fibers created are supposed to connect two
  cortical areas.<br>
  * FiberSource is the basic Class for the representation of a Fiber. Objects containing
  the geometries to be added to the scene are to be referred to FiberSource for
  gathering any necessary information.

  * @param {array} controlPoints Array-of-arrays (N, 3) containing the 3-D coordinates
  of the fiber Control Points.
  * @param {string} [tangents='symmetric'] Way the tangents are to be computed.
  Available options: 'incoming', 'outgoing', 'symmetric'
  * @param {number} [radius=1] Fiber radius; same dimensions as controlPoints.
  * @param {number} [color] Color in which the fiber should be displayed. If not
  specified, to be picked randomly from {@link colors}.

  * @property {array} observers Objects to be notified when some change is applied
  */

  // Initialize properties. By default tangents = 'symmetric', radius = 1.
  this.controlPoints = controlPoints;

  if (tangents === undefined) {
    tangents = 'symmetric';
  }
  this.tangents = tangents;

  if (radius === undefined) {
    radius = 1;
  }
  this.radius = radius;

  if (color === undefined) {
    color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
  }
  this.color = new THREE.Color(color);

  // Calculate coefficients
  this.polyCalc();

  // FiberSource objects will act as subjects to FiberTube or FiberSkeleton
  this.observers = [];
}

FiberSource.prototype = {
  polyCalc: function() {
    /** @function polyCalc
      * @memberof FiberSource
      * @desc When called, coefficients are calculated.
        This takes the FiberSource instance from control points, and a specified
        mode to compute the tangents.<br>
        The output is the coefficients as <p style='margin-left: 10em; font-family:monospace'>
        (x,y,z)(t)= a + b[(t-ti)/(ti1-ti)] + c[(t-ti)/(ti1-ti)]^2 + d[(t-ti)/(ti1-ti)]^3</p> for each x, y and
        z and for each pair of points, as <i>this.xpoly</i>, <i>this.ypoly</i> and <i>this.zpoly</i>.
        Timestamps normalized in <[0,1] are also calculated in <i>this.ts</i>.
     */
    // Take distance of each pair of given control points
    nbPoints = this.controlPoints.length;
    var distances = [];
    for (var i = 0; i < nbPoints - 1; i++) {
      var squareDistance = 0;
      for (var j = 0; j < 3; j++) {
        squareDistance +=
          Math.pow(this.controlPoints[i + 1][j] - this.controlPoints[i][j], 2);
      }
      distances[i] = Math.sqrt(squareDistance);
    }
    // Make time interval proportional to distance between control points
    var ts = [0, distances[0]];
    for (var i = 2; i < nbPoints; i++) {
      ts[i] = ts[i - 1] + distances[i - 1];
    }
    length = ts[ts.length - 1];
    for (var i = 0; i < nbPoints; i++) {
      ts[i] /= length;
    }

    //INTERPOLATION
    // as [x y z] for each point
    var derivatives = [];
    // For start and ending points; normal to the surface
    derivatives[0] = [];
    derivatives[nbPoints - 1] = [];
    for (var i = 0; i < 3; i++) {
      derivatives[0][i] = -this.controlPoints[0][i];
      derivatives[nbPoints - 1][i] = this.controlPoints[nbPoints - 1][i];
    }
    // As for other derivatives, we use discrete approx
    switch (this.tangents) {
      case "incoming":
        for (var i = 1; i < nbPoints - 1; i++) {
          derivatives[i] = [];
          for (var j = 0; j < 3; j++) {
            derivatives[i][j] =
              this.controlPoints[i][j] - this.controlPoints[i - 1][j];
          }
        }
        break;
      case "outgoing":
        for (var i = 1; i < nbPoints - 1; i++) {
          derivatives[i] = [];
          for (var j = 0; j < 3; j++) {
            derivatives[i][j] =
              this.controlPoints[i + 1][j] - this.controlPoints[i][j];
          }
        }
        break;
      case "symmetric":
        for (var i = 1; i < nbPoints - 1; i++) {
          derivatives[i] = [];
          for (var j = 0; j < 3; j++) {
            derivatives[i][j] =
              this.controlPoints[i + 1][j] - this.controlPoints[i - 1][j];
          }
        }
        break;
      default:
        console.error("'tangents' should be one of the following:\
          'incoming', 'outgoing', 'symmetric'");
    }
    for (var i = 0; i < derivatives.length; i++) {
      var squaredDerivativeNorm = 0;
      for (var j = 0; j < 3; j++) {
        squaredDerivativeNorm += Math.pow(derivatives[i][j], 2);
      }
      var derivativeVector = [];
      for (var j = 0; j < 3; j++) {
        derivativeVector[j] = (derivatives[i][j] /
          Math.sqrt(squaredDerivativeNorm)) * length;
      }
      derivatives[i] = derivativeVector;
    }

    // RETURN POLYNOMIALS
    /*Function that returns 4x4 array with polynomials [a,b,c,d] for given ts (t),
        control points (p) and derivatives (pd).
        Values of a, b, c and d are found by solving the system
         (t)= a + b[(t-ti)/(ti1-ti)] + c[(t-ti)/(ti1-ti)]^2 + d[(t-ti)/(ti1-ti)]^3
        along with its derivative, being ti and ti1 t_i and t_(i+1).
    */
    function poly(t, p, pd) {
      coef = [];
      for (var i = 0; i < t.length - 1; i++) {
        coef[i] = [p[i],
          (t[i + 1] - t[i]) * pd[i],
          3 * p[i + 1] - (t[i + 1] - t[i]) * pd[i + 1] - 2 * (t[i + 1] - t[i]) * pd[i] - 3 * p[i],
          (t[i + 1] - t[i]) * pd[i + 1] - 2 * p[i + 1] + (t[i + 1] - t[i]) * pd[i] + 2 * p[i]
        ];
      }
      return coef;
    }
    // Col extracts columns for matrices as array-of-arrays.
    function col(matrix, column) {
      var array = [];
      for (var i = 0; i < matrix.length; i++) {
        array[i] = matrix[i][column];
      }
      return array;
    }
    this.xpoly = poly(ts, col(this.controlPoints, 0), col(derivatives, 0));
    this.ypoly = poly(ts, col(this.controlPoints, 1), col(derivatives, 1));
    this.zpoly = poly(ts, col(this.controlPoints, 2), col(derivatives, 2));
    this.ts = ts;
    this.length = length;
  },

  interpolate: function(ts) {
    /** @function interpolate
      * @memberof FiberSource
      * @param {Number[]|Number} ts List of "timesteps" (or a single) between 0 and 1.
        From a ``FiberSource``, which is a continuous representation, to a
        ``Fiber``, a discretization of the fiber trajectory.
      * @return {array} The trajectory of the fiber, discretized over the provided
        timesteps in an array-of-arrays form (N, 3)
    */
    // interp implements equation used for coefficients [a,b,c,d], described above.
    function interp(coef, t, ti, ti1) {
      factor = (t - ti) / (ti1 - ti);
      return (coef[0] + coef[1] * factor + coef[2] * Math.pow(factor, 2) +
        coef[3] * Math.pow(factor, 3));
    }
    // Single value option
    if (ts.constructor !== Array) {
      var N = 1;
      ts = [ts];
    } else {
      var N = ts.length;
    }
    var trajectory = [];
    traj: for (var i = 0; i < N; i++) {
      for (var j = 0; j < this.ts.length - 1; j++) {
        if ((ts[i] >= this.ts[j]) && (ts[i] <= this.ts[j + 1])) {
          break;
        }
        if (j == this.ts.length - 2) {
          console.error('Value ' + i + ' (being ' + ts[i] +
            ') is out of bounds [' + this.ts[0] + ',' +
            this.ts[this.ts.length - 1] + '].');
          continue traj;
        }
      }
      trajectory[i] = [];
      trajectory[i][0] = interp(this.xpoly[j], ts[i], this.ts[j], this.ts[j + 1]);
      trajectory[i][1] = interp(this.ypoly[j], ts[i], this.ts[j], this.ts[j + 1]);
      trajectory[i][2] = interp(this.zpoly[j], ts[i], this.ts[j], this.ts[j + 1]);
      if (ts.constructor !== Array) {
        trajectory = trajectory[0];
      }
    }
    return trajectory;
  },
  addObserver: function(object) {
    /** @function addObserver
     * @memberof FiberSource
     * @param {object} object Object to be added to <i>this.observers</i> array.
     * @desc Add object to <i>this.observers</i> property
     */
    this.observers.push(object)
  },
  notify: function() {
    /** @function notify
     * @memberof FiberSource
     * @desc Runs .refresh() method to all objects present in <i>this.observers</i> property. Renders.
     */
    for (var i = 0; i < this.observers.length; i++) {
      this.observers[i].refresh();
    }
    render();
  },
  // setControlPoint changes a control point for this Fiber.
  // inputs: n (position in controlPoints array) and x, y, z coordinates.
  setControlPoint: function(n, axis, value, notrefresh) {
    /** @function setControlPoint
     * @memberof FiberSource
     * @desc Sets a value to a given Control Point in a given Axis. Refreshes coefficients and notifies observers.
     * @param {number} n Index in this.controlPoints of Control Point to be set.
     * @param {string} axis Axis in which to apply the change 'x', 'y' or 'z'.
     * @param {number} value Value to set.
     */
    switch (axis) {
      case 'x':
        this.controlPoints[n][0] = value;
        break;
      case 'y':
        this.controlPoints[n][1] = value;
        break;
      case 'z':
        this.controlPoints[n][2] = value;
        break;
      default:
        console.error('Wrong axis set in fiber.setControlPoint. Called for ' + axis);
    }

    if (!notrefresh) {
      this.polyCalc();
      this.notify();
    }
  }
}

function IsotropicRegionSource(center, radius, color) {
  /** @class IsotropicRegionSource
    * @classdesc An Isotropic Region is defined in Phantomas as an empty spherical space.<br>
    * IsotropicRegionSource is the basic Class for the representation of an Isotropic Region. Objects containing
    the geometries to be added to the scene are to be referred to IsotropicRegionSource for
    gathering any necessary information.

    * @param {array} center Array containing the 3-D coordinates
    of the center point in which the Isotropic Region is located.
    * @param {number} [radius=1] Isotropic Region radius.
    * @param {number} [color] Color in which the Isotropic Region should be displayed in. If not
    specified, to be picked randomly from {@link colors}.

    * @property {array} observers Objects to be notified when some change is applied
  */
  this.center = center;
  this.radius = radius;

  if (color === undefined) {
    color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
  }
  this.color = new THREE.Color(color);

  this.observers = [];
}
IsotropicRegionSource.prototype = {
  // Refreshes objects in the observer list
  notify: function() {
    /** @function notify
     * @memberof IsotropicRegionSource
     * @desc Runs .refresh() method to all objects present in <i>this.observers</i> property. Renders.
     */

    for (var i = 0; i < this.observers.length; i++) {
      this.observers[i].refresh();
    }
    render();
  },
  setCenter: function(axis, value, notrefresh) {
    /** @function setCenter
     * @memberof IsotropicRegionSource
     * @param {string} axis Axis in which to apply the new value
     * @param {number} value New value to be applied
     * @desc Changes the center of the Isotropic Region for a given new. Notifies observers.
     */
    switch (axis) {
      case 'x':
        this.center[0] = value;
        break;
      case 'y':
        this.center[1] = value;
        break;
      case 'z':
        this.center[2] = value;
        break;
      default:
        console.error('Incorrect axis label for IsotropicRegion.setCenter(label, value)');
    }

    if (!notrefresh) {
      this.notify();
    }
  },
  setRadius: function(radius) {
    /** @function setRadius
     * @memberof IsotropicRegionSource
     * @param {number} radius New value to be applied
     * @desc Changes the radius of the Isotropic Region for a given new. Notifies observers.
     */
    this.radius = radius;
    this.notify();
  },
  addObserver: function(object) {
    /** @function addObserver
     * @memberof IsotropicRegionSource
     * @param {object} object Object to be added to <i>this.observers</i> array.
     * @desc Add object to <i>this.observers</i> property
     */

    this.observers.push(object)
  }
}
