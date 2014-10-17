var uploadDiv = document.getElementById("upload");
var applyDiv = document.getElementById("apply");
var resetDiv = document.getElementById("reset");

function onClickListener(event)
{
	
	var tabdivs = document.getElementsByClassName('content');
	var contentelementid = event.target.id +"-content";
	window.alert(contentelementid);
	var contentelement = document.getElementById(contentelementid);
	contentelement.style.display = "block";

	for(index = 0; index < tabdivs.length; index++)
	{
		var divelement = tabdivs[index];
		window.alert(divelement.id);

		if(divelement.id != event.target.id)
		{
			var contentelementid = divelement.id + "-content";

			var contentelement = document.getElementById(contentelementid);
			contentelement.style.display = "none";
		}
	}

}

function reset()
{

        uploadDiv.addEventListener("click", onClickListener, false);
        applyDiv.addEventListener("click", onClickListener, false);
	resetDiv.addEventListener("click", onClickListener,false);
}

reset();
