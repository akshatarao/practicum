/*
 Filename: main.js
 Created by: ARao
*/
var pageloader = require("./pageloadhandler.js");
var panelviewer = require("./panelviewer.js");
var trustmarkhelper = require("./trustmarkhelper.js");

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
 *Create Recipient Store
 * db - Database pointer
 * Returns none
 *TODO: Check if can return a global recipient Object Store variable 
 */
function createRecipientStore(db)
{
	var objectStore = db.createObjectStore("recipients", { keyPath: "identifier" });
        objectStore.createIndex("name", "name", {unique:true});

         //Insert dummy data     
         objectStore.transaction.oncomplete = function(event)
         {
              var recipientObjectStore = db.transaction("recipients", "readwrite").objectStore("recipients");
              
	     //Adding dummy data
	      //var facebookstore = { identifier : "www.facebook.com", name: "Facebook, Inc"};
              //recipientObjectStore.add(facebookstore);
	      //console.log("Successfully added");
         }

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
 * Purpose: Create Object Store
 * Parameter: database_pointer - Database pointer
 * Returns: none
 */
function createObjectStores(database_pointer)
{
	createRecipientStore(database_pointer);
	createRecipientTrustmarkMappingStore(database_pointer);
	createTrustmarkStore(database_pointer);
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
 * Purpose: Load trustmarks in cache
 * Parameters: recipient_id - Recipient Identifier
 *	       trustmark_id - Trustmark Identifier
 *	       trustmark - Trustmark JSON
 */
function loadTrustmarksInCache(recipient_id, trustmark_id, trustmark_def_id, trustmark)
{

	var request = indexedDB.open("trustmarkDB",2);
	var db;

	request.onerror = function(event)
	{
		console.log("An error occurred while opening the database");
	}

	request.onsuccess = function(event)
	{
		console.log("Successfully got a connection to database");
		db = event.target.result;



		//************DUMMY CODE STARTS HERE*******************
		//Access dummy data inserted earlier
/*		var objectStore = db.transaction("recipients", "readwrite").objectStore("recipients");
		var fbrequest = objectStore.get("www.facebook.com");
		
		fbrequest.onerror = function(event)
		{
			console.log("Error accessing FB data");
		}

		fbrequest.onsuccess = function(event)
		{
			console.log("Success accessing FB data");
			console.log("Recipient Name: " + fbrequest.result.name);
		}	*/
		//************DUMMY CODE ENDS HERE*************
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

initDB();
getDefaultTrustmarks();
trustmarkhelper.retrieveRecipientTrustmarks("www.facebook.com");
