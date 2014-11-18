/**
 * This module is responsible for rendering the trustmark addon panel
 * @module panelviewer
 */

/**
 @class panelviewer
*/

/**
 @requires sdk/self
 @requires sdk/tabs
 @requires sdk/url
 @requires trustmarkpolicyhelper
 @requires trustmarkhelper
 @requires pageloadhandler
 @requires sdk/indexed-db
 */
var self = require("sdk/self");
var tabs = require("sdk/tabs");
var urls = require("sdk/url");

var trustmarkpolicyhelper = require("./trustmarkpolicyhelper.js");
var trustmarkhelper = require("./trustmarkhelper.js");
var pageloadhandler = require("./pageloadhandler.js");
var { indexedDB }  = require('sdk/indexed-db');

var settingssidebar;
var tipsidebar;

/**
 This is the trustmark panel object
 @attribute trustmarkpanel
 */
var trustmarkpanel = require("sdk/panel").Panel({

	width: 360,
	height:	460,
        contentURL: self.data.url("panel.html"),
	contentScriptFile: self.data.url("test.js"),
  	onHide: hideTrustmarks,
	onMessage: function(message)
	{

		//Settings Sidebar Message
		if(message === "settings")
		{
			var sidebarid = "settings";
			var sidebartitle = "Settings";
			
			/**
			 *@attribute Trustmarks Sidebar
			 */
			var sidebar = require("sdk/ui/sidebar").Sidebar({
			id: sidebarid,
			title: sidebartitle,
			url: self.data.url("settings.html"),
			onReady: function(worker)
			{
				//Set the settings sidebar variable
				settingssidebar = sidebar;
			},
			onHide : function(worker)
			{
				//Dispose the sidebar object
				sidebar.dispose();
			},
			onAttach: function(worker)
			{
				//Action on receiving "gettipdetails" message
				
				/**
				 *Get the TIP details given the TIP nickname
				 *@event gettipdetails
 				 *@param tip_name {String} tip name
 				 */
				worker.port.on("gettipdetails", function(tip_name)
				{
					trustmarkpolicyhelper.getTIPExpressionText(tip_name, worker);
				});

				/**
				*Load trustmark definitions for a granular principle (minimization/transparency...)
				*@event loadtrustmarkdefs
				*@param tip_type {minimization|transparency|accountability|access|dataquality} Granular principle
				*/
				worker.port.on("loadtrustmarkdefs", function(tip_type)
				{
					trustmarkhelper.loadTrustmarkDefinitions(worker, tip_type);
				});

				/**
				 *Upload a user defined policy to the trustmark database
				 *@event policypassed
 				 *@param - policyName {string} Policy nickname
				 *@param - policyType {minimization|transparency|accountability|access|dataquality} Granular principle
				 *@param - tip_json - TIP JSON
				 */
				worker.port.on("policypassed", function(policyName, policyType, tip_json) {
					trustmarkpolicyhelper.uploadUserPolicy2(tip_json, policyName, policyType);	
				});

				/**
				 *Get all the trust interoperability profiles for a specific granular principle
				 *@event gettips
				 *@param policyType {minimization|transparency|accountability|access|dataquality} Granular principle
				 */
				worker.port.on("gettips", function(tip_type)
				{
					trustmarkpolicyhelper.getTIPNicknameList(tip_type, worker);
				});

				/**
				 *Make the chosen trust interoperability profile (policy) as the currently active
				 *@event applytip
				 *@param tip_nickname TIP Nickname
				 *@param tip_type {minimization|transparency|accountability|access|dataquality} Granular principle
				 */
				worker.port.on("applytip", function(tip_nickname, tip_type)
				{
					trustmarkpolicyhelper.applyUserPolicy(tip_nickname, tip_type);
				});

				/**
				 *Verify if the user entered TIP name is unique, if it's spark the policypassed event
				 *@event checkuniquetipname
				 *@param tip_name TIP Nickname
				 *@param tip_type {minimization|transparency|accountability|access|dataquality} Granular principle
				 *@param tip_expr TIP trust expression	
				 */
				worker.port.on("checkuniquetipname", function(tip_name, tip_type, tip_expr)
				{
					trustmarkpolicyhelper.checkIfTipNameIsUnique(worker, tip_name, tip_type, tip_expr);
				});	
			}
			
		      });
		
			//Show trustmarks sidebar
			sidebar.show();

			//Hide trustmark panel
			trustmarkpanel.hide();
		}
		else
		{

			//Show the trustmark settings sidebar
			
			var sidebarid = "trustmark-sidebar-" + message; 
			var sidebartitle = message + " trustmarks";

			/**
			 *@attribute Settings sidebar
			 */
			var sidebar = require("sdk/ui/sidebar").Sidebar({
		        id: sidebarid,
	        	title: sidebartitle,
		        url: self.data.url("sidebar.html"),
		        onReady: function(worker)
	        	{

				tipsidebar = sidebar;

				var url = urls.URL(tabs.activeTab.url);
				var site = url.host;
				var tip_id = "";
		
				/**
				 *Display the trustmarks for the currently active policy for the granular principle specified in the message
				 */
				if(message === "minimization" || message === "transparency" || message === "access" || message === "accountability" || message === "transparency")
				{
					trustmarkpolicyhelper.displayTrustmarksForCurrentlyActivePolicy(message, site, worker);
				}
        	       	
        		},
			onHide: function()
			{
				//Dispose trustmark sidebar
				sidebar.dispose();
				
				//Reset trustmark panel selections
				trustmarkpanel.port.emit("resetpanel");
			}
			});

			//Show sidebar
			sidebar.show();

			//Hide the trustmark panel
			trustmarkpanel.hide();
		}
	} 
});

