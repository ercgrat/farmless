import React from 'react';
import './App.css';
import SheetsService, { useSheetsService } from './services/SheetsService';

function App() {
    
    const isSignedIn = useSheetsService();

    return (
        <div className="App">
            <p>Hello, world!</p>
            <button onClick={() => {
                signout();
            }}>
                { isSignedIn ? 'Switch accounts' : 'Sign in' }
            </button>
        </div>
    );

    function signout() {
        SheetsService.signout();
    }
}

export default App;
