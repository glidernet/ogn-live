<?php
function ouvrebase()
  {
  // **************** Connexion et ouverture de la base ************************
  global $link;
  //if (!($link = @mysql_connect( )))   // en local
  if (!($link = @mysql_connect("****hostname****", "****username****", "****password****" )))   //
    {
    echo "<BR><BR><CENTER>Connection not possible</CENTER><BR><BR>";
    @mysql_close($link);
    exit();
    }

  if (!(@mysql_select_db ("****databasename****",$link)))
    {
    echo "<BR><BR><CENTER>Database access not possible</CENTER><BR><BR>";
    @mysql_close($link);
    exit();
    }
  // ***************************************************************************

  }
?>
