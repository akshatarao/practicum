/**
 * File: trustmarkpolicyhelper.js
 * Purpose: Trustmark Policy Handler
 * Created by: ARao 
 */

var { indexedDB } = require('sdk/indexed-db');
const {Cu} = require("chrome");
const {TextEncoder, TextDecoder, OS} = Cu.import("resource://gre/modules/osfile.jsm", {});
var self = require("sdk/self");
/**
 * Create a policy 
 */
function createPolicy()
{
	console.log("Inside create policy");
}

/***
 *@Purpose - Get list of all applicable TIPS
 *@Param: tip_type - Type of TIP
 *@Returns: none
 */
function getTIPNicknameList(tip_type, worker)
{
	var request = indexedDB.open("trustmarkDB",2);
	var db;

	request.onsuccess = function(event)
	{
		db = event.target.result;
		var tipObjectStore = db.transaction("tip", "readwrite").objectStore("tip");
		var policyRequest;

		if(tip_type === "all")
		{
			policyRequest = tipObjectStore.openCursor();
		}
		else
		{
			var policyIndex = tipObjectStore.index("type");
			policyRequest = policyIndex.openCursor(tip_type);
		}

		var tip_array = [];
		policyRequest.onsuccess = function(event)
		{	
			var cursor = event.target.result;

			if(cursor)
			{
				var tip = cursor.value;
				tip_array.push(tip.nickname);

				cursor.continue();
			}
			else
			{
				worker.port.emit("tipreceive", tip_array, tip_type);
			}
		}

	
	}

}


/****
 *@Purpose - Check if TIP Name is Unique
 *@Param - tip_name - TIP Name
 *@Param - tip_type - TIP Type
 *@Param - tip_expr - TIP Trust Expression
 *@Returns - Emits uniquetipname/duplicatetipname messages
 */
function checkIfTipNameIsUnique(worker, tip_name, tip_type, tip_expr)
{
	var dbOpenRequest = indexedDB.open("trustmarkDB", 2);

        dbOpenRequest.onsuccess = function(event)
        {
                db = event.target.result;
		var tipObjectStore = db.transaction("tip").objectStore("tip");
		var tipRequest = tipObjectStore.openCursor();
                var overallFailed = false;

               	tipRequest.onsuccess = function(event)
                {
                           var cursor = event.target.result;

                           if(cursor)
                           {
                           	var tip = cursor.value;
				if(tip.nickname === tip_name)
				{
					worker.port.emit("duplicatetipname");	
				}
				else
				{
					cursor.continue();
				}			
			   }
			   else
			   {
				worker.port.emit("uniquetipname", tip_name, tip_type, tip_expr);
			   }	
		}
	}
			
}
/********************************************
 * @Purpose : Applies custome user policy
 * @Param : tip_nickname - TIP Custom Name
 * @Param: tip_type - TIP Type
 * @Returns none
 ********************************************/
function applyUserPolicy(tip_nickname, tip_type)
{
	var request = indexedDB.open("trustmarkDB", 2);
	var db;

	request.onsuccess = function(event)
	{
		db = event.target.result;

		var tipObjectStore = db.transaction("tip", "readwrite").objectStore("tip");

		var policyIndex = tipObjectStore.index("type");
		var policyRequest = policyIndex.openCursor(tip_type);

		policyRequest.onsuccess = function(event)
		{
			var cursor = event.target.result;

			if(cursor)
			{
				var tip = cursor.value;
				var nickname = tip.nickname;
				var isActive;
				if(nickname === tip_nickname)
				{
					isActive = "1";
					
					//console.log("Update to active:" + tip.tip_id);
				}
				else
				{
					isActive = "0";
					//console.log("Update to inActive: " + tip.tip_id);
				}

				var newRow = { "tip_id" : tip.tip_id, "tip_json" : tip.tip_json, "trustmark_list" : tip.trustmark_list, "trust_expression" : tip.trust_expression, "type" : tip.type, "isActive" : isActive, "nickname" : tip.nickname};
				var updateRequest = tipObjectStore.put(newRow);

				updateRequest.onsuccess = function(event)
				{
					console.log("Active policy changed successfully");
				}

				updateRequest.onerror = function(event)
				{
					console.log("An error occurred while applying active policy");
				}

				cursor.continue();
	
			}
		}
		
	}
}

