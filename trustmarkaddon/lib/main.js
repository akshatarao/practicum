/***
 Filename: main.js
 Created by: ARao
*/

//Load all related components
var pageloader = require("./pageloadhandler.js");
var panelviewer = require("./panelviewer.js");
var trustmarkhelper = require("./trustmarkhelper.js");
var trustmarkpolicyhelper = require("./trustmarkpolicyhelper.js");

//Load objects
var { ToggleButton } = require('sdk/ui/button/toggle');
var self = require("sdk/self");
var { indexedDB }  = require('sdk/indexed-db');

//Trustmark Button
var button = ToggleButton({
  id: "show-panel",
  label: "Show Panel",
  icon: {
    "16": "./icon-16.png"
  },
  onClick: displayTrustmarkPanel
});

/**
 *@Purpose: Display trustmarks in the panel
 *@
 */
function displayTrustmarkPanel(state)
{
	if(state.checked)
	{
		panelviewer.displayTrustmarks(button);

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

	//Check if table exists	
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		db.deleteObjectStore(objectStoreLabel);
	}
	
	//Delete if it doesn't exist
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

	//Delete table if it exists
	if(db.objectStoreNames.contains(objectStoreLabel))
        {
                db.deleteObjectStore(objectStoreLabel);
        }

	//Create recipient object store
	var objectStore = db.createObjectStore(objectStoreLabel, { keyPath: "identifier" });
        objectStore.createIndex("name", "name", {unique:true});
      	objectStore.createIndex("trustmark_list", "trustmark_list", {unique:false});


	objectStore.transaction.onerror = function(event)
	{
		console.log("Recipient Object Store - transaction unsuccessful");
	}

	objectStore.transaction.onsuccess = function(event)
	{
		console.log("Recipient Object Store - transaction successful");
	}

}

function getTrustmarkDefStoreName()
{
	return "trustmarkdefs";
}

function createTrustmarkDefinitionStore(db)
{
	var objectStoreLabel = getTrustmarkDefStoreName();
	
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		db.deleteObjectStore(objectStoreLabel);
	}

	var objectStore = db.createObjectStore(objectStoreLabel, {keyPath: "identifier"});
	objectStore.createIndex("name", "name", {unique:true});
	objectStore.createIndex("description", "description", {unique:false});
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
	
	//Delete table if exists
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		db.deleteObjectStore(objectStoreLabel);
	}

	//Create table
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
	
	//Delete table if exists
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		db.deleteObjectStore(objectStoreLabel);
	}

	//Create table
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
	
	//Delete table if exists
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		console.log("Deleted tip object store");
		db.deleteObjectStore(objectStoreLabel);
	}

	//Create table 
	var objectStore = db.createObjectStore(objectStoreLabel, {keyPath: "tip_id"});
	objectStore.createIndex("tip_json", "tip_json", {unique:false});
	objectStore.createIndex("trustmark_list", "trustmark_list", {unique: false});
	objectStore.createIndex("trust_expression", "trust_expression", {unique: false});
	objectStore.createIndex("type", "type", {unique: false});
	objectStore.createIndex("isActive", "isActive", {unique: false});
	objectStore.createIndex("nickname", "nickname", {unique: true});

}
/**
 * Purpose: Create Object Store
 * Parameter: database_pointer - Database pointer
 * Returns: none
 */
function createObjectStores(database_pointer)
{
	//Create all the object stores
	createRecipientStore(database_pointer);
	createRecipientTrustmarkMappingStore(database_pointer);
	createTrustmarkStore(database_pointer);
	createTIPStore(database_pointer);
	createTempStore(database_pointer);
	createTrustmarkDefinitionStore(database_pointer);
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
    	//If string is NULL or string length is 0
	return (!str || 0 === str.length);
}

/***
 *@Purpose: Load default trustmark definition references in cache
 *@Returns: none
 */
function getDefaultTrustmarkDefs()
{
	var request = indexedDB.open("trustmarkDB", 2);
	var db;

	request.onerror = function(event)
	{
		console.log("An error occurred while opening the database.");
	}

	request.onsuccess = function(event)
	{
		db = event.target.result;

		var configFileJSON = self.data.load("defaultTrustmarkDefinitions/configFileJSON");
		var configFileJSONObj = JSON.parse(configFileJSON);

		var tdreferencearray = configFileJSONObj.DefaultTrustmarkDefinition.TrustmarkDefinitionList;

		for(var index in tdreferencearray)
		{
			var td = tdreferencearray[index];
			var td_name = td.TrustmarkDefinition.Name;
			var td_desc = td.TrustmarkDefinition.Description;
			var td_identifier = td.TrustmarkDefinition.Identifier;

			trustmarkhelper.insertTrustmarkDefinitionInCache(db, td_identifier, td_name, td_desc);
	
		}	
	}	
}
/**
 *@Purpose: Load Default TIPS
 *@Parameters: none
 *@Returns: none
 */
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
		db = event.target.result;
		//Read list of tips to be loaded from config file

		var configFileJSON = self.data.load("defaultTIP/configFileJSON");
		var configFileJSONObj = JSON.parse(configFileJSON);

		var tipreferencearray = configFileJSONObj.DefaultTIP.TIPs.TIPList;


		for(var index in tipreferencearray)
		{
			var tip = tipreferencearray[index];
			var tip_type = tip.TIP.Type;
			var tip_nickname = tip.TIP.Nickname;

			//Parse TIP
			var tipjson = self.data.load(tip.TIP.Path);
			var jsonObj = JSON.parse(tipjson);	
			var tip_id = jsonObj.TrustInteroperabilityProfile.Identifier;
		
			var isActive = "1";	
			//Insert TIP In Cache	
			trustmarkpolicyhelper.insertTIPInCache(db, tip_id, tipjson, tip_nickname, tip_type, isActive);
		}

	}
}

/**
 *@Purpose: Read pre packaged trustmarks and load in database
 *@Parameters: None
 *@Returns: None
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

		//Iterate through config file to get trustmarks
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

				//Insert trustmark to cache
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
	getDefaultTrustmarkDefs();	
}

function createFile()
{
  const {Ci,Cu,Cc,components} = require("chrome");
  Cu.import("resource://gre/modules/FileUtils.jsm");
  Cu.import("resource://gre/modules/NetUtil.jsm");

  var data = "Hi";
  var file = FileUtils.getFile("TmpD", ["suggestedName.tmp"]); 
  file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
	// do whatever you need to the created file
  console.log(file.path);

  var ostream = FileUtils.openSafeFileOutputStream(file);
  var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
  
  converter.charset = "UTF-8";
  var istream = converter.convertToInputStream(data);

	// The last argument (the callback) is optional.
  NetUtil.asyncCopy(istream, ostream, function(status) {
  if (!components.isSuccessCode(status)) {
    // Handle error!
    return;
  }});

}

initDB();
loadPrepackagedData();
//trustmarkpolicyhelper.uploadUserPolicy("/home/justinekays/access.json", "Custom Access", "access");
//trustmarkpolicyhelper.applyUserPolicy("Custom Access", "access");
/*TODO
 1. ICONs for each TIP
 2. Case insensitive replace for AND

*/
