<?php
foreach( scandir( __DIR__."/includes/" ) as $file ){
    if( !in_array( $file, array( ".",".." ) ) ){
        include __DIR__."/includes/$file";
    }
}
$router = new Router();
include __DIR__."/layout/config.php";
$router->dispatch();