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
var pageloadhandler = require("./pageloadhandler.js");
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

			//var icon = new Object();
		        //var jsonString = '{"32" : "./greenshield.png"}';
		        //togglebutton.icon  = JSON.parse(jsonString);
		}
		else if(message === "overallfailed")
		{
			// var icon = new Object();
                        //var jsonString = '{"32" : "./redshield.png"}';
                        //togglebutton.icon  = JSON.parse(jsonString);

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

				worker.port.on("gettipdetails", function(tip_name)
				{
					trustmarkpolicyhelper.getTIPExpressionText(tip_name, worker);
				});

				worker.port.on("loadtrustmarkdefs", function(tip_type)
				{
					trustmarkhelper.loadTrustmarkDefinitions(worker, tip_type);
				});

				worker.port.on("policypassed", function(policyName, policyType, tip_json) {
					trustmarkpolicyhelper.uploadUserPolicy2(tip_json, policyName, policyType);	
				});

				worker.port.on("gettips", function(tip_type)
				{
					trustmarkpolicyhelper.getTIPNicknameList(tip_type, worker);
				});

				worker.port.on("applytip", function(tip_nickname, tip_type)
				{
					trustmarkpolicyhelper.applyUserPolicy(tip_nickname, tip_type);
				});

				worker.port.on("checkuniquetipname", function(tip_name, tip_type, tip_expr)
				{
					trustmarkpolicyhelper.checkIfTipNameIsUnique(worker, tip_name, tip_type, tip_expr);
				});	
			}
			
		      });
		
			sidebar.show();
			trustmarkpanel.hide();
		}
		else
		{

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
        	       	
        		},
			onHide: function()
			{
				sidebar.dispose();
				trustmarkpanel.port.emit("resetpanel");
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
	console.log("Button" + JSON.stringify(togglebutton.icon));

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
}

/**
 * Display the trustmarks in a panel.
 */
function displayTrustmarks(button)
{
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

tabs.on('activate', function(tab) {
        console.log('tab is active', tab.url);

        var url = urls.URL(tab.url);
        var site = url.host;
        pageloadhandler.onPageLoad(site, trustmarkpanel);

	trustmarkpolicyhelper.checkIfRecipientSatisfiesAllActiveTIPs(site,togglebutton);

});

tabs.on('ready', function(tab)
{
        console.log('tab is loaded', tab.title, tab.url);

        if(tab === tabs.activeTab)
        {
                console.log("Im the active tab" + tab.url);
                var url = urls.URL(tab.url);
                var site = url.host;

                pageloadhandler.onPageLoad(site, trustmarkpanel);
		trustmarkpolicyhelper.checkIfRecipientSatisfiesAllActiveTIPs(site,togglebutton);
        }
});

exports.displayTrustmarks = displayTrustmarks;
exports.setToggleButton = setToggleButton;
exports.iterateThroughTIPs = iterateThroughTIPs;
