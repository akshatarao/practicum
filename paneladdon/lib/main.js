var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");

require("sdk/tabs").on("ready", logURL);
 
function logURL(tab) {
  
        alert(tab.url);

	console.log(tab.url);
}

var button = ToggleButton({
  id: "my-button",
  label: "my button",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

var panel = panels.Panel({
  contentURL: self.data.url("panel.html"),
  onHide: handleHide
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });

   var tabs = require("sdk/tabs");

   for each (var tab in tabs)
  	tabs.open(tab.url);
  }
}

function handleHide() {
  button.state('window', {checked: false});
}
