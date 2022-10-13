import QRCode from 'qrcode';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { SessionContext } from '../contexts/SessionContext';


const sleep = ms => new Promise(
  resolve => setTimeout(resolve, ms)
);


const GenerateQRPairingKey = () => {
  const { token, fetchQR } = useContext(SessionContext);
  const [qrKey, setQrKey] = useState('');

  const fetchKey = async () => {
    if(fetchQR){
      await axios.post('http://localhost:3001/api/qrToken', {msg: "Generate a qr token for me, please... No hurry."}, {
        headers: {'token': token}}).then( (res) =>
          setQrKey(JSON.stringify(res.data.key)));
    };
  };
  

  const renderQrKey = () => {
    if(qrKey && qrKey !== ''){
      let qrcanvas = document.getElementById('qrpaircanvas');
      if(qrcanvas){
        QRCode.toCanvas(qrcanvas, qrKey, function (error) {
        if (error) { 
          console.error(error)
        }
        console.log('qr: success!');
        })
      }
    };
  };


  useEffect(() => {
    renderQrKey();
  },[qrKey]);

  const fetcher = async () => {
    if(fetchQR){
      while(fetchQR === true){
        fetchKey();
        await sleep(50000);
      };
    };
  };
  useEffect(() => {
    if(fetchQR){
      fetcher()
    }
  },[fetchQR]);
 
};

export default GenerateQRPairingKey;

