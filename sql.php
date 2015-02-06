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

//legacy mysql_connect for non-released code:

$link;
if (!($link = @mysql_connect($cfg['db_host'], $cfg['db_user'], $cfg['db_pass'] )))   //
{
    echo "<BR><BR><CENTER>Connection not possible</CENTER><BR><BR>";
    @mysql_close($link);
    exit();
}

if (!(@mysql_select_db ($cfg['db_name'],$link)))
{
    echo "<BR><BR><CENTER>Database access not possible</CENTER><BR><BR>";
    @mysql_close($link);
    exit();
}
// ***************************************************************************
