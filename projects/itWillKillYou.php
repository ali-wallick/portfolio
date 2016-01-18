<?php include($_SERVER['DOCUMENT_ROOT']."/includes/header.php"); ?>

<h1 class="centered">It Will Kill You</h1>

<iframe class="banner" width="600" height="371" src="https://www.youtube.com/v/Erk81CCfc5A?fs=1&hl=en_US&hd=1" frameborder="0" allowfullscreen></iframe>

<h2>About</h2>

<p>It Will Kill you is a game created in the Unity Game engine by Team Tearing Balls for Georgia Tech's Video Game Design class. The team is comprised of Sam Brown, Henry Dooley, Matt Lovett, Robert Spessard, and myself. The game was created essentially in two and a half months so, while not terribly balanced, is available for download below.</p>
<p>This head-to-head action game requires two players. The first player takes the role of a human who is infected by a virus. He seeks the aid of a scientist to cure him. The scientist, however, resides in an observatory across a lake whose bridge is out. To cross the bridge he must reconstruct jump boots. The second player takes the role of the virus inside the human and must strategically move about the level to disable and eventually kill the human</p>
<p>If you are playing the human you must get each of the pieces of the boot to make the jump. The arrow on the screen will point you to the next piece. You can hold two at once, and once you have two pieces you must take them to the craft shop in the center of the map. Once collected, and arrow will point you to the top of the roof to make the jump by holding and releasing the mouse. In addition to this, you may retaliate against the virus by visiting the hospital and planting antibiotic turrets that attack the virus.</p>
<p>If you are playing the virus you must move about the level and attack the nodes. Each node has an effect on the player - for example, the legs prevent jumping and the eyes blur vision. To win, the virus must place tumors with the "b" which will slowly increase the infection amount displayed on the bottom of the HUD. To attack and place, the virus must have energy. Power-ups scattered throughout the level provide the player with energy (displayed on the top left in blue.)</p>
		
<br />

<h2>Contributions</h2>
<div id="contribTable">
    <div class="projectRow">
        <div class="projectCell">
            <img class="projectTableImage" src="/resources/images/projects/itwillkillyou/design.jpg" />
        </div>
        <div class="projectCell">
            <img class="projectTableImage" src="/resources/images/projects/itwillkillyou/level.jpg" />
        </div>
    </div>
    <div class="projectRow">
        <div class="projectCell">
            <h3 class="centered">Game Design/Prototyping</h3>
            <p>The whole group worked together through the game design and development phase early on to create a fun game before we even looked at coding. Prototyping consisted of making a turn-based version of our game which was subsequently tested on friends.</p>
        </div>
        <div class="projectCell">
            <h3 class="centered">Level Design</h3>
            <p>Early in the design process, we decided the nodes should correspond roughly to the body. It was my task to create a level that would convey this; as well as making it hard for the player to get trapped in small areas (such as arms) by attacking AI.</p>
        </div>
    </div>
    <div class="projectRow">
        <div class="projectCell">
            <img class="projectTableImage" src="/resources/images/projects/itwillkillyou/character.jpeg" />
        </div>
        <div class="projectCell">
            <img class="projectTableImage" src="/resources/images/projects/itwillkillyou/modeling.jpeg" />
        </div>
    </div>
    <div class="projectRow">
        <div class="projectCell">
            <h3 class="centered">Character Design</h3>
            <p>While the group could use a generic free model for the human side, this was not feasible to do for a level about a virus. I created the virus character based on look of a bacteriophage. Creation consisted of modeling, texturing, rigging, and animating each of the character's movements.</p>
        </div>
        <div class="projectCell">
            <h3 class="centered">Modeling</h3>
            <p>For this game, I modeled most of the virus level entities including the body border, platforms, nodes, tumors, projectiles and antibodies. On the human side I also modeled the observatory, UV mapped and textured the shack, and created most of the human pickups icons.</p>
        </div>
    </div>
</div>

<h3 class="back"><a href="/projects/">Back</a></h3>

<?php include($_SERVER['DOCUMENT_ROOT']."/includes/footer.php"); ?>