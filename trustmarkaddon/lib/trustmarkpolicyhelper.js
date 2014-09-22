/**
 * File: trustmarkpolicyhelper.js
 * Purpose: Trustmark Policy Handler
 * Created by: ARao 
 */

var { indexedDB } = require('sdk/indexed-db');
/**
 * Create a policy 
 */
function createPolicy()
{
	console.log("Inside create policy");
}

/**
 *@Purpose: Insert TIP into Cache
 *@Parameters: db - Database pointer
 *	       tip_id - TIP Identifier
 *	       tip_json - TIP JSON
 *@Returns: None
 */
function addTIPtoCache(db, tip_id_val, tip_json_val)
{
	var tipObjectStore = db.transaction("tip", "readwrite").objectStore("tip");
	var tipRow = { tip_id: tip_id_val, tip_json: tip_json_val, trustmark_list: ""};
	
	var addrequest = tipObjectStore.add(tipRow);

	addrequest.onsuccess = function(event)
	{
		console.log("Successfully added: " + event.target.result);
	}

	addrequest.onerror = function(event)
	{
		console.log("An error occurred while adding the TIP : " + event.target.errorCode);
	}
			
}

/**
 *@Purpose: Retrieve Referenced Trustmarks from TIP
 *@Parameters: tip_id - TIP identifier
	       trustmark_list - Set of trustmarks	
 *@Returns: List of referenced trustmarks
 */
function getTIPJSON(db, tip_id, temp_store_id)
{
	
	var dbOpenRequest = indexedDB.open("trustmarkDB", 2);


		var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");
		var tipRequest = TIPObjectStore.get(tip_id);

		tipRequest.onsuccess = function(event)
                {
                        if(event.target.result)
                        {
                                tip_json = event.target.result.tip_json;
                                var tip_json_obj = JSON.parse(tip_json);
                                var tip_name = tip_json_obj.TrustInteroperabilityProfile.Name;
                                console.log("TIP Name: " + tip_name);

				var tempObjectStore = db.transaction("trustmark-temp","readwrite").objectStore("trustmark-temp");
				var tempRow = {"identifier": temp_store_id, "value": tip_json }
				var tempAddRequest = tempObjectStore.add(tempRow);
			
				tempAddRequest.onsuccess = function(event)
				{
					console.log("Successfully added to temp store:" + event.target.result);
				}

				tempAddRequest.onerror = function(event)
				{
					console.log("An error occurred while adding temp variable " + temp_store_id + " to tempstore: " + event.target.errorCode);
				}

				var tempRequest = tempObjectStore.get("fake_id");

			        tempRequest.onsuccess = function(event)
			        {
       					 var tip_json = event.target.result.value;
        				 console.log("TIP JSON1: " + tip_json);
				}

                        }
                        else
                        {
                                console.log("Did not find TIP: " + tip_id);
                        }
			
		}



}
/**
 * @Purpose - Verify if trustmark adheres to policy
 * @Parameters - policy_xml - Policy XML
 * 	 	 trustmark_xml - Trustmark XML
 * @Returns - none
 */
function verifyIfTrustmarkAdheresToPolicy(policy_xml, trustmark_xml)
{
	console.log("Inside verify if trustmark adheres to policy");
}

/**
 * @Purpose - Take the action of the policy adherence/non-adherence on the site
 * @Parameters - policy_xml - Policy XML
 * 	       - trustmark_xml - Trustmark XML
 * @Returns None
 */
function effectPolicyActionOnSite(policy_xml, trustmark_xml)
{
	console.log("Inside effect policy action on site");
}

function getTrustmarkList(tip_json)
{

    var trustmarkList = "";
    var trustmarkseparator = "##TRUSTMARK##";

    var JSONObj = JSON.parse(tip_json);
    var trustmarkreferencearray = JSONObj.TrustInteroperabilityProfile.References.TrustmarkDefinitionReferenceList;
    var trustmarkset = new Set();

    for(var index in trustmarkreferencearray)
    {
        var reference = trustmarkreferencearray[index];
        var referenceID = reference.TrustmarkDefinitionReference.Identifier;
        trustmarkList += referenceID;
        trustmarkList += trustmarkseparator;

    } 

    return trustmarkList;

}

function appendValueInTempStore(tipObjectStore, tip_id, tip_json, trustmark, tipreferencearray, currentindex)
{
	var getRequest = tipObjectStore.get(tip_id);

	getRequest.onsuccess = function(event)
	{
		if(event.target.result)
		{
			console.log("Trustmark to append: " + trustmark);
			var trustmarklist = event.target.result.trustmark_list;
			trustmarklist += "##TRUSTMARK##";
			trustmarklist += trustmark;
	
			console.log("Updated list: " + trustmarklist);		
			var newRow = { "tip_id" : tip_id, "tip_json": tip_json , "trustmark_list": trustmarklist};
			
			var updateRequest = tipObjectStore.put(newRow);	

			updateRequest.onsuccess = function(event)
			{
				console.log("The trustmark list was updated successfully for " + tip_id);

				var getRequest = tipObjectStore.get(tip_id);

                                getRequest.onsuccess = function(event)
                                {
                                        console.log(event.target.result.trustmark_list);
					appendTrustmarksRecursively(tipreferencearray, currentindex, tip_id, tip_json, tipObjectStore);
                                }

			}

			updateRequest.onerror = function(event)
			{
				console.log("The trustmark list could not be updated for " + tip_id);
			}
		}
		else
		{
			var newRow  = { "tip_id" : tip_id, "tip_json": tip_json, "trustmark_list": trustmark};

			var addRequest = tipObjectStore.add(newRow);
			
			addRequest.onsuccess = function(event)
			{
				console.log("The trustmark list was successfully added for " + tip_id);
			}

			addRequest.onerror = function(event)
			{
				console.log("The tip could not be added for " + tip_id);
			}	 
		}	
		
	}

}

