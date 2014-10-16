self.port.on("failedtip", function onFailedTIP(tip)
{
	var wrapperid = tip + "-wrapper";
	var d = document.getElementById(wrapperid);
	d.style.background = "url('red-cross.png')";
	d.style.color = "gray";

});

self.port.on("passedtip", function onPassedTIP(tip)
{
	var wrapperid = tip + "-wrapper";
	var d = document.getElementById(wrapperid);
	d.style.background = "url('green-check.png')";
	d.style.color = "gray";

});

var minimizationDiv = document.getElementById("minimization");
var transparencyDiv = document.getElementById("transparency");
var accessDiv = document.getElementById("access");
var accountabilityDiv = document.getElementById("accountability");
var dataqualityDiv = document.getElementById("dataquality");

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


function onClickListener(event)
{
	self.postMessage(event.target.id);

	var tipdivs = document.getElementsByClassName('tip-heading')

	for(index = 0; index < tipdivs.length; index++)
	{
		var divelement = tipdivs[index];
		if(divelement.id != event.target.id)
		{
			divelement.removeEventListener("click", onClickListener, false);
			divelement.removeEventListener("mouseover", onMouseOverListener, false);
			divelement.removeEventListener("mouseout", onMouseOutListener, false);
			divelement.style.color = "#A7C4C4";
		}

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
}
reset();

self.port.on("hi", function onHi()
{
        reset();
});

