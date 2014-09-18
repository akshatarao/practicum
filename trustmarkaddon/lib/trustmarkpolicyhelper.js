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
	var tipRow = { tip_id: "test", tip_json: tip_json_val};
	
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
function getTIPJSON(tip_id)
{
	
	var dbOpenRequest = indexedDB.open("trustmarkDB", 2);
	var db;

	dbOpenRequest.onerror  = function(event)
	{
		console.log("An error occurred while opening the database");
	}

	dbOpenRequest.onsuccess = function(event)
	{
		db = event.target.result;

		var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");
		var tipRequest = TIPObjectStore.get(tip_id);

		tipRequest.onsuccess = function(event)
		{
			if(event.target.result)
			{
				var tip_json = event.target.result.tip_json;
				var tip_json_obj = JSON.parse(tip_json);
				var tip_name = tip_json_obj.TrustInteroperabilityProfile.Name;
				console.log("TIP Name: " + tip_name);

				retrieveReferencedTrustmarksFromTIP(tip_json);	
			}
			else
			{
				console.log("Did not find TIP: " + tip_id);
			}
		}	
	}


	
	//Get the TIP JSON
	//Get the TIP identifiers in reference of another TIP.
	//Write to trustmark list -> Create a set?
	//Get the Trustmark identifiers referenced
	//Check if the trustmarks are added

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

function retrieveReferencedTrustmarksFromTIP(tip_json)
{

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
			
	return trustmarkset;
}

exports.addTIPtoCache = addTIPtoCache
exports.retrieveReferencedTrustmarksFromTIP = retrieveReferencedTrustmarksFromTIP
exports.getTIPJSON = getTIPJSON
/**
1. Load default TIPS
2. Retrieve TIP
3. Return TIP JSON
4. Read Referenced trustmarks from TIP
5. Read Referenced TIP from TIP
6. Read referenced trustmarks from referenced TIP
**/
