/******
 *@Purpose - Shows failed and passed trustmarks
 *
 */
function isEmpty(str)
{
	return (!str || 0 === str.length);
}

function getTrustmarkSet(trustmark_list)
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

addon.port.on("trustmark", function(tip_trustmark_list, recipient_trustmark_list, tip_json, site_url) {

	var tip_trustmark_set = tip_trustmark_list;
	var recipient_trustmark_set = getTrustmarkSet(recipient_trustmark_list);
	var tipJSONObj = JSON.parse(tip_trustmark_list);
	var trustmarkarray = tipJSONObj.trustmarks;
	var trustmarks_received_set = [];
	var trustmarks_not_received_set = [];

	var trustmarkheader = document.getElementById("trustmarkheader");
	trustmarkheader.appendChild(document.createTextNode(site_url));
	for(var index in trustmarkarray)
	{
		var trustmark = trustmarkarray[index];
		var trustmarkname = trustmark.trustmark_name;
		var trustmarkid = trustmark.trustmark_id;

		if(recipient_trustmark_set.has(trustmarkid))
		{
			trustmarks_received_set[trustmarks_received_set.length] = trustmarkname;
		}
		else
		{
			trustmarks_not_received_set[trustmarks_not_received_set.length] = trustmarkname;
		}
	}

        var trustmark_externaldiv = document.getElementById("trustmark_wrapper");
	for(var index in trustmarks_received_set)
	{
		var trustmarkname = trustmarks_received_set[index];
		var element = document.createElement('div');
		element.className = "received_trustmark";
                trustmark_externaldiv.appendChild(element);
                element.appendChild(document.createTextNode(trustmarkname));
	}

        var notrustmark_externaldiv = document.getElementById("notrustmark_wrapper");
	for(var index in trustmarks_not_received_set)
	{
		var trustmarkname = trustmarks_not_received_set[index];
                var element = document.createElement('div');
		element.className = "notreceived_trustmark";
		notrustmark_externaldiv.appendChild(element);
                element.appendChild(document.createTextNode(trustmarkname));
	}

	addon.port.emit("trustmarksshown");
});

//TODO: Click to view policy
