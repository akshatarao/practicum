var { indexedDB }  = require('sdk/indexed-db');

/**
 Filename: trustmarkhelper.js
 Purpose: Retrieves trustmarks from trustmark registry server
 Created by: ARao
**/

function loadTrustmarkDefinitions(worker, tip_type)
{
	var dbOpenRequest = indexedDB.open("trustmarkDB", 2);
	var db;

	dbOpenRequest.onsuccess = function(event)
	{
		db = event.target.result;

		var trustmarkDefinitionObjectStore = db.transaction("trustmarkdefs", "readwrite").objectStore("trustmarkdefs");

		var openRequest = trustmarkDefinitionObjectStore.openCursor();
		var test = [];

		openRequest.onerror = function(event)
		{
			console.log("An error occurred while openingObjectStore");
		}
		openRequest.onsuccess = function(event)
		{
			var cursor = event.target.result;

			if(cursor)
			{
				
				var td = cursor.value;

				var td_tip_type = td.tip_type;

				if(td_tip_type === tip_type)
				{
					var td_id = td.identifier;
					var td_name = td.name;
					var td_desc = td.description;
					var td_array = [td_id, td_name, td_desc];
					test.push(td_array);
				}

				cursor.continue();
			}
			else
			{
				
				worker.port.emit("receivetrustmarkdefs", test);
			}
		}

	} 
}

/****
 *@Purpose - Get Trustmark List String from Array
 *@Param - trustmark_array - Array of trustmark identifiers
 *@Returns none
 */
function getTrustmarkList(trustmark_array)
{
	var trustmark_list = "";

	for(var index in trustmark_array)
	{
		trustmark_list += trustmark_array[index];
		trustmark_list += "##TRUSTMARK##";
	}

	return trustmark_list;
}


/***
 *@Purpose: Insert Trustmark Definition in Cache
 *@Param: td_identifier - Trustmark Definition ID
 *@Param: td_name - Trustmark Definition Name
 *@Param: td_desc - Trustmark Description
 *@Returns: none
 */
function insertTrustmarkDefinitionInCache(db, td_identifier, td_name, td_desc, td_tip_type)
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
			//console.log("TD ID: " + td_identifier + "TD Name: " + td_name + "TD Desc: " + td_desc);
			var trustmarkRow = { identifier : td_identifier, name : td_name, description: td_desc, tip_type: td_tip_type};

			trustmarkDefObjectStore.add(trustmarkRow);	
			
		}
		else
		{
			console.log("Trustmark Definition already exists: " + td_identifier);
		}	
	}	
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
 *@Param-	db - Database
 *@Param-	recipient_id - Recipient Identifier
 *@Param-	trustmark_json - Trustmark JSON string
 *@Param - overwriteTrustmarkList - if true, overwrites the existing trustmark list for a recipient with the new trustmark_id_val
 *@Returns none
 */
function addRecipientToCache(db, recipient_id, trustmark_id_val, overwriteTrustmarkList)
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

		       var trustmark_list_val = trustmark_id_val;
			
		       //Append to the existing trustmark list	
		       if(!overwriteTrustmarkList)
		       {
	                       trustmark_list_val =  recipientRequest.result.trustmark_list;
        	               trustmark_list_val += "##TRUSTMARK##";
                	       trustmark_list_val += trustmark_id_val;
		       }
	
                       var newRow = { identifier : recipient_id, trustmark_list : trustmark_list_val };  
                       recipientObjectStore.put(newRow);    
                      //console.log("Trustmark List: " + trustmark_list_val); 
                }
                else
                {
                  	//Update trustmark id to list
                        var recipientRow = { identifier : recipient_id, trustmark_list : trustmark_id_val};
                        recipientObjectStore.add(recipientRow);
                        //console.log("Recipient added : " + recipient_name);
                }
        }

}

/*****
 *@Purpose - Delete trustmark from cache
 *@Param - db - Database pointer
 *@Param - trustmark_id_val - Trustmark ID
 *@Returns none
 */
function deleteTrustmarkFromCache(db, trustmark_id_val)
{
	var trustmarkObjectStore = db.transaction("trustmarks", "readwrite").objectStore("trustmarks");

        var trustmarkRequest = trustmarkObjectStore.delete(trustmark_id_val);

	trustmarkRequest.onSuccess = function(event)
	{
		console.log("Deletion successful of trustmark from trustmark store: " + trustmark_id_val);
	}

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

/****
 *@Purpose - Delete a trustmark recipient mapping from cache
 *@Param - db - Database pointer
 *@Param - trustmark_id_val - Trustmark ID
 *@Returns none
 */
function deleteTrustmarkMappingFromCache(db, trustmark_id_val)
{
	 var trustmarkMappingObjectStore = db.transaction("trustmarkrecipientmapping", "readwrite").objectStore("trustmarkrecipientmapping");

	 var deleteRequest = trustmarkMappingObjectStore.delete(trustmark_id_val);
	 
	 deleteRequest.onsuccess = function(event)
	 {
		console.log("Trustmark successfully deleted from mapping: " + trustmark_id_val);

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
						console.log("Trustmark: " + trustmarkname);
						test[i] = trustmarkname;
						
						i = i+1;
					}
					else
					{

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
	var overwriteTrustmarkList = false;
	addRecipientToCache(db, recipient_id, trustmark_def_id, false);
	addTrustmarkToCache(db, trustmark_id, trustmark_def_id, trustmark_json);
	addTrustmarkMappingToCache(db, trustmark_id, recipient_id, trustmark_def_id);

}


exports.retrieveRecipientTrustmarks = retrieveRecipientTrustmarks;
exports.addTrustmarkRelationsToCache = addTrustmarkRelationsToCache;
exports.insertTrustmarkDefinitionInCache = insertTrustmarkDefinitionInCache;
exports.loadTrustmarkDefinitions = loadTrustmarkDefinitions;
exports.deleteTrustmarkFromCache = deleteTrustmarkFromCache;
exports.deleteTrustmarkMappingFromCache = deleteTrustmarkMappingFromCache;
exports.getTrustmarkList = getTrustmarkList;
exports.addRecipientToCache = addRecipientToCache;
