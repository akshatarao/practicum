/***
 * This module contains the initialization code for the addon
 * @module main
*/

/**
 * This module contains the initialization code for the addon
 @class main
*/

//Load all related components
/**
 @requires panelviewer
 @requires trustmarkhelper
 @requires trustmarkpolicyhelper
 @requires sdk/url
 @requires sdk/tabs
 @requires sdk/self
 @requires sdk/indexed-db
 @requires sdk/ui/button/toggle
*/

var panelviewer = require("./panelviewer.js");
var trustmarkhelper = require("./trustmarkhelper.js");
var trustmarkpolicyhelper = require("./trustmarkpolicyhelper.js");
var urls = require("sdk/url");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var { ToggleButton } = require('sdk/ui/button/toggle');
var { indexedDB }  = require('sdk/indexed-db');

//Trustmark Button
/**
 This is the toggle button object
 @attribute button 
*/
var button = ToggleButton({
  id: "show-panel",
  label: "Display privacy report card for this website",
  icon: {
    "32": "./eye-qnmark.png"
  },
  onClick: displayTrustmarkPanel
});

/**
 *Display trustmarks in the panel
 *@method displayTrustmarkPanel
 *@param state {string} togglebutton state
 *@return none
 */
function displayTrustmarkPanel(state)
{

	//Check if toggle button has been clicked
	if(state.checked)
	{
		//If yes, display trustmarks
		panelviewer.displayTrustmarks(button);

	}
}

/**
 *Get database name
 *@method getDBName
 *@return The name of the trustmark addon database
 */
function getDBName()
{
	return "trustmarkDB";
}

/** 
 *Get Recipient Store Name
 *@method getRecipientStoreName
 *@return Recipient object store name.
 */
function getRecipientStoreName()
{
	return "recipients";
}

/**
 *Create Recipient Store
 *@method createRecipientStore
 *@param db {indexedDB object}  Pointer to Trustmark database
 *@return none
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
      	objectStore.createIndex("trustmark_list", "trustmark_list", {unique:false});
}

/***
 * Get Trustmark Definition Store name
 *@method getTrustmarkDefStoreName
 *@return Trustmark Definition Store Name
 */
function getTrustmarkDefStoreName()
{
	return "trustmarkdefs";
}

/**
 * Create Trustmark Definition Store
 *@method createTrustmarkDefinitionStore
 *@param db {indexedDB object} Pointer to the trustmark database
 *@return none
 */
function createTrustmarkDefinitionStore(db)
{
	var objectStoreLabel = getTrustmarkDefStoreName();
	
	//Delete table if exists
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		db.deleteObjectStore(objectStoreLabel);
	}

	//Create table
	var objectStore = db.createObjectStore(objectStoreLabel, {keyPath: "identifier"});
	objectStore.createIndex("name", "name", {unique:true});
	objectStore.createIndex("description", "description", {unique:false});
	objectStore.createIndex("tip_type", "tip_type", {unique:false});
}

/**
 *Retrieve Recipient Trustmark Mapping Store Name
 *@method getRecipientTrustmarkMappingStoreName
 *@return Recipient Trustmark Mapping objectStore name
 */
function getRecipientTrustmarkMappingStoreName()
{
	return "trustmarkrecipientmapping";
}

/**
 * Create Recipient Trustmark Mapping Store
 * @method createRecipientTrustmarkMappingStore
 * @param db {indexedDB object} database pointer
 * @return none
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
 *Get trustmark store name
 *@method getTrustmarkStoreName
 *@return  Trustmark store name
 */
function getTrustmarkStoreName()
{
	return "trustmarks";
}

/**
 *Create trustmark object store
 *@method createTrustmarkStore
 *@param db {indexedDB object} Database pointer
 *@return none
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
 *Get the TIP store name
 *@return TIP object store name
 */
function getTIPStoreName()
{
	return "tip";
}

/**
 *Create TIP Store
 *@param db {indexedDB pointer} Database pointer
 *@return none
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
 * Create all the object stores (tables) required for the trustmark addon
 * @method createObjectStores
 * @param database_pointer - {indexedDB object} Database pointer
 * @return none
 */
function createObjectStores(database_pointer)
{
	//Create all the object stores
	createRecipientStore(database_pointer);
	createRecipientTrustmarkMappingStore(database_pointer);
	createTrustmarkStore(database_pointer);
	createTIPStore(database_pointer);
	createTrustmarkDefinitionStore(database_pointer);
}

/**
 * Initialize the trustmark database
 * @method initDB
 * @return none
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
		
		//Create all the tables/object stores
		createObjectStores(db);
 	}


}

/**
 *Check if string is empty
 *@method isEmpty
 *@param str {String} string
 *@return TRUE if string is empty
*/
function isEmpty(str) 
{
    	//If string is NULL or string length is 0
	return (!str || 0 === str.length);
}

/***
 *Load pre-packaged trustmark definition references in cache
 *@method getDefaultTrustmarkDefs
 *@return none
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

		//Load trustmark definitions configuration file
		var configFileJSON = self.data.load("defaultTrustmarkDefinitionsNew/configFileJSON");
		var configFileJSONObj = JSON.parse(configFileJSON);

		//Load trustmark definiton list
		var tdreferencearray = configFileJSONObj.DefaultTrustmarkDefinition.TrustmarkDefinitionList;

		for(var index in tdreferencearray)
		{
			var td = tdreferencearray[index];
			var td_name = td.TrustmarkDefinition.Name;
			var td_desc = td.TrustmarkDefinition.Description;
			var td_identifier = td.TrustmarkDefinition.Identifier;
			var td_tip_type = td.TrustmarkDefinition.TIP;

			//Insert trustmark definitions in cache
			trustmarkhelper.insertTrustmarkDefinitionInCache(db, td_identifier, td_name, td_desc, td_tip_type);	
		}	
	}	
}

/**
 *Load pre-packaged trust interoperability profiles
 *@method getDefaultTIP
 *@return none
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

		//Load pre-packaged TIP configuration file
		var configFileJSON = self.data.load("defaultTIPNew/configFileJSON");
		var configFileJSONObj = JSON.parse(configFileJSON);

		var tipreferencearray = configFileJSONObj.DefaultTIP.TIPs.TIPList;
		
		//Iterate through list of TIPs
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
 *Read pre packaged trustmarks and load in trustmark database
 *@method getDefaultTrustmarks
 *@return none
 */
function getDefaultTrustmarks()
{
	var request = indexedDB.open("trustmarkDB",2);
        var db;


        request.onerror = function(event)
        {
                console.log("An error occurred while opening the database.");
        }

        request.onsuccess = function(event)
        {
		var configFile = self.data.load("defaulttrustmarksnew/configfile");
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
 *Load Prepackaged data (trustmarks, trust interoperability profiles)
 *@method loadPrepackagedData
 *@return none
 */
function loadPrepackagedData()
{
	getDefaultTrustmarks();
	getDefaultTIP();
	getDefaultTrustmarkDefs();	
}

//Initialize the Database
initDB();

//Load Prepackaged Data
loadPrepackagedData();

//Set Toggle Button variable
panelviewer.setToggleButton(button);
