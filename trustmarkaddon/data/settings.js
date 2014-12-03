/***
 *Show Tool TIP for settings
 *@module settingstooltip
 */

/**
 *Displays the settings icon tooltip in the panel
 *@class settingstooltip
 */

/***
 *Show Settings Tool tip
 *@method showToolTip
 */
function showToolTip()
{
	var tooltip = document.getElementById("tooltip");
	tooltip.innerHTML = "    Click to edit privacy settings."	
}

/**
 *Hide Settings Tool tip
 *@method hideToolTip
 */
function hideToolTip()
{
	var tooltip = document.getElementById("tooltip");
	tooltip.innerHTML = "";
}

