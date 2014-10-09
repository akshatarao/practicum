self.port.on("show", function onShow()
{
	self.port.emit("whatsup");
	window.alert("hey");
});

self.port.on("failedtip", function onFailedTIP(tip)
{
	var d = document.getElementById(tip);
	d.style.background = "red";

});

self.port.on("passedtip", function onPassedTIP(tip)
{
	var d = document.getElementById(tip);
	d.style.background = "green";
});

var minimizationDiv = document.getElementById("minimization");
var transparencyDiv = document.getElementById("transparency");
var accessDiv = document.getElementById("access");
var accountabilityDiv = document.getElementById("accountability");
var dataqualityDiv = document.getElementById("dataquality");

function onMouseOverListener(event)
{
        var targetDiv = event.target;
        targetDiv.style.border = "thin solid black";
}

function onMouseOutListener(event)
{
        var targetDiv = event.target;
        targetDiv.style.border = "";
}


function onClickListener(event)
{
	self.postMessage(event.target.id);

	var tipdivs = document.getElementsByClassName('tip')

	for(index = 0; index < tipdivs.length; index++)
	{
		var divelement = tipdivs[index];
		
		if(divelement.id != event.target.id)
		{
			divelement.removeEventListener("click", onClickListener, false);
			divelement.removeEventListener("mouseover", onMouseOverListener, false);
			divelement.removeEventListener("mouseout", onMouseOutListener, false);
			divelement.style.background = "gray";
		}

	}
		
}
function reset()
{
	var tipdivs = document.getElementsByClassName('tip');

	for(index = 0; index < tipdivs.length; index++)
	{
		tipdivs[index].addEventListener("click", onClickListener, false);
		tipdivs[index].addEventListener("mouseover", onMouseOverListener, false);
		tipdivs[index].addEventListener("mouseout", onMouseOutListener, false);
	}
}
reset();

self.port.on("hi", function onHi()
{
        reset();
});

