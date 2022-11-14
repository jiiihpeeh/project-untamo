import QRCode from 'qrcode';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { SessionContext } from '../contexts/SessionContext';
const GenerateQRPairingKey = () => {
  const { token, fetchQR, server } = useContext(SessionContext);
  const [qrKey, setQrKey] = useState('');


  useEffect(() => {  
    const renderQrKey = () => {
      if(qrKey && qrKey !== ''){
        let qrcanvas = document.getElementById('qrpaircanvas');
        
        if(qrcanvas){
          let ensure = ''
          for(let i =0; i< 5; i++){
            ensure = `${Math.round(Math.random() * 9)}${ensure}`
          }
          let qrObject = JSON.stringify({token:qrKey, server: server, ensure:ensure})
          QRCode.toCanvas(qrcanvas, qrObject, function (error) {
          if (error) { 
            console.error('qr',error)
          }
          console.log('qr: success!');
          })
        }
      };
    };
    renderQrKey();
  },[qrKey]);

  useEffect(() => {
    const fetchKey = async () => {
      if(fetchQR === true){
        try{
          let res = await axios.post(`${server}/api/qrToken`, {msg: "Generate a qr token for me, please... No hurry."}, {
            headers: {'token': token}});
          setQrKey(res.data.key);
        }catch(err){
          console.log(err)
        }
      };
    };
    
    const fetcher = async () => {
      if (fetchQR === true) {
        await fetchKey();
      }
      
      let qrcanvas = document.getElementById('qrpaircanvas');
  
      if (qrcanvas){
      //if(fetchQR === true){
        setTimeout(fetcher, 30000);
      }
    }
    if (fetchQR === true){
      fetcher();
    }
  },[fetchQR, token]);
 
};

export default GenerateQRPairingKey;

