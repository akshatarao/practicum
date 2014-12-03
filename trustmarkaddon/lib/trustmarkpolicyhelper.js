/**
 * Handles the trust interoperability profile operations for the trustmark addon
 * @module trustmarkpolicyhelper
 */

/**
 * This module handles the trust interoperability profile operations for the trustmark addon
 *@class trustmarkpolicyhelper
 */

/***
 *@requires sdk/indexed-db
 *@requires chrome
 *@requires sdk/self
 *@requires osfile.jsm
 */
var { indexedDB } = require('sdk/indexed-db');
const {Cu} = require("chrome");
const {TextEncoder, TextDecoder, OS} = Cu.import("resource://gre/modules/osfile.jsm", {});
var self = require("sdk/self");

/***
 *For a granular principle type, retrieve the list of applicable TIPS
 *@param tip_type {minimization|accountability|access|transparency|dataquality}  Granular Principle
 *@return none
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

		//If we require all the TIPS irrespective of granular principle
		if(tip_type === "all")
		{
			policyRequest = tipObjectStore.openCursor();
		}
		else//For a specific granular principle
		{
			var policyIndex = tipObjectStore.index("type");
			policyRequest = policyIndex.openCursor(tip_type);
		}

		//Store the tip IDs in the tip_array
		var tip_array = [];
		policyRequest.onsuccess = function(event)
		{	
			var cursor = event.target.result;

			//Iterate through all the tips that match the cursor criteria
			if(cursor)
			{
				var tip = cursor.value;
				tip_array.push(tip.nickname);

				cursor.continue();
			}
			else
			{
				//Receive TIPs
				worker.port.emit("tipreceive", tip_array, tip_type);
			}
		}

	
	}

}


/****
 *Check if TIP nickname is unique
 *@method checkIfTipNameIsUnique
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

			   //Iterate through all tips
                           if(cursor)
                           {
				//Check if tip name has been already used
                           	var tip = cursor.value;
				if(tip.nickname === tip_name)
				{
					//If yes, then trigger the duplicatetipname event and stop iterating
					worker.port.emit("duplicatetipname");	
				}
				else
				{
					//If no, move on to the next record
					cursor.continue();
				}			
			   }
			   else
			   {
				//If no matched records found, trigger the uniquetipname event
				worker.port.emit("uniquetipname", tip_name, tip_type, tip_expr);
			   }	
		}
	}
			
}

/********************************************
 * Applies custom defined user policy as the current privacy setting for the selected granular principle
 * @method applyUserPolicy
 * @param tip_nickname {String} TIP Custom Name
 * @param tip_type {minimization|accountability|access|transparency|dataquality} TIP Type
 * @return none
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

				//Change the selected tip status to active
				if(nickname === tip_nickname)
				{
					isActive = "1";
					
					//console.log("Update to active:" + tip.tip_id);
				}
				else//Mark other tips for the selected granular principle as inactive
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
 *Reset all policies to default
 *@method resetPolicy
 *@return none
 ******************/
