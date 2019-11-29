const ws = require( 'ws' );
const cookieParser = require('cookie');
const mysql = require('mysql');
const url = require('url');
class App{
    constructor(){
        this.websocket = null;
        this.port = 3245;
        this.rooms = {};
        this.history = {};
    }
    iniate(){
        try{
            console.log( "WebSocket Starting on port:"+this.port );
            this.websocket = new ws.Server({ port: this.port });
            this.db = mysql.createConnection( {
                "host":"localhost",
                "user":"root",
                "password":"",
                "database":"DATABASE"
            } );
            this.websocket.on( "connection", ( connection, req )=>{
                this.connection = connection;
                this.req = req;
                this.ip = req.connection.remoteAddress;
                this.url = url.parse( req.url, true );
                this.urlQuery = this.url.query;
                console.log( "new connection "+this.ip+" - "+req.url );
                if( this.url.pathname == '/stream/' ){
                    if( this.urlQuery.hash !== '' ){
                        if( this.urlQuery.token ){
                            //HOST
                            this.db.query( "SELECT room_hash, room_host FROM tbl_room_info WHERE room_hash='"+this.urlQuery.hash+"' AND room_host='"+this.urlQuery.token+"'", ( err, result, fields )=>{
                                if( result[0] ){
                                    let token = result[0].room_host;
                                    let hash = result[0].room_hash;
                                    this.rooms[ hash ] = {};
                                    this.rooms[ hash ].token = token;
                                    this.rooms[ hash ].admin = this.connection;
                                    this.rooms[ hash ].connections = {};
                                    this.rooms[ hash ].admin.on( 'message', ( message )=>{
                                        console.log( "[ADMIN]["+this.ip+"] "+message );
                                        if( this.isJson( message ) == true ){
                                            let array = JSON.parse( message );
                                            if( "type" in array ){
                                                switch( array.type ){
                                                    case"candidate":
                                                        if( array.candidate !=='' || array.user !=='' ){
                                                            if( this.rooms[ hash ].connections[ array.user ] !=='' ){
                                                                let to = this.rooms[ hash ].connections[ array.user ];
                                                                delete array.user;
                                                                to.send( JSON.stringify( array ) );
                                                            }
                                                        }
                                                    break;
                                                    case"offer":
                                                        if( array.offer !=='' || array.user !=='' ){
                                                            if( this.rooms[ hash ].connections[ array.user ] !=='' ){
                                                                let to = this.rooms[ hash ].connections[ array.user ];
                                                                delete array.user;
                                                                to.send( JSON.stringify( array ) );
                                                            }
                                                        }
                                                    break;
                                                }
                                            } else {
                                                this.connection.terminate();
                                            }
                                        } else {
                                            this.connection.terminate();
                                        }
                                    } );
                                } else {
                                    this.connection.terminate();
                                }
                            } );
                        } else {
                            //CLIENT
                            this.db.query( "SELECT room_hash, room_host FROM tbl_room_info WHERE room_hash='"+this.urlQuery.hash+"'", ( err, result, fields )=>{
                                if( result[0] ){
                                    let hash = result[0].room_hash;
                                    if( this.rooms[ hash ] ){
                                        let userId = Math.floor( (Math.random() * 1000)+1 );
                                        if( this.rooms[ hash ].connections[ userId ] !== '' ){
                                            userId = Math.floor( (Math.random() * 1000)+1 );
                                        }
                                        this.rooms[ hash ].connections[ userId ] = connection;
                                        this.rooms[ hash ].connections[ userId ].on( "message", ( message )=>{
                                            console.log( "[CLIENT]["+this.ip+"] "+message );
                                            if( this.isJson( message ) == true ){
                                                let array = JSON.parse( message );
                                                if( "type" in array ){
                                                    switch( array.type ){
                                                        case"join":
                                                            if( this.rooms[ hash ].admin !=='' ){
                                                                this.rooms[ hash ].admin.send( JSON.stringify( {"type":"join","userId":userId} ) );
                                                            }
                                                        break;
                                                        case"candidate":
                                                            if( array.candidate !=='' ){
                                                                if( this.rooms[ hash ].admin !=='' ){
                                                                    let to = this.rooms[ hash ].admin;
                                                                    array.user = userId;
                                                                    to.send( JSON.stringify( array ) );
                                                                }
                                                            }
                                                        break;
                                                        case"answer":
                                                            if( array.answer !== '' ){
                                                                if( this.rooms[ hash ].admin !=='' ){
                                                                    let to = this.rooms[ hash ].admin;
                                                                    array.user = userId;
                                                                    to.send( JSON.stringify( array ) );
                                                                }
                                                            }
                                                        break;
                                                    }
                                                } else {
                                                    this.connection.terminate();
                                                }
                                            } else {
                                                this.connection.terminate();
                                            }
                                        } );
                                    } else {
                                        this.connection.terminate();
                                    }
                                } else {
                                    this.connection.terminate();
                                }
                            } );
                        }
                    } else {
                        this.connection.terminate();
                    }
                }
            } );
        }catch( error ){
            console.log( error );
        }
    }
    isJson( data ){
        try{
            JSON.parse( data );
        } catch( e ){
            return false;
        }
        return true;
    }
}
App = new App();
App.iniate();