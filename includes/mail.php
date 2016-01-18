
<?php
if(isset($_POST["submit"]))
{
    // Checking For Blank Fields..
    if($_POST["vname"]==""||$_POST["vemail"]==""||$_POST["msg"]=="")
    {
        echo "Please fill out all fields.";
    }
    
    else
    {
        // Check if the "Sender's Email" input field is filled out
        $email_from=$_POST['vemail'];
        // Sanitize E-mail Address
        $email_from =filter_var($email_from, FILTER_SANITIZE_EMAIL);
        // Validate E-mail Address
        $email_from= filter_var($email_from, FILTER_VALIDATE_EMAIL);
        if (!$email_from)
        {
            echo "Invalid Sender's Email";
        }
        else
        {
            $email_to = "ali@aliwallick.com";
            $subject = "Ali Wallick Contact Email";
            
            $message = $_POST['msg'];
            $message = wordwrap($message, 70);
            
            $headers = "From: " . $email_to . "\r\n";
            $headers .= 'Reply-To: ' . $email_from . "\r\n";
            
            mail($email_to, $subject, $message, $headers);
            echo "Your email has been sent successfully! I'll contact you soon.";
        }
    }
}
?>