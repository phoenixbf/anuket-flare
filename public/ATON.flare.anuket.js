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

    F.PATH_LOGIC = ATON.PATH_FLARES+"anuket/logic/";

    // This handels all custom logic
    F.logic = {};

    F.setup = ()=>{
        F._ws = undefined;
        F._bConnected = false;

        F.params = new URLSearchParams(window.location.search);
        
        let addr  = F.params.get("anuket.srv");

        if (F.params.get("anuket.logic")){
            let logicpath = String(F.params.get("anuket.logic"));
            if (!logicpath.includes("/")) logicpath = F.PATH_LOGIC + logicpath+".js";
            
            ATON.loadScript( logicpath, ()=>{
                if (addr) F.connect( String(addr) );

                F.log("Logic loaded");

                if (F.params.get("anuket.role")){
                    let role = String(F.params.get("anuket.role"));

                    let setuproutine = F.logic[role];
                    if (setuproutine) setuproutine();

                    F.log("Role '"+role+"' set");
                }
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

            if (F.params.get("anuket.ses")) F.joinSession( String(F.params.get("anuket.ses")) );

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

        F.log("Request join session '"+ssid+"'");

        F.sendMessage("#"+ssid);
        ATON.fireEvent("ANUKET_JOIN_REQ", ssid);
    };

    F.sendMessage = (msg)=>{
        if (!F._bConnected) return;

        F._ws.send(msg);
    };

    F.setLogic = (role, setup)=>{
        if (!F.logic) return;
        if (F.logic[role]){
            F.log("Logic already defined for role '"+role+"'");
            return;
        }

        F.logic[role] = setup;
        F.log("Added logic for role '"+role+"'");
    };

/*
    F.update = ()=>{
        console.log("a")
    };
*/
}