/*******************
 *@Purpose - Reset all policies to default
 *@Returns none
 ******************/
function resetPolicy()
{
	var configFileJSON = self.data.load("defaultTIP/configFileJSON");
	var configFileJSONObj = JSON.parse(configFileJSON);
        var tipreferencearray = configFileJSONObj.DefaultTIP.TIPs.TIPList;

        for(var index in tipreferencearray)
        {  
              var tip = tipreferencearray[index];
              var tip_type = tip.TIP.Type;
              var tip_nickname = tip.TIP.Nickname;
			
              applyUserPolicy(tip_nickname, tip_type);
	}	
}

function uploadUserPolicy2(tip_json_str, tip_nickname, tip_type)
{
	var request = indexedDB.open("trustmarkDB", 2);
	var db;

	request.onerror = function(event)
	{
		console.log("An error occurred while opening the database");
	}
	
	request.onsuccess = function(event)
	{
		db = event.target.result;

		var tip_json = JSON.parse(tip_json_str);
	        var tip_id = tip_json.TrustInteroperabilityProfile.Identifier;
                var isActive = "0";

                insertTIPInCache(db, tip_id, tip_json_str, tip_nickname, tip_type, isActive)
	
	}
}
/**
 *@Purpose - Uploads user defined policy from file path
 *@Param - filepath - User defined TIP file path
 *@Param - tip_nickname - TIP Nickname
 *@Param - tip_type - TIP Type (minimization, transparency etc.)
 */
