<?php
define( "VIEWS", __DIR__."/views/" );

Database::getInstance()->connect()->query("CREATE TABLE IF NOT EXISTS tbl_room_info(
    id INT(12) NOT NULL AUTO_INCREMENT,
    room_hash TEXT NOT NULL,
    room_name VARCHAR(255) NOT NULL,
    room_host TEXT NOT NULL,
    PRIMARY KEY(id)
)");
Database::getInstance()->connect()->query("CREATE TABLE IF NOT EXISTS tbl_file_info(
    id INT(12) NOT NULL AUTO_INCREMENT,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    type TEXT NOT NULL,
    last_modified_date TEXT NOT NULL,
    room_hash TEXT NOT NULL,
    PRIMARY KEY(id)
)");

$router->add( "GET","/", function(){
    Layout::File( "home.php" );
} );
$router->add( "GET","/bulma", function(){
    Layout::File( "bulma.css" );
} );
$router->add( "GET","/js", function(){
    Layout::File( "js.js" );
} );
$router->add( "GET","/js/peer", function(){
    Layout::File( "peer.js" );
} );
$router->add( "POST","/room/new", function(){
    $postError = false;
    $inputs = ["name","file_name","file_size","file_type","file_last_edit"];
    foreach( $inputs as $input ){
        if( isset( $_POST[ $input ] ) && !empty( $_POST[ $input ] ) ){

        } else {
            $postError = true;
        }
    }
    if( $postError == true ){
        echo json_encode( ["type"=>"error","msg"=>"Empty Input"] );
    } else {
        //RUN CLASS
        Stream::newStream();
    }
} );
$router->add( "POST","/room/view", function(){
    $postError = false;
    $inputs = ["hash"];
    foreach( $inputs as $input ){
        if( isset( $_POST[ $input ] ) && !empty( $_POST[ $input ] ) ){
        } else {
            $postError = true;
        }
    }
    if( $postError == true ){
        echo json_encode( ["type"=>"error","msg"=>"Empty Input"] );
    } else {
        //RUN CLASS
        if( Stream::checkStreamDb( filter_var( $_POST['hash'], FILTER_SANITIZE_STRING ) ) == true ){
            //echo json_encode( ["type"=>"ok"] );
            Stream::getStreamInfo( filter_var( $_POST['hash'], FILTER_SANITIZE_STRING ) );
        } else {
            echo json_encode( ["type"=>"error","msg"=>"Room Not Found"] );
        }
    }
} );