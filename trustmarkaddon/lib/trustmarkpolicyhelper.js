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

function createTempFile(fileName)
{
  const {Ci,Cu,Cc,components} = require("chrome");
  Cu.import("resource://gre/modules/FileUtils.jsm");

  var file = FileUtils.getFile("TmpD", [fileName]);
  file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
        // do whatever you need to the created file
  console.log(file.path);

  return file;
  
}

function writeDataToFile(data, file)
{
  const {Ci,Cu,Cc,components} = require("chrome");
  Cu.import("resource://gre/modules/FileUtils.jsm");
  Cu.import("resource://gre/modules/NetUtil.jsm");

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

function isEmpty(str)
{
        //If string is NULL or string length is 0 
        return (!str || 0 === str.length);
}

function getRecipientTrustmarkSet(trustmark_list)
{
	var trustmarkarray = trustmark_list.split("##TRUSTMARK##");
	var trustmarkSet = new Set();

	for(var index in trustmarkarray)
	{
		if(!isEmpty(trustmarkarray[index]))
		{
			trustmarkSet.add(trustmarkarray[index]);	
		}	
	}

	return trustmarkSet;
}
	
function checkIfRecipientSatisfiesPolicy(db, recipient_id, tip_id)
{

	var recipientObjectStore = db.transaction("recipients").objectStore("recipients");
	var recipientRequest = recipientObjectStore.get(recipient_id);

	recipientRequest.onerror = function(event)
	{
		console.log("An error occurred while accessing the recipient store");
	}
	recipientRequest.onsuccess = function(event)
	{
		if(event.target.result)
		{
			var trustmark_list = event.target.result.trustmark_list;
		
			var tipObjectStore = db.transaction("tip").objectStore("tip");
			var tipRequest = tipObjectStore.get(tip_id);

			tipRequest.onerror  = function(event)
			{
				console.log("An error occurred while accessing the tip store");
			}
	
			tipRequest.onsuccess = function(event)
			{

				if(event.target.result)
				{
					var trust_expression = event.target.result.trust_expression;
					var trustmarkSet = getRecipientTrustmarkSet(trustmark_list);			
					for(let item of trustmarkSet)
					{
						console.log("Item: " + item);
						trust_expression = trust_expression.replace(item, 1);
					}	
			
					console.log("Before Updation: " + trust_expression);	
					trust_expression = trust_expression.replace(/http:\/\/trustmark[a-z\/\.]*\.xml/g, "0");	
					console.log("Trust Expression Updated:" + trust_expression);
				}
			}

			//Get TIP expr
			//Replace all the trustmarks in TIP with trustmark_list
			//Replace and/AND with &&, or/OR with ||
			//Evaluate expression
		
	
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

/**
 *@Purpose: TIP Trust Expression
 *@Parameters: tip_json - TIP JSON
 *@Returns - trust expression
 */
function getTIPTrustExpression(tip_json)
{
	var jsonObj = JSON.parse(tip_json);
	var trustexpression = jsonObj.TrustInteroperabilityProfile.TrustExpression;

	return trustexpression;
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

    //Iterate through Trustmark Reference Array	
    for(var index in trustmarkreferencearray)
    {
        var reference = trustmarkreferencearray[index];
	
	//Append Trustmark ID
        var referenceID = reference.TrustmarkDefinitionReference.Identifier;
       
	trustmarkList += trustmarkseparator;
	trustmarkList += referenceID;

    } 

    return trustmarkList;

}


function updateExpression(existing_condition, referenced_tip_id, referenced_tip_condition)
{

	existing_condition = existing_condition.replace(referenced_tip_id, "(" + referenced_tip_condition + ")");
	return existing_condition;
}
/**
 *@Purpose: Append the trustmark to trustmark list recursively
 *@Parameters: tipObjectStore - TIP Object Store
 *             tip_id - TIP Identifier
 *	       tip_json - TIP JSON
 *	       trustmark - Trustmark List that will be appended to TIP's trustmark list
 *	       trustexpression - Trust Expression of the TIP (new insert) or Referenced TIP for Update
 *	       tipreferencearray - Array of TIP IDs referred by the TIP
 *	       currentindex - Index of currently referred TIP in tipreferencearray whose trustmarks will be appended to TIP's trustmark list in the next call
 *@Returns: none		
 */
function addTIPDetailsToTIP(tipObjectStore, tip_id, tip_json, trustmark, trustexpression, tipreferencearray, currentindex)
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

			//Update tip trust expression with referenced tip expression
		    	var referenced_tip_expression = trustexpression;
			var existing_expression = event.target.result.trust_expression;
			var referenced_tip_ID = tipreferencearray[currentindex-1].TrustInteroperabilityProfileReference.Identifier;

			existing_expression = updateExpression(existing_expression, referenced_tip_ID, referenced_tip_expression);		
			//TODO: Update existing expression
		
			//console.log("Found referenced tip condition: " + referenced_tip_expression);
			//console.log("Existing condition: " + existing_expression);		
	
			//Update tip with new trustmark list
			var newRow = { "tip_id" : tip_id, "tip_json": tip_json , "trustmark_list": trustmarklist, "trust_expression" : existing_expression};
			
			var updateRequest = tipObjectStore.put(newRow);	

			updateRequest.onsuccess = function(event)
			{
			//	console.log("The trustmark list was updated successfully for " + tip_id);

				var getRequest = tipObjectStore.get(tip_id);

                                getRequest.onsuccess = function(event)
                                {
					//Check if trustmark list was satisfactorily appended
                                        //console.log(event.target.result.trustmark_list);

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
			var newRow  = { "tip_id" : tip_id, "tip_json": tip_json, "trustmark_list": trustmark, "trust_expression": trustexpression};

			var addRequest = tipObjectStore.add(newRow);
			
			addRequest.onsuccess = function(event)
			{
				//console.log("The trustmark list was successfully added for " + tip_id);

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
		  var referenced_tip_trustexpression = getTIPTrustExpression(referenced_tip_json);	
	
		  //Forward the index to the next tip to be processed			
		  currentindex = currentindex+1;
		
		  //Append the referenced tip's trustmark list to tip's trustmark list	
                  addTIPDetailsToTIP(TIPObjectStore, tip_id, tip_json, referenced_trustmark_list, referenced_tip_trustexpression, tipreferencearray, currentindex); 
	     }
	     else
             {
                        console.log("ERROR: Referenced TIP is not in cache " + referenced_tip_ID);
             }
	 }	  		
}

/**
 * @Purpose - Retrieve Referenced Trustmarks from DB
 * @Parameters - db - Database pointer
 *             - tip_id - TIP Identifier
 *	       - tip_json - TIP JSON
 * @Returns none  
 */
function insertTIPInCache(db, tip_id, tip_json)
{
    var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");

    var trustmarklist = getTrustmarkList(tip_json);
    var trust_expression = getTIPTrustExpression(tip_json);	
    addTIPDetailsToTIP(TIPObjectStore, tip_id, tip_json, trustmarklist, trust_expression);

    TIPObjectStore.transaction.oncomplete = function(event)
    {
	
		//TODO: Depending on purpose, trigger action
    }

}

exports.insertTIPInCache = insertTIPInCache
exports.checkIfRecipientSatisfiesPolicy = checkIfRecipientSatisfiesPolicy
/**
 *NOTES
 1. Not handling TIP/Trustmark Updation over time
 2. Assumption - TIP JSON has been modified to put Trustmarks and Referenced TIPs in an array (for JSON parsing to succeed)
 3. Assumption - TIP JSON Trustexpression directly has Identifiers instead of idrefs
 4. Assumption - If TIP is not present in pre-packaged, currently we don't support it. But it could get it from trustmark registry server.
 5. Assumption - If a TIP references Trustmarks that are not present in the cache, it is retrieved from Trustmark Registry Server
**/
