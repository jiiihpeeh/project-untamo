import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TextInput, Button } from "@react-native-material/core";
import axios from "axios";

const HomeScreen = () => {
  const [isLogInFormValid, setIsLogInFormValid] = useState(false);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const logIn = async () => {
    console.log("Logging In....")
    try{
      let res = await axios.post('http://192.168.2.207:3001/login',{user: user,password: password })
      console.log(res.data)
    }catch(err){
      console.log(err)
    }
    

  }
  
  useEffect(() => {
    const isOK = () => {
      if(password.length > 5 && emailPattern.test(user)){
        setIsLogInFormValid(true);
      }else {
        setIsLogInFormValid(false);
      }
    };
    const emailPattern = new RegExp(".+@.+..+");
  //console.log(user, password)
    isOK();
  },[user, password])
  return (<>
        <TextInput 
          name="user" 
          onChangeText={text => setUser(text)} 
          label="Email" 
          style={{ margin: 16 }} 
          type="email"/>
        <TextInput 
          label="Password" 
          onChangeText={text => setPassword(text)} 
          style={{ margin: 16 }} 
          secureTextEntry={true} />
        <Button 
          title="Log In" 
          disabled={!isLogInFormValid} 
          onPress={logIn}
          style={{ alignSelf: "center", marginTop: 40 }}/>
        </>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;