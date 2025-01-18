/*
    Anuket ATON flare

    author: bruno.fanini_AT_gmail.com

    Params
    - anuket.srv: anuket service address
    - anuket.ses: session ID
    - anuket.logic: url for custom logic script

===========================================================*/
{
    let F = new ATON.Flare("anuket");

    F.setup = ()=>{
        F._ws = undefined;
        F._bConnected = false;

        F._params = new URLSearchParams(window.location.search);
        
        let addr  = F._params.get("anuket.srv");

        if (F._params.get("anuket.logic")){
            let logicpath = String(F._params.get("anuket.logic"));
            if (!logicpath.includes("/")) logicpath = "/flares/anuket/config/"+logicpath+".js";
            
            ATON.loadScript( logicpath, ()=>{
                if (addr) F.connect( String(addr) );
            });
        }
        else {
            if (addr) F.connect( String(addr) );
        }

        F.log("Initialized");
    };

    F.connect = (addr)=>{
        if (!addr){
            F.log("Invalid connect address");
            return;
        }

        F._ws = new WebSocket(addr);

        F._ws.addEventListener('open', (event)=>{
            F.log("Connected!");
            F._bConnected = true;

            if (F._params.get("anuket.ses")) F.joinSession( String(F._params.get("anuket.ses")) );

            ATON.fireEvent("ANUKET_CONNECTED");
        });

        F._ws.addEventListener('message', (event)=>{
            ATON.fireEvent("ANUKET_MSG", event.data);
        });

        F._ws.addEventListener('close', (event)=>{ 
            F.log('Connection has been closed');
            F._bConnected = false;

            ATON.fireEvent("ANUKET_DISCONNECTED");
        });

        F._ws.addEventListener('error', (event)=>{ 
            F.log('Error:' + event);
            F._bConnected = false;

            ATON.fireEvent("ANUKET_DISCONNECTED");
        });
    };

    F.joinSession = (ssid)=>{
        if (!F._bConnected) return false;

        F.log("Request join session "+ssid);

        F.sendMessage("#"+ssid);
    };

    F.sendMessage = (msg)=>{
        if (!F._bConnected) return;

        F._ws.send(msg);
    };

/*
    F.update = ()=>{
        console.log("a")
    };
*/
}