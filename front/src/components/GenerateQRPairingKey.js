import QRCode from 'qrcode';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { SessionContext } from '../contexts/SessionContext';

const GenerateQRPairingKey = () => {
  const { token, fetchQR } = useContext(SessionContext);
  const [qrKey, setQrKey] = useState('');

  const fetchKey = async () => {
    if(fetchQR === true){
      try{
        let res = await axios.post('http://localhost:3001/api/qrToken', {msg: "Generate a qr token for me, please... No hurry."}, {
          headers: {'token': token}});
        setQrKey(JSON.stringify(res.data.key));
      }catch(err){
        console.log(err)
      }
    };
  };
  

  const renderQrKey = () => {
    if(qrKey && qrKey !== ''){
      let qrcanvas = document.getElementById('qrpaircanvas');
      if(qrcanvas){
        QRCode.toCanvas(qrcanvas, qrKey, function (error) {
        if (error) { 
          console.error('qr',error)
        }
        console.log('qr: success!');
        })
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
      setTimeout(fetcher, 50000);
    }
  }
  useEffect(() => {
    renderQrKey();
  },[qrKey]);

  useEffect(() => {
    if (fetchQR === true){
      fetcher();
    }
  },[fetchQR]);
 
};

export default GenerateQRPairingKey;

