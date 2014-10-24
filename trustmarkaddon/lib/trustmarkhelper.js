var { indexedDB }  = require('sdk/indexed-db');

/**
 Filename: trustmarkhelper.js
 Purpose: Retrieves trustmarks from trustmark registry server
 Created by: ARao
**/

/***
 *@Purpose: Insert Trustmark Definition in Cache
 *@Param: td_identifier - Trustmark Definition ID
 *@Param: td_name - Trustmark Definition Name
 *@Param: td_desc - Trustmark Description
 *@Returns: none
 */
function insertTrustmarkDefinitionInCache(db, td_identifier, td_name, td_desc)
{
	var trustmarkDefObjectStore = db.transaction("trustmarkdefs", "readwrite").objectStore("trustmarkdefs");

	var trustmarkDefRequest = trustmarkDefObjectStore.get(td_identifier);
	
	trustmarkDefRequest.onerror = function(event)
	{
		console.log("An error occurred while accessing the trustmark definition store");
	}

	trustmarkDefRequest.onsuccess = function(event)
	{
		if(!event.target.result)
		{
			console.log("TD ID: " + td_identifier + "TD Name: " + td_name + "TD Desc: " + td_desc);
			var trustmarkRow = { identifier : td_identifier, name : td_name, description: td_desc};

			trustmarkDefObjectStore.add(trustmarkRow);	
			
		}
		else
		{
			console.log("Trustmark Definition already exists");
		}	
	}	
}
/**
 * Retrieve trustmarks
 * Params: website_url - URL of the website for which the trustmarks are being retrieved
 * Returns: trustmark XML
 */
function retrieveTrustmarks(website_url)
{
	//console.log("Inside retrieve trustmarks");
}


/**
 *@Purpose - Retrieve recipient name
 *@Parameter - Trustmark JSON String
 *@Returns - Recipient Name
 */
function getRecipientName(trustmark_json_str)
{
	var trustmarkJSON = JSON.parse(trustmark_json_str);
	//TODO: What if label is empty
	return trustmarkJSON.Trustmark.Recipient.Name;
}

/**
 *@Purpose - Add Recipient to Cache
 *@Parameters
 *	db - Database
 *	recipient_id - Recipient Identifier
 *	trustmark_json - Trustmark JSON string
 *@Returns none
 */
function addRecipientToCache(db, recipient_id, trustmark_id_val, trustmark_json)
{
	var recipientObjectStore = db.transaction("recipients", "readwrite").objectStore("recipients");

        var recipientRequest = recipientObjectStore.get(recipient_id);

        recipientRequest.onerror = function(event)
        {
                console.log("An error occurred while accessing the recipient store");
        }

        recipientRequest.onsuccess = function(event)
        {
                if(recipientRequest.result)
                {
		       //Update trustmark id to existing list
                       //console.log("Recipient " + recipientRequest.result.name + " found.");
                       var trustmark_list_val =  recipientRequest.result.trustmark_list;
                       trustmark_list_val += "##TRUSTMARK##";
                       trustmark_list_val += trustmark_id_val;

                       var newRow = { identifier : recipient_id, trustmark_list : trustmark_list_val, name: recipient_name };  
                      recipientObjectStore.put(newRow);    
                      //console.log("Trustmark List: " + trustmark_list_val); 
                }
                else
                {
                  	//Update trustmark id to list
                        var recipient_name = getRecipientName(trustmark_json);
                        var recipientRow = { identifier : recipient_id, trustmark_list : trustmark_id_val,name: recipient_name };
                        recipientObjectStore.add(recipientRow);
                        //console.log("Recipient added : " + recipient_name);
                }
        }

}

function addTrustmarkDefToCache(db, trustmark_def_id_val, trustmark_def_name_val, trustmark_provider_name_val)
{
	var trustmarkDefObjectStore = db.transaction("trustmarkdefs", "readwrite").objectStore("trustmarkdefs");


}

/*@Purpose - Add trustmark to cache
 *@Parameters - db - Database pointer
 *	      - trustmark_id_val = Trustmark Identifier
 *	      - trustmark_def_id_val = Trustmark Definition Identifier
 *	      - trustmark_json_val = Trustmark JSON
 *@Returns none
*/
function addTrustmarkToCache(db, trustmark_id_val, trustmark_def_id_val, trustmark_json_val)
{
	var trustmarkObjectStore = db.transaction("trustmarks", "readwrite").objectStore("trustmarks");

        var trustmarkRequest = trustmarkObjectStore.get(trustmark_id_val);

        trustmarkRequest.onerror = function(event)
        {
                //console.log("An error occurred while accessing the trustmarks store");
        }

        trustmarkRequest.onsuccess = function(event)
        {
                if(trustmarkRequest.result)
                {
                        //console.log("Trustmark " + trustmark_id_val + " found.");
                }
                else
                {
                        var trustmarkRow = { trustmark_id : trustmark_id_val, trustmark_def_id: trustmark_def_id_val, trustmark_json: trustmark_json_val };
                        trustmarkObjectStore.add(trustmarkRow);
                        //console.log("Trustmark added : " + trustmark_id_val);
                }
        }

}

