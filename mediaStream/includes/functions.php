<?php
function errorToFile( $e ){
    file_put_contents( "./error.txt", $e."\r\n\r\n", FILE_APPEND );
}