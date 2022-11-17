export const websocketAddress = (server) =>{
    if(!server){
      return null
    }
    let base = server.split("://");
    if(base[0] ==="https"){
      return "wss://"+base[1];
    }
    return  "ws://"+base[1];
  }