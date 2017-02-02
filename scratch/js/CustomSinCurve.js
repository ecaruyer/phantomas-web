
// Declaration of object CustomSinCurve
function CustomSinCurve(scale){
  this.scale = (scale === undefined) ? 1 : scale;
}

CustomSinCurve.prototype = Object.create(THREE.Curve.prototype);
CustomSinCurve.prototype.constructor = CustomSinCurve;

CustomSinCurve.prototype.getPoint = function(t) {
  var tx = t * 3 - 1.5;
  var ty = Math.sin(2 * Math.PI * t);
  var tz = 0;
  return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
};
// end of declaration of CustomSinCurve


