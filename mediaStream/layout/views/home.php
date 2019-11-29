<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Stream</title>
        <link rel="stylesheet" href="./bulma">
    </head>
    <body>
        <section class="hero is-fullheight is-light" id="new" style="display: none;">
            <div class="hero-body has-text-centered">
                <div class="container">
                    <h1 class="title">New Room</h1>
                    <div class="field">
                        <label class="label">Stream Name</label>
                        <div class="control">
                            <input type="text" class="input" id="streamName" value="Default" placeholder="Type Stream Name" autocomplete="off"/>
                        </div>
                    </div>
                    <div class="field">
                        <div class="file is-centered is-boxed has-name is-info is-medium">
                            <label class="file-label">
                                <input class="file-input" type="file" id="streamFile" accept="video/*">
                                <span class="file-cta">
                                    <span class="file-label">
                                        Select a File
                                    </span>
                                </span>
                                <span class="file-name" id="file-nameInfo" style="display: none;"></span>
                            </label>
                        </div>
                        <input type="submit" class="button is-success" id="newStreamButton"/>
                    </div>
                </div>
            </div>
        </section>
        <section class="hero is-fullheight is-light" id="join" style="display: none;">
            <div class="hero-body has-text-centered">
                <div class="container">
                    <h1 class="title" id="streamTitle">Join Room</h1>
                    <div class="field" id="join_Form_field">
                        <label class="label">Stream Hash</label>
                        <div class="control">
                            <input type="text" class="input" id="streamHash" placeholder="Type Stream Hash" autocomplete="off"/>
                        </div>
                        <input type="submit" value="Join Stream" class="button is-success" id="joinStreamButton"/>
                    </div>
                    <video id="videoplayer" width="500" style="display: none;" controls></video>
                    <div id="connected_users" style="display: none;"></div>
                </div>
            </div>
        </section>
        <script src="./js/peer"></script>
        <script src="./js"></script>
        <script>
            window.onload = ()=>{
                app = new MediaStream();
                app.init();
                peer = new PeerToPeer();
            }
            window.onerror = ( event )=>{
                console.log( event );
            }
        </script>
    </body>
</html>