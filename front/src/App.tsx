import './App.css'
import { Button } from './ui/Button'

function App() {
    console.log('App rendering')
    return (
        <div className="App">
            <h1>Hello World</h1>
            <Button onClick={() => console.log('clicked')}>Test Button</Button>
        </div>
    )
}

export default App