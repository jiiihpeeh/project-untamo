
import React, { useState, useEffect } from "react";
import { SafeAreaView, StatusBar, FlatList, StyleSheet } from "react-native";
import { Div, Button, Icon, Modal, ThemeProvider, Text } from "react-native-magnus";
import axios from "axios";

import { BarCodeScanner } from 'expo-barcode-scanner';

const QrWindow = (props) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
  
    useEffect(() => {
      const getBarCodeScannerPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      };
  
      getBarCodeScannerPermissions();
    }, []);
  
    const handleBarCodeScanned = ({ type, data }) => {
      setScanned(true);
      props.setScanData(data) 
      //alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };
  
    if (hasPermission === null) {
      return (<Text>Requesting for camera permission</Text>)
    }
    if (hasPermission === false) {
      return (<Text>No access to camera</Text>)
    }
    
    return(
    <Div >
        <Modal isVisible={props.qrcodeScanner}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            <Button onPress={() => props.setQrcodeScanner(false)}>Cancel</Button>
        </Modal>
    </Div>)
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },
  });
  

export default QrWindow;