/**
 *Displays the trustmark addon panel (privacy report card)
 *@event show
 */
trustmarkpanel.on("show", function()
{

	//Hide the settings sidebar if open
	if(settingssidebar)
	{
		settingssidebar.dispose();
	}

	//Hide the trustmark sidebar if open
	if(tipsidebar)
	{
		tipsidebar.dispose();
	}

	//For the currently loaded site, iterate through the TIP passing status for each of the granular principles
	var url = urls.URL(tabs.activeTab.url);
	iterateThroughTIPs(url.host);

});

/**
 *For the currently loaded site, check the passing status for every granular principle
 *@method iterateThroughTIPs
 *@param recipient_id {String} hostname of the currently loaded website
 *@return none
 */
function iterateThroughTIPs(recipient_id)
{
	var request = indexedDB.open("trustmarkDB", 2);
	var db;
	
	request.onsuccess = function(event)
	{
		var db = event.target.result;

		//Check if recipient satisfies each granular principle
		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "access", trustmarkpanel);

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "accountability", trustmarkpanel);

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "transparency", trustmarkpanel);		
		
		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "dataquality", trustmarkpanel);

		trustmarkpolicyhelper.checkIfRecipientSatisfiesPolicy(db, recipient_id, "minimization", trustmarkpanel);	

	}	

}

/**
 *Toggle Button that displays the trustmark addon panel
 *@attribute togglebutton
 */
var togglebutton;

/**
 *Setter for the toggle button attribute
 *@method setToggleButton 
 *@param button {ToggleButton} Toggle button for trustmark panel
 */
function setToggleButton(button)
{
	togglebutton = button;
}

/**
 * Display the trustmarks in a panel
 * @method displayTrustmarks
 * @param button {ToggleButton} toggle button
 * @return none
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
 *@method hideTrustmarks
 *@return none
 */
function hideTrustmarks()
{
  togglebutton.state('window', {checked:false});
} 

/**
 *Check if the loaded website passes the privacy settings for all granular principles
 *@event activate
 *@param tab {tab} Browser Tab
 */
tabs.on('activate', function(tab) {

	if(tab.url.indexOf("about") === 0)
        {
              var icon = new Object();
              var jsonString = '{"32" : "./eye-qnmark.png"}';
              togglebutton.icon  = JSON.parse(jsonString);
        }
        else
        {
               var url = urls.URL(tab.url);
               var site = url.host;
               trustmarkpolicyhelper.checkIfRecipientSatisfiesAllActiveTIPs(site,togglebutton);
         }

	//Load trustmarks in the panel
        pageloadhandler.onPageLoad(site, trustmarkpanel);
});

/**
 *Check if the loaded website passes the privacy settings for all granular principles
 *@event ready
 *@param tab {tab} Browser Tab
 */
tabs.on('ready', function(tab)
{

	//When the active tab is loaded
        if(tab === tabs.activeTab)
        {

		//If an empty tab
		if(tab.url.indexOf("about") === 0)
		{
			//Change the toggle button's icon to "Unknown status"
			var icon = new Object();
                        var jsonString = '{"32" : "./eye-qnmark.png"}';
                        togglebutton.icon  = JSON.parse(jsonString);
		}
		else
                {
			//Check if the website satisfies all active TIPs
			var url = urls.URL(tab.url);
              		var site = url.host;
			trustmarkpolicyhelper.checkIfRecipientSatisfiesAllActiveTIPs(site,togglebutton);
		}
		
		//Display the passed/failed status for the settings for each privacy principles 
                pageloadhandler.onPageLoad(site, trustmarkpanel);
        }
});

exports.displayTrustmarks = displayTrustmarks;
exports.setToggleButton = setToggleButton;
exports.iterateThroughTIPs = iterateThroughTIPs;
