import { BehaviorSubject } from 'rxjs';
import { useEffect, useState } from 'react';
import { IEnterpriseBlock, ITask } from './GraphService';
import moment from 'moment';

export interface ISheetService {
    getIsSignedIn(): boolean;
    getData(): IEnterpriseBlock[];
    signout(): void;
    reloadData(): Promise<void>;
}

export function useSheetsService(): ISheetService {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [data, setData] = useState([]);
    const sheetService: ISheetService = {
        getIsSignedIn: () => {
            return isSignedIn;
        },
        getData: (): IEnterpriseBlock[] => {
            return data;
        },
        signout: SheetsService.signout,
        reloadData: SheetsService.reloadData
    };

    useEffect(() => {
        SheetsService.initialize();
        const signedInSubscription = SheetsService.getSignedInSubject().subscribe((value) => {
            setIsSignedIn(value);
        });
        const dataSubscription = SheetsService.getDataSubject().subscribe((value) => {
            setData(value);
        });
        return (() => {
            //cleanup function
            signedInSubscription.unsubscribe();
            dataSubscription.unsubscribe();
        });
    }, [setIsSignedIn, setData]);

    return sheetService;
}

class SheetsService {
    private static isInitialized = false;

    private static SignedInSubject: BehaviorSubject<boolean>;
    private static DataSubject: BehaviorSubject<any>;

    // Client ID and API key from the Developer Console
    private static CLIENT_ID = '849489452026-l86oilegotm5l0j7s387vma11uqm9tou.apps.googleusercontent.com';
    private static API_KEY = 'AIzaSyC9kkuPvALf3RmAxVt2ixXgp9_62Y33PEE';

    // Array of API discovery doc URLs for APIs used by the quickstart
    private static DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    private static SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

    public static initialize() {
        if (!SheetsService.isInitialized) {
            gapi.load('client:auth2', this.initClient);
            SheetsService.isInitialized = true;
        }
    }

    public static signout() {
        gapi.auth2.getAuthInstance().signOut();
        gapi.auth2.getAuthInstance().disconnect();
    }

    public static async reloadData(): Promise<void> {
        let result: IEnterpriseBlock[] = [];
        const ranges = ['Greenhouse!A:E',
            'Bed Prep & H2O!A:E',
            'Plant Sales!A:E',
            'Other!A:E',
            'Chickens!A:E',
            'Pigs!A:E',
            'Alliums (Onions & Leeks)!A:E',
            'Asian Greens (bok choy, tatsoi)!A:E',
            'Asparagus!A:E',
            'Beets!A:E',
            'Blackberries!A:E',
            'Brassicas (only use if all brassicas)!A:E',
            'Broccoli (inc. Cauliflower, Romanesco)!A:E',
            'Cabbage!A:E',
            'Carrots!A:E',
            'Chard!A:E',
            'Cucumbers!A:E',
            'Cucurbits (both zukes & cukes)!A:E',
            'Cut Greens!A:E',
            'Eggplant!A:E',
            'Escarole!A:E',
            'Fava Beans!A:E',
            'Fennel!A:E',
            'Flowers & Ornamental Grass!A:E',
            'Garlic!A:E',
            'Herbs!A:E',
            'Husk Cherries!A:E',
            'Kale!A:E',
            'Lettuce (head)!A:E',
            'Light Feeders (only use if all)!A:E',
            'Napa Cabbage!A:E',
            'Microgreens!A:E',
            'Peas!A:E',
            'Perennials!A:E',
            'Peppers!A:E',
            'Potatoes!A:E',
            'Radicchio & Chicory!A:E',
            'Radish & Hakurei Turnip!A:E',
            'Rutabaga!A:E',
            'Scallions!A:E',
            'String Beans!A:E',
            'Summer Squash!A:E',
            'Sweet Potatoes!A:E',
            'Tomatoes!A:E',
            'Winter Squash!A:E'];
        for (let range of ranges) {
            await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: '1MVWu1vCSrLgIZ1pjPl76d7BuknKSvAU9LPIGJKvUESA',
                range,
            }).then((response) => {
                const enterprise = range.split('!')[0];
                result.push({
                    name: enterprise,
                    tasks: response.result.values?.slice(1).map((task: any[]): ITask => {
                        return {
                            date: moment(task[0]).format('YYYY-MM-DD'),
                            employee: task[1],
                            type: task[2],
                            hours: Number(task[3]),
                            tractorHours: task[4] ? Number(task[4]) : undefined
                        };
                    }) || []
                });
            });
        }
        SheetsService.updateData(result);
    }

    private static initClient() {
        gapi.client.init({
            apiKey: SheetsService.API_KEY,
            clientId: SheetsService.CLIENT_ID,
            discoveryDocs: SheetsService.DISCOVERY_DOCS,
            scope: SheetsService.SCOPES
        }).then(() => {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(SheetsService.updateSigninStatus);

            // Handle the initial sign-in state.
            SheetsService.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

            // Load data
            SheetsService.reloadData();

        }, function (error) {
            console.log(JSON.stringify(error, null, 2));
        });
    }

    public static getSignedInSubject(): BehaviorSubject<boolean> {
        SheetsService.SignedInSubject = SheetsService.SignedInSubject || new BehaviorSubject<boolean>(false);
        return SheetsService.SignedInSubject;
    }

    public static getDataSubject(): BehaviorSubject<any> {
        SheetsService.DataSubject = SheetsService.DataSubject || new BehaviorSubject<any>(null);
        return SheetsService.DataSubject;
    }

    public static updateSigninStatus(isSignedIn: boolean) {
        SheetsService.SignedInSubject.next(isSignedIn);
        if (!isSignedIn) {
            gapi.auth2.getAuthInstance().signIn();
        }
    }

    public static updateData(data: any) {
        SheetsService.DataSubject.next(data);
        
    }
}