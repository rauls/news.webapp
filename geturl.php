<?php
//get the q parameter from URL
$url=$_GET["url"];

/*
ini_set("user_agent","Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.0)");
ini_set("max_execution_time", 0);
ini_set("memory_limit", "10000M");
$rss = simplexml_load_file($feed_url);
*/

$content = file_get_contents( $url );
print $content;

?>

