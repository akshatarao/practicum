/*
 Filename: main.js
 Created by: ARao
*/
var pageloader = require("./pageloadhandler.js");
var panelviewer = require("./panelviewer.js");
var trustmarkhelper = require("./trustmarkhelper.js");
var trustmarkpolicyhelper = require("./trustmarkpolicyhelper.js");

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
 *@Purpose: Get Temp Store Name
 *@Parameters: none
 *@Returns: Temp Store Name
 */

function getTempStoreName()
{
	return "trustmark-temp";
}

/**
 *@Purpose: Create Temp Store
 *@Params: db - Database pointer
 *@Returns: none
 */
function createTempStore(db)
{
	var objectStoreLabel = getTempStoreName();
	
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		db.deleteObjectStore(objectStoreLabel);
	}
	
	var objectStore = db.createObjectStore(objectStoreLabel, {keyPath: "identifier"});

	objectStore.createIndex("value", "value", {unique:true});

}
/** 
 *@Purpose: Get Recipient Store Name
 *@Parameters: none
 *@Returns: Recipient object store name.
 */
function getRecipientStoreName()
{
	return "recipients";
}

/**
 *@Purpose: Create Recipient Store
 *@Parameters: db - Database pointer
 *@Returns: none
 *TODO: Check if can return a global recipient Object Store variable 
 */
function createRecipientStore(db)
{

	var objectStoreLabel = getRecipientStoreName();

	if(db.objectStoreNames.contains(objectStoreLabel))
        {
                db.deleteObjectStore(objectStoreLabel);
        }

	var objectStore = db.createObjectStore(objectStoreLabel, { keyPath: "identifier" });
        objectStore.createIndex("name", "name", {unique:true});


	objectStore.transaction.onerror = function(event)
	{
		console.log("Recipient Object Store - transaction unsuccessful");
	}

	objectStore.transaction.onsuccess = function(event)
	{
		console.log("Recipient Object Store - transaction successful");
	}

}

/**
 *@Purpose Retrieve Recipient Trustmark Mapping Store Name
 *@Returns objectStore name
 */
function getRecipientTrustmarkMappingStoreName()
{
	return "trustmarkrecipientmapping";
}

/**
 * Purpose: Create Recipient Trustmark Mapping Store
 * Parameter: db - database pointer
 * Returns: none
 * TODO: Check if object store pointer can be returned and stored globally 
 */
function createRecipientTrustmarkMappingStore(db)
{
	const objectStoreLabel = getRecipientTrustmarkMappingStoreName();
	
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		db.deleteObjectStore(objectStoreLabel);
	}

	var objectStore = db.createObjectStore(objectStoreLabel, {keyPath: "trustmark_id"});
	objectStore.createIndex("recipient_id", "recipient_id", {unique: false});
	objectStore.createIndex("trustmark_def_id", "trustmark_def_id", {unique: false});
}

/**
 *@Purpose - Get trustmark store name
 *@Returns - trustmark store name
 */
function getTrustmarkStoreName()
{
	return "trustmarks";
}

/**
 *@Purpose: Create trustmark object store
 *@Parameters: db - Database pointer
 *@Returns: none
 */
function createTrustmarkStore(db)
{
	const objectStoreLabel = getTrustmarkStoreName();
	
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		db.deleteObjectStore(objectStoreLabel);
	}

	var objectStore = db.createObjectStore(objectStoreLabel, {keyPath: "trustmark_id"});
	objectStore.createIndex("trustmark_def_id", "trustmark_def_id", {unique: false});
	objectStore.createIndex("trustmark_json", "trustmark_json", {unique: true});
}

/**
 *@Purpose - Get the TIP store name
 *@Returns none
 */
function getTIPStoreName()
{
	return "tip";
}

/**
 *@Purpose: Create TIP Store
 *@Parameters: db - Database pointer
 *@Returns: None
 */
function createTIPStore(db)
{

	const objectStoreLabel = getTIPStoreName();
	
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		console.log("Deleted tip object store");
		db.deleteObjectStore(objectStoreLabel);
	}

	var objectStore = db.createObjectStore(objectStoreLabel, {keyPath: "tip_id"});
	objectStore.createIndex("tip_json", "tip_json", {unique:true});

}
/**
 * Purpose: Create Object Store
 * Parameter: database_pointer - Database pointer
 * Returns: none
 */
function createObjectStores(database_pointer)
{
	createRecipientStore(database_pointer);
	createRecipientTrustmarkMappingStore(database_pointer);
	createTrustmarkStore(database_pointer);
	createTIPStore(database_pointer);
	createTempStore(database_pointer);
}

/**
 * Purpose: Initialized Database by creating object stores
 * Tables - Recipients
 * 	  - RecipientTrustmarkMapping
 * Returns: none
 **/
function initDB()
{
	const dbName = getDBName();
	var request = indexedDB.open(dbName,2);
	
	request.onerror = function(event) {
		console.log("An error occurred while accessing trustmark DB:" + event.target.errorCode);
	};

	request.onsuccess = function(event) {
		console.log("DB successfully initialized.");
	}

	request.onupgradeneeded = function(event) {
		var db  = event.target.result;

		createObjectStores(db);
 	}


}

/**
 *@Purpose: Utility Function - Check if string is empty
 *@Parameters: String
 *@Returns: TRUE if string is empty
*/
function isEmpty(str) 
{
    return (!str || 0 === str.length);
}

function getDefaultTIP()
{
	var request = indexedDB.open("trustmarkDB", 2);
	var db;

	request.onerror = function(event)
	{
		console.log("An error occurred while opening the database.");
	}

	request.onsuccess = function(event)
	{
		var configFile = self.data.load("defaultTIP/configfile");
		var tips = configFile.split("\n");

		db = event.target.result;

		for( var i in tips)
		{
			if(!isEmpty(tips[i]))
			{
				var tipjson = self.data.load(tips[i]);
				var jsonObj = JSON.parse(tipjson);	
				var tip_id = jsonObj.TrustInteroperabilityProfile.Identifier;
				trustmarkpolicyhelper.addTIPtoCache(db, tip_id, tipjson);
			}
		}
	
	
	}
}
/**
 *@Purpose: Read pre packaged trustmarks and load in database
 *@Parameters: None
 *Returns: None
 */
function getDefaultTrustmarks()
{
	//TODO: Check if file exists

	var request = indexedDB.open("trustmarkDB",2);
        var db;


        request.onerror = function(event)
        {
                console.log("An error occurred while opening the database.");
        }

        request.onsuccess = function(event)
        {
		var configFile = self.data.load("defaulttrustmarks/configfile");
	        var trustmarks = configFile.split("\n");

                console.log("Successfully got a connection to database.");
                db = event.target.result;

		for( var i in trustmarks)
		{
			if(!isEmpty(trustmarks[i]))
			{
				var trustmarkjson = self.data.load(trustmarks[i]);
				var jsonObj = JSON.parse(trustmarkjson);
			
				recipient_id = jsonObj.Trustmark.Recipient.Identifier;
				trustmark_def_id = jsonObj.Trustmark.TrustmarkDefinitionReference.Identifier;
				trustmark_id = jsonObj.Trustmark.Identifier;
	
				/*console.log(jsonObj.Trustmark.Recipient.Identifier);	
				console.log(jsonObj.Trustmark.TrustmarkDefinitionReference.Identifier);
				console.log(jsonObj.Trustmark.Identifier);*/

				trustmarkhelper.addTrustmarkRelationsToCache(db, recipient_id, trustmark_id, trustmark_def_id, trustmarkjson);
			}
		}

	}


}

/**
 *@Purpose: Load Prepackaged data (trustmarks, TIPs)
 *@Parameters: none
 *@Returns: none
 */
function loadPrepackagedData()
{
	getDefaultTrustmarks();
	getDefaultTIP();	
}

function testFunction()
{

	var request = indexedDB.open(getDBName(),2);
	
	request.onsuccess = function(event) {

	db = event.target.result;	
/*	var tipStore = db.transaction("tip", "readwrite").objectStore("tip");
	const data = {tip_id : "pleasegod", tip_json : "ok"}

	var addrequest = tipStore.add(data);		

	addrequest.onsuccess = function(event)
	{
			console.log("Add Request added: " + event.target.result); 
	}

	var getrequest  = tipStore.get("pleasegod");

	getrequest.onsuccess = function(event)
	{
		console.log("Get Request: " + getrequest.result.tip_id);
	}*/

	var tip_id = "http://trustmark.gtri.gatech.edu/schema/examples/trust-interoperability-profiles/tip-minimum.xml";
	trustmarkpolicyhelper.retrieveReferencedTrustmarksFromTIP(db, tip_id, "fake_tip_id");

	}
}

function createFile()
{
  const {Ci,Cu} = require("chrome");
  Cu.import("resource://gre/modules/FileUtils.jsm");

  var file = FileUtils.getFile("TmpD", ["suggestedName.tmp"]); 
  file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
	// do whatever you need to the created file
  console.log(file.path);
} 
initDB();
createFile();
//loadPrepackagedData();
//testFunction();
//trustmarkhelper.retrieveRecipientTrustmarks("www.facebook.com");
var trustmarklist = "";
var tip_id = "http://trustmark.gtri.gatech.edu/schema/examples/trust-interoperability-profiles/tip-minimum.xml";
//trustmarkpolicyhelper.getTIPJSON(tip_id, "fake_id");
//trustmarkpolicyhelper.retrieveReferencedTrustmarksFromTIP(tip_id);
