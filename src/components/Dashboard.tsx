import React from 'react';
import { useSheetsService } from '../services/SheetsService';

function Dashboard() {
    
    const sheetState = useSheetsService();
    
    return (
        <div>
            <p>{ sheetState.getData() ? JSON.stringify(sheetState.getData()) : '' }</p>
        </div>
    );

}

export default Dashboard;
