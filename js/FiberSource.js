/*
This module contains the definition of ``FiberSource``, which is a continuous
representation of a fiber. All the fibers created are supposed to connect two
cortical areas.

Parameters
----------
controlPoints : array-of-arrays shape (N, 3)
tangents : 'incoming', 'outgoing', 'symmetric'
radius : fiber radius; same dimensions as controlPoints.
[ deprecated ] scale : multiplication factor.
    This is useful when the coodinates are given dimensionless, and we
    want a specific size for the phantom.

*/
function FiberSource(controlPoints, tangents, radius) {
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

  // Calculate coefficients
  this.polyCalc();

  // FiberSource objects will act as subjects to FiberTube or FiberSkeleton
  this.observers = [];
}

/* FiberSource methods definition
  'polyCalc' calculates coefficients for each polynomial. Needed in constructor
    and once any of the three FiberSource input change.
  'interpolate' goes from the continuous representation of FiberSource to a
  discretization to given timesteps (ts) between 0 and 1.
  Return is an array which lists [x y z] for each timestep.
*/
FiberSource.prototype = {
  polyCalc: function() {
    /*
     When called, coefficients are calculated.
     This takes the FiberSource instance from control points, and a specified
     mode to compute the tangents.

     The output is the coefficients as f(x)=a0+a1x+a2x^2+a3x^3 for each x, y and
     z and for each pair of points, as this.xpoly, this.ypoly and this.zpoly.
     Timestamps normalized in [0,1] are also calculated in this.ts
   */
   // Take distance of each pair of given control points
    nbPoints = this.controlPoints.length;
    var distances = [];
    for (var i = 0; i < nbPoints-1; i++) {
      var squareDistance = 0;
      for (var j = 0; j < 3; j++) {
        squareDistance +=
          Math.pow(this.controlPoints[i+1][j] - this.controlPoints[i][j], 2);
      }
      distances[i] = Math.sqrt(squareDistance);
    }
    // Make time interval proportional to distance between control points
    var ts = [0, distances[0]];
    for (var i = 2; i < nbPoints; i++) {
      ts[i] = ts[i-1]+distances[i-1];
    }
    length = ts[ts.length - 1];
    for (var i = 0; i < nbPoints; i++) {
      ts[i] /= length;
    }

    //INTERPOLATION
    // as [x y z] for each point
    var derivatives = [];
    // For start and ending points; normal to the surface
    derivatives[0]=[];
    derivatives[nbPoints-1] = [];
    for (var i = 0; i < 3; i++) {
      derivatives[0][i] = -this.controlPoints[0][i];
      derivatives[nbPoints-1][i] = this.controlPoints[nbPoints-1][i];
    }
    // As for other derivatives, we use discrete approx
    switch (this.tangents) {
      case "incoming":
        for (var i = 1; i < nbPoints-1; i++) {
          derivatives[i] = [];
          for (var j = 0; j < 3; j++) {
            derivatives[i][j] =
              this.controlPoints[i][j] - this.controlPoints[i-1][j];
          }
        }
        break;
      case "outgoing":
        for (var i = 1; i < nbPoints-1; i++) {
          derivatives[i]=[];
          for (var j = 0; j < 3; j++) {
            derivatives[i][j] =
              this.controlPoints[i+1][j] - this.controlPoints[i][j];
          }
        }
        break;
      case "symmetric":
        for (var i = 1; i < nbPoints-1; i++) {
          derivatives[i] = [];
          for (var j = 0; j < 3; j++) {
            derivatives[i][j] =
              this.controlPoints[i+1][j] - this.controlPoints[i-1][j];
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
          derivativeVector[j] = (derivatives[i][j]
            /Math.sqrt(squaredDerivativeNorm))*length;
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
      for (var i = 0; i < t.length-1; i++) {
        coef[i] = [p[i],
                (t[i+1]-t[i]) * pd[i],
                3*p[i+1] - (t[i+1]-t[i])*pd[i+1] - 2*(t[i+1]-t[i])*pd[i] - 3*p[i],
                (t[i+1]-t[i])*pd[i+1] - 2*p[i+1] + (t[i+1]-t[i])*pd[i] + 2*p[i]
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
  /*
  From a ``FiberSource``, which is a continuous representation, to a
      ``Fiber``, a discretization of the fiber trajectory.

      Parameters
      ----------
      ts : array-like, shape (N, )
          A list of "timesteps" between 0 and 1.
          OR
          A single value for a timestep between 0 and 1.

      Returns
      -------
      trajectory : array-like, shape (N, 3)
          The trajectory of the fiber, discretized over the provided
          timesteps.
  */
  // interp implements equation used for coefficients [a,b,c,d], described above.
    function interp(coef, t, ti, ti1) {
      factor = (t-ti) / (ti1-ti);
      return (coef[0] + coef[1]*factor + coef[2]*Math.pow(factor,2) +
              coef[3]*Math.pow(factor,3));
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
      for (var j = 0; j < this.ts.length-1; j++) {
        if ((ts[i] >= this.ts[j]) && (ts[i] <= this.ts[j+1])) {
          break;
        }
        if (j == this.ts.length-2) {
          console.error('Value '+i+' (being '+ts[i]+
          ') is out of bounds ['+this.ts[0]+','
          +this.ts[this.ts.length-1]+'].');
          continue traj;
        }
      }
      trajectory[i] = [];
      trajectory[i][0] = interp(this.xpoly[j], ts[i], this.ts[j], this.ts[j+1]);
      trajectory[i][1] = interp(this.ypoly[j], ts[i], this.ts[j], this.ts[j+1]);
      trajectory[i][2] = interp(this.zpoly[j], ts[i], this.ts[j], this.ts[j+1]);
      if (ts.constructor !== Array) {
        trajectory = trajectory[0];
      }
    }
      return trajectory;
  },
  // Pushes an object to the observer list. Once added, will be notified.
  addObserver: function(object) {
    this.observers.push(object)
  },
  // Refreshes objects in the observer list
  notify: function() {
    for(var i = 0; i < this.observers.length; i++) {
      this.observers[i].refresh();
    }
    render();
  },
  // setControlPoint changes a control point for this Fiber.
  // inputs: n (position in controlPoints array) and x, y, z coordinates.
  setControlPoint: function(n, axis, value) {
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
      default: console.error('Wrong axis set in fiber.setControlPoint. Called for ' + axis);
    }
    this.polyCalc();
    this.notify();
  }
}

// An isotropic region has a spherical shape
function IsotropicRegionSource(center, radius) {
  this.center = center;
  this.radius = radius;
  this.observers = [];
}
IsotropicRegionSource.prototype = {
  // Refreshes objects in the observer list
  notify: function() {
    for(var i = 0; i < this.observers.length; i++) {
      this.observers[i].refresh();
    }
    render();
  },
  setCenter: function(axis, value) {
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
      default: console.error('Incorrect axis label for IsotropicRegion.setCenter(label, value)');
    }
    this.notify();
  },
  setRadius: function(radius) {
    this.radius = radius;
    this.notify();
  },
  addObserver: function(object) {
    this.observers.push(object)
  }
}
