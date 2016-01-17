<?php include($_SERVER['DOCUMENT_ROOT']."/includes/header.php"); ?>

<script type="text/javascript" src="http://webplayer.unity3d.com/download_webplayer-3.x/3.0/uo/UnityObject.js"></script>
	<script type="text/javascript">
	<!--
	function GetUnity() {
		if (typeof unityObject != "undefined") {
			return unityObject.getObjectById("unityPlayer");
		}
		return null;
	}
	if (typeof unityObject != "undefined") {
		unityObject.embedUnity("unityPlayer", "downloads/nightLight.unity3d", 600, 375);
	}
	-->
</script>

<style type="text/css">
	<!--
	div.missing {
		margin: auto;
		position: relative;
		top: 50%;
		width: 193px;
	}
	div.missing a {
		height: 63px;
		position: relative;
		top: -31px;
	}
	div.missing img {
		border-width: 0px;
	}
	div#unityPlayer {
		cursor: default;
		height: 375px;
		width: 600px;
	}
	-->
</style>

<h1 class="centered">Night Light</h1>

<div class="banner">
    <div id="unityPlayer">
		<div class="missing">
			<a href="http://unity3d.com/webplayer/" title="Unity Web Player. Install now!">
				<img alt="Unity Web Player. Install now!" src="http://webplayer.unity3d.com/installation/getunity.png" width="193" height="63" />
			</a>
		</div>
	</div>
</div>

<h2>About</h2>

<p><img class="imgRight" style="width:45%;" src="/resources/images/projects/nightlight/screenshot.png" />Night Light was created in Unity 3D by Wes Anderson, Esther Estroff, and myself for our last project in our Construction of a Moving Image class. Although this is considered a "scene," it has definite game elements and has been developed in a game engine. The class' theme was inspiration, and our group hoped to convey the idea that one can make their own inspiration through choice.</p>
<p>This game tells the story of a boy who has a fear of the dark. The story opens with the light turning out and the boy turning on his flashlight. The player must look around the room at various items that are either comforting or scary. If the player spends more time on scary items than good ones they will "lose," or be so scared that they sit through the night and must try again. If the player comforts themselves, however, they will win and see the sun rise having "inspired" themselves to make it through the night.</p>
<p>One of our important design decisions came in the form of excluding any sort of HUD. Since this has game elements of winning and losing, we had to convey states to the player. We decided to accomplish this by using natural indicators as the game was meant to be a theatrical scene. Information about two states must be shown: the scale of confidence or fear the player has, and the amount of time remaining. The first, confidence, is indicated through a vignetting effect. The edges close in and become darker as the player becomes more afraid, or open and become brighter if they are confident. Time is indicated by the flashlight. When there is little time left, the flashlight will begin blinking (as if its battery is dying) and will get progressively darker. Our team feels that these choices helped keep the game authentic and engaging.</p>
		
<br />

<h2>Contributions</h2>
<div id="contribTable">
    <div class="projectRow">
        <div class="projectCell">
            <img class="projectTableImage" src="/resources/images/projects/programming_unity.png" />
        </div>
        <div class="projectCell">
            <img class="projectTableImage" src="/resources/images/projects/nightlight/design.png" />
        </div>
    </div>
    <div class="projectRow">
        <div class="projectCell">
            <h3 class="centered">Programming</h3>
            <p>The official role I took in the group was programmer. All programming in the game was done by me - from the collision of the flashlight, to the progression of the story, the animation of the curtains, and the insertion of the animations.</p>
        </div>
        <div class="projectCell">
            <h3 class="centered">Design</h3>
            <p>Along with the other 2 members in my group, we all contributed to the design of the scene: from the idea to the final tweaks. Design decisions included subject matter, room layout, items within the room, display of information, etc.</p>
        </div>
    </div>
    <div class="projectRow">
        <div class="projectCell">
            <img class="projectTableImage" src="/resources/images/projects/nightlight/modeling.png" />
        </div>
        <div class="projectCell"></div>
    </div>
    <div class="projectRow">
        <div class="projectCell">
            <h3 class="centered">Modeling</h3>
            <p>All group members contributed to the game's models. My contributions include the modeling and texturing of: the bed, the fan, and the flashlight.</p>
        </div>
        <div class="projectCell"></div>
    </div>
</div>

<h3 class="back"><a href="/projects/">Back</a></h3>

<?php include($_SERVER['DOCUMENT_ROOT']."/includes/footer.php"); ?>