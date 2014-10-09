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

minimizationDiv.addEventListener("click", function(event)
{
	self.postMessage("minimization");
}, false);

minimizationDiv.addEventListener("mouseover", function(event)
{
	minimizationDiv.style.border = "thin solid black";
}, false);

minimizationDiv.addEventListener("mouseout", function(event)
{
	minimizationDiv.style.border = "";
}, false);

var transparencyDiv = document.getElementById("transparency");
transparencyDiv.addEventListener("click", function(event)
{
        self.postMessage("transparency");
}, false);

transparencyDiv.addEventListener("mouseover", function(event)
{
        transparencyDiv.style.border = "thin solid black";
}, false);

transparencyDiv.addEventListener("mouseout", function(event)
{
        transparencyDiv.style.border = "";
}, false);

var accessDiv = document.getElementById("access");
accessDiv.addEventListener("click", function(event)
{
        self.postMessage("access");
}, false);

accessDiv.addEventListener("mouseover", function(event)
{
       accessDiv.style.border = "thin solid black";
}, false);

accessDiv.addEventListener("mouseout", function(event)
{
        accessDiv.style.border = "";
}, false);

var accountabilityDiv = document.getElementById("accountability");
accountabilityDiv.addEventListener("click", function(event)
{
        self.postMessage("accountability");
}, false);

accountabilityDiv.addEventListener("mouseover", function(event)
{
        accountabilityDiv.style.border = "thin solid black";
}, false);

accountabilityDiv.addEventListener("mouseout", function(event)
{
        accountabilityDiv.style.border = "";
}, false);

var dataqualityDiv = document.getElementById("dataquality");
dataqualityDiv.addEventListener("click", function(event)
{
        self.postMessage("dataquality");
}, false);

dataqualityDiv.addEventListener("mouseover", function(event)
{
        dataqualityDiv.style.border = "thin solid black";
}, false);

dataqualityDiv.addEventListener("mouseout", function(event)
{
        dataqualityDiv.style.border = "";
}, false);

