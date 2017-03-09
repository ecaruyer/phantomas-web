function setupGUI() {
  var fiberSelector = document.getElementById("fiberSelector");
  phantom.fibers.source.forEach( function(fiber, index) {
    var string = '\n<option style="background-color:';
    string += phantom.fibers.tube[index].color.getStyle();
    string +='" onmouseover="phantom.fiberHighlight(';
    string += index.toString();
    string += ');">';
    string += index.toString();
    string += ': ';
    string += fiber.controlPoints.length.toString();
    string += ' Points</option>\n';
    fiberSelector.innerHTML += string;
  });
  // console.log(fiberSelector.innerHTML);
}

// fiberSelector.innerHTML='<option style="background-color:#FF0000" value="1" onmouseover="phantom.fiberHighlight(0);">Primera fibra</option>'
//       <option value="2" onmouseover="phantom.fiberHighlight(1);">Segona</option>
//       <option value="3" onmouseover="phantom.fiberHighlight(2);">Tercera</option>
//       <option value="3" onmouseover="phantom.fiberHighlight(0);">Primera altre cop</option>
//       <option value="3" onmouseover="phantom.fiberHighlight(1);">Segona per segon cop</option>
//       <option value="3" onmouseover="phantom.fiberHighlight(2);">I la tercera</option>
//       <option value="3" onmouseover="phantom.fiberHighlight(2);">I la tercera</option>
//       <option value="3" onmouseover="phantom.fiberHighlight(2);">I la tercera</option>
//       <option value="3" onmouseover="phantom.fiberHighlight(2);">I la tercera</option>
//       <option value="3" onmouseover="phantom.fiberHighlight(2);">I la tercera</option>`
// #FF0000" value="1" onmouseover="phantom.fiberHighlight(0);">Primera fibra</option>
