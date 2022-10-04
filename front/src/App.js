import { useState } from 'react';
import {Routes,Route,Link} from 'react-router-dom';
import Alarms from './components/Alarms';
import About from './components/About';
import LogIn from './components/LogIn';
import Register from './components/Register'
import Welcome from './components/Welcome';


function App() {

	return (
		<div className="App">
			<ul style={{listStyleType:"none"}}>
				<li><Link to="/">Alarms</Link></li>
				<li><Link to="/about">About</Link></li>
				<li><Link to="/register">Register</Link></li>
				<li><Link to="/login">LogIn</Link></li>
				<li><Link to="/welcome">Welcome</Link></li>
			</ul>
			<hr/>
			<Routes>
					<Route exact path="/" element={<Alarms/>}/>
					<Route path="/about" element={<About/>}/>
					<Route path="/login" element={<LogIn/>}/>
					<Route path="/register" element={<Register/>}/>
					<Route path="/welcome" element={<Welcome/>}/>
			</Routes>    
    </div>
  );
}

export default App;
