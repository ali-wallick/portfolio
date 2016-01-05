<?php include($_SERVER['DOCUMENT_ROOT']."/includes/header.php"); ?>

<?php
	if(isset($_GET['offset']))
		$offS = $_GET["offset"];
	else
		$offS = 0;
	
	define('WP_USE_THEMES', false);

	require('./wp-blog-header.php');
?>

<p style="text-align:right; text-size:x-small;"><a href="wp-login.php">Login</a></p>

<h1 class="centered">Blog</h1>

<?php
$posts = get_posts('numberposts=5&order=DESC&offset='.$offS.'');
foreach ($posts as $post) : start_wp(); ?>
<hr />
<h4><?php the_date(); echo "<br />"; ?></h4>
<h2><?php the_title(); ?>  </h2>  
<?php the_content(); ?> 
<br />
<?php
endforeach;
?>

<table width="100%">
<tr>
<?php 
	if($offS > 0) 
		echo '<td width="33%" align="left"><a href="index.php?offset='.($offS-5).'">Newer</a></td>';
	else
		echo '<td width="33%">';
	
?>
<td width="33%" align="center"><a href="index.php?offset=0">Most Recent</a></td>
<?php
	$nextPosts = get_posts('numberposts=5&order=DESC&offset='.($offS+5).'');
	if(count($nextPosts) >0)
		echo '<td width="33%" align="right"><a href="index.php?offset='.($offS+5).'">Older</a></td>';
	else
		echo '<td width="33%">';
?>
</tr>
</table>

<?php include($_SERVER['DOCUMENT_ROOT']."/includes/footer.php"); ?>