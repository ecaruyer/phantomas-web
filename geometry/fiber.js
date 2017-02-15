/*
This module contains the definition of ``FiberSource``, which is a continuous
representation of a fiber. All the fibers created are supposed to connect two
cortical areas. Currently, the only supported shape for the "cortical surface"
is a sphere.
*/
function FiberSource(control_points, tangents, scale) {
  // Initialize properties. By default tangents = 'symmetric', scale = 1.
  this.control_points = control_points;
  if (tangents === undefined) {
    tangents = 'symmetric';
  }
  this.tangents = tangents;
  if (scale === undefined) {
    scale = 1;
  }
  this.scale = scale;
   /*
    When called, coeficients are calculated.
    This takes the FiberSource instance from control points, and a specified
    mode to compute the tangents.

       Parameters
       ----------
       control_points : ndarray shape (N, 3)
       tangents : 'incoming', 'outgoing', 'symmetric'
       scale : multiplication factor.
           This is useful when the coodinates are given dimensionless, and we
           want a specific size for the phantom.


    The output is the coefficients as f(x)=a0+a1x+a2x^2+a3x^3 for each x, y and
    z and for each pair of points, as this.xpoly, this.ypoly and this.zpoly.
    Timestamps normalized in [0,1] are also calculated in this.ts
  */
  nb_points = control_points.length;
  // Take distance of each pair of given control points
  var distances = [];
  for (var i = 0; i < nb_points-1; i++) {
    var squared_distance = 0;
    for (var j = 0; j < 3; j++) {
      squared_distance += Math.pow(control_points[i+1][j]-control_points[i][j], 2);
    }
    distances[i] = Math.sqrt(squared_distance);
  }
  // Make time interval proportional to distance between control points
  var ts = [0, distances[0]];
  for (var i = 2; i < nb_points; i++) {
    ts[i] = ts[i-1]+distances[i-1];
  }
  length = ts[ts.length - 1];
  for (var i = 0; i < nb_points; i++) {
    ts[i] /= length;
  }

  //INTERPOLATION
  // as [x y z] for each point
  var derivatives = [];
  // For start and ending points; normal to the surface
  derivatives[0]=[];
  derivatives[nb_points-1] = [];
  for (var i = 0; i < 3; i++) {
    derivatives[0][i] = -control_points[0][i];
    derivatives[nb_points-1][i] = control_points[nb_points-1][i];
  }
  // As for other derivatives, we use discrete approx
  switch (tangents) {
    case "incoming":
      for (var i = 1; i < nb_points-1; i++) {
        derivatives[i] = [];
        for (var j = 0; j < 3; j++) {
          derivatives[i][j] = control_points[i][j]-control_points[i-1][j];
        }
      }
      break;
    case "outgoing":
      for (var i = 1; i < nb_points-1; i++) {
        derivatives[i]=[];
        for (var j = 0; j < 3; j++) {
          derivatives[i][j] = control_points[i+1][j]-control_points[i][j];
        }
      }
      break;
    case "symmetric":
      for (var i = 1; i < nb_points-1; i++) {
        derivatives[i] = [];
        for (var j = 0; j < 3; j++) {
          derivatives[i][j] = control_points[i+1][j]-control_points[i-1][j];
        }
      }
      break;
    default:
      console.error("'tangents' should be one of the following:\
        'incoming', 'outgoing', 'symmetric'");
  }
  for (var i = 0; i < derivatives.length; i++) {
    var squared_derivative_norm = 0;
    for (var j = 0; j < 3; j++) {
        squared_derivative_norm += Math.pow(derivatives[i][j], 2);
    }
    var derivative_vector = [];
    for (var j = 0; j < 3; j++) {
        derivative_vector[j] = (derivatives[i][j]
          /Math.sqrt(squared_derivative_norm))*length;
    }
    derivatives[i] = derivative_vector;
  }

  // RETURN POLYNOMIALS
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
  function col(matrix, column) {
    var array = [];
    for (var i = 0; i < matrix.length; i++) {
      array[i] = matrix[i][column];
    }
    return array;
  }

  this.xpoly = poly(ts, col(control_points, 0), col(derivatives, 0));
  this.ypoly = poly(ts, col(control_points, 1), col(derivatives, 1));
  this.zpoly = poly(ts, col(control_points, 2), col(derivatives, 2));
  this.ts = ts;
  this.length = length;
}

/* FiberSource methods definition
  'interpolate' goes from the continuous representation of FiberSource to a
  discretization to given timesteps (ts) between 0 and 1.
  Return is an array which lists [x y z] for each timestep.
  'tangent' outputs normalized derivative as an [x y z] vector for each timestep.
  'curvature' outputs the curvature of the trajectory for each timestep given.
*/
FiberSource.prototype = {
  interpolate: function(ts) {
  /*
  From a ``FiberSource``, which is a continuous representation, to a
      ``Fiber``, a discretization of the fiber trajectory.

      Parameters
      ----------
      ts : array-like, shape (N, )
          A list of "timesteps" between 0 and 1.

      Returns
      -------
      trajectory : array-like, shape (N, 3)
          The trajectory of the fiber, discretized over the provided
          timesteps.
  */
    function interp(coef, t, ti, ti1) {
      factor = (t-ti) / (ti1-ti);
      return coef[0] + coef[1]*factor + coef[2]*Math.pow(factor,2) +
              coef[3]*Math.pow(factor,3);
    }
    var N = ts.length;
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
    }
    return trajectory;
  }
  }
}
