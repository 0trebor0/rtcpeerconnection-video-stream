<?php
class Session
{
    public static function create( $name, $value = null )
    {
        $name = filter_var( $name, FILTER_SANITIZE_STRING );
        $value = filter_var( $value, FILTER_SANITIZE_STRING );
        //$_SESSION[ $name ] = $value;
        setcookie( $name, $value, time()+(86400 * 30), "/","",false,true );
    }
    public static function check( $name )
    {
        $name = filter_var( $name, FILTER_SANITIZE_STRING );
        if( isset( $_COOKIE[ $name ] ) && !empty( $_COOKIE[ $name ] ) ){
            return true;
        } else {
            return false;
        }
    }
    public static function get( $name )
    {
        $name = filter_var( $name, FILTER_SANITIZE_STRING );
        return $_COOKIE[ $name ];
    }
    public static function delete( $name )
    {
        // session_destroy();
        // session_unset();
        setcookie( $name, "", time() - 3600 );
        header( "Location: /" );
    }
}