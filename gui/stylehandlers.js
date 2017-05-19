/**@overview Contains all functions regarding selection lists hover*/

function optionOnMouseOver(option) {
/** @function optionOnMouseOver
  * @memberof module:GUI Handlers
  * @param {DOM} option Parent option DOM element.
  * @desc Applies hover classes to onmouseovered options in lists.
  */
  if (option.className == 'optionSelected') {
    option.className = 'optionSelectedAndOnMouseOver';
  } else if (option.className == 'optionUnselected') {
    option.className = 'optionOnMouseOver';
  }
}
function optionOnMouseLeave(option) {
/** @function optionOnMouseLeave
  * @memberof module:GUI Handlers
  * @param {DOM} option Parent option DOM element.
  * @desc Restores class to onmouseovered options in lists.
  */
  if (option.className == 'optionSelectedAndOnMouseOver') {
    option.className = 'optionSelected';
  } else if (option.className == 'optionOnMouseOver') {
    option.className = 'optionUnselected';
  }
}

function optionSelect(option) {
/** @function optionSelect
  * @memberof module:GUI Handlers
  * @param {DOM} option Parent option DOM element.
  * @desc Applies selected class to selected options in lists. Removes selected options from other lists.
  */
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
      if (regionoptions.length > 1) {  //Avoids selecting (any) option.
        regionoptions[0].className = 'optionSelected';
      }
    } else {
      if (fiberoptions.length > 1) {  //Avoids selecting (any) option.
        fiberoptions[0].className = 'optionSelected';
      }
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
/** @function selectOption
  * @memberof module:GUI Handlers
  * @param {DOM} list List's DOM element.
  * @param {Number} number Index of option to select
  * @desc Changes class of option as if it was clicked, given the list and its index.
  */
  var options = Array.from(list.childNodes);
  optionSelect(options[number]);
  optionOnMouseLeave(options[number]);
}