function uploadUserPolicy(filePath, tip_nickname, tip_type)
{
	console.log("In Upload: " + filePath + " Nickname: " + tip_nickname + " Type: " + tip_type);
	let promise = OS.File.read(filePath);
	promise = promise.then(function onSuccess(value)
	{

		var request = indexedDB.open("trustmarkDB", 2);
		var db;

		request.onerror = function(event)
		{
			console.log("An error occurred while opening the database.");
		}

		request.onsuccess = function(event)
		{
			db = event.target.result;

			let decoder = new TextDecoder();
			var jsonData = decoder.decode(value);
			var tip_json = JSON.parse(jsonData);
			var tip_id = tip_json.TrustInteroperabilityProfile.Identifier;
			var isActive = "0";

			insertTIPInCache(db, tip_id, jsonData, tip_nickname, tip_type, isActive)		
		}
	});
	
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

function getTIPTrustmarkJSONString(trustmark_list)
{
	var removeLeadingComma = trustmark_list.substring(1);
	var jsonString = "{ \"trustmarks\" : [" + removeLeadingComma + "]}";
	//console.log("JSON String: " + jsonString);
	JSON.parse(jsonString);
	return jsonString;
}

/***
 *@Purpose -Placeholder: Check if Recipient trustmarks satisfy TIP
 *@Param - recipient_id - Site hostname (www.facebook.com)
 *@Param - tip_json -TIP JSON
 *@Returns - true if recipient satisfies policy
 */
function doesRecipientSatisfiesPolicyUsingWebAPI(recipient_id, tip_json)
{

	//TODO: Placeholder for checking if recipient satisfies tip
	return true;
}

function evaluateTrustmarkExpression(trust_expression, trustmark_list)
{
	var result = true;
        var trustmarkSet = getRecipientTrustmarkSet(trustmark_list);   
        for(let item of trustmarkSet)
        {
                 trust_expression = trust_expression.replace(item, 1);
        }

        trust_expression = trust_expression.replace(/http:\/\/trustmark[a-z\/\.]*\.xml/g, "0");
        trust_expression = trust_expression.replace(/\sand\s/g, "&&");
        trust_expression = trust_expression.replace(/\sor\s/g, "||");
        trust_expression = trust_expression.replace(/\sAND\s/g, "&&");
        trust_expression = trust_expression.replace(/\sOR\s/g, "||");

        result = eval("(" + trust_expression + ")");

	return result;
}

function checkIfRecipientSatisfiesAllActiveTIPs(recipient_id, button)
{
	var dbOpenRequest = indexedDB.open("trustmarkDB", 2);

	dbOpenRequest.onsuccess = function(event)
	{
		db = event.target.result;
	var recipientObjectStore = db.transaction("recipients").objectStore("recipients");
	var recipientRequest = recipientObjectStore.get(recipient_id);

	recipientRequest.onsuccess = function(event)
	{

		var recipient = event.target.result;

		if(recipient)
		{
			var trustmark_list = recipient.trustmark_list;

			var tipObjectStore = db.transaction("tip").objectStore("tip");

			var tipRequest = tipObjectStore.openCursor();
			var overallFailed = false;

			tipRequest.onsuccess = function(event)
			{
				var cursor = event.target.result;

				if(cursor)
				{

					var tip = cursor.value;
					if(tip.isActive === "1")
					{
						var trust_expression = tip.trust_expression;

						var result = evaluateTrustmarkExpression(trust_expression,trustmark_list);
						if(!result)
							overallFailed = true;
					}

					if(!overallFailed)
					{
						cursor.continue();
					}
					else
					{
						var icon = new Object();
        			                var jsonString = '{"32" : "./redshield.jpg"}';
	                        		button.icon  = JSON.parse(jsonString);
					}
				}
				else
				{
					if(!overallFailed)
					{
						var icon = new Object();
			                        var jsonString = '{"32" : "./greenshield.jpg"}';
                        			button.icon  = JSON.parse(jsonString);
					}
				}

			}
			
		}
		else
		{
			var icon = new Object();
			var jsonString = '{"32" : "./questionmark.png"}';
                        button.icon  = JSON.parse(jsonString);
		}
	}
	}

}
	
function checkIfRecipientSatisfiesPolicy(db, recipient_id, tip_type, trustmarkpanel)
{
	var tip_divname = tip_type;

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

			var policyIndex = tipObjectStore.index("type");
			var policyRequest = policyIndex.openCursor(tip_type);

			policyRequest.onsuccess = function(event)
			{
				var cursor = event.target.result;
				if(cursor)
        		        {
                       			 var results = cursor.value;
		                         var isActive = results.isActive;

                 		         if(isActive === "1")
                       			 {

						var overallEvaluationViaWebAPI = false;

						if(overallEvaluationViaWebAPI)
						{
							//TODO: Placeholder for GTRI integration for TIP verification
							doesRecipientSatisfiesPolicyUsingWebAPI(recipient_id, results.tip_json);
						}
						else
						{
							//Simple evaluation of trust expression

							var trust_expression = results.trust_expression;
							var result = evaluateTrustmarkExpression(trust_expression, trustmark_list);

	                        	                if(result)
        	                        	        {
                	                        	        trustmarkpanel.port.emit("passedtip", tip_divname, recipient_id);
                        	                        	console.log("The recipient has matched policy");
                                	        	}
	                                	        else
        	                                	{
                	                                	trustmarkpanel.port.emit("failedtip", tip_divname, recipient_id);
                     		   	                        console.log("The recipient has not matched policy");
                                		        }

						 }
					}
				
					cursor.continue();
                	        }
                	}

		}
	}
				

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

/*****
 *@Purpose - Send the tip trust expression (textual format) and tip type to settings
 *@Param - tip_name - TIP Nickname
 *@Param - worker - Settings Worker
 *@Return - Emits receivetipdetails message with tip type and trust expression
 */
