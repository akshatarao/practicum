/**
 * Filename: trustmarkviewer.js
 * Purpose: Display trustmarks in a panel
 * Created by: ARao 
 */

var self = require("sdk/self");
var tabs = require("sdk/tabs");
var urls = require("sdk/url");

var trustmarkpolicyhelper = require("./trustmarkpolicyhelper.js");
var { indexedDB }  = require('sdk/indexed-db');


var trustmarkpanel = require("sdk/panel").Panel({

	width: 360,
	height:	490,
        contentURL: self.data.url("panel.html"),
	contentScriptFile: self.data.url("test.js"),
  	onHide: hideTrustmarks,
	onMessage: function(message)
	{
		console.log("Got content script" + message);

		var sidebarid = "trustmark-sidebar-" + message; 
		var sidebartitle = message + " trustmarks";
		

		var sidebar = require("sdk/ui/sidebar").Sidebar({
	        id: sidebarid,
	        title: sidebartitle,
	        url: self.data.url("sidebar.html"),
	        onReady: function(worker)
	        {

			var url = urls.URL(tabs.activeTab.url);
			var site = url.host;
			var tip_id = "";
			if(message === "minimization")
			{
				tip_id = trustmarkpolicyhelper.getCurrentMinimizationPolicy();
			 
			}
			else if(message === "transparency")
			{
				tip_id = trustmarkpolicyhelper.getCurrentTransparencyPolicy();
			}
			else if(message === "access")
			{
				tip_id = trustmarkpolicyhelper.getCurrentAccessPolicy();
			}
			else if(message === "accountability")
			{
				tip_id = trustmarkpolicyhelper.getCurrentAccountabilityPolicy();
			}
			else if(message === "dataquality")
			{
				tip_id = trustmarkpolicyhelper.getCurrentDataQualityPolicy();
			}

        	        trustmarkpolicyhelper.displayTIPTrustmarks(worker, tip_id, site);
               		 worker.port.on("trustmarksshown", function()
               		 {
                        	console.log("addon script got the reply");
               		 });
        	},
		onHide: function()
		{
			console.log("Sidebar hidden");
			
			sidebar.dispose();
			trustmarkpanel.port.emit("hi");
		}
		});


		

		sidebar.show();
	} 
});

trustmarkpanel.on("show", function()
{

	var url = urls.URL(tabs.activeTab.url);
	console.log("URL is: " + url);
	iterateThroughTIPs(url.host);


});

function iterateThroughTIPs(recipient_id)
{
	var request = indexedDB.open("trustmarkDB", 2);
	var db;
	
	request.onsuccess = function(event)
	{
		console.log("Recipient is " + recipient_id);
		var db = event.target.result;
		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/access.xml", trustmarkpanel, "access");

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/accountability.xml", trustmarkpanel, "accountability");

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/transparency.xml", trustmarkpanel, "transparency");		
		
		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/dataquality.xml", trustmarkpanel, "dataquality");

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/minimization.xml", trustmarkpanel, "minimization");	

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
