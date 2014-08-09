<?php
$action = $_GET["action"];
$platformid = $_GET["platformid"];
$languageid = $_GET["languageid"];
$url = $_GET["url"];

header('content-type: application/json');
if (filter_var($url, FILTER_VALIDATE_URL))
	echo file_get_contents($url);
else
	echo file_get_contents("http://tech.lds.org/glweb?format=json&action=$action&platformid=$platformid&languageid=$languageid");
?>
