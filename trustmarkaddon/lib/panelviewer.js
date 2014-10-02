/**
 * Filename: trustmarkviewer.js
 * Purpose: Display trustmarks in a panel
 * Created by: ARao 
 */

var self = require("sdk/self");
var tabs = require("sdk/tabs");
var trustmarkpolicyhelper = require("./trustmarkpolicyhelper.js");
var { indexedDB }  = require('sdk/indexed-db');

var trustmarkpanel = require("sdk/panel").Panel({

	width: 360,
	height:	420,
        contentURL: self.data.url("panel.html"),
	contentScriptFile: self.data.url("test.js"),
  	onHide: hideTrustmarks, 
});

trustmarkpanel.on("show", function()
{
	//TODO: Get domain name
/*	const {Ci,Cu,Cc,components} = require("chrome");
	var eTLDService = Cc["@mozilla.org/network/effective-tld-service;1"].getService(Ci.nsIEffectiveTLDService);

	var basedomain = eTLDService.getBaseDomain("https://www.facebook.com");

	var url = tabs.activeTab.url;
	console.log(url);*/
	iterateThroughTIPs("test");


});

function iterateThroughTIPs(recipient_id)
{
	var request = indexedDB.open("trustmarkDB", 2);
	var db;
	
	request.onsuccess = function(event)
	{
		var db = event.target.result;
		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, "www.facebook.com", "http://trustmark.gtri.gatech.edu/schema/examples/trust-interoperability-profiles/tip-minimum.xml", trustmarkpanel);		

	}	

}

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

exports.displayTrustmarks = displayTrustmarks;
