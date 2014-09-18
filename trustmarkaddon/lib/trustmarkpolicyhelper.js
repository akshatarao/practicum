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
			
}

/**
 *@Purpose: Retrieve Referenced Trustmarks from TIP
 *@Parameters: tip_id - TIP identifier
	       trustmark_list - Set of trustmarks	
 *@Returns: List of referenced trustmarks
 */
function retrieveReferencedTrustmarksFromTIP(tip_id, trustmark_list)
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
		var tipRequest = TIPObjectStore.get("test");

		tipRequest.onsuccess = function(event)
		{
			if(event.target.result)
			{
				var tip_json = event.target.result.tip_json;
				var tip_json_obj = JSON.parse(tip_json);
				var tip_name = tip_json_obj.TrustInteroperabilityProfile.Name;
				console.log("TIP Name: " + tip_name);	
			}
			//else
		//	{
		//		console.log("Did not find TIP: " + tip_id);
		//	}
		}	
	}


	
	//Get the TIP JSON
	//Get the TIP identifiers in reference of another TIP.
	//Write to trustmark list -> Create a set?
	//Get the Trustmark identifiers referenced
	//Check if the trustmarks are added

}
/**
 * Verify if trustmark adheres to policy
 * policy_xml - Policy XML
 * trustmark_xml - Trustmark XML
 */
function verifyIfTrustmarkAdheresToPolicy(policy_xml, trustmark_xml)
{
	console.log("Inside verify if trustmark adheres to policy");
}

/**
 * Take the action of the policy adherence/non-adherence on the site
 * policy_xml - Policy XML
 * trustmark_xml - Trustmark XML
 */
function effectPolicyActionOnSite(policy_xml, trustmark_xml)
{
	console.log("Inside effect policy action on site");
}

exports.addTIPtoCache = addTIPtoCache
exports.retrieveReferencedTrustmarksFromTIP = retrieveReferencedTrustmarksFromTIP
/**
1. Load default TIPS
2. Retrieve TIP
3. Send TIP
**/
