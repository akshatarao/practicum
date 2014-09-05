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
