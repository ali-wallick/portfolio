var navButtons = document.getElementsByClassName("navButtonSelected");
for (var i = 0; i < navButtons.length; i++)
    navButtons[i].className = "navButton";

var navRegex = /\/\/.+?\/(\w+)/;
var navLoc = navRegex.exec(location.href);
if (navLoc)
    document.getElementById(navLoc[1]).className = "navButtonSelected";