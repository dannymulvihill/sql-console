<?php

require 'RunQueryPDO.php';

$sql = html_entity_decode($_POST['sql'], ENT_QUOTES);

$query = new RunQueryPDO();

$query->query($sql);
$query->output();