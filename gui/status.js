var guiStatus;

function GuiStatus() {
  /* Using two properties:
    editingFiber -> fiber currently being edited
    editingCP -> CP of the fiber in current edition
    editingRegion -> region currently being edited.
  editingFiber and editingRegion must never be defined at the same time.

  Featuring three methods:
    editing, which recieves as input:
      element, with 'fiber', 'CP' or 'region' as string value.
      index, which specifies its index
    viewing, which removes any editing state. Constructor leaves status this way.
    retrieve, which brings back the state in which it the editor was

    *TO BE CHECKED* apply method usability.
*/
    this.previewing = false;
    document.getElementById("switchViewButton").disabled = true;

    this.editingFiber = undefined;
    this.editingCP = undefined;
    this.editingRegion = undefined;
}

GuiStatus.prototype = {
  editing: function(element, index) {
    switch (element) {
      case 'fiber':
        this.unediting();
        this.editingFiber = index;
        break;
      case 'CP':
        if (this.editingFiber === undefined) {
          console.error('Tried to edit CP with any fiber in edit!');
          break;
        }
        this.editingCP = index;
        break;
      case 'region':
        this.unediting();
        this.editingRegion = index;
        break;
      default: console.error('Element string in status was not correct');
    }

    document.getElementById("switchViewButton").disabled = false;
    document.getElementById("switchViewButton").className = 'w3-btn w3-border w3-hover-aqua w3-block w3-ripple';
  },
  retrieve: function() {
    if (this.previewing) {
      phantom.addToScene(scene);
    } else {
      if (this.editingFiber !== undefined) {
        fiberSelectClick(this.editingFiber, true);
        if (this.editingCP !== undefined) {
          cpSelectClick(this.editingFiber, this.editingCP, true);
          if (!document.getElementById('cpUndoButton').disabled) {
            phantom.cpHighlight(guiStatus.editingFiber, this.editingCP, 'green');
          }
        }
      } else if (this.editingRegion !== undefined) {
        regionSelectClick(this.editingRegion, true)
      } else {
        phantom.addToScene(scene);
        editExit();
      }
    }
  },
  apply: function(element, index) {
    this.editing(element, index);
    this.retrieve();
  },
  unediting: function() {
    this.previewing = false;
    document.getElementById("switchViewButton").value = "Preview";
    document.getElementById("switchViewButton").disabled = true;
    document.getElementById("switchViewButton").className = 'w3-btn w3-border w3-hover-aqua w3-block w3-ripple';

    this.editingFiber = undefined;
    this.editingCP = undefined;
    this.editingRegion = undefined;
  }
}