function resetPolicy()
{
	var configFileJSON = self.data.load("defaultTIPNew/configFileJSON");
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

/****
 *Upload user defined policy string to the database
 *@method uploadUserPolicy2 
 *@param tip_json_str {JSON string} TIP JSON
 *@param tip_nickname {String} TIP Nickname
 *@param tip_type {minimization|accountability|access|transparency|dataquality} Granular Principle
 *@return none
 */
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

/***
 *Utility method - Check if string is empty
 *@method isEmpty
 *@param str {String} string
 *@return TRUE if string is empty
 ***/
function isEmpty(str)
{
        //If string is NULL or string length is 0 
        return (!str || 0 === str.length);
}

/****
 *From a ##TRUSTMARK## delimited trustmark set, get the set of recipient trustmark IDs
 *@method getRecipientTrustmarkSet
 *@param trustmark_list {string} ##TRUSTMARK## delimited string of trustmark IDs
 *@return Set of Trustmark IDs
 */
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

/****
 *Get TIP JSON string for trustmark list
 *@method getTIPTrustmarkJSONString
 *@param trustmark_list {String} Trustmark in JSON string
 *@return Trustmarks that map to a TIP in JSON format
 */
function getTIPTrustmarkJSONString(trustmark_list)
{
	var removeLeadingComma = trustmark_list.substring(1);
	var jsonString = "{ \"trustmarks\" : [" + removeLeadingComma + "]}";
	//console.log("JSON String: " + jsonString);
	JSON.parse(jsonString);
	return jsonString;
}

/***
 *Placeholder: Check if Recipient trustmarks satisfy TIP
 *@method doesRecipientSatisfyPolicyWebAPICheck
 *@param recipient_id {String} Site hostname (www.facebook.com)
 *@param tip_json TIP JSON
 *@return TRUE if recipient satisfies policy
 */
function doesRecipientSatisfyPolicyWebAPICheck(recipient_id, tip_json)
{

	//TODO: Placeholder for checking if recipient satisfies tip
	return true;
}

/***
 *Evaluate trustmark conditional expression for a TIP given recipient trustmarks
 *@method evaluateTrustmarkExpression
 *@param trust_expression {Boolean String} Conditional expression of trustmark IDs that must be satisified for the TIP to pass
 *@param trustmark_list {String} ##TRUSTMARK## delimited Trustmark ID string for recipient
 */
function evaluateTrustmarkExpression(trust_expression, trustmark_list)
{
	var result = true;
        var trustmarkSet = getRecipientTrustmarkSet(trustmark_list);   

	//Replace all the trustmarks that the recipient owns with 1
        for(let item of trustmarkSet)
        {
                 trust_expression = trust_expression.replace(item, 1);
        }

	//Replace the trustmarks that the recipient does not own with 0
	//NOTE: Assumption - The trustmark ID format is of the form http://trustmark.*/*/*.xml
        trust_expression = trust_expression.replace(/http:\/\/trustmark[a-z\/\.\-]*\.xml/g, "0");

	//Replace all AND with &&
        trust_expression = trust_expression.replace(/\sand\s/gi, "&&");

	//Replace all OR with ||
        trust_expression = trust_expression.replace(/\sor\s/gi, "||");
//        trust_expression = trust_expression.replace(/\sAND\s/g, "&&");
//        trust_expression = trust_expression.replace(/\sOR\s/g, "||");

//	console.log("Trust expression : " + trust_expression);
  
	//Evaluate the trust expression
	result = eval("(" + trust_expression + ")");

	return result;
}

/***
 *Check If the Recipient satisfies all the currently applied TIPs for all of the 5 granular principles
 *@method checkIfRecipientSatisfiesAllActiveTIPs
 *@param recipient_id {String} website hostname (www.example.com)
 *@param button {ToggleButton} toggle button to change the privacy status icon
 *@return none
 */
function checkIfRecipientSatisfiesAllActiveTIPs(recipient_id, button)
{
	var dbOpenRequest = indexedDB.open("trustmarkDB", 2);

	dbOpenRequest.onsuccess = function(event)
	{
		db = event.target.result;
		var recipientObjectStore = db.transaction("recipients").objectStore("recipients");

		//Get the row for the recipient from the recipient object store
		var recipientRequest = recipientObjectStore.get(recipient_id);

		recipientRequest.onsuccess = function(event)
		{

			var recipient = event.target.result;

			//If recipient exists in the store
			if(recipient)
			{

				//Get the recipient trustmark list
				var trustmark_list = recipient.trustmark_list;

				var tipObjectStore = db.transaction("tip").objectStore("tip");

				var tipRequest = tipObjectStore.openCursor();
				var overallFailed = false;

				//Check if recipient trustmarks satisfy the active tips
				tipRequest.onsuccess = function(event)
				{
					var cursor = event.target.result;

					if(cursor)
					{

						//If the tip has been currently applied
						var tip = cursor.value;
						if(tip.isActive === "1")
						{

							//TODO: Placeholder for inserting TIP Evaluation
							var evaluateTIPUsingWebAPI = false;
							var result = false;
						
							if(evaluateTIPUsingWebAPI)
							{
								result = doesRecipientSatisfyPolicyWebAPICheck(recipient_id, tip.tip_json);
							}
							else
							{
								var trust_expression = tip.trust_expression;

								result = evaluateTrustmarkExpression(trust_expression,trustmark_list);
							}

							if(!result)
								overallFailed = true;
						}

						//If tip has passed
						if(!overallFailed)
						{
							cursor.continue();
						}
						else//If tip has failed, change the icon to NEGATIVE privacy
						{
							var icon = new Object();
        			             	   	var jsonString = '{"32" : "./eye-noprivacy.png"}';
	                        			button.icon  = JSON.parse(jsonString);
						}
					}
					else
					{
						//If all tips succeeded, change the icon to positive privacy
						if(!overallFailed)
						{
							var icon = new Object();
			                        	var jsonString = '{"32" : "./eye-privacy.png"}';
                        				button.icon  = JSON.parse(jsonString);
						}
					}

				}
			
			}
			else//If recipient was not found in cache, then privacy policy of website has not yet been reviewed
			{
				var icon = new Object();
				var jsonString = '{"32" : "./eye-qnmark.png"}';
	                        button.icon  = JSON.parse(jsonString);
			}
		}
	}

}

/****
 *Check if the recipient satisfies a specific tip. Triggers passedtip/failedtip events
 *@method checkIfRecipientSatisfiesPolicy
 *@param db {indexedDB pointer} Pointer to the trustmark database
 *@param recipient_id {String} hostname of the website (www.example.com)
 *@param tip_type {minimization|access|accountability|transparency|dataquality} Granular Principle
 *@param trustmarkpanel {panel object} Trustmark Panel
 *@return none
 */	
function checkIfRecipientSatisfiesPolicy(db, recipient_id, tip_type, trustmarkpanel)
{
	var tip_divname = tip_type;

	var recipientObjectStore = db.transaction("recipients").objectStore("recipients");
	var recipientRequest = recipientObjectStore.get(recipient_id);

	//Get the recipient from the recipient object store
	recipientRequest.onerror = function(event)
	{
		console.log("An error occurred while accessing the recipient store");
	}
	recipientRequest.onsuccess = function(event)
	{
		//if recipient exists
		if(event.target.result)
		{
			var trustmark_list = event.target.result.trustmark_list;
		

			//Get the tips from the tip store
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

					//If the tip is active
                 		         if(isActive === "1")
                       			 {

						var overallEvaluationViaWebAPI = false;

						if(overallEvaluationViaWebAPI)
						{
							//TODO: Placeholder for GTRI integration for TIP verification
							doesRecipientSatisfyPolicyWebAPICheck(recipient_id, results.tip_json);
						}
						else
						{
							//Simple evaluation of trust expression
							var trust_expression = results.trust_expression;

							var result = evaluateTrustmarkExpression(trust_expression, trustmark_list);

							//If recipient trustmarks have satisfied TIP trust expression
	                        	                if(result)
        	                        	        {
								//Trigger passedtip event
                	                        	        trustmarkpanel.port.emit("passedtip", tip_divname, recipient_id);
                        	                        	console.log("The recipient has matched policy");
                                	        	}
	                                	        else
        	                                	{
								//Trigger failed tip event
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
 *Extract TIP trust expression from TIP JSON
 *@method getTIPTrustExpression
 *@param tip_json {JSON string} TIP JSON
 *@return Trust expression for the TIP
 */
function getTIPTrustExpression(tip_json)
{
	var jsonObj = JSON.parse(tip_json);
	var trustexpression = jsonObj.TrustInteroperabilityProfile.TrustExpression;

	return trustexpression;
}

/*****
 *Send the tip trust expression (textual format) and tip type to settings. Triggers 'receivetipdetails' event
 *@method getTIPExpressionText
 *@param tip_name {String} TIP Nickname
 *@Param worker {sidebar eventhandler} settings sidebar worker
 *@return Emits receivetipdetails message with tip type and trust expression
 */
function getTIPExpressionText(tip_name, worker)
{
	var dbRequest = indexedDB.open("trustmarkDB", 2);

	var db;

	dbRequest.onsuccess = function(event)
	{	
		db = event.target.result;

		var tipObjectStore = db.transaction("tip", "readwrite").objectStore("tip");

		//Get the tip for the matching nickname
		var tipIndex = tipObjectStore.index("nickname")
		var tipRequest = tipIndex.openCursor(tip_name);	

		tipRequest.onsuccess = function(event)
		{
			var cursor = event.target.result;
			if(cursor)
			{
					
				var tipRow = event.target.result.value;
				//If TIP found
				if(tipRow.nickname === tip_name)
				{

					//Get tip trustexpression
					var trustexpression = tipRow.trust_expression;

					//Get list of all trustmark definitions
					var trustmarkdefsStore = db.transaction("trustmarkdefs", "readwrite").objectStore("trustmarkdefs");
					var openRequest = trustmarkdefsStore.openCursor()
					
					openRequest.onsuccess = function(event)
					{
						var trustmarkdefcursor = event.target.result;
						if(trustmarkdefcursor)
						{
							//Replace trustmark definition ID with trustmark definition description
							var td = trustmarkdefcursor.value;
							trustexpression = trustexpression.replace(td.identifier, "'" +td.description + "'");	

							trustmarkdefcursor.continue();
						}
						else
						{

							//After iterating through all trustmark definitions, trigger receivetipdetails event that sends the trust expression
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
 *Get trustmark definition ID list referenced by a TIP
 *@method getTrustmarkList
 *@param tip_json {JSON string} TIP JSON
 *@return Trustmark Definition IDs list separated by ##TRUSTMARK##
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
 *Update TIP trustmark expression with referenced TIP's trust expression
 *@method updateExpression
 *@param existing_condition {Boolean expression} Current trust expression for TIP
 *@param referenced_tip_id {String} Referenced TIP Identifier
 *@param referenced_tip_condition {Boolean expression} Referenced TIP Trust expression
 *@return none
 */
function updateExpression(existing_condition, referenced_tip_id, referenced_tip_condition)
{
	existing_condition = existing_condition.replace(referenced_tip_id, "(" + referenced_tip_condition + ")");
	
	return existing_condition;
}

/***
 *Identify type of TIP from its ID 
 *Can be replaced by a call back to the tip store to get the TIP type
 *@method getTipType
 *@param tip_id {String} TIP Identifier
 *@return tip_type {minimization|accountability|access|dataquality|transparency)} Granular Principle
 */
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

/****
 *Get the default tip nickname for a tip
 *@method getTIPNickname
 *@param policy_type {minimization|accountability|access|dataquality|transparency} Granular Principle
 */
function getTIPNickname(policy_type)
{
	return policy_type + "-default";
}


/**
 *Add the TIP details (trustmark list,active ..etc) to TIP row
 *@method addTIPDetailsToTIP
 *@param tipObjectStore {indexedDB store} TIP Object Store
 *@param tip_id {String} TIP Identifier
 *@param tip_json {JSON String} TIP JSON
 *@param tip_type {minimization|access|accountability|transparency|dataquality} Granular Principle
 *@param tip_nickname {String} TIP Nickname
 *@param isActive {1/0} is TIP Currently Applied
 *@param trustmark {String}  Trustmark Definition List that will be appended to TIP's trustmark definition list
 *@param trustexpression {String} Trust Expression of the TIP (new insert) or Referenced TIP for Update
 *@param tipreferencearray {String array} Array of TIP IDs referred by the TIP
 *@param currentindex {integer} Index of currently referred TIP in tipreferencearray whose trustmarks will be appended to TIP's trustmark list in the next call
 *@return none		
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
				
//				console.log("TIP added!" + tip_nickname);

			}


			addRequest.onerror = function(event)
			{
				console.log("The tip could not be added for " + tip_id);
			}	 
		}	
		
	}

}

/**
 *Append trustmark definitions to TIP's trustmark definition listrecursively from referenced tips
 *@method appendTrustmarksRecursively
 *@param tipreferencearray {String array} TIP Reference array
 *@param currentindex {integer} Index of the referenced tip among list of referenced tips
 *@param tip_json {JSON string} JSON string of the TIP
 *@param tip_type {minimization|access|accountability|transparency|dataquality} Granular Principle
 *@param tip_nickname {String} TIP Nickname
 *@param isActive {1/0} Is TIP currently applied
 *@param TIPObjectStore {indexedDB object store} TIP Object Store
 *@return none
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
 * Insert TIP in Cache
 * @method insertTIPInCache
 * @param db {indexedDB pointer} Database pointer
 * @param tip_id {indexedDB pointer} TIP Identifier
 * @param tip_json {JSON string} TIP JSON
 * @param tip_type {minimization|transparency|accountability|access|dataquality} Specific granular principle
 * @param tip_nickname {string} TIP Nickname
 * @param isActive {1/0} Is TIP Active	
 * @return none  
 */
function insertTIPInCache(db, tip_id, tip_json, tip_nickname, tip_type, isActive)
{
    var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");

    var trustmarklist = getTrustmarkList(tip_json);
    var trust_expression = getTIPTrustExpression(tip_json);	
    addTIPDetailsToTIP(TIPObjectStore, tip_id, tip_json, tip_type, tip_nickname, isActive, trustmarklist, trust_expression);

}

/***
 *Display the trustmarks for a recipient and TIP
 *Emits the 'trustmark' event
 *@method displayTIPTrustmarks
 *@param tip_key {String} TIP Identifier
 *@param recipient_id {String} hostname of the recipient website
 *@param worker {Panel object} panel eventhandler and transmitter
 *@return none
 */
function displayTIPTrustmarks(db, worker, tip_key, recipient_id)
{


		//Open TIP object store
		var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");
		//Get the tip key
		var tipRequest = TIPObjectStore.get(tip_key);

		tipRequest.onerror = function(event)
		{
			console.log("An error occurred while accesssing the tip store");
		}

		tipRequest.onsuccess = function(event)
		{

			//If the tip is present
			if(event.target.result)
			{

				//Get the TIP trustmark definition list, tip trust expression, tip json
				var tip = event.target.result;
				var tip_trustmark_list = tip.trustmark_list;
				var tip_json = tip.tip_json;
				var trustexpression = tip.trust_expression;
				var tip_name = tip.nickname;

				//Get the recipient trustmark list
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

					//Get the description of all the trustmark definitions
					//Create a list of trustmark definition with the descriptions
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
							//Emit the trustmark event
							worker.port.emit("trustmark", tip_trustmark_json, recipient_trustmark_list, tip_json, recipient_id, trustexpression, tip_name);

						}
					}
				}	
			}
		}	

}

/***
 *Displays the trustmarks passed/failed for a currently active policy for a specified granular principle
 *@method displayTrustmarksForCurrentlyActivePolicy
 *@param tip_type {minimization|access|accountability|transparency|dataquality} Granular Principle
 *@param recipient_id {string} website host name (www.example.com}
 *@param worker {Panel object} panel event handler/trigger
 */
function displayTrustmarksForCurrentlyActivePolicy(tip_type, recipient_id, worker)
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

		//Access the TIP object store and get all the tips for the specified granular principle
		var TIPObjectStore = db.transaction("tip", "readwrite").objectStore("tip");
		var policyIndex = TIPObjectStore.index("type");

		var policyRequest = policyIndex.openCursor(tip_type);

		policyRequest.onsuccess = function(event)
		{
			var cursor = event.target.result;
		
			if(cursor)
			{
				var tip = cursor.value;

				//Is TIP Active?
				if(tip.isActive === "1")
				{

					var tip_trustmark_list = tip.trustmark_list;
   	                                var tip_json = tip.tip_json;
                                        var trustexpression = tip.trust_expression;
                               		var tip_name = tip.nickname;

					//Get the recipient trustmark list
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

                                	        //Get the description of all the trustmark definitions
                                        	//Create a list of trustmark definition with the descriptions
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
                                                        	//Emit the trustmark event
        	                                                worker.port.emit("trustmark", tip_trustmark_json, recipient_trustmark_list, tip_json, recipient_id, trustexpression, tip_name);

							}	
						}

					}
				}
				else
				{
					//If TIP is not active
					cursor.continue();
				}
			}
		} 
			
	}

}
 
exports.insertTIPInCache = insertTIPInCache
exports.checkIfRecipientSatisfiesPolicy = checkIfRecipientSatisfiesPolicy
exports.displayTIPTrustmarks = displayTIPTrustmarks
exports.uploadUserPolicy2 = uploadUserPolicy2
exports.applyUserPolicy = applyUserPolicy
exports.resetPolicy = resetPolicy 
exports.getTIPNicknameList = getTIPNicknameList
exports.getTIPExpressionText = getTIPExpressionText
exports.checkIfRecipientSatisfiesAllActiveTIPs = checkIfRecipientSatisfiesAllActiveTIPs
exports.checkIfTipNameIsUnique = checkIfTipNameIsUnique;
exports.displayTrustmarksForCurrentlyActivePolicy = displayTrustmarksForCurrentlyActivePolicy
/**
 *NOTES
 1. Not handling TIP/Trustmark Updation over time
 2. Assumption - TIP JSON has been modified to put Trustmarks and Referenced TIPs in an array (for JSON parsing to succeed)
 3. Assumption - TIP JSON Trustexpression directly has Identifiers instead of idrefs
 4. Assumption - If TIP is not present in pre-packaged, currently we don't support it. But it could get it from trustmark registry server.
 5. Assumption - If a TIP references Trustmarks that are not present in the cache, it is retrieved from Trustmark Registry Server
 6. Trustmark Definition updation is not handled right now
**/
