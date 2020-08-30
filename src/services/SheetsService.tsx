import { BehaviorSubject } from 'rxjs';
import { useEffect, useState } from 'react';

export interface ISheetService {
    getIsSignedIn(): boolean;
    getData(): any;
    signout(): void;
    reloadData(): Promise<void | Response>;
}

export function useSheetsService(): ISheetService {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [data, setData] = useState({});
    const sheetService: ISheetService = {
        getIsSignedIn: () => {
            return isSignedIn;
        },
        getData: () => {
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

    public static reloadData(): Promise<void | Response> {
        return gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1WsCmqKn56rVLtG12kR28JVrj05MjUscNNSsIHTRD3z8',
            range: 'Greenhouse!A:E',
        }).then(function (response) {
            SheetsService.updateData(response);
        });
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