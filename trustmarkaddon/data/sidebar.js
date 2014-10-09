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

addon.port.on("trustmark", function(tip_trustmark_list, recipient_trustmark_list, tip_json) {

	var tip_trustmark_set = tip_trustmark_list;
	var recipient_trustmark_set = getTrustmarkSet(recipient_trustmark_list);
	var tipJSONObj = JSON.parse(tip_trustmark_list);
	var trustmarkarray = tipJSONObj.trustmarks;

	for(var index in trustmarkarray)
	{
		var trustmark = trustmarkarray[index];
		var trustmarkname = trustmark.trustmark_name;
		var trustmarkid = trustmark.trustmark_id;

		if(recipient_trustmark_set.has(trustmarkid))
		{
			var element = document.createElement('div');
        	        document.body.appendChild(element);
                        element.appendChild(document.createTextNode(trustmarkname));

		}
	}

	addon.port.emit("trustmarksshown");
});

//TODO: Click to view policy