function getTIPExpressionText(tip_name, worker)
{
	var dbRequest = indexedDB.open("trustmarkDB", 2);

	var db;

	dbRequest.onsuccess = function(event)
	{	
		db = event.target.result;

		var tipObjectStore = db.transaction("tip", "readwrite").objectStore("tip");

		var tipIndex = tipObjectStore.index("nickname")
		var tipRequest = tipIndex.openCursor(tip_name);	

		tipRequest.onsuccess = function(event)
		{
			var cursor = event.target.result;
			if(cursor)
			{
					
				var tipRow = event.target.result.value;
				
				if(tipRow.nickname === tip_name)
				{

					var trustexpression = tipRow.trust_expression;
					var trustmarkdefsStore = db.transaction("trustmarkdefs", "readwrite").objectStore("trustmarkdefs");
					var openRequest = trustmarkdefsStore.openCursor()
					
					openRequest.onsuccess = function(event)
					{
						var trustmarkdefcursor = event.target.result;

						if(trustmarkdefcursor)
						{
							var td = trustmarkdefcursor.value;
							trustexpression = trustexpression.replace(td.identifier, "'" +td.description + "'");	

							trustmarkdefcursor.continue();
						}
						else
						{

							worker.port.emit("receivetipdetails", tipRow.type, trustexpression);
						}	
					}	
				}
				
				cursor.continue();
			}	
		}
	}
}
/**
 *@Purpose: Get a Trustmark List String
 *@Parameters: TIP JSON
 *@Returns: Trustmarks list separated by ##TRUSTMARK##
 */
function getTrustmarkList(tip_json)
{

    var trustmarkList = "";
    var trustmarkseparator = ",";

    var JSONObj = JSON.parse(tip_json);
    var trustmarkreferencearray = JSONObj.TrustInteroperabilityProfile.References.TrustmarkDefinitionReferenceList;

    //Iterate through Trustmark Reference Array	
    for(var index in trustmarkreferencearray)
    {
        var reference = trustmarkreferencearray[index];
	
	//Append Trustmark ID
        var referenceID = reference.TrustmarkDefinitionReference.Identifier;
	var referenceName = reference.TrustmarkDefinitionReference.Description;      
	var trustmarkSet = "{ \"trustmark_id\": \"" + referenceID + "\"" + "," + "\"trustmark_name\": \"" + referenceName + "\"}" 
 
	trustmarkList += trustmarkseparator;
	trustmarkList += trustmarkSet;
    } 

    return trustmarkList;

}

/**
 *@Purpose: Update expression
 *@Parameters: existing_condition - Existing condition
 *	       referenced_tip_id - Referenced TIP Identifier
 *	       referenced_tip_condition - Referenced TIP Condition
 *@Returns: none
 */
function updateExpression(existing_condition, referenced_tip_id, referenced_tip_condition)
{
	existing_condition = existing_condition.replace(referenced_tip_id, "(" + referenced_tip_condition + ")");
	
	return existing_condition;
}

function getTipType(tip_id)
{
	var policyTypeArr = [ "minimization", "transparency", "access", "accountability", "dataquality"];

	for(var index in policyTypeArr)
	{
		var policyType = policyTypeArr[index];
		
		var typearr = tip_id.match(policyType);
	
		if(typearr && typearr.length > 0)
		{
			return policyType;
		}
	}			
}

function getTIPNickname(policy_type)
{
	return policy_type + "-default";
}


/**
 *@Purpose: Append the trustmark to trustmark list recursively
 *@Parameters: tipObjectStore - TIP Object Store
 *             tip_id - TIP Identifier
 *	       tip_json - TIP JSON
 *	       tip_type - Type of TIP (minimization, transparency etc.)
 *	       tip_nickname - TIP Nickname
 *	       isActive - is TIP Currently Applied (1/0)
 *	       trustmark - Trustmark List that will be appended to TIP's trustmark list
 *	       trustexpression - Trust Expression of the TIP (new insert) or Referenced TIP for Update
 *	       tipreferencearray - Array of TIP IDs referred by the TIP
 *	       currentindex - Index of currently referred TIP in tipreferencearray whose trustmarks will be appended to TIP's trustmark list in the next call
 *@Returns: none		
 */
