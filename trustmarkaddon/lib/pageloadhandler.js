/**
 * File: pageloader.js
 * Purpose: Displays page warnings upon page load and activates policy
 * Created by: ARao
 */

var urls = require("sdk/url");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var { indexedDB }  = require('sdk/indexed-db');
var trustmarkhelper = require("./trustmarkhelper.js");

function printTrustmarkList(trustmarkarray)
{
	console.log("Trustmark array: " + trustmarkarray);
}

tabs.on('activate', function(tab) {
	console.log('tab is active', tab.url);

	var url = urls.URL(tabs.url);
        var site = url.host;

	onPageLoad(site);

});

tabs.on('ready', function(tab)
{
	console.log('tab is loaded', tab.title, tab.url);
	
	if(tab === tabs.activeTab)
	{
		console.log("Im the active tab" + tab.url);

		var url = urls.URL(tab.url);
	        var site = url.host;

		onPageLoad(site);
	}
});

function isEmpty(str)
{
	if(str && str.length > 0)
	{
		return false;
	}

	return true;
}

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
 *@Purpose - Placeholder - Retrieves the IDs of currently active trustmarks for the recipient
 *@Params - Recipient_ID - Hostname of the recipient
 *@Returns - Delimiter separated list of currently active trustmark IDs for recipient
 */
function getRecipientActiveTrustmarkIDListFromServer(recipient_id)
{
	//TODO: Insert web service here to contact the trustmark server
	return "";
}

/***
 *@Purpose - Get List of inactive trustmarks in Cache
 *@Param - cacheRecipientTrustmarkArray - Array of recipient trustmark IDs in cache
 *@Param - serverRecipientTrustmarkArray - Array of server trustmark IDs in server  
 *@Returns - Array of inactive trustmarks in Cache
 */
function getInactiveTrustmarks(cacheRecipientTrustmarkArray, serverRecipientTrustmarkArray)
{
   var inactiveTrustmarks = [];

    for(var index = 0; index < cacheRecipientTrustmarkArray.length; index++)
    {
	var cacheTrustmark = cacheRecipientTrustmarkArray[index];
	var found = false;

	for(var index2 = 0; index2 < serverRecipientTrustmarkArray.length; index2++)
	{
	    var serverTrustmark = serverRecipientTrustmarkArray[index2];
	    
	    if(cacheTrustmark === serverTrustmark)
	    {
		found = true;
	    }
	}

	if(!found)
	{
		inactiveTrustmarks.push(cacheTrustmark);
	}

    }

    return inactiveTrustmarks;	

}

/****
 *@Purpose - Get trustmarks that need to be downloaded from server
 *@Param - cacheRecipientTrustmarkArray - Array of recipient trustmarks present in cache
 *@Param - serverRecipientTrustmarkArray - Array of server trustmarks present in cache
 *@Returns - array of trustmarks to be downloaded
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
 *@Purpose - Update trustmarks in cache
 *@Param - recipient_id - Site URL (www.facebook.com)
 *@Param - recipientTrustmarkArrayInServer - Array of recipient trustmark IDs that are present in cache
 *@Param - recipientTrustmarkArrayInCache - Array of recipient trustmark IDs that are present in server
 *@Returns - none
 */
function updateTrustmarksInCache(recipient_id, recipientTrustmarkArrayInCache, recipientTrustmarkArrayInServer)
{
	console.log("Updating trustmarks!");
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
 *@Purpose - Download trustmarks from server
 *@Param - recipient_id - Site URL (www.facebook.com)
 *@Param - trustmark_id - Trustmark Identifier
 *@Returns - Trustmark JSON string
 */
function downloadTrustmarkFromServer(recipient_id, trustmark_id)
{
	var tipjson = "";

	//TODO: Placeholder for retrieving trustmark from server
	return tipjson;
	
}

/****
 *@Purpose - Download Trustmarks From Server
 *@Param - Recipient_id - Site URL (www.facebook.com)
 *@Param - trustmarksToBeDownloaded - Array of trustmark IDs to be downloaded
 *@Returns - none
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
 *@Purpose - Verifies if Latest Recipient Trustmarks are In Cache
 *@Param - Recipient_id - Hostname of the Recipient (www.facebook.com)
 *@Param - RecipientActiveTrustmarkIDsInServer - Active recipient trustmarks
 *@Returns - none
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
 * Loads the page with a privacy warning frame 
 */
function onPageLoad(recipient_id)
{

	var recipientActiveTrustmarkIDs = getRecipientActiveTrustmarkIDListFromServer(recipient_id);
	console.log("Got Recipient Active Trustmark IDs from Server: " + recipient_id);

	verifyIfLatestRecipientTrustmarksAreInCache(recipient_id, recipientActiveTrustmarkIDs);
	console.log("Verified If recipient trustmarks are in cache: " + recipient_id);

	console.log("page load");
}

exports.onPageLoad = onPageLoad;
exports.printTrustmarkList = printTrustmarkList;
