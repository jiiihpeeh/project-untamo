export const websocketAddress = (server) =>{
    let base = server.split("://");
    if(base[0] ==="https"){
      return "wss://"+base[1];
    }
    return  "ws://"+base[1];
  }