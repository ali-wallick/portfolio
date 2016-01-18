<?php include($_SERVER['DOCUMENT_ROOT']."/includes/header.php"); ?>

<h1 class="centered">Contact Me!</h1>

<div id="contactSocialMedia" style="margin:auto; width:auto;">
    <div class="row">
        <div class="contactCell"><a href="https://www.linkedin.com/in/aliwallick" target="_blank"><img src="/resources/images/socialmedia/linkedin-dreamstale45.png" class="socialMediaImg" /></a></div>
        <div class="contactCell"><a href="https://twitter.com/aliwallick" target="_blank"><img src="/resources/images/socialmedia/twitter2-dreamstale72.png" class="socialMediaImg" /></a></div>
        <div class="contactCell"><a href="https://www.facebook.com/awallick" target="_blank"><img src="/resources/images/socialmedia/facebook-dreamstale25.png" class="socialMediaImg" /></a></div>
        <div class="contactCell"><a href="http://steamcommunity.com/id/beantoes" target="_blank"><img src="/resources/images/socialmedia/steam-dreamstale65.png" class="socialMediaImg" /></a></div>
    </div>
</div>

<form action="#" id="form" method="post" name="form">
    <div class="contactRow">
        <input name="vname" placeholder="Your Name *" type="text" value="">
    </div>
    
    <div class="contactRow">
        <input name="vemail" placeholder="Your Email *" type="text" value="">
    </div>
        
    <div class="contactRow">
        <textarea name="msg" placeholder="Message *"></textarea>
    </div>
    
    <h5 class="contactRow"><?php include "includes/mail.php"?></h5>
        
    <div class="contactButton">
        <div class="contactButtonWrapper"><input id="send" name="submit" type="submit" value="Send Email"></div>
    </div>
</form>

<br />

<?php include($_SERVER['DOCUMENT_ROOT']."/includes/footer.php"); ?>