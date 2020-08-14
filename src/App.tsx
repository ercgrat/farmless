import React from 'react';
import './App.css';
import SheetsService, { useSheetService } from './services/SheetsService';

function App() {
    
    const isSignedIn = useSheetService();

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
