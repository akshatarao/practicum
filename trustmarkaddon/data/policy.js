var uploadDiv = document.getElementById("upload");
var applyDiv = document.getElementById("apply");
var resetDiv = document.getElementById("reset");
/**
 * Displays the settings in tabbed content
 *@module policy
 */

/**
 *@class policy
 */

/***
 *On Click Listener for Tabs
 *@method onClickListener
 *@param event {Event} Mouse click event
 */
function onClickListener(event)
{
	
	var tabdivs = document.getElementsByClassName('content');
	var contentelementid = event.target.id +"-content";
	window.alert(contentelementid);
	var contentelement = document.getElementById(contentelementid);
	contentelement.style.display = "block";

	//Iterate through the tabs and display contents of the displayed tabs
	for(index = 0; index < tabdivs.length; index++)
	{
		var divelement = tabdivs[index];

		if(divelement.id != event.target.id)
		{
			var contentelementid = divelement.id + "-content";

			var contentelement = document.getElementById(contentelementid);
			contentelement.style.display = "none";
		}
	}

}

/****
 *Reset all tabs
 *@method reset
 */
function reset()
{

        uploadDiv.addEventListener("click", onClickListener, false);
        applyDiv.addEventListener("click", onClickListener, false);
	resetDiv.addEventListener("click", onClickListener,false);
}

reset();
