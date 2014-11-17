/********
 *@Purpose - Functions to display TIPs panel content
 *         - Displays the failed TIPs
 *         - Supports click on TIPs and sends message to panel to display TIP sidebar
 */
function displayOverallPrinciplesPassed(recipient)
{
	 var tipdivs = document.getElementsByClassName('tip')
	 var overallPassed = true;

	 for(var index = 0; index < tipdivs.length; index++)
	 {

		var tip = tipdivs[index];
		
		if(tip.style.display === "block")
		{
			overallPassed = false;
		}
	 }

	var overallmessagediv = document.getElementById("overall-policy");
	var overallMessage  = "<font color='#0066FF'>" + recipient + "</font> fails the privacy settings for the below privacy principles.";
	
	if(overallPassed)
	{
		overallMessage = "<font color='#0066FF'>" + recipient + "</font> has passed the privacy settings for all the privacy principles.";
		//self.postMessage("overallpassed");		
	}
	else
	{
		//self.postMessage("overallfailed");
	}

	overallmessagediv.innerHTML = overallMessage;

}

self.port.on("failedtip", function onFailedTIP(tip, recipient)
{
	var wrapperid = tip + "-wrapper";
	var d = document.getElementById(wrapperid);
	d.style.background = "url('red-cross.png')";
	d.style.color = "gray";
	d.style.display = "block";

	displayOverallPrinciplesPassed(recipient);

});

self.port.on("passedtip", function onPassedTIP(tip, recipient)
{
	var wrapperid = tip + "-wrapper";
	var d = document.getElementById(wrapperid);
	d.style.background = "url('green-check.png')";
	d.style.color = "gray";
        d.style.display = "none";

        displayOverallPrinciplesPassed(recipient);

});

var minimizationDiv = document.getElementById("minimization");
var transparencyDiv = document.getElementById("transparency");
var accessDiv = document.getElementById("access");
var accountabilityDiv = document.getElementById("accountability");
var dataqualityDiv = document.getElementById("dataquality");
var settingsButton = document.getElementById("settings");

function onMouseOverListener(event)
{
        var targetDiv = event.target;
	targetDiv.style.color = "#0066FF";
}

function onMouseOutListener(event)
{
        var targetDiv = event.target;
	targetDiv.style.color = "black";
}

function onClickListenerForSettings(event)
{
	self.postMessage("settings");
}

function onClickListener(event)
{
	self.postMessage(event.target.id);

	var tipdivs = document.getElementsByClassName('tip-heading')

	for(index = 0; index < tipdivs.length; index++)
	{
		var divelement = tipdivs[index];
/**		if(divelement.id != event.target.id)
		{
			divelement.removeEventListener("click", onClickListener, false);
			divelement.removeEventListener("mouseover", onMouseOverListener, false);
			divelement.removeEventListener("mouseout", onMouseOutListener, false);
			divelement.style.color = "#A7C4C4";
		}**/

	}
		
}

function reset()
{
	var tipdivs = document.getElementsByClassName('tip-heading');

	for(index = 0; index < tipdivs.length; index++)
	{
		tipdivs[index].addEventListener("click", onClickListener, false);
		tipdivs[index].addEventListener("mouseover", onMouseOverListener, false);
		tipdivs[index].addEventListener("mouseout", onMouseOutListener, false);
		tipdivs[index].style.color = "black";
		var wrapperid = tipdivs[index].id+"-wrapper";
		var wrapper = document.getElementById(wrapperid);
		wrapper.style.background  = "url('rotating.gif') no-repeat";
	}

	settingsButton.addEventListener("click", onClickListenerForSettings, false);
}
reset();

self.port.on("resetpanel", function onResetPanel()
{
        reset();
});

self.port.on("notrustmarks", function onNoTrustmarksReceived(recipient)
{
	
	var overallmessagediv = document.getElementById("overall-policy");

	var overallMessage = "";
	if(recipient)
	{
		overallMessage = "The privacy policy for <font color='#0066FF'>" + recipient + "</font> has not yet been reviewed.";

	}
	else
	{
        	overallMessage  = "No website is open in this tab.";
	}

	overallmessagediv.innerHTML = overallMessage;
	//Change icon to grey

	var tipdivs = document.getElementsByClassName('tip');

        for(var index = 0; index < tipdivs.length; index++)
        {
                var tip = tipdivs[index];

                tip.style.display = "none";
        }


});