/*@Purpose - Add trustmark mapping to cache
 *@Parameters - db - Database pointer
 *	      - trustmark_id_val = Trustmark Identifier
 *	      - trustmark_def_id_val = Trustmark Definition Identifier
 *	      - trustmark_json_val = Trustmark JSON
 *@Returns none
*/
function addTrustmarkMappingToCache(db, trustmark_id_val, recipient_id_val, trustmark_def_id_val)
{
	var trustmarkMappingObjectStore = db.transaction("trustmarkrecipientmapping", "readwrite").objectStore("trustmarkrecipientmapping");

        var trustmarkMappingRequest = trustmarkMappingObjectStore.get(trustmark_id_val);

        trustmarkMappingRequest.onerror = function(event)
        {
                //console.log("An error occurred while accessing the trustmark mapping store");
        }

        trustmarkMappingRequest.onsuccess = function(event)
        {
                if(trustmarkMappingRequest.result)
                {
                        //console.log("Trustmark " + trustmark_id_val + " found.");
                }
                else
                {
                        var trustmarkMappingRow = { trustmark_id : trustmark_id_val, trustmark_def_id: trustmark_def_id_val, recipient_id: recipient_id_val };
                        trustmarkMappingObjectStore.add(trustmarkMappingRow);
                        //console.log("Trustmark mapping added : " + trustmark_id_val);
                }
        }

}

/**
 *@Purpose - Retrieve Recipient Trustmarks from Cache
 *@Parameter - Recipient Identifier
 *@Returns - Array of trustmark IDs?
 */
function retrieveRecipientTrustmarks(recipient_id)
{

	var dbOpenRequest = indexedDB.open("trustmarkDB",2);
        var db;


        dbOpenRequest.onerror = function(event)
        {
                //console.log("An error occurred while opening the database.");
        }

        dbOpenRequest.onsuccess = function(event)
        {

		db = event.target.result;
	
	        var trustmarkMappingObjectStore = db.transaction("trustmarkrecipientmapping", "readwrite").objectStore("trustmarkrecipientmapping");

		var index = trustmarkMappingObjectStore.index("recipient_id");
		var request = index.openCursor(recipient_id);

		var test = [];
		var i = 0;
		request.onsuccess = function(event)
		{
			var cursor = event.target.result;

			if(cursor)
			{
				var results = cursor.value;

				var trustmark_id = results.trustmark_id;

		
				var trustmarkObjectStore = db.transaction("trustmarks", "readwrite").objectStore("trustmarks");

				var trustmarkRequest = trustmarkObjectStore.get(trustmark_id);

			
	
				trustmarkRequest.onsuccess = function(event)
				{
					if(trustmarkRequest.result)
					{
						var trustmark_json = trustmarkRequest.result.trustmark_json;
						var trustmark_json_obj = JSON.parse(trustmark_json);
						var trustmarkname = trustmark_json_obj.Trustmark.TrustmarkDefinitionReference.Name
						//console.log("Trustmark: " + trustmarkname);
						test[i] = trustmarkname;
						i = i+1;
					}
					else
					{
						//console.log("Test: " + test);
						//TODO: Handle
					}
				}

				trustmarkRequest.onerror = function(event)
				{
					//console.log("An error occurred while retrieving the trustmarks");
				}
		
				cursor.continue();
			}
		

		}


	}

}

/**
 * @Purpose - Add trustmark to cache
 * @Parameters - db - Database
 * 	       - recipient_id - Recipient ID
 *	       - trustmark_id - Trustmark ID
 *	       - trustmark_def_id - Trustmark Definition ID
 *	       - trustmark_json - Trustmark JSON
 */
function addTrustmarkRelationsToCache(db, recipient_id, trustmark_id, trustmark_def_id, trustmark_json)
{

/*	//console.log("Add trustmark to cache");
	//console.log("Recipient ID: " + recipient_id);
	//console.log("Trustmark ID: " + trustmark_id);
	//console.log("Trustmark Def ID:" + trustmark_def_id);
*/
	addRecipientToCache(db, recipient_id, trustmark_def_id, trustmark_json);
	addTrustmarkToCache(db, trustmark_id, trustmark_def_id, trustmark_json);
	addTrustmarkMappingToCache(db, trustmark_id, recipient_id, trustmark_def_id);
	//if not exists, add trustmark-recipient mapping to store	

	//TODO: Update existing trustmark
}

/**
 * Store trustmarks in IndexedDB cache
 * Params: website_url - URL of the website
           trustmark_xml - Trustmark of the website
 */
function storeTrustmarkInCache(website_url, trustmark_xml)
{
	//console.log("Inside store trustmark in cache");
}

/**
 * Retrieve Trustmarks from Cache
 * Params: website_url - Website URL
 */ 
function retrieveTrustmarkFromCache(website_url)
{
	//console.log("Inside retrieve trustmark from cache");
}

exports.retrieveRecipientTrustmarks = retrieveRecipientTrustmarks;
exports.retrieveTrustmarks = retrieveTrustmarks;
exports.storeTrustmarkInCache = storeTrustmarkInCache;
exports.retrieveTrustmarkFromCache = retrieveTrustmarkFromCache;
exports.addTrustmarkRelationsToCache = addTrustmarkRelationsToCache;
exports.insertTrustmarkDefinitionInCache = insertTrustmarkDefinitionInCache;

/*****
 TODO 1. Return trustmark array - See how to return a value upon success - See how to check if cursor ends
      2. Trustmark Definition Cache
      3. Provider Cache
      4. Code comments
      5. Signed trustmarks
****/
