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

addon.port.on("trustmark", function(tip_trustmark_list, recipient_trustmark_list) {

	var tip_trustmark_set = getTrustmarkSet(tip_trustmark_list);
	var recipient_trustmark_set = getTrustmarkSet(recipient_trustmark_list);
	
	tip_trustmark_set.forEach(function(trustmark){

		if(recipient_trustmark_set.has(trustmark))
		{
			var element = document.createElement('div');
			document.body.appendChild(element);
			element.appendChild(document.createTextNode(trustmark));
		}
	});
	
	addon.port.emit("trustmarksshown");
});

//TODO: Click to view policy
