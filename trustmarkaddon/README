*****************************************************************
*This code is property of Georgia Institute of Technology
*Written by: Akshata Rao
*****************************************************************
DISCLAIMER
----------------
This is an academic project created as part of the CS 6266 Information Security Practicum course at Georgia Institute of Technology.

All pre-packaged trustmarks that have been provided to websites are for representational purposes only. They were assigned using the website's privacy policy as a guideline. However, no actual examination of a website's privacy policy has been conducted to assign these trustmarks to the website.

DESCRIPTION
-------------------
This is a software prototype for extending the trustmark concept towards online privacy.
Enclosed is a Mozilla Firefox browser addon built using the Mozilla Firefox Addon SDK.
This addon can be imported into the Mozilla Firefox browser. 

TECHNOLOGIES USED
------------------------
Languages used: HTML, Javascript
Database: Indexed DB
Mozilla Addon SDK

WEBSITES SUPPORTED
------------------
Trustmarks have been packaged for the below list of websites. These trustmarks have been provided to the websites using their privacy policy as a guideline. However, there has been no official examination and these are only representative trustmarks. They do NOT represent the actual privacy status for any of these websites.

a. Facebook (www.facebook.com)
b. Amazon (www.amazon.com)
c. HealthVault (www.healthvault.com)
d. Bank of America (www.bankofamerica.com)
e. Udacity (www.udacity.com)

INSTALLATION
--------------
1. In your Mozilla Firefox browser, navigate to Addons->Settings->Install Addon From File.
2. Select the trustmarkaddon.xpi file.

DEVELOPMENT GUIDELINES
-----------------------
This project has been developed using the Mozilla Addon SDK.
https://developer.mozilla.org/en-US/Add-ons/SDK

Installation instructions for the SDK can be found at https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation

The browser addon can be packaged using 'cfx xpi' command.


MODULES
--------------------
The trustmark browser addon has the following modules.

1. Panel Viewer
****************
Files: lib/panelviewer.js, data/panel.html, data/test.js

This module is responsible for displaying the TIPs that have passed or failed for the website.

2. Page Load Handler
*********************
Files: lib/pageloadhandler.js

This module is responsible for invoking trustmark download and TIP evaluation for a website.

3. Main
***************
Files: lib/main.js

This module is responsible for initializing the database tables and loading pre-packaged trustmarks, trustmark definitions and TIPs. It also initializes the trustmark panel.

4. Trustmark Helper
*********************
Files: lib/trustmarkhelper.js

This module is responsible for insertion,retrieval and deletion of trustmarks, trustmark definitions, recipients in the cache.

5. Trustmark Policy Helper
*****************************
Files: lib/trustmarkpolicyhelper.js

This module is responsible for insertion,retrieval and deletion of trustmark interoperability profiles in the cache. The module has operations for evaluation of recipient trustmarks according to a TIP.
It also has library functions for TIPs such as getting the tip names, applying the TIP policy, reset all TIPS to default, upload TIPs.
 
6. Trustmark Verifier
***************************
Files: lib/trustmarkverifier.js

This module is a placeholder for trustmark verification. 

7. Privacy Settings Sidebar
****************************
Files: data/settings.js data/settings.html

This module encloses the operations for switch, upload, creation of TIPs from the TIP sidebar (Settings).  

8. Trustmark Sidebar
****************************
Files: data/sidebar.html data/sidebar.js

This module encloses the operations for displaying the trustmarks received/not received by a website in the trustmarks sidebar. It also displays the currently active TIP.
 
9. Pre-packaged Trustmarks and Trustmark Interoperability Profiles
*******************************************************************
Files: data/defaultTrustmarksNew, data/defaultTrustmarkDefinitionsNew, data/defaultTIPNew

These folders enclose the pre-packaged trustmarks,trust interoperability profiles.

PLACEHOLDERS
---------------------------

1. Placeholder 1
********************
File: lib/pageloadhandler.js
Method: getRecipientActiveTrustmarkIDListFromServer(recipient_id)
Description: Gets the list of active trustmark IDs for a website.
Current Status: Contains dummy code that checks if prepackaged trustmarks exist for the website. If yes, it returns dummy trustmark IDs.

2. Placeholder 2
********************* 
File: lib/pageloadhandler.js
Method: downloadTrustmarkFromServer(recipient_id, trustmark_id)
Description: Downloads the trustmark for the website.i
Current Status: Returns an empty trustmark JSON 

3. Placeholder 3
*********************
File: lib/pageloadhandler.js
Method:verifyIfLatestRecipientTrustmarksAreInCache(recipient_id, recipientActiveTrustmarkIDsinServer)
Description: Verifies if the website's trustmarks in cache are the latest
Current Status: Returns true always. Compares the list of trustmarks in the cache with itself, instead of the trustmarks that will be received from the server.

4. Placeholder 4
**********************
File: lib/trustmarkpolicyhelper.js
Method: doesRecipientSatisfyPolicyWebAPICheck(recipient_id, tip_json)
Description: Sends the TIP JSON and website hostname to the GTRI webservice to verify if the website satisfies the TIP
Current Status: Always returns true. TIP evaluation is done using an internal method that validates only the TIP's trust expression. Dummy invocation in checkIfRecipientSatisfiesPolicy(), checkIfRecipientSatisfiesAllActiveTIPs().

DOCUMENTATION
---------------
All documentation has been generated using YUIDocs in the form of HTML docs.
The documentation can be accessed in the out folder. (out/index.html)

FUTURE WORK
---------------
This trustmark addon can be improved upon in the following versions.

1. Support for trustmark definition updates.
2. Support for a 'Help' page to guide users about trustmark definitions.
3. Support for TIP evaluation, trustmark status check using web services.
4. Support for trustmark signature verification.
