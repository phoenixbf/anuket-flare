/*
    Anuket ATON flare

    author: bruno.fanini_AT_gmail.com

===========================================================*/
{
    let F = new ATON.Flare("anuket");

    F.setup = ()=>{
        F._ws = undefined;
        F._bConnected = false;

        F._params = new URLSearchParams(window.location.search);
        if (F._params.get("F.addr")) F.connect( F._params.get("F.addr") );

        F.log("Initialized");
    };

    F.connect = (addr)=>{
        F._ws = new WebSocket(addr);

        F._ws.addEventListener('open', (event)=>{
            F.log("Connected!");
            F._bConnected = true;
        });

        F._ws.addEventListener('message', (event)=>{
            F.onMessage(event.data);
        });

        F._ws.addEventListener('close', (event)=>{ 
            F.log('Connection has been closed');
            F._bConnected = false;
        });

        F._ws.addEventListener('error', (event)=>{ 
            F.log('Error:' + event);
            F._bConnected = false;
        });
    };

    F.onMessage = (msg)=>{
        F.console(msg);
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