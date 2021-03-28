/// <reference types="gapi" />
/// <reference types="gapi.auth2" />
/// <reference types="gapi.client.sheets" />

import { Injectable } from '@angular/core';
import { GoogleCredential } from '../models/google-credential';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {

  private readonly DiscoveryDocs = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
  private readonly Scopes = "https://www.googleapis.com/auth/spreadsheets.readonly";
  private readonly Gapi = gapi;

  get isSignedIn() {
    return this.Gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  constructor() { }

  signInAndOpenSpreadsheet(credential: GoogleCredential, spreadsheetId: string) {
    return new Promise<boolean>((res, rej) => {
      this.loadLibraries(() => {
        this.initLibraries(credential).then(() => {
          if (this.isSignedIn) {
            this.checkAccessToSpreadsheet(spreadsheetId).then(_ => res(true), rej)
          } else {
            this.signIn().then(response => {
              if (response.isSignedIn()) {
                this.checkAccessToSpreadsheet(spreadsheetId).then(_ => res(true), rej)
              } else {
                rej("Sign in failed.")
              }
            });
          }
        }, rej);
      });
    });
  }

  extractSpreadsheetId(spreadsheetUrl: string) {
    return /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/g.exec(spreadsheetUrl)![1];
  }

  getRange(spreadsheetId: string, range: string) {
    return new Promise((res, rej) => {
      this.Gapi.client.sheets.spreadsheets.values
        .get({
          spreadsheetId: spreadsheetId,
          range: range
        })
        .then(response => res(response.result.values))
        .catch(rej);
    });
  }

  // Step 1
  private loadLibraries(initCallBack: () => void) {
    this.Gapi.load('client:auth2', initCallBack);
  }

  // Step 2
  private initLibraries(credential: GoogleCredential) {
    return this.Gapi.client.init({
      apiKey: credential.apiKey,
      clientId: credential.clientId,
      discoveryDocs: this.DiscoveryDocs,
      scope: this.Scopes
    });
  }

  private signIn() {
    return this.Gapi.auth2.getAuthInstance().signIn();
  }

  private checkAccessToSpreadsheet(spreadsheetId: string) {
    return this.Gapi.client.sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      fields: 'spreadsheetId',
    });
  }

}
