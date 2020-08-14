import { BehaviorSubject } from 'rxjs';
import { useEffect, useState } from 'react';

export function useSheetService(): boolean {
    const [isSignedIn, setIsSignedIn] = useState(false);
    useEffect(() => {
        SheetsService.initialize();
        const signedInSubject= SheetsService.getSignedInSubject();
        const signedInSubscription = signedInSubject.subscribe((value) => {
            setIsSignedIn(value);
        });

        return (() => {
            //cleanup function
            signedInSubscription.unsubscribe();
        });
    }, []);

    return isSignedIn;
}

export default class SheetsService {
    private static SignedInSubject: BehaviorSubject<boolean>;

    // Client ID and API key from the Developer Console
    private static CLIENT_ID = '849489452026-l86oilegotm5l0j7s387vma11uqm9tou.apps.googleusercontent.com';
    private static API_KEY = 'AIzaSyC9kkuPvALf3RmAxVt2ixXgp9_62Y33PEE';

    // Array of API discovery doc URLs for APIs used by the quickstart
    private static DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    private static SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

    private static isInitialized = false;
    private static isSignedIn = false;

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

    public static getSignedInSubject(): BehaviorSubject<boolean> {
        SheetsService.SignedInSubject = SheetsService.SignedInSubject || new BehaviorSubject<boolean>(SheetsService.isSignedIn);
        return SheetsService.SignedInSubject;
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
            
        }, function (error) {
            console.log(JSON.stringify(error, null, 2));
        });
    }

    private static updateSigninStatus(isSignedIn: boolean) {
        SheetsService.isSignedIn = isSignedIn;
        SheetsService.SignedInSubject.next(SheetsService.isSignedIn);
        if (!isSignedIn) {
            gapi.auth2.getAuthInstance().signIn();
        }
    }
}