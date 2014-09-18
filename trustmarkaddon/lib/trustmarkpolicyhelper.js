/**
 * File: trustmarkpolicyhelper.js
 * Purpose: Trustmark Policy Handler
 * Created by: ARao 
 */

/**
 * Create a policy 
 */
function createPolicy()
{
	console.log("Inside create policy");
}

function addTIPToCache(db, tip_id, tip_json)
{
	var tipObjectStore = db.transaction("tip", "readwrite").objectStore("tip");
	var tipRequest = tipObjectStore.get(tip_id);

	tipRequest.onerror = function(event)
	{
		console.log("An error occurred while accessing the tip store");
	}

	tipRequest.onsuccess = function(event)
	{
		if(tipRequest.result)
		{
			console.log("TIP " + tipRequest.result.identifier + " found.");
		}
		else
		{
			var tipRow = { identifier: tip_id, tip_json: tip_json_val};
			tipObjectStore.add(tipRow);
			console.log("TIP added: " + tip_id_val);
		}
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

