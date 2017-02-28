/*
This module contains the definition of ``FiberSource``, which is a continuous
representation of a fiber. All the fibers created are supposed to connect two
cortical areas.

Parameters
----------
control_points : array-of-arrays shape (N, 3)
tangents : 'incoming', 'outgoing', 'symmetric'
scale : multiplication factor.
    This is useful when the coodinates are given dimensionless, and we
    want a specific size for the phantom.

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

  // Calculate coefficients
  this.polycalc();
}

/* FiberSource methods definition
  'polycalc' calculates coefficients for each polynomial. Needed in constructor
    and once any of the three FiberSource input change.
  'interpolate' goes from the continuous representation of FiberSource to a
  discretization to given timesteps (ts) between 0 and 1.
  Return is an array which lists [x y z] for each timestep.
*/
FiberSource.prototype = {
  polycalc: function() {
    /*
     When called, coefficients are calculated.
     This takes the FiberSource instance from control points, and a specified
     mode to compute the tangents.

     The output is the coefficients as f(x)=a0+a1x+a2x^2+a3x^3 for each x, y and
     z and for each pair of points, as this.xpoly, this.ypoly and this.zpoly.
     Timestamps normalized in [0,1] are also calculated in this.ts
   */
   // Take distance of each pair of given control points
    nb_points = this.control_points.length;
    var distances = [];
    for (var i = 0; i < nb_points-1; i++) {
      var squared_distance = 0;
      for (var j = 0; j < 3; j++) {
        squared_distance +=
          Math.pow(this.control_points[i+1][j] - this.control_points[i][j], 2);
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
      derivatives[0][i] = -this.control_points[0][i];
      derivatives[nb_points-1][i] = this.control_points[nb_points-1][i];
    }
    // As for other derivatives, we use discrete approx
    switch (this.tangents) {
      case "incoming":
        for (var i = 1; i < nb_points-1; i++) {
          derivatives[i] = [];
          for (var j = 0; j < 3; j++) {
            derivatives[i][j] =
              this.control_points[i][j] - this.control_points[i-1][j];
          }
        }
        break;
      case "outgoing":
        for (var i = 1; i < nb_points-1; i++) {
          derivatives[i]=[];
          for (var j = 0; j < 3; j++) {
            derivatives[i][j] =
              this.control_points[i+1][j] - this.control_points[i][j];
          }
        }
        break;
      case "symmetric":
        for (var i = 1; i < nb_points-1; i++) {
          derivatives[i] = [];
          for (var j = 0; j < 3; j++) {
            derivatives[i][j] =
              this.control_points[i+1][j] - this.control_points[i-1][j];
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
    this.xpoly = poly(ts, col(this.control_points, 0), col(derivatives, 0));
    this.ypoly = poly(ts, col(this.control_points, 1), col(derivatives, 1));
    this.zpoly = poly(ts, col(this.control_points, 2), col(derivatives, 2));
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
    var scale = this.scale;
    function interp(coef, t, ti, ti1) {
      factor = (t-ti) / (ti1-ti);
      return (coef[0] + coef[1]*factor + coef[2]*Math.pow(factor,2) +
              coef[3]*Math.pow(factor,3)) * scale;
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
  SetControlPoint: function(n, x, y, z) {
    this.control_points[n] = [x, y, z];
  }

}
