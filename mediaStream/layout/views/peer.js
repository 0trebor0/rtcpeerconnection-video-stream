class PeerToPeer{
    constructor(){
        this.peers = {};
    }
    newPeer( name ){
        console.log( "creating peer for "+name );
        this.peers[ name ] = new RTCPeerConnection( { "iceServers": [{ "url": "stun:stun2.1.google.com:19302" },{"url": "turn:numb.viagenie.ca", "credential": "muazkh", "username": "webrtc@live.com" }] } );
    }
    isSet( name ){
        if( this.peers[ name ] ){
            return true;
        } else {
            return false;
        }
    }
    connectedPeers(){
        return this.peers.length;
    }
    createOffer( name, callback = null ){
        console.log( "creating offer for "+name );
        this.peers[ name ].createOffer( { offerToReceiveAudio: 1, offerToReceiveVideo: 1 } ).then( ( offer )=>{
            console.log( "create offer success" );
            this.peers[ name ].setLocalDescription( offer );
            if( callback !== null ){
                callback( offer );
            }
        } ).catch( ( err )=>{
            console.log( err );
        } );
    }
    onIceCandidate( name, callback = null ){
        console.log( "onIceCandidate for "+name );
        this.peers[ name ].onicecandidate = ( event )=>{
            if( event.candidate ){
                if( callback !== null ){
                    callback( event.candidate );
                }
            }
        }
    }
    setOffer( name, offer ){
        console.log( "set offer for "+name );
        this.peers[ name ].setRemoteDescription( new RTCSessionDescription( offer ) ).catch( ( err )=>{
            console.log( err );
        } );
    }
    setIceCandidate( name, candidate ){
        console.log( "setIceaCandidate for "+name );
        this.peers[ name ].addIceCandidate( new RTCIceCandidate( candidate ) ).catch( ( err )=>{
            console.log( err );
        } );
    }
    createAnswer( name, callback = null ){
        console.log( "creating answer for "+name );
        this.peers[ name ].createAnswer().then( ( answer )=>{
            console.log( "create answer success");
            this.peers[ name ].setLocalDescription( answer ).catch( ( err )=>{
                console.log( err );
            } );
            if( callback !== null ){
                callback( answer );
            }
        }).catch( ( err )=>{
            console.log( err );
        } );
    }
    setAnswer( name, answer ){
        console.log( "set answer for "+name );
        this.peers[ name ].setRemoteDescription( new RTCSessionDescription( answer ) ).catch( ( err )=>{
            console.log( err );
        } );
    }
    getStream( name, stream ){
        console.log( "got media stream for "+name );
        stream.getTracks().forEach( ( track )=>{
            console.log( "Track "+track );
            this.peers[ name ].addTrack(track, stream );
        } );
    }
    onStream( name, callback = null ){
        this.peers[ name ].ontrack = ( event )=>{
            if( callback !== null ){
                callback( event.streams[0] );
            }
        }
    }
}