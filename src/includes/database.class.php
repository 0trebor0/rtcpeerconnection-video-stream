<?php
class Database
{
	private $session;
	private static $instance = null;
	private $host = "localhost";
	private $username = "root";
	private $password = "";
	private $db = "DATABASE";
	private function __construct()
	{
		$this->session = new mysqli( $this->host, $this->username, $this->password, $this->db );
	}
	public static function getInstance()
	{
		if( !self::$instance ){
			self::$instance = new Database();
		}
		return self::$instance;
	}
	public function connect()
	{
		return $this->session;
	}
	//private function __clone(){}
}