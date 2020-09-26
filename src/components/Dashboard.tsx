import { useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { GraphService } from '../services/GraphService';
import { useSheetsService } from '../services/SheetsService';

function Dashboard() {

    const [isDBPopulated, setIsDBPopulated] = useState(false);
    const sheetService = useSheetsService();
    const [resetDatabase] = useMutation(GraphService.Mutations.RESET_DATABASE);
    const [post, { loading }] = useMutation(GraphService.Mutations.POST);
    
    let populateDatabase = async () => {
        await resetDatabase({
            fetchPolicy: "no-cache"
        });
        for (let enterpriseBlock of sheetService.getData()) {
            console.log(enterpriseBlock.name);
            console.log(enterpriseBlock.tasks);
            await post({ variables: {
                enterprise: enterpriseBlock.name,
                tasks: enterpriseBlock.tasks
            }});
        }
        setIsDBPopulated(true);
    };

    return (
        <div>
            { sheetService.getData() ?
                (()=> {
                    if (!isDBPopulated) {
                        return (<button onClick={populateDatabase}>Populate the Database!</button>);
                    } else if (!isDBPopulated && loading) {
                        return (<p>Populating the database...</p>);
                    } else {
                        return (<h2>The database has now been populated with</h2>);
                    }
                    
                })() :
                (<p>Loading...</p>)
            }
        </div>
    );

}

export default Dashboard;
