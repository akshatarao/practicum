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


function displayTrustmarkPanel(state)
{
	if(state.checked)
	{
		var jsondata = self.data.load("trial2.json");
		jsonObj = JSON.parse(jsondata);
		console.log(jsonObj.name);
		panelviewer.displayTrustmarks(button);
	}
}

function initDB()
{
	const dbName = "trustmarkDB";

	var request = indexedDB.open(dbName,2);
	

	request.onerror = function(event) {
		console.log("Errors in db access: " + event.target.errorCode);
	};

	request.onsuccess = function(event) {
		console.log("Success");
	}

	request.onupgradeneeded = function(event) {
		var db  = event.target.result;

		console.log("DB: " + db);
		var objectStore = db.createObjectStore("recipients", { keyPath: "identifier" });
		objectStore.createIndex("name", "name", {unique:true});
		
		objectStore.transaction.oncomplete = function(event)	
		{
			var recipientObjectStore = db.transaction("recipients", "readwrite").objectStore("recipients");
			var facebookstore = { identifier : "www.facebook.com", name: "Facebook, Inc"};
			recipientObjectStore.add(facebookstore); 

		}
 	} 	

}

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

	var trustmarkjson = self.data.load("trial2.json");
	jsonObj = JSON.parse(trustmarkjson);
	console.log(jsonObj.Trustmark.Identifier);

	
//	var transaction = db.transaction("recipients", "readwrite");
//	var objectStore = transaction.objectStore("recipients");
//	var request = objectStore.get("www.facebook.com");

/*	request.onerror = function(event) {
		console.log("Error accessing facebook data");
	};


	request.onsuccess = function(event) {

	console.log("Recipient Name: " + request.result.name);
	};*/
}

initDB();
loadTrustmarksInCache();