function addTIPDetailsToTIP(tipObjectStore, tip_id, tip_json, tip_type, tip_nickname, isActive, trustmark, trustexpression, tipreferencearray, currentindex)
{
	//Get the TIP row from TIP Object Store
	var getRequest = tipObjectStore.get(tip_id);

	getRequest.onsuccess = function(event)
	{
		var policyType = getTipType(tip_id);
                var nickname = getTIPNickname(policyType);

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
		
			//console.log("Found referenced tip condition: " + referenced_tip_expression);
			//console.log("Existing condition: " + existing_expression);		
	
			//Update tip with new trustmark list

			var newRow = { "tip_id" : tip_id, "tip_json": tip_json , "trustmark_list": trustmarklist, "trust_expression" : existing_expression, "type": tip_type, "isActive": isActive, "nickname" : tip_nickname};
			
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
					appendTrustmarksRecursively(tipreferencearray, currentindex, tip_id, tip_json,tip_type, tip_nickname, isActive, tipObjectStore);
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
			var newRow  = { "tip_id" : tip_id, "tip_json": tip_json, "trustmark_list": trustmark, "trust_expression": trustexpression, "type":tip_type, "isActive": isActive, "nickname":tip_nickname};

			var addRequest = tipObjectStore.add(newRow);
			
			addRequest.onsuccess = function(event)
			{
				//console.log("The trustmark list was successfully added for " + tip_id);

				var JSONObj = JSON.parse(tip_json);
			        var tipreferencearray = JSONObj.TrustInteroperabilityProfile.References.TrustInteroperabilityProfileReferenceList;
				if(tipreferencearray)
				{
    					appendTrustmarksRecursively(tipreferencearray, 0, tip_id, tip_json, tip_type, tip_nickname, isActive, tipObjectStore);
				}
				
				console.log("TIP added!" + tip_nickname);

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
 *	       tip_type - Type of TIP(minimization, transparency..)
 *	       tip_nickname - TIP Nickname
 *	       isActive  - is TIP currently applied
 *	       TIPObjectStore - TIP Object Store
 *@Returns    none
 */
function appendTrustmarksRecursively(tipreferencearray, currentindex, tip_id, tip_json, tip_type, tip_nickname, isActive, TIPObjectStore)
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
                  addTIPDetailsToTIP(TIPObjectStore, tip_id, tip_json, tip_type, tip_nickname, isActive, referenced_trustmark_list, referenced_tip_trustexpression, tipreferencearray, currentindex); 
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
 *	       - tip_type - Type of Policy (minimization,transparency ...)
 *	       - tip_nickname - TIP Nickname
 *	       - tip_path - TIP Path
 *	       - isActive - is TIP Active	
 * @Returns none  
 */
function insertTIPInCache(db, tip_id, tip_json, tip_nickname, tip_type, isActive)
{
    var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");

    var trustmarklist = getTrustmarkList(tip_json);
    var trust_expression = getTIPTrustExpression(tip_json);	
    addTIPDetailsToTIP(TIPObjectStore, tip_id, tip_json, tip_type, tip_nickname, isActive, trustmarklist, trust_expression);

}

function displayTIPTrustmarks(worker, tip_key, recipient_id)
{
	var request  = indexedDB.open("trustmarkDB", 2);
	var db;

	request.onerror = function(event)
	{
		console.log("An error occurred while opening the database.");	
	}

	request.onsuccess = function(event)
	{
		db = event.target.result;
		var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");
		var tipRequest = TIPObjectStore.get(tip_key);

		tipRequest.onerror = function(event)
		{
			console.log("An error occurred while accesssing the tip store");
		}

		tipRequest.onsuccess = function(event)
		{

			if(event.target.result)
			{
				var tip = event.target.result;
				var tip_trustmark_list = tip.trustmark_list;
				var tip_json = tip.tip_json;
				var trustexpression = tip.trust_expression;
				var tip_name = tip.nickname;

				var recipientObjectStore = db.transaction("recipients").objectStore("recipients");

				var recipientRequest = recipientObjectStore.get(recipient_id);

				recipientRequest.onerror = function(event)
				{
					console.log("An error occurred while accessing the recipient store");
				}

				recipientRequest.onsuccess = function(event)
				{
					var recipient_trustmark_list = event.target.result.trustmark_list;
					var tip_trustmark_json  = getTIPTrustmarkJSONString(tip_trustmark_list);

                                        var trustmarkdefsStore = db.transaction("trustmarkdefs", "readwrite").objectStore("trustmarkdefs");
                                        var openRequest = trustmarkdefsStore.openCursor();

                                        openRequest.onsuccess = function(event)
                                        {
                                                var trustmarkdefcursor = event.target.result;

                                                if(trustmarkdefcursor)
                                                {
                                                        var td = trustmarkdefcursor.value;
                                                        trustexpression = trustexpression.replace(td.identifier, "'" +td.description + "'");
							trustmarkdefcursor.continue();

						}
						else
						{
							worker.port.emit("trustmark", tip_trustmark_json, recipient_trustmark_list, tip_json, recipient_id, trustexpression, tip_name);

						}
					}
				}	
			}
		}	
	}

}

function getCurrentMinimizationPolicy()
{
	var minimization_tip = "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/minimization.xml";
	return minimization_tip;
}

function getCurrentTransparencyPolicy()
{
	var transparency_tip = "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/transparency.xml";
	return transparency_tip;
}

function getCurrentAccessPolicy()
{
	var access_tip = "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/access.xml";
	
	return access_tip;	
}

function getCurrentAccountabilityPolicy()
{
	var accountability_tip = "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/accountability.xml"

	return accountability_tip; 
}

function getCurrentDataQualityPolicy()
{
	var dataquality_tip = "http://trustmark.gtri.gatech.edu/schema/trust-interoperability-profiles/dataquality.xml";
	return dataquality_tip;
}

exports.insertTIPInCache = insertTIPInCache
exports.checkIfRecipientSatisfiesPolicy = checkIfRecipientSatisfiesPolicy
exports.displayTIPTrustmarks = displayTIPTrustmarks
exports.getCurrentMinimizationPolicy = getCurrentMinimizationPolicy
exports.getCurrentTransparencyPolicy = getCurrentTransparencyPolicy
exports.getCurrentDataQualityPolicy = getCurrentDataQualityPolicy
exports.getCurrentAccessPolicy = getCurrentAccessPolicy
exports.getCurrentAccountabilityPolicy = getCurrentAccountabilityPolicy 
exports.uploadUserPolicy = uploadUserPolicy
exports.uploadUserPolicy2 = uploadUserPolicy2
exports.applyUserPolicy = applyUserPolicy
exports.resetPolicy = resetPolicy 
exports.getTIPNicknameList = getTIPNicknameList
exports.getTIPExpressionText = getTIPExpressionText
exports.checkIfRecipientSatisfiesAllActiveTIPs = checkIfRecipientSatisfiesAllActiveTIPs
exports.checkIfTipNameIsUnique = checkIfTipNameIsUnique;
/**
 *NOTES
 1. Not handling TIP/Trustmark Updation over time
 2. Assumption - TIP JSON has been modified to put Trustmarks and Referenced TIPs in an array (for JSON parsing to succeed)
 3. Assumption - TIP JSON Trustexpression directly has Identifiers instead of idrefs
 4. Assumption - If TIP is not present in pre-packaged, currently we don't support it. But it could get it from trustmark registry server.
 5. Assumption - If a TIP references Trustmarks that are not present in the cache, it is retrieved from Trustmark Registry Server
**/
