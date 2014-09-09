/**
 * Filename: trustmarkviewer.js
 * Purpose: Display trustmarks in a panel
 * Created by: ARao 
 */

var self = require("sdk/self");
var trustmarkpanel = require("sdk/panel").Panel({

	width: 180,
	height:	180,
  contentURL: self.data.url("panel.html"),
  onHide: hideTrustmarks  
});

var togglebutton;
/**
 * Display the trustmarks in a panel.
 */
function displayTrustmarks(button)
{
	console.log("Inside display trustmarks");
	togglebutton = button;
	trustmarkpanel.show({
      	position: button
  });
}

/**
 * Hide trustmark panel
 */
function hideTrustmarks()
{
  togglebutton.state('window', {checked:false});
} 
/**
 * Displays the trustmarks rating
 */
function displayTrustmarkRating()
{
	console.log("Inside display trustmark rating");
}

exports.displayTrustmarks = displayTrustmarks;
exports.displayTrustmarkRating = displayTrustmarkRating;

