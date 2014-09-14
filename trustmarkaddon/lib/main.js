/*
 Filename: main.js
 Created by: ARao
*/
var pageloader = require("./pageloadhandler.js");
var panelviewer = require("./panelviewer.js");
var { ToggleButton } = require('sdk/ui/button/toggle');
var self = require("sdk/self");
var { indexedDB }  = require('sdk/indexed-db');

var button = ToggleButton({
  id: "show-panel",
  label: "Show Panel",
  icon: {
    "16": "./icon-16.png"
  },
  onClick: displayTrustmarkPanel
});

/**
 *Display trustmarks in the panel
 */
function displayTrustmarkPanel(state)
{
	if(state.checked)
	{
		
		//Dummy code
		var jsondata = self.data.load("trial2.json");
		jsonObj = JSON.parse(jsondata);
		console.log(jsonObj.name);
		panelviewer.displayTrustmarks(button);

		//Get tab URL
		//Check if it exists in recipients
		//Get recipient ID
		//Get trustmark IDs for that recipient
		//Get trustmark name per recipient
	}
}

/**
 *Get database name
 */
function getDBName()
{
	return "trustmarkDB";
}

/**
 * Initialized Database
 * Tables - Recipients
 **/
function initDB()
{
	const dbName = getDBName();
	var request = indexedDB.open(dbName,2);
	
	request.onerror = function(event) {
		console.log("An error occurred while accessing trustmark DB:" + event.target.errorCode);
	};

	request.onsuccess = function(event) {
		console.log("Success");
	}

	request.onupgradeneeded = function(event) {
		var db  = event.target.result;

		console.log("DB: " + db);
		var objectStore = db.createObjectStore("recipients", { keyPath: "identifier" });
		objectStore.createIndex("name", "name", {unique:true});
	
		//Insert dummy data	
		objectStore.transaction.oncomplete = function(event)	
		{
			var recipientObjectStore = db.transaction("recipients", "readwrite").objectStore("recipients");
			var facebookstore = { identifier : "www.facebook.com", name: "Facebook, Inc"};
			recipientObjectStore.add(facebookstore); 

		}
 	} 	

}


/**
 * Load trustmarks in cache
 */
function loadTrustmarksInCache()
{

	//Iterate through the folders
	//Iterate through the json files
	//Store indexes in files

	var request = indexedDB.open("trustmarkDB",2);
	var db;

	request.onerror = function(event)
	{
		console.log("DB2 error");
	}

	request.onsuccess = function(event)
	{
		console.log("Successfully got a connection to database");
		db = event.target.result;

		//Access dummy data inserted earlier
		var objectStore = db.transaction("recipients", "readwrite").objectStore("recipients");
		var fbrequest = objectStore.get("www.facebook.com");
		
		fbrequest.onerror = function(event)
		{
			console.log("Error accessing FB data");
		}

		fbrequest.onsuccess = function(event)
		{
			console.log("Success accessing FB data");
			console.log("Recipient Name: " + fbrequest.result.name);
		}	

	}

	//Read through files and insert into database
	var trustmarkjson = self.data.load("trial2.json");
	jsonObj = JSON.parse(trustmarkjson);
	console.log(jsonObj.Trustmark.Identifier);
}

function isEmpty(str) 
{
    return (!str || 0 === str.length);
}
function getDefaultTrustmarks()
{
	var configFile = self.data.load("defaulttrustmarks/configfile");
	var trustmarks = configFile.split("\n");
	
	for( var i in trustmarks)
	{
		if(!isEmpty(trustmarks[i]))
		{
			var trustmarkjson = self.data.load(trustmarks[i]);
			var jsonObj = JSON.parse(trustmarkjson);
			console.log(jsonObj.Trustmark.Recipient.Identifier);	
			console.log(jsonObj.Trustmark.TrustmarkDefinitionReference.Identifier);
		}
	}

	
	//TODO: If does not exist, skip
}
initDB();
loadTrustmarksInCache();
getDefaultTrustmarks();
