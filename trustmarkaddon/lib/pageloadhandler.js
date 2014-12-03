/**
 * Handles the download of trustmarks and invocation of TIP evaluation upon webpage load.
 *@module pageloadhandler
 */

/**
 * Handles the download of trustmarks and invocation of TIP evaluation upon webpage load
  @class pageloadhandler
 */
var urls = require("sdk/url");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var { indexedDB }  = require('sdk/indexed-db');
var trustmarkhelper = require("./trustmarkhelper.js");


/******
 *Utility Function - Check if String is empty
 *@method isEmpty
 *@param  str {String} string
 *@return TRUE if blank string
 */
function isEmpty(str)
{
	if(str && str.length > 0)
	{
		return false;
	}

	return true;
}

/****
 *Get Array of Recipient Trustmarks from List
 *@method getRecipientTrustmarkArray
 *@param trustmark_list {String} ##TRUSTMARK## delimited string of trustmark IDs
 *@return Array of recipient trustmark IDs
 */
function getRecipientTrustmarkArray(trustmark_list)
{
	var trustmark_array = trustmark_list.split("##TRUSTMARK##");
	var trustmark_final_array = [];

	for(var index = 0; index < trustmark_array.length; index++)
	{
		var trustmark_id = trustmark_array[index];

		if(!isEmpty(trustmark_id))
		{
				trustmark_final_array.push(trustmark_id);
		}	
		
	}

        return trustmark_final_array;
}

/***
 *Placeholder - Retrieves the IDs of currently active trustmarks for the recipient
 *@method getRecipientActiveTrustmarkIDListFromServer
 *@Params - Recipient_ID - Hostname of the recipient
 *@Returns - Delimiter separated list of currently active trustmark IDs for recipient
 */
function getRecipientActiveTrustmarkIDListFromServer(recipient_id)
{

	//START OF DUMMY CODE
	var prepackaged_trustmarks_sites = [];
	prepackaged_trustmarks_sites.push("www.facebook.com");
	prepackaged_trustmarks_sites.push("www.amazon.com");
	prepackaged_trustmarks_sites.push("www.bankofamerica.com");
	prepackaged_trustmarks_sites.push("www.udacity.com");
	prepackaged_trustmarks_sites.push("www.healthvault.com");

	for(var index in prepackaged_trustmarks_sites)
	{
		var site = prepackaged_trustmarks_sites[index];

		if(recipient_id === site)
			return "DUMMY_TRUSTMARK_IDS";

	}
	//END of DUMMY code
	

	//TODO: Insert web service here to contact the trustmark server

	//IF no trustmarks were found for the website, return empty string
	return "";
}

/***
 *Get List of inactive trustmarks in Cache
 *@method getInactiveTrustmarks
 *@param cacheRecipientTrustmarkArray {String array} Array of recipient trustmark IDs in cache
 *@param serverRecipientTrustmarkArray {String array} Array of server trustmark IDs in server  
 *@return Array of inactive trustmarks in Cache
 */
function getInactiveTrustmarks(cacheRecipientTrustmarkArray, serverRecipientTrustmarkArray)
{
   var inactiveTrustmarks = [];

    //Compare the recipient's trustmarks present in the cache with the recipient's trustmarks obtained from server
    for(var index = 0; index < cacheRecipientTrustmarkArray.length; index++)
    {
	var cacheTrustmark = cacheRecipientTrustmarkArray[index];
	var found = false;

	//If the server trustmark is found in the cache, mark as found
	for(var index2 = 0; index2 < serverRecipientTrustmarkArray.length; index2++)
	{
	    var serverTrustmark = serverRecipientTrustmarkArray[index2];
	    
	    if(cacheTrustmark === serverTrustmark)
	    {
		found = true;
	    }
	}

	//Add the server trustmarks not found in cache as inactive
	if(!found)
	{
		inactiveTrustmarks.push(cacheTrustmark);
	}

    }

    return inactiveTrustmarks;	

}

/****
 *Get trustmarks that need to be downloaded from server
 *@method getTrustmarksToBeDownloaded
 *@param cacheRecipientTrustmarkArray {String array} Array of recipient trustmarks present in cache
 *@param serverRecipientTrustmarkArray {String array} Array of server trustmarks present in cache
 *@return Array of trustmarks to be downloaded
 */
function getTrustmarksToBeDownloaded(cacheRecipientTrustmarkArray, serverRecipientTrustmarkArray)
{

   var trustmarksToDownload = [];

    for(var index = 0; index < serverRecipientTrustmarkArray.length; index++)
    {
	var serverTrustmark = serverRecipientTrustmarkArray[index];
	var found = false;

	for(var index2 = 0; index2 < cacheRecipientTrustmarkArray.length; index2++)
	{
	    var cacheTrustmark = cacheRecipientTrustmarkArray[index2];
	    
	    if(cacheTrustmark === serverTrustmark)
	    {
		found = true;
	    }
	}

	if(!found)
	{
		trustmarksToDownload.push(serverTrustmark);
	}

    }

    return trustmarksToDownload;	
}


/*****
 *Update trustmarks in cache
 *@method updateTrustmarksInCache
 *@param recipient_id {String} Site URL (www.facebook.com)
 *@param recipientTrustmarkArrayInServer {String array} Array of recipient trustmark IDs that are present in cache
 *@param recipientTrustmarkArrayInCache {String array} Array of recipient trustmark IDs that are present in server
 *@return none
 */
