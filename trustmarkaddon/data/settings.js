function changeSettings()
{
/*        var panelfooter = document.getElementById("panel-footer");
	var selecttag = document.createElement('select');
	var optionstag = document.createElement('option');
	optionstag.value="value";
	optionstag.text="try";
	selecttag.appendChild(optionstag);
        var input=document.createElement('input');
        input.type="file";
        panelfooter.appendChild(input);
	panelfooter.appendChild(selecttag);*/

	var filesettings = document.getElementById("filesettings");
	filesettings.style.display = 'inline-block';
	var nickname = document.getElementById("policyfile");
	nickname.style.display='inline-block';
}

function showToolTip()
{
	var tooltip = document.getElementById("tooltip");
	tooltip.innerHTML = "Hovering"	
}

function hideToolTip()
{
	var tooltip = document.getElementById("tooltip");
	tooltip.innerHTML = "";
}

function onPolicySubmit()
{
	
}
