<?php
class Stream
{
    public static function newStream()
    {
        try{
            $stream_name = filter_var( $_POST['name'], FILTER_SANITIZE_STRING );
            $file_name = filter_var( $_POST['file_name'], FILTER_SANITIZE_STRING );
            $file_size = filter_var( $_POST['file_size'], FILTER_SANITIZE_STRING );
            $file_type = filter_var( $_POST['file_type'], FILTER_SANITIZE_STRING );
            $file_last_edit = filter_var( $_POST['file_last_edit'], FILTER_SANITIZE_STRING );
            $hash = md5( rand( 10000, 90000 ) );
            $host = md5( rand( 10000, 90000 ) );
            $query = Database::getInstance()->connect()->prepare( "INSERT INTO tbl_room_info( room_hash, room_name, room_host )VALUES(?,?,?)" );
            $query->bind_param( "sss",$hash,$stream_name, $host );
            $query->execute();
            if( $query ){
                //Session::create( "room", $hash );
                $query1 = Database::getInstance()->connect()->prepare( "INSERT INTO tbl_file_info( name, size, type,last_modified_date, room_hash )VALUES(?,?,?,?,?)" );
                $query1->bind_param( "sssss", $file_name, $file_size, $file_type,$file_last_edit, $hash );
                $query1->execute();
                if( $query1 ){
                    echo json_encode( ["type"=>"ok", "hash"=>$hash, "token"=>$host] );
                } else {
                    $this->deleteStream( $host );
                    echo json_encode( ["type"=>"error" , "msg"=>"Server Error"] );
                }
            } else {
                echo json_encode( ["type"=>"error" , "msg"=>"Server Error"] );
            }
        }catch( Error $e ){
            errorToFile( $e );
            echo json_encode( ["type"=>"error" , "msg"=>"Server Error"] );
        }
    }
    public static function checkStreamDb( $room )
    {
        try{
            $query = Database::getInstance()->connect()->prepare( "SELECT room_hash FROM tbl_room_info WHERE room_hash=?" );
            $query->bind_param( "s", $room );
            $query->execute();
            $result = $query->get_result();
            if( $result->num_rows > 0 ){
                return true;
            } else {
                return false;
            }
        } catch( Error $e ){
            errorToFile( $e );
            echo json_encode( ["type"=>"error" , "msg"=>"Server Error"] );
        }
    }
    public static function getStreamInfo( $room )
    {
        try{
            $query = Database::getInstance()->connect()->prepare( "SELECT tbl_room_info.room_hash, tbl_room_info.room_name, tbl_file_info.name, tbl_file_info.size, tbl_file_info.type, tbl_file_info.name FROM tbl_room_info, tbl_file_info WHERE tbl_room_info.room_hash=? AND tbl_file_info.room_hash=?" );
            $query->bind_param( "ss", $room, $room );
            $query->execute();
            $result = $query->get_result();
            if( $result->num_rows > 0 ){
                $row = $result->fetch_assoc();
                echo json_encode( ["type"=>"ok","name"=>$row['room_name'],"file_name"=>$row['name'],"file_size"=>$row['size'],"file_type"=>$row['type']] );
            } else {
                echo json_encode( ["type"=>"error" , "msg"=>"Room not found"] );
            }
        }catch( Error $e ){
            errorToFile( $e );
            echo json_encode( ["type"=>"error" , "msg"=>"Server Error"] );
        }
    }
    public static function deleteStream( $room ){
        $query = Database::getInstance()->connect()->prepare( "DELETE FROM tbl_room_info WHERE room_host=?" );
        $query->bind_param( "s", $room );
        $query->execute();
    }
}