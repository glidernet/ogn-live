<?php
include 'config.php';

try
{
    $dbh = new PDO($cfg['db_type'].':host='.$cfg['db_host'].';dbname='.$cfg['db_name'], $cfg['db_user'], $cfg['db_pass']);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}
