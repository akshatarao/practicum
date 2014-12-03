/***
 * TIP Sidebar
 * @module sidebar
 */

/**
 *@class
 */

/******
 *Check if string is empty
 *@method isEmpty
 *@param str {String} string
 *@return TRUE if string is empty
 */
function isEmpty(str)
{
	return (!str || 0 === str.length);
}

/***
 *Get Trustmark Set
 *@method getTrustmarkSet
 *@param trustmark_list {String} Trustmark Set
 *@return none
 */
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

/***
 *Get HTML TIP Expression
 *@method getBeautifiedTIPExpr
 *@param tip_expr {String} TIP trust expression
 *@return none
 */
function getBeautifiedTIPExpr(tip_expr)
{
        tip_expr = tip_expr.replace(/\) and \(/gi, "\)<p><b> AND </b></p>\(");
        tip_expr = tip_expr.replace(/\) and /gi, "\)<p><b> AND </b></p>");
        tip_expr = tip_expr.replace(/ and \(/gi, "<p><b> AND </b></p>\(");

        tip_expr = tip_expr.replace(/\) and \(/gi, "\)<p><b> OR </b></p>\(");
        tip_expr = tip_expr.replace(/\) and /gi, "\)<p><b> OR </b></p>");
        tip_expr = tip_expr.replace(/ and \(/gi, "<p><b> OR </b></p>\(");

        tip_expr = tip_expr.replace(/\' and \'/gi, "\'<p><b> AND </b></p>\'");
        tip_expr = tip_expr.replace(/\' or \'/gi, "\'<p><b> OR </b></p>\'");
        tip_expr = tip_expr.replace(/\(/gi,"<font color='blue' size='5'>\(</font>");
        tip_expr = tip_expr.replace(/\)/gi, "<font color='blue' size='5'>\)</font>");

        return tip_expr;
}

/**
 *Event Handler for 'trustmark' event
 *@event trustmark
 *@param tip_trustmark_list {String} TIP referenced trustmark definitions
 *@param recipient_trustmark_list {String} Recipient trustmark definitions
 *@param tip_json {JSON} TIP JSON string
 */
addon.port.on("trustmark", function(tip_trustmark_list, recipient_trustmark_list, tip_json, site_url, trustexpression, tip_name) {

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

	var policy_preview = document.getElementById("policy_preview");
	policy_preview.innerHTML = getBeautifiedTIPExpr(trustexpression);

	var policy_name = document.getElementById("policy_name");
	policy_name.innerHTML = tip_name;

	addon.port.emit("trustmarksshown");
});

/***
 *On MouseOver Listener for Tab
 *@method onMouseOverListener
 *@return none
 */
function onMouseOverListener(event)
{
        event.target.style.background = "#00407F";
}

/**
 *On mouseout listener for tab
 *@method onMouseOutListener
 *@return none
 */
function onMouseOutListener(event)
{
        if(event.target.style.color != "white")
        {
                event.target.style.background = "#3D4040";
        }
}

/**
 *On mouse click listener for tab
 *@method onClickListener
 *@return none
 */
function onClickListener(event)
{
	var tabheaddivs = document.getElementsByClassName('tab-head');

        for(index = 0; index < tabheaddivs.length; index++)
        {
                var divelement = tabheaddivs[index];

                if(divelement.id === event.target.id)
                {
                        divelement.style.background = "#00407F";
                        divelement.style.color = "white";
                }
                else
                {
                        divelement.style.background = "#3D4040";
                        divelement.style.color = "#CCD5D5"; 
                }       
        }


	var tabdivs = document.getElementsByClassName('wrapper');
        var contentelementid = event.target.id +"_wrapper";

        for(index = 0; index < tabdivs.length; index++)
        {
                var divelement = tabdivs[index];

                if(divelement.id === contentelementid)
               {

                        divelement.style.display = "block";
                }
                else
                {
                        divelement.style.display = "none";
                }
        }


}

/**
 *Reset all sidebar tabs
 *@method reset
 *@return none
 */
function reset()
{           
        var tabdivs = document.getElementsByClassName('tab-head');
               
        for (var index = 0; index < tabdivs.length; index++)
        {
                var e = tabdivs[index]; 
                e.addEventListener("click", onClickListener, false);
                e.addEventListener("mouseover", onMouseOverListener,false);
                e.addEventListener("mouseout", onMouseOutListener,false);
        }
}

reset();
