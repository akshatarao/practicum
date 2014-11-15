/***
 Filename: main.js
 Created by: ARao
*/

//Load all related components
var panelviewer = require("./panelviewer.js");
var trustmarkhelper = require("./trustmarkhelper.js");
var trustmarkpolicyhelper = require("./trustmarkpolicyhelper.js");
var urls = require("sdk/url");
var tabs = require("sdk/tabs");

//Load objects
var { ToggleButton } = require('sdk/ui/button/toggle');
var self = require("sdk/self");
var { indexedDB }  = require('sdk/indexed-db');

//Trustmark Button
var button = ToggleButton({
  id: "show-panel",
  label: "Display privacy report card for this website",
  icon: {
    "32": "./eye-qnmark.png"
  },
  onClick: displayTrustmarkPanel
});

/**
 *@brief Display trustmarks in the panel
 *@param state - togglebutton state
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
 *@brief Get database name
 *@returns Database Name
 */
function getDBName()
{
	return "trustmarkDB";
}

/**
 *@brief Get Temp Store Name
 *@return Temp Store Name
 */

function getTempStoreName()
{
	return "trustmark-temp";
}

/**
 *@brief Create Temp Store
 *@param db - Database pointer
 *@return none
 */
function createTempStore(db)
{
	var objectStoreLabel = getTempStoreName();

	//Check if table exists	
	if(db.objectStoreNames.contains(objectStoreLabel))
	{
		//Delete table if exists
		db.deleteObjectStore(objectStoreLabel);
	}
	
	//Create a table with identifier-value mappings
	var objectStore = db.createObjectStore(objectStoreLabel, {keyPath: "identifier"});
	objectStore.createIndex("value", "value", {unique:true});

}

/** 
 *@brief Get Recipient Store Name
 *@return Recipient object store name.
 */
function getRecipientStoreName()
{
	return "recipients";
}

/**
 *@brief Create Recipient Store
 *@param db - Database pointer
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
 *@brief - Get Trustmark Definition Store name
 *@return Trustmark Definition Store Name
 */
function getTrustmarkDefStoreName()
{
	return "trustmarkdefs";
}

/****
 *@brief Create Trustmark Definition Store
 *@param db - Database pointer
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
 *@brief Retrieve Recipient Trustmark Mapping Store Name
 *@return Recipient Trustmark Mapping objectStore name
 */
function getRecipientTrustmarkMappingStoreName()
{
	return "trustmarkrecipientmapping";
}

/**
 * @brief Create Recipient Trustmark Mapping Store
 * @param db - database pointer
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
 *@brief  Get trustmark store name
 *@return  Trustmark store name
 */
function getTrustmarkStoreName()
{
	return "trustmarks";
}

/**
 *@brief Create trustmark object store
 *@param db - Database pointer
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
 *@brief  Get the TIP store name
 *@return TIP object store name
 */
function getTIPStoreName()
{
	return "tip";
}

/**
 *@brief Create TIP Store
 *@param db - Database pointer
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
 * @brief Create Object Store
 * @param database_pointer - Database pointer
 * @return none
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
 * @brief Initialized Database by creating object stores
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
 *@brief Utility Function - Check if string is empty
 *@param str - String
 *@return TRUE if string is empty
*/
function isEmpty(str) 
{
    	//If string is NULL or string length is 0
	return (!str || 0 === str.length);
}

/***
 *@brief Load default trustmark definition references in cache
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

		var configFileJSON = self.data.load("defaultTrustmarkDefinitionsNew/configFileJSON");
		var configFileJSONObj = JSON.parse(configFileJSON);

		var tdreferencearray = configFileJSONObj.DefaultTrustmarkDefinition.TrustmarkDefinitionList;

		for(var index in tdreferencearray)
		{
			var td = tdreferencearray[index];
			var td_name = td.TrustmarkDefinition.Name;
			var td_desc = td.TrustmarkDefinition.Description;
			var td_identifier = td.TrustmarkDefinition.Identifier;
			var td_tip_type = td.TrustmarkDefinition.TIP;

			trustmarkhelper.insertTrustmarkDefinitionInCache(db, td_identifier, td_name, td_desc, td_tip_type);
	
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

		var configFileJSON = self.data.load("defaultTIPNew/configFileJSON");
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
panelviewer.setToggleButton(button);

  
 //Check if url is among recipients
 //If not retrieve recipient trustsmarks from server
 //Validate if recipient trustmarks are signed and status is active
 //Insert recipient trustmarks into cache
 //If not obtained from cache, send an no recipient trustmarks found to panel
 //Panel should set overalldiv message to no trustmarks received from server (This site's privacy policy has not yet been analysed.
 //Mark all tip divs as display: none
 //Set overall icon to ?
 //If tip divs have trustmarks, then overalldiv message will be overwritten anyway.
 //If tip divs have trustmarks , check recipient trustmark status while iterating through tips
 //Refresh page to see the new policy effects.
 // var url = urls.URL(tabs.activeTab.url);
 // console.log("URL is: " + url);
 // panelviewer.iterateThroughTIPs(url.host);
