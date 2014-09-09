/*
 Filename: main.js
 Created by: ARao
*/
var pageloader = require("./pageloadhandler.js");
var panelviewer = require("./panelviewer.js");
var { ToggleButton } = require('sdk/ui/button/toggle');


var button = ToggleButton({
  id: "show-panel",
  label: "Show Panel",
  icon: {
    "16": "./icon-16.png"
  },
  onClick: displayTrustmarkPanel
});

function displayTrustmarkPanel(state)
{
	if(state.checked)
	{
		panelviewer.displayTrustmarks(button);
	}
}


