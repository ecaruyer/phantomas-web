// Parsable objects must contain only those parameters the loaders expect to find
ParsableFiber = function(control_points, tangents, radius, color) {
  this.control_points = control_points;
  this.tangents = tangents;
  this.radius = Number(radius);
  this.color = Number(color.getHex());
}
ParsableRegion = function(center, radius, color) {
  this.center = center;
  this.radius = Number(radius);
  this.color = Number(color.getHex());
}

// Returns a JSON string with the phantom in ParsableFiber and ParsableRegion classes
Phantom.prototype.export = function() {
  var parsable_phantom = new Object;
  parsable_phantom.fiber_geometries = new Object;
  parsable_phantom.isotropic_regions = new Object;

  // FIBERS
  this.fibers.source.forEach( function(source, index) {
    var control_points = [];
    // Control Points are expected in a unique string.
    source.controlPoints.forEach( function(cp) {
      cp.forEach( function(element){
        control_points.push(element);
      });
    });

    var parsable_fiber = new ParsableFiber(control_points, source.tangents, source.radius, source.color);
    // Fiber names featured in Phantomas are not featured here. Instead, numbers are applied.
    parsable_phantom.fiber_geometries[index.toString()] = parsable_fiber;
  });

  // ISOTROPICREGIONS
  this.isotropicRegions.source.forEach( function(source, index) {
    var parsable_region = new ParsableRegion(source.center, source.radius, source.color);
    // Fiber names featured in Phantomas are not featured here. Instead, numbers are applied.
    parsable_phantom.isotropic_regions[index.toString()] = parsable_region;
  });

  // null,2 automatically indents json file
  var parsed_phantom = JSON.stringify(parsable_phantom, null, 2);

  return parsed_phantom;
}

pushDownload = function(content) {
  // From http://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
  function timestamp() {
    // Partly from https://stackoverflow.com/questions/12409299/how-to-get-current-formatted-date-dd-mm-yyyy-in-javascript-and-append-it-to-an-i
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = today.getMonth()+1; //January is 0!
    if(mm<10){
      mm='0'+mm;
    }
    var dd = today.getDate();
    if(dd<10){
      dd='0'+dd;
    }
    var hh = today.getHours();
    if (hh<10) {
      hh='0'+hh;
    }
    var mn = today.getMinutes();
    if (mn<10) {
      mn='0'+mn;
    }

    var timestamp = dd+mm+yyyy+hh+mn;
    return timestamp;
  }
  var uriContent = "data:text/json;charset=utf-8," + encodeURIComponent(content);
  var dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute("href", uriContent);
  dlAnchorElem.setAttribute("download", timestamp()+"-phantom_save.json");
  dlAnchorElem.click();
}
