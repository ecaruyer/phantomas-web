function optionOnMouseOver(option) {
  if (option.className == 'optionSelected') {
    option.className = 'optionSelectedAndOnMouseOver';
  } else if (option.className == 'optionUnselected') {
    option.className = 'optionOnMouseOver';
  }
}

function removeOnMouseOver() {
  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");
  var cpSelector = document.getElementById("cpSelector");
  var fiberoptions = Array.from(fiberSelector.childNodes);
  var regionoptions = Array.from(regionSelector.childNodes);

  fiberoptions.forEach( function( element ) {
    if (element.className == 'optionOnMouseOver') {
      element.className = 'optionUnselected';
    } else if (element.className == 'optionSelectedAndOnMouseOver'){
      element.className = 'optionSelected';
    }
  });
  regionoptions.forEach( function( element ) {
    if (element.className == 'optionOnMouseOver') {
      element.className = 'optionUnselected';
    } else if (element.className == 'optionSelectedAndOnMouseOver'){
      element.className = 'optionSelected';
    }
  });
  if (cpSelector) {
    var pointsoptions = Array.from(cpSelector.childNodes);
    pointsoptions.forEach( function( element ) {
      if (element.className == 'optionOnMouseOver') {
        element.className = 'optionUnselected';
      } else if (element.className == 'optionSelectedAndOnMouseOver'){
        element.className = 'optionSelected';
      }
    });
  }
}

function optionSelect(option) {
  var fiberSelector = document.getElementById("fiberSelector");
  var regionSelector = document.getElementById("regionSelector");
  if ((option.parentNode == fiberSelector) | (option.parentNode == regionSelector)) {
    var fiberoptions = Array.from(fiberSelector.childNodes);
    var regionoptions = Array.from(regionSelector.childNodes);

    fiberoptions.forEach( function( element ) {
      element.className = 'optionUnselected';
    });
    regionoptions.forEach( function( element ) {
      element.className = 'optionUnselected';
    });

    if (option.parentNode == fiberSelector) {
      regionoptions[0].className = 'optionSelected';
    } else {
      fiberoptions[0].className = 'optionSelected';
    }
  } else {
    var listoptions = Array.from(option.parentNode.childNodes);
    listoptions.forEach( function( element ) {
      element.className = 'optionUnselected';
    });
  }
  option.className = 'optionSelectedAndOnMouseOver'
}

function selectOption(list, number) {
  var options = Array.from(list.childNodes);
  optionSelect(options[number]);
}
