/**
 * Filename: trustmarkviewer.js
 * Purpose: Display trustmarks in a panel
 * Created by: ARao 
 */

var self = require("sdk/self");
var tabs = require("sdk/tabs");
var urls = require("sdk/url");

var trustmarkpolicyhelper = require("./trustmarkpolicyhelper.js");
var trustmarkhelper = require("./trustmarkhelper.js");
var { indexedDB }  = require('sdk/indexed-db');


var trustmarkpanel = require("sdk/panel").Panel({

	width: 360,
	height:	460,
        contentURL: self.data.url("panel.html"),
	contentScriptFile: self.data.url("test.js"),
  	onHide: hideTrustmarks,
	onMessage: function(message)
	{

		if(message === "overallpassed")
		{

			var icon = new Object();
		        var jsonString = '{"16" : "./view_icon.png"}';
		        togglebutton.icon  = JSON.parse(jsonString);
		}
		else if(message === "overallfailed")
		{
			console.log("OVerall Failed");
			 var icon = new Object();
                        var jsonString = '{"16" : "./view_icon.png"}';
                        togglebutton.icon  = JSON.parse(jsonString);

		}
		else if(message === "settings")
		{
			var sidebarid = "settings";
			var sidebartitle = "Settings";

			var sidebar = require("sdk/ui/sidebar").Sidebar({
			id: sidebarid,
			title: sidebartitle,
			url: self.data.url("settings.html"),
			onReady: function(worker)
			{
			},
			onHide : function(worker)
			{
				sidebar.dispose();
			},
			onAttach: function(worker)
			{

				worker.port.on("loadtrustmarkdefs", function()
				{
					console.log("In Load");
					trustmarkhelper.loadTrustmarkDefinitions(worker);
				});

				worker.port.on("policypassed", function(policyName, policyType, tip_json) {
					console.log("Policy Passed! " + policyName + " " + policyType + " " + tip_json);
					trustmarkpolicyhelper.uploadUserPolicy2(tip_json, policyName, policyType);	
				});

				worker.port.on("gettips", function(tip_type)
				{
					console.log("Get TIPS");

					trustmarkpolicyhelper.getTIPNicknameList(tip_type, worker);

				});

				worker.port.on("applytip", function(tip_nickname, tip_type)
				{
					console.log("Apply TIP");

					trustmarkpolicyhelper.applyUserPolicy(tip_nickname, tip_type);
				});
			}
			
		      });
		
			sidebar.show();
			trustmarkpanel.hide();
		}
		else
		{
			console.log("Got content script" + message);

			var sidebarid = "trustmark-sidebar-" + message; 
			//TODO: Capitalize first letter
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
					trustmarkpolicyhelper.resetPolicy();
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
        	       	
        		},
			onHide: function()
			{
				sidebar.dispose();
				trustmarkpanel.port.emit("hi");
			}
			});

			sidebar.show();
		}
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

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "access", trustmarkpanel);

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "accountability", trustmarkpanel);

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "transparency", trustmarkpanel);		
		
		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "dataquality", trustmarkpanel);

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "minimization", trustmarkpanel);	

	}	

}

var togglebutton;

function setToggleButton(button)
{
	togglebutton = button;

	/*var icon = new Object();
        var jsonString = '{"16" : "./view_icon.png"}';
        togglebutton.icon  = JSON.parse(jsonString);
        */

}

/**
 * Display the trustmarks in a panel.
 */
function displayTrustmarks(button)
{
	//TODO: On page load - check and set icon
	/*var icon = new Object();
	var jsonString = '{"16" : "./view_icon.png"}';
	button.icon  = JSON.parse(jsonString);
        */
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
exports.setToggleButton = setToggleButton;
exports.iterateThroughTIPs = iterateThroughTIPs;
