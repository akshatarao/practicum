/**
 * Filename: trustmarkverifier.js
 * Purpose: Verifies the digital signature on the trustmark XML
 * Created By: ARao
 *
 */

/** 
 * Retrieves the Trustmark Registry Server Signing Certificate
 */
function retrieveServerCertificate()
{
	console.log("Inside retrieve server certificate");
}

/**
 * Verify the digital signature of the trustmark
 * Params: trustmark_xml - Trustmark XML
 *	   server_certificate - Server Certificate
 */
function verifyTrustmarkSignature(trustmark_xml, server_certificate)
{
	console.log("Inside verify trustmark signature");
}

/**
 * Verify if the trustmark is valid 
 *
 */
function verifyIfTrustmarkIsValid()
{
	console.log("Inside verify if trustmark is valid");
}

exports.retrieveServerCertificate = retrieveServerCertificate;
exports.verifyTrustmarkSignature = verifyTrustmarkSignature;
exports.verifyIfTrustmarkIsValid = verifyIfTrustmarkIsValid;
