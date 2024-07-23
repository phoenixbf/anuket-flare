/*
    Anuket ATON flare

    author: bruno.fanini_AT_gmail.com

===========================================================*/

    let AK = new ATON.Flare("anuket");

    AK.setup = ()=>{
        AK._ws = undefined;
        AK._bConnected = false;

        AK._params = new URLSearchParams(window.location.search);
        if (AK._params.get("ak.addr")) AK.connect( AK._params.get("ak.addr") );

        AK.log("Initialized");
    };

    AK.connect = (addr)=>{
        AK._ws = new WebSocket(addr);

        AK._ws.addEventListener('open', (event)=>{
            AK.log("Connected!");
            AK._bConnected = true;
        });

        AK._ws.addEventListener('message', (event)=>{
            AK.onMessage(event.data);
        });

        AK._ws.addEventListener('close', (event)=>{ 
            AK.log('Connection has been closed');
            AK._bConnected = false;
        });

        AK._ws.addEventListener('error', (event)=>{ 
            AK.log('Error:' + event);
            AK._bConnected = false;
        });
    };

    AK.onMessage = (msg)=>{
        AK.console(msg);
    };

    AK.sendMessage = (msg)=>{
        if (!AK._bConnected) return;

        AK._ws.send(msg);
    };
/*
    AK.update = ()=>{

    };
*/