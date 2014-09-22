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


/**
 *@Purpose: Get a Trustmark List String
 *@Parameters: TIP JSON
 *@Returns: Trustmarks list separated by ##TRUSTMARK##
 */
function getTrustmarkList(tip_json)
{

    var trustmarkList = "";
    var trustmarkseparator = "##TRUSTMARK##";

    var JSONObj = JSON.parse(tip_json);
    var trustmarkreferencearray = JSONObj.TrustInteroperabilityProfile.References.TrustmarkDefinitionReferenceList;
    var trustmarkset = new Set();

    //Iterate through Trustmark Reference Array	
    for(var index in trustmarkreferencearray)
    {
        var reference = trustmarkreferencearray[index];
	
	//Append Trustmark ID
        var referenceID = reference.TrustmarkDefinitionReference.Identifier;
        trustmarkList += referenceID;
        trustmarkList += trustmarkseparator;

    } 

    return trustmarkList;

}

/**
 *@Purpose: Append the trustmark to trustmark list recursively
 *@Parameters: tipObjectStore - TIP Object Store
 *             tip_id - TIP Identifier
 *	       tip_json - TIP JSON
 *	       trustmark - Trustmark List that will be appended to TIP's trustmark list
 *	       tipreferencearray - Array of TIP IDs referred by the TIP
 *	       currentindex - Index of currently referred TIP in tipreferencearray whose trustmarks will be appended to TIP's trustmark list in the next call
 *@Returns: none		
 */
function appendTrustmarkToTIPTrustmarkList(tipObjectStore, tip_id, tip_json, trustmark, tipreferencearray, currentindex)
{
	//Get the TIP row from TIP Object Store
	var getRequest = tipObjectStore.get(tip_id);

	getRequest.onsuccess = function(event)
	{
		//If TIP Row already exists, append trustmarks to existing trustmark list
		if(event.target.result)
		{
			//Get current trustmark list for TIP
			var trustmarklist = event.target.result.trustmark_list;

			//Append new set of trustmarks to trustmark list
			trustmarklist += "##TRUSTMARK##";
			trustmarklist += trustmark;
	
			//Update tip with new trustmark list
			var newRow = { "tip_id" : tip_id, "tip_json": tip_json , "trustmark_list": trustmarklist};
			
			var updateRequest = tipObjectStore.put(newRow);	

			updateRequest.onsuccess = function(event)
			{
				console.log("The trustmark list was updated successfully for " + tip_id);

				var getRequest = tipObjectStore.get(tip_id);

                                getRequest.onsuccess = function(event)
                                {
					//Check if trustmark list was satisfactorily appended
                                        console.log(event.target.result.trustmark_list);

					//Append trustmarks of the next tip in the tip reference array	
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
			//TIP does not previously exist in cache
			//Insert TIP into cache
			var newRow  = { "tip_id" : tip_id, "tip_json": tip_json, "trustmark_list": trustmark};

			var addRequest = tipObjectStore.add(newRow);
			
			addRequest.onsuccess = function(event)
			{
				console.log("The trustmark list was successfully added for " + tip_id);

				var JSONObj = JSON.parse(tip_json);
			        var tipreferencearray = JSONObj.TrustInteroperabilityProfile.References.TrustInteroperabilityProfileReferenceList;
				if(tipreferencearray)
				{
    					appendTrustmarksRecursively(tipreferencearray, 0, tip_id, tip_json, tipObjectStore);
				}
			}


			addRequest.onerror = function(event)
			{
				console.log("The tip could not be added for " + tip_id);
			}	 
		}	
		
	}

}

/**
 *@Purpose: Append trustmarks to TIP's trustmark recursively from referenced tips
 *@Parameters: tipreferencearray - TIP Reference array
 *	       currentindex - Index of the referenced tip among list of referenced tips
 *	       tip_json - JSON string of the TIP
 *	       TIPObjectStore - TIP Object Store
 *@Returns    none
 */
function appendTrustmarksRecursively(tipreferencearray, currentindex, tip_id, tip_json, TIPObjectStore)
{
	//If no tips were referenced OR all referenced tips have been processed, do nothing
	if(!tipreferencearray || (currentindex === tipreferencearray.length))
	{
		return;
	}

	//Get currently referenced tip ID
        var tipreference = tipreferencearray[currentindex];
        var referenced_tip_ID = tipreference.TrustInteroperabilityProfileReference.Identifier;
        
	//Get referenced tip
	var referencedTIPRequest = TIPObjectStore.get(referenced_tip_ID);

        referencedTIPRequest.onsuccess = function(event)
        {
	     //If referenced tip exists	in cache, process its trustmarks
             if(event.target.result)
             {
		  //Get referenced tip's trustmarks	
                  var referenced_tip_json = event.target.result.tip_json;
                  var referenced_trustmark_list = getTrustmarkList(referenced_tip_json);
	
		  //Forward the index to the next tip to be processed			
		  currentindex = currentindex+1;
		
		  //Append the referenced tip's trustmark list to tip's trustmark list	
                  appendTrustmarkToTIPTrustmarkList(TIPObjectStore, tip_id, tip_json, referenced_trustmark_list, tipreferencearray, currentindex); 
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
function retrieveReferencedTrustmarksFromTIP(db, tip_id, tip_json)
{
    var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");

    var trustmarklist = getTrustmarkList(tip_json);
    appendTrustmarkToTIPTrustmarkList(TIPObjectStore, tip_id, tip_json, trustmarklist);

    TIPObjectStore.transaction.oncomplete = function(event)
    {
	
		//TODO: Depending on purpose, trigger action
    }

}

exports.retrieveReferencedTrustmarksFromTIP = retrieveReferencedTrustmarksFromTIP
/**
1. Load default TIPS
2. Retrieve TIP
3. Return TIP JSON
4. Read Referenced trustmarks from TIP
5. Read Referenced TIP from TIP
6. Read referenced trustmarks from referenced TIP
**/
