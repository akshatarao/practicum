/**
 Filename: trustmarkhelper.js
 Purpose: Retrieves trustmarks from trustmark registry server
 Created by: ARao
**/

/**
 * Retrieve trustmarks
 * Params: website_url - URL of the website for which the trustmarks are being retrieved
 * Returns: trustmark XML
 */
function retrieveTrustmarks(website_url)
{
	console.log("Inside retrieve trustmarks");
}

/**
 * Calculate Privacy Rating based on trustmarks
 * Params: trustmark_xml - Trustmarks XML
 * Return : Trustmark Rating
 */
function calculateTrustmarkRating(trustmark_xml)
{
	console.log("Inside calculate trustmark rating");
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
function addRecipientToCache(db, recipient_id, trustmark_json)
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
                        console.log("Recipient " + recipientRequest.result.name + " found.");
                }
                else
                {
                        var recipient_name = getRecipientName(trustmark_json);
                        var recipientRow = { identifier : recipient_id, name: recipient_name };
                        recipientObjectStore.add(recipientRow);
                        console.log("Recipient added : " + recipient_name);
                }
        }

}

/*
 *
 *
*/
function addTrustmarkToCache(db, trustmark_id_val, trustmark_def_id_val, trustmark_json_val)
{
	var trustmarkObjectStore = db.transaction("trustmarks", "readwrite").objectStore("trustmarks");

        var trustmarkRequest = trustmarkObjectStore.get(trustmark_id_val);

        trustmarkRequest.onerror = function(event)
        {
                console.log("An error occurred while accessing the trustmarks store");
        }

        trustmarkRequest.onsuccess = function(event)
        {
                if(trustmarkRequest.result)
                {
                        console.log("Trustmark " + trustmark_id_val + " found.");
                }
                else
                {
                        var trustmarkRow = { trustmark_id : trustmark_id_val, trustmark_def_id: trustmark_def_id_val, trustmark_json: trustmark_json_val };
                        trustmarkObjectStore.add(trustmarkRow);
                        console.log("Trustmark added : " + trustmark_id_val);
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

	console.log("Add trustmark to cache");
	console.log("Recipient ID: " + recipient_id);
	console.log("Trustmark ID: " + trustmark_id);
	console.log("Trustmark Def ID:" + trustmark_def_id);

	addRecipientToCache(db, recipient_id, trustmark_json);
	addTrustmarkToCache(db, trustmark_id, trustmark_def_id, trustmark_json);
	//add trustmark to trustmark store
	//if not exists, add trustmark def to trustmark def store
	//if not exists, add recipient to recipient store
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
	console.log("Inside store trustmark in cache");
}

/**
 * Retrieve Trustmarks from Cache
 * Params: website_url - Website URL
 */ 
function retrieveTrustmarkFromCache(website_url)
{
	console.log("Inside retrieve trustmark from cache");
}

exports.retrieveTrustmarks = retrieveTrustmarks;
exports.calculateTrustmarkRating = calculateTrustmarkRating;
exports.storeTrustmarkInCache = storeTrustmarkInCache;
exports.retrieveTrustmarkFromCache = retrieveTrustmarkFromCache;
exports.addTrustmarkRelationsToCache = addTrustmarkRelationsToCache;
