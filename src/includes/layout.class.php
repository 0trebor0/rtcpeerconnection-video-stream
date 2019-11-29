<?php
class Layout{
    public static function File( $file ){
        if( file_exists( VIEWS."$file" ) ){
            $fileEx = pathinfo( VIEWS."$file", PATHINFO_EXTENSION );
            switch( $fileEx ){
                case"css":
                    header("Content-Type: text/css");
                    include VIEWS."$file";
                break;
                case"js":
                    header("Content-Type: application/javascript");
                    include VIEWS."$file";
                break;
                default:
                    include VIEWS."$file";
                break;
            }
        } else {
            router::Error();
        }
    }
}