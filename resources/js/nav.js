var navButtons = document.getElementsByClassName("navButtonSelected");
for (var i = 0; i < navButtons.length; i++)
    navButtons[i].className = "navButton";

var navRegex = /\/\/.+?\/(\w+)/;
var navLoc = navRegex.exec(location.href);
if (navLoc)
    navLoc = navLoc[1];
else
    navLoc = "home";

document.getElementById(navLoc).className = "navButtonSelected";