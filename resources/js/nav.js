var navButtons = document.getElementsByClassName("navButtonSelected");
for (var i = 0; i < navButtons.length; i++)
    navButtons[i].className = "navButton";

var navRegex = /\/(\w+)/g;
var locations = [];

var nextLoc;
while ( (nextLoc = navRegex.exec(location.href)) !== null) {
    locations.push(nextLoc[1]);
}

if (locations[1]) {
    document.getElementById(locations[1]).className = "navButtonSelected";

    var breadcrumbs = "";
    for (var i = 1; i < locations.length; i++) {
        if (locations[i].toLowerCase() !== "index")
            breadcrumbs += createBreadcrumbString(i);
    }
    
    document.getElementById("breadcrumbs").innerHTML += breadcrumbs;
}

function createBreadcrumbString(index)
{
    var hrefStr = "";
    for (var i = 1; i <= index; i++) {
        hrefStr += "/" + locations[i];
    }
    
    var location = locations[index];
    location = location.replace(/([A-Z])/g, ' $1');
    location = location.charAt(0).toUpperCase() + location.slice(1);
    
    return ' > <a href=' + hrefStr + ' class="breadcrumb">' + location + '</a>';
}