function appendTrustmarksRecursively(tipreferencearray, currentindex, tip_id, tip_json, TIPObjectStore)
{
	if(!tipreferencearray || (currentindex === tipreferencearray.length))
	{
		return;
	}

        var tipreference = tipreferencearray[currentindex];
           var referenced_tip_ID = tipreference.TrustInteroperabilityProfileReference.Identifier;
           console.log("Referenced TIP ID: " + referenced_tip_ID);
           var referencedTIPRequest = TIPObjectStore.get(referenced_tip_ID);

           referencedTIPRequest.onsuccess = function(event)
           {
                if(event.target.result)
                {
                        var referenced_tip_json = event.target.result.tip_json;
                        var referenced_trustmark_list = getTrustmarkList(referenced_tip_json);

			currentindex = currentindex+1;
                        appendValueInTempStore(TIPObjectStore, tip_id, tip_json, referenced_trustmark_list, tipreferencearray, currentindex); 
		}
		else
                {
                        console.log("ERROR: Referenced TIP is not in cache " + referenced_tip_ID);
                }
	
	   }	  
			
}

/**
 * @Purpose - Retrieve Referenced Trustmarks from DB
 *
 */
function retrieveReferencedTrustmarksFromTIP2(db, tip_id, tip_json)
{
    var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");

    var trustmarklist = getTrustmarkList(tip_json);
    appendValueInTempStore(TIPObjectStore, tip_id, tip_json, trustmarklist);

    var JSONObj = JSON.parse(tip_json);	
    var tipreferencearray = JSONObj.TrustInteroperabilityProfile.References.TrustInteroperabilityProfileReferenceList;
   
    console.log("TIP REf array" + tipreferencearray); 
    appendTrustmarksRecursively(tipreferencearray, 0, tip_id, tip_json, TIPObjectStore); 
                
   /* for(var index in tipreferencearray)
    {
           var tipreference = tipreferencearray[index];
	   var referenced_tip_ID = tipreference.TrustInteroperabilityProfileReference.Identifier;
	   console.log("Referenced TIP ID: " + referenced_tip_ID);
	   var referencedTIPRequest = TIPObjectStore.get(referenced_tip_ID);	
		
	   referencedTIPRequest.onsuccess = function(event)
	   {
		if(event.target.result)
		{
			var referenced_tip_json = event.target.result.tip_json;
			var referenced_trustmark_list = getTrustmarkList(referenced_tip_json);

			appendValueInTempStore(TIPObjectStore, tip_id, tip_json, referenced_trustmark_list);		
		}
		else
		{
			console.log("ERROR: Referenced TIP is not in cache " + referenced_tip_ID);
		}
	   }
		
    }*/



    TIPObjectStore.transaction.oncomplete = function(event)
    {
	
		//TODO: Depending on purpose, trigger action
    }

}
/**
 *@Purpose: Retrieve Referenced Trustmarks from TIP
 *@Parameters: tip_id
 *@Returns: List of trustmarks
 */
function retrieveReferencedTrustmarksFromTIP(db, tip_id, return_val_temp_id)
{

	var temp_tip_json_id = "fake_id";
	getTIPJSON(db, tip_id, temp_tip_json_id);

	var tempObjectStore = db.transaction("trustmark-temp", "readwrite").objectStore("trustmark-temp");
	var tempRequest = tempObjectStore.get("fake_id");
		
	tempRequest.onsuccess = function(event)
	{
		
	var tip_json = event.target.result.value;
	console.log("TIP JSON: " + tip_json);	
	var JSONObj = JSON.parse(tip_json);
	var trustmarkreferencearray = JSONObj.TrustInteroperabilityProfile.References.TrustmarkDefinitionReferenceList;
	var trustmarkset  = new Set();

	console.log("Length: " + trustmarkreferencearray.length);

	for(var index in trustmarkreferencearray)
	{
		var reference = trustmarkreferencearray[index];
		var referenceID = reference.TrustmarkDefinitionReference.Identifier;
		console.log("Trustmark ID: " + referenceID);
		trustmarkset.add(referenceID);
	}

	var tipreferencearray = JSONObj.TrustInteroperabilityProfile.References.TrustInteroperabilityProfileReferenceList;
	for(var index in tipreferencearray)
	{
		var tipreference = tipreferencearray[index];
		var tipID = tipreference = tipreferencearray[index];

		
	}
	}		
}

exports.addTIPtoCache = addTIPtoCache
exports.retrieveReferencedTrustmarksFromTIP = retrieveReferencedTrustmarksFromTIP
exports.retrieveReferencedTrustmarksFromTIP2 = retrieveReferencedTrustmarksFromTIP2
exports.getTIPJSON = getTIPJSON
/**
1. Load default TIPS
2. Retrieve TIP
3. Return TIP JSON
4. Read Referenced trustmarks from TIP
5. Read Referenced TIP from TIP
6. Read referenced trustmarks from referenced TIP
**/
