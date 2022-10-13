import QRCode from 'qrcode';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { SessionContext } from '../contexts/SessionContext';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Link,
  Box,
  useDisclosure
} from '@chakra-ui/react';

const GenerateQRPairingKey = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { token } = useContext(SessionContext);
  const [qrKey, setQrKey] = useState('');
  const [fetchState, setFetchState] = useState(false);
  const[timeStamp, setTimeStamp] = useState(0);

  const fetchKey = async () => {
    if(fetchState && (Date.now() - timeStamp > 30000 )){
      try {
        let res = await axios.post('http://localhost:3001/api/qrToken', {msg: "Generate a qr token for me, please... No hurry."}, {
            headers: {'token': token}});
        //console.log(res.data);
        setQrKey(JSON.stringify(res.data.key));
        setTimeStamp(Date.now());
      } catch(err){
        console.log("hmm..");
      };
    };
    setInterval(fetchKey,35000);
  };
  

  const renderQrKey = () => {
    console.log(qrKey);
    if(qrKey && qrKey !== ''){
      let qrcanvas = document.getElementById('qrpaircanvas');
      if(qrcanvas){
        QRCode.toCanvas(qrcanvas, qrKey, function (error) {
        if (error) { 
          console.error(error)
        }
        console.log('success!');
        })
      }
    };
 };

  useEffect(() => {

    const fetcher = async () => {
      if(fetchState){
        await fetchKey();
      }
    }
    fetcher()
  },[fetchState])
  useEffect(() => {
    renderQrKey();
  },[qrKey]);

  return (
      <>
      <Link onClick={() => {onOpen(); setTimeStamp(0); setFetchState(true)}}>Pair a device (QR code)</Link>

      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={() => {setFetchState(false); onClose()}} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Scan QR code</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box>
              <canvas id="qrpaircanvas" width="228" height="228"></canvas>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      </>
  );
};

export default GenerateQRPairingKey;