function updateTrustmarksInCache(recipient_id, recipientTrustmarkArrayInCache, recipientTrustmarkArrayInServer)
{
	//Get inactive recipient trustmarks that are present in cache
        var inactivetrustmarks = getInactiveTrustmarks(recipientTrustmarkArrayInCache, recipientTrustmarkArrayInServer);
	//Delete them from trustmark, trustmarkmapping store	
	for(var index in inactivetrustmarks)
	{
		trustmarkhelper.deleteTrustmarkFromCache(inactivetrustmarks[index]);
		trustmarkhelper.deleteTrustmarkMappingFromCache(inactivetrustmarks[index]);
	}

        //Get recipient trustmarks that need to be downloaded from server
        var trustmarksToBeDownloaded = getTrustmarksToBeDownloaded(recipientTrustmarkArrayInCache, recipientTrustmarkArrayInServer);
	downloadTrustmarksFromServer(recipient_id, trustmarksToBeDownloaded);

	//Update recipientTrustmarks In recipientStore

}

/***
 *PLACEHOLDER : Download trustmarks from server
 *@method downloadTrustmarkFromServer
 *@param recipient_id {string} Site URL (www.example.com)
 *@param trustmark_id {string} Trustmark Identifier
 *@return Trustmark JSON string
 */
function downloadTrustmarkFromServer(recipient_id, trustmark_id)
{
	var trustmarkjson = "";

	//TODO: Placeholder for retrieving trustmark from server
	return trustmarkjson;
	
}

/****
 *Download Trustmarks From Server
 *@method downloadTrustmarksFromServer
 *@param recipient_id {String} Recipient_id - Site URL (www.example.com)
 *@param trustmarksToBeDownloaded {String array} Array of trustmark IDs to be downloaded
 *@return none
 */
function downloadTrustmarksFromServer(recipient_id, trustmarksToBeDownloaded)
{
	for(var trustmarkID in trustmarksToBeDownloaded)
        {

                //Download trustmark json string
                var trustmark_json = downloadTrustmarkFromServer(recipient_id, trustmarkID);


                //Insert trustmark into trustmark store and trustmark mapping store
                var jsonObj = JSON.parse(trustmark_json);
                var trustmark_def_id = jsonObj.Trustmark.TrustmarkDefinitionReference.Identifier;
                trustmarkhelper.addTrustmarkRelationsToCache(db, recipient_id, trustmarkID, trustmark_def_id, trustmark_json);
        }


}

/***
 *Verifies if Latest Recipient Trustmarks are In Cache
 *@method
 *@param recipient_id {string} Hostname of the recipient (www.example.com)
 *@param recipientActiveTrustmarkIDsInServer {string} Active recipient trustmarks
 *@return none
 */
function verifyIfLatestRecipientTrustmarksAreInCache(recipient_id, recipientActiveTrustmarkIDsInServer)
{
	//1. Checks if recipient exists in the cache
	var dbRequest  = indexedDB.open("trustmarkDB", 2);
	var db;

	dbRequest.onsuccess = function(event)
	{
		db = event.target.result;

		var recipientObjectStore = db.transaction("recipients", "readwrite").objectStore("recipients");
		var recipientRequest = recipientObjectStore.get(recipient_id);

		recipientRequest.onsuccess = function(event)
		{

			var activeTrustmarks = false;
			var recipientRow = event.target.result;
			

			if(recipientRow)
			{
				var trustmark_list = recipientRow.trustmark_list;
				var recipientTrustmarkArrayInCache = getRecipientTrustmarkArray(trustmark_list);

				//TODO: Change this code when server support is added
				//HACK: As there is no server at the moment, I'm copying trustmark_array to the recipientActiveTrustmarkArray
                                //This should be uncommented when server support is added
				//var recipientTrustmarkArrayInServer = getArray(recipientActiveTrustmarkIDsInServer);
				var recipientTrustmarkArrayInServer = recipientTrustmarkArrayInCache;

				updateTrustmarksInCache(recipient_id, recipientTrustmarkArrayInCache, recipientTrustmarkArrayInServer);
				
				var overwriteTrustmarkList = true;
				var trustmark_list = trustmarkhelper.getTrustmarkList(recipientTrustmarkArrayInServer);
				trustmarkhelper.addRecipientToCache(db, recipient_id, trustmark_list, overwriteTrustmarkList);
			}
			else
			{
				downloadTrustmarksFromServer(recipientActiveTrustmarkIDsInServer);

				//TODO: When the delimiter for recipient active trustmark ID string is determined,
				//need to implement getArray to get an array of trustmark IDs
				//var recipientTrustmarkArrayInServer = getArray(recipientActiveTrustmarkIDsInServer);
				var recipientTrustmarkArrayInServer = []; //DUMMY
				var trustmark_list = trustmarkhelper.getTrustmarkList(recipientTrustmarkArrayInServer);
				var overwriteTrustmarkList = false;

				trustmarkhelper.addRecipientToCache(db, recipient_id, trustmark_list, overwriteTrustmarkList);
			}
	
		}

	}

}

/**
 *Loads the page with a privacy warning frame 
 *@method onPageLoad
 *@param recipient_id {String} website host name (www.example.com)
 *@param trustmarkpanel {Panel object} Trustmark addon panel
 *@return none
 */
function onPageLoad(recipient_id, trustmarkpanel)
{

	//Get recipient trustmarks from the Server
	var recipientActiveTrustmarkIDs = getRecipientActiveTrustmarkIDListFromServer(recipient_id);

	//If server has trustmarks for the website(privacy policy has been reviewed)
	if(!isEmpty(recipientActiveTrustmarkIDs))
	{
		//Check if the latest recipient trustmarks are in the cache
		verifyIfLatestRecipientTrustmarksAreInCache(recipient_id, recipientActiveTrustmarkIDs);
	//	console.log("Verified If recipient trustmarks are in cache: " + recipient_id);
	}
	else
	{
		trustmarkpanel.port.emit("notrustmarks", recipient_id);
	}
}

exports.onPageLoad = onPageLoad;
