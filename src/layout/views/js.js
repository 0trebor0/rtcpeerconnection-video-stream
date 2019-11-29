class MediaStream{
    constructor(){
        this.elements = {};
        this.data = {};
        this.data['websocketUrl'] = "ws://localhost:3245";
        this.onLoad();
    }
    init(){
        switch( this.data['urlHash'] ){
            case "new":
                this.viewNew();
            break;
            case "join":
                this.viewJoin();
            break;
            default:
                this.viewNew();
            break;
        }
    }
    onLoad(){
        if( document.location.hash.slice(1) == '' ){
            this.data['urlHash'] = null;
        } else {
            this.data['urlHash'] = document.location.hash.slice(1);
        }
        this.data['urlQuery'] = new URLSearchParams( document.location.search );
        if ("WebSocket" in window){
        } else {
            document.body.innerHTML = "<h1>Web browser dont support websocket</h1>";
        }
        console.log( this.elements );
        console.log( this.data );
    }
    viewJoin( data = null ){
        this.elements['join'] = {};
        this.elements['join'].View = document.querySelector("#join");
        this.elements['join'].View.style.display = "";
        this.elements['join'].inputs = {};
        this.elements['join'].buttons = {};
        this.elements['join'].videoplayer = document.querySelector("#videoplayer");
        this.elements['join'].form = document.querySelector("#join_Form_field");
        this.elements['join'].roomTitle = document.querySelector("#streamTitle");
        this.elements['join'].connected_users = document.querySelector("#connected_users");
        this.elements['join'].temp = {};
        this.elements['join'].buttons['join'] = document.querySelector('#joinStreamButton');
        this.elements['join'].inputs['hash'] = document.querySelector('#streamHash');
        if( data == null ){
            //User Join
            this.elements['join'].buttons['join'].onclick = ()=>{
                if( this.elements['join'].inputs['hash'].value == '' ){
                    this.elements['join'].inputs['hash'].style.backgroundColor = "red";
                } else {
                    var formData = new FormData();
                    formData.append( "hash", this.elements['join'].inputs['hash'].value );
                    fetch( "/room/view", {
                        method:"POST",
                        body: formData
                    } ).then( ( response )=>{
                        return response.json();
                        //return response.text();
                    } ).then( ( data )=>{
                        console.log( data );
                        if( "type" in data ){
                            if( data.type == 'ok' ){
                                this.elements['join'].roomTitle.innerHTML = "Room: "+data.name+"<p class='subtitle'>invite: "+this.elements['join'].inputs['hash'].value+"</br>File Name: "+data.file_name+"</br>File Size: "+data.file_size+"</br>Mime Type: "+data.file_type+"</p>";
                                this.elements['join'].temp['websocket'] = new WebSocket( this.data['websocketUrl']+"/stream/?hash="+this.elements['join'].inputs['hash'].value );
                                this.elements['join'].form.innerHTML = "";
                                this.elements['join'].videoplayer.style.display = "";
                                this.elements['join'].videoplayer.autoplay = true;
                                this.elements['join'].temp['websocket'].onclose = ( e )=>{
                                    window.location.href = "/#join";
                                }
                                let t = ()=>{
                                    setTimeout( ()=>{
                                        if( this.elements['join'].temp['websocket'].readyState == 1 ){
                                            //Open
                                            this.elements['join'].temp['websocket'].send( JSON.stringify({"type":"join"}) );
                                        } else if( this.elements['join'].temp['websocket'].readyState == 0 ){
                                            //Connecting
                                            this.elements['join'].roomTitle.innerHTML = "Waiting for Websocket";
                                            t();
                                        } else if( this.elements['join'].temp['websocket'].readyState == 3 ){
                                            //Closed
                                            this.elements['join'].roomTitle.innerHTML = "Waiting for Websocket";
                                            this.elements['join'].temp['websocket'] = new WebSocket( this.data['websocketUrl']+"/stream/?hash="+this.elements['join'].inputs['hash'].value );
                                            t();
                                        }
                                    }, 5000 );
                                }
                                t();
                                this.elements['join'].temp['websocket'].onmessage = ( event )=>{
                                    console.log( event.data );
                                    if( this.isJson( event.data ) == true ){
                                        let array = JSON.parse( event.data );
                                        switch( array.type ){
                                            case"offer":
                                                if( array.offer !=='' ){
                                                    peer.newPeer( null );
                                                    peer.onStream( null, ( stream )=>{
                                                        this.elements['join'].videoplayer.srcObject = stream;
                                                    } );
                                                    peer.onIceCandidate( null, ( candidate )=>{
                                                        this.elements['join'].temp['websocket'].send( JSON.stringify({"type":"candidate", "candidate":candidate}) );
                                                    } );
                                                    peer.setOffer( null, array.offer );
                                                    peer.createAnswer( null, ( answer )=>{
                                                        this.elements['join'].temp['websocket'].send( JSON.stringify({"type":"answer", "answer":answer}) );
                                                    } );

                                                }
                                            break;
                                            case"candidate":
                                                if( array.candidate !== '' ){
                                                    peer.setIceCandidate( null, array.candidate );
                                                }
                                            break;
                                        }
                                    }
                                }
                                this.elements['join'].temp['websocket'].onerror = ( e )=>{
                                    console.log( e );
                                }
                            } else {
                                this.elements['join'].connected_users.innerHTML = data.msg;
                                this.elements['join'].connected_users.style.display = "";
                            }
                        }
                    });
                }
            }
        } else {
            this.elements['join'].temp['hash'] = data.hash;
            this.elements['join'].temp['token'] = data.token;
            this.elements['join'].form.innerHTML = "";
            this.elements['join'].videoplayer.style.display = "";
            this.elements['join'].roomTitle.innerHTML = "Waiting for Websocket";
            this.elements['join'].videoplayer.src = URL.createObjectURL( data.file );
            this.elements['join'].temp['websocket'] = new WebSocket( this.data['websocketUrl']+"/stream/?hash="+this.elements['join'].temp['hash']+"&token="+this.elements['join'].temp['token'] );
            this.elements['join'].videoplayer.oncanplay = ()=>{
                this.elements['join'].temp['captureStream'] = this.elements['join'].videoplayer.captureStream();
            }
            this.elements['join'].videoplayer.onchange = ()=>{
                console.log( "Player Changed" );
                this.elements['join'].temp['captureStream'] = this.elements['join'].videoplayer.captureStream();
            }
            this.elements['join'].temp['websocket'].onmessage = ( event )=>{
                console.log( event.data );
                if( this.isJson( event.data ) == true ){
                    let array = JSON.parse( event.data );
                    switch( array.type ){
                        case"join":
                            if( array.userId !== '' ){
                                peer.newPeer( array.userId );
                                peer.getStream( array.userId, this.elements['join'].temp['captureStream'] );
                                peer.onIceCandidate( array.userId, ( candidate )=>{
                                    this.elements['join'].temp['websocket'].send( JSON.stringify({"type":"candidate", "candidate":candidate,"user":array.userId}) );
                                } );
                                peer.createOffer( array.userId, ( offer )=>{
                                    this.elements['join'].temp['websocket'].send( JSON.stringify({"type":"offer", "offer":offer, "user":array.userId}) );
                                } );
                            }
                        break;
                        case"candidate":
                            if( array.candidate !== '' || array.user !=='' ){
                                peer.setIceCandidate( array.user, array.candidate );
                            }
                        break;
                        case"answer":
                            if( array.answer !=='', array.user !=='' ){
                                peer.setAnswer( array.user, array.answer );
                            }
                        break;
                    }
                }
            }
            this.elements['join'].temp['websocket'].onclose = ( e )=>{
                window.location.href = "/#new";
            }
            let t = ()=>{
                setTimeout( ()=>{
                    if( this.elements['join'].temp['websocket'].readyState == 1 ){
                        //Open
                        this.elements['join'].roomTitle.innerHTML = "Room: "+data.name+"<p class='subtitle'>invite: "+data.hash+"</br>File Name: "+data.file.name+"</br>File Size: "+data.file.size+"</br>Mime Type: "+data.file.type+"</p>";
                        this.elements['join'].temp['websocket'].send( JSON.stringify({"type":"ready"}) );
                    } else if( this.elements['join'].temp['websocket'].readyState == 0 ){
                        //Connecting
                        this.elements['join'].roomTitle.innerHTML = "Waiting for Websocket";
                        t();
                    } else if( this.elements['join'].temp['websocket'].readyState == 3 ){
                        //Closed
                        this.elements['join'].roomTitle.innerHTML = "Waiting for Websocket";
                        this.elements['join'].temp['websocket'] = new WebSocket( this.data['websocketUrl']+"/stream/?hash="+this.elements['join'].temp['hash']+"&token="+this.elements['join'].temp['token'] );
                        t();
                    }
                }, 5000 );
            }
            t();
            this.elements['join'].temp['websocket'].onerror = ( e )=>{
                console.log( e );
            }
        }
    }
    viewNew(){
        this.elements['new'] = {};
        this.elements['new'].View = document.querySelector("#new");
        this.elements['new'].View.style.display = "";
        this.elements['new'].inputs = {};
        this.elements['new'].buttons = {};
        this.elements['new'].temp = {};
        this.elements['new'].msg = document.querySelector("#file-nameInfo");
        this.elements['new'].inputs['streamName'] = document.querySelector("#streamName");
        this.elements['new'].inputs['streamFile'] = document.querySelector("#streamFile");
        this.elements['new'].buttons['newStreamButton'] = document.querySelector("#newStreamButton");
        this.elements['new'].inputs['streamFile'].onchange = ()=>{
            if( this.elements['new'].inputs['streamFile'].value !== '' ){
                this.elements['new'].temp['fileInfo'] = this.elements['new'].inputs['streamFile'].files[0];
                this.elements['new'].msg.innerHTML = this.elements['new'].temp['fileInfo'].name;
                this.elements['new'].msg.style.display = "";
            }
        }
        this.elements['new'].buttons['newStreamButton'].onclick = ()=>{
            if( this.elements['new'].inputs['streamName'].value == '' ){
                this.elements['new'].inputs['streamName'].style.backgroundColor = "red";
                this.elements['new'].msg.innerHTML = "Room name Cannot be Empty";
                this.elements['new'].msg.style.display = "";
            }
            if( this.elements['new'].inputs['streamFile'].value == '' ){
                this.elements['new'].msg.innerHTML = "Select a File";
                this.elements['new'].msg.style.display = "";
            }
            if( this.elements['new'].inputs['streamName'].value !== '' ){
                if( this.elements['new'].inputs['streamFile'].value !== '' ){
                    this.elements['new'].msg.style.display = "";
                    var formData = new FormData();
                    formData.append( "name",this.elements['new'].inputs['streamName'].value);
                    formData.append( "file_name",this.elements['new'].temp['fileInfo'].name);
                    formData.append( "file_size",this.elements['new'].temp['fileInfo'].size);
                    formData.append( "file_type",this.elements['new'].temp['fileInfo'].type);
                    formData.append( "file_last_edit",this.elements['new'].temp['fileInfo'].lastModified);
                    fetch( "/room/new", {
                        method:"POST",
                        body: formData
                    } ).then( ( response )=>{
                        return response.json();
                        //return response.text();
                    } ).then( ( data )=>{
                        console.log( data );
                        if( "type" in data ){
                            switch( data.type ){
                                case"ok":
                                    if( data.hash !=='' || data.token !=='' ){
                                        data.file = this.elements['new'].temp['fileInfo'];
                                        data.name = this.elements['new'].inputs['streamName'].value;
                                        this.elements['new'].View.style.display = "none";
                                        this.viewJoin( data );
                                    }
                                break;
                                case"error":
                                    this.elements['new'].msg.innerHTML = data.msg;
                                    this.elements['new'].msg.style.display = "";
                                break;
                            }
                        }
                    });
                }
            }
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