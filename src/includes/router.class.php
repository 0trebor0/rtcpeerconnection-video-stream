<?php
class Router{
    private $req;
    private $method;
    private $ReqMethods = [];
    public function __construct(){
        $this->req = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
        $this->method = $_SERVER['REQUEST_METHOD'];
    }
    public function add( $method, $path, $callback ){
        $this->ReqMethods[ $method ][ $path ] = $callback;
    }
    public static function Error(){
        header( "HTTP/1.0 404 Not Found" );
    }
    public function dispatch(){
        if( isset( $this->ReqMethods[ $this->method ][ $this->req ] ) ){
            call_user_func( $this->ReqMethods[ $this->method ][ $this->req ] );
        } else {
            header( "HTTP/1.0 404 Not Found" );
        }
    }
}