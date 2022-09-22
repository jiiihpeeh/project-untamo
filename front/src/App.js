import './App.css';
import {Routes,Route,Link} from 'react-router-dom';
import Alarms from './components/Alarms';
import About from './components/About';
//import LogIn from './components/LogIn';
import Register from './components/Register'

function App() {
  return (
    <div className="App">
			<ul style={{listStyleType:"none"}}>
				<li><Link to="/">Alarms</Link></li>
				<li><Link to="/about">About</Link></li>
				<li><Link to="/register">Register</Link></li>
			</ul>
			<hr/>
			<Routes>
				<Route exact path="/" element={<Alarms/>}/>
				<Route path="/about" element={<About/>}/>
				{/* <Route path="/about" element={<LogIn/>}/> */}
				<Route path="/register" element={<Register/>}/>

			</Routes>    
    </div>
  );
}

export default App;
