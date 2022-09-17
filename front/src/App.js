import './App.css';
import {Routes,Route,Link} from 'react-router-dom';
import Alarms from './components/Alarms';
import About from './components/About';


function App() {
  return (
    <div className="App">
			<ul style={{listStyleType:"none"}}>
				<li><Link to="/">Alarms</Link></li>
				<li><Link to="/about">About</Link></li>
			</ul>
			<hr/>
			<Routes>
				<Route exact path="/" element={<Alarms/>}/>
				<Route path="/about" element={<About/>}/>
			</Routes>    
    </div>
  );
}

export default App;
