/*
    Anuket ATON flare

    Remote control/interaction plugin for ATON Apps
    developed under task 3.3 (CHANGES project - https://sites.google.com/uniroma1.it/changes/home)

    author: bruno.fanini_AT_cnr.it

    Params
    - anuket.srv: anuket service address
    - anuket.logic: custom logic in the form <mylogic>|<role> (e.g.: "samplelogic|controller")
    - anuket.ses: session ID

===========================================================*/
{
    let F = new ATON.Flare("anuket");

    F.PATH_LOGIC = ATON.PATH_FLARES+"anuket/logic/";
    
    F.CSTATE = {
        DISCONNECTED: 0,
        CONNECTING: 1,
        CONNECTED: 2
    };

    F._cState = F.CSTATE.DISCONNECTED;

    // This handels all custom logic
    F.logic = {};

    F.params = new URLSearchParams(window.location.search);
    F._ws   = undefined;
    F._addr = undefined;

    /**
    Load logic from path, and if provided a specific role 
    @param {string} logicpath - url to logic file or logic-name from dedicated logic folder of Anuket
    @param {string} role - (optional) The role to load
    */
    F.loadLogic = (logicpath, role, onLoad)=>{
        if (!logicpath.includes("/")) logicpath = F.PATH_LOGIC + logicpath+".js";

        ATON.loadScript( logicpath, ()=>{
            F.log("Logic loaded");

            if (role){
                let setuproutine = F.logic[role];
                if (setuproutine) setuproutine();

                F.log("Role '"+role+"' set");
            }

            if (F._addr) F.connect( F._addr );

            if (onLoad) onLoad();
        });
    };

    F.setup = ()=>{
        if (F.params.get("anuket.srv")) F._addr = String(F.params.get("anuket.srv"));

        if (F.params.get("anuket.logic")){
            let logx = String(F.params.get("anuket.logic"));

            logx = logx.split("|");

            F.loadLogic(logx[0], logx[1]);
        }

        F.log("Initialized");
    };

    /**
    Return true if connected to Anuket service
    @returns {boolean}
    */
    F.isConnected = ()=>{
        return (F._cState === F.CSTATE.CONNECTED);
    };

    /**
    Connect to Anuket service 
    @param {string} addr - url of Anuket websocket service
    */
    F.connect = (addr)=>{
        if (F._cState === F.CSTATE.CONNECTED){
            F.log("Already connected to service");
            return;
        }
        if (F._cState === F.CSTATE.CONNECTING){
            F.log("Already connecting to service");
            return;
        }

        if (!addr){
            F.log("Invalid connect address");
            return;
        }

        // Enter connecting state
        F._cState = F.CSTATE.CONNECTING;

        F._ws = new WebSocket(addr);

        F._ws.addEventListener('open', (event)=>{
            F.log("Connected!");
            F._cState = F.CSTATE.CONNECTED;

            if (F.params.get("anuket.ses")) F.joinSession( String(F.params.get("anuket.ses")) );

            ATON.fire("ANUKET_CONNECTED");
        });

        F._ws.addEventListener('message', (event)=>{
            let data = event.data;
            if (data.startsWith("{")) data = JSON.parse(data);

            ATON.fire("ANUKET_MSG", data);
        });

        F._ws.addEventListener('close', (event)=>{ 
            F.log('Connection has been closed');
            F._cState = F.CSTATE.DISCONNECTED;

            ATON.fire("ANUKET_DISCONNECTED");
        });

        F._ws.addEventListener('error', (event)=>{ 
            F.log('Error:' + event);
            F._cState = F.CSTATE.DISCONNECTED;

            ATON.fire("ANUKET_DISCONNECTED");
        });
    };

    /**
    Join a session (subscribe)
    @param {string} ssid - session ID
    */
    F.joinSession = (ssid)=>{
        if (F._cState !== F.CSTATE.CONNECTED) return false;

        F.log("Request join session '"+ssid+"'");

        F.sendMessage("#"+ssid);
        ATON.fire("ANUKET_JOIN_REQ", ssid);
    };

    /**
    Send message (string)
    @param {string} msg - string to send to current session participants
    */
    F.sendMessage = (msg)=>{
        if (F._cState !== F.CSTATE.CONNECTED) return false;

        F._ws.send(msg);
    };

    /**
    Send object
    @param {object} o - object to send to current session participants
    */
    F.sendObject = (o)=>{
        if (F._cState !== F.CSTATE.CONNECTED) return false;

        F._ws.send( JSON.stringify(o) );        
    };

    /**
    Define logic for a given role
    @param {string} role - the role
    @param {function} setup - the setup routine for the role
    */
    F.setRoleLogic = (role, setup)=>{
        if (!setup) return;
        
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