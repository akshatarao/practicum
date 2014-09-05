/*
 Filename: main.js
 Created by: ARao
*/
var pageloader = require("./pageloadhandler.js");

require("sdk/ui/button/action").ActionButton({
  id: "show-panel",
  label: "Show Panel",
  icon: {
    "16": "./icon-16.png"
  },
  onClick: function() {
    console.log(pageloader.onPageLoad());
  }
});
