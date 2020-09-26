import React from 'react';
import './App.css';
import { useSheetsService } from './services/SheetsService';
import Dashboard from './components/Dashboard';

function App() {
    
    const sheetService = useSheetsService();

    return (
        <div className="App">
            <p>Hello, world!</p>
            <button onClick={() => {
                signout();
            }}>
                { sheetService.getIsSignedIn() ? 'Switch accounts' : 'Sign in' }
            </button>
            <Dashboard/>
        </div>
    );

    function signout() {
        sheetService.signout();
    }
}

export default App;
