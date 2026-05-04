<?php
echo password_hash("BCI@123", PASSWORD_DEFAULT) . "<br>"; //admin
echo password_hash("BCI@456", PASSWORD_DEFAULT)."<br>" ; //meet_manager
echo password_hash("BCI@789", PASSWORD_DEFAULT) ."<br>" ; //dataentry op
?>