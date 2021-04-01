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
  private readonly Scopes = "https://www.googleapis.com/auth/spreadsheets";
  private readonly Gapi = gapi;
  spreadsheetId: string | null = null;

  get isSignedIn() {
    return this.Gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  constructor() { }

  accessSpreadsheetUsingCredential(credential: GoogleCredential, spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
    return new Promise<boolean>((res, rej) => {
      this.loadLibraries(() => {
        this.initLibraries(credential).then(() => {
          if (this.isSignedIn) {
            this.checkAccessSpreadsheetAfterSignIn().then(_ => res(true), rej)
          } else {
            this.signIn().then(response => {
              if (response.isSignedIn()) {
                this.checkAccessSpreadsheetAfterSignIn().then(_ => res(true), rej)
              } else {
                rej("Sign in failed.")
              }
            });
          }
        }, rej);
      });
    });
  }

  checkAccessSpreadsheetAfterSignIn() {
    return new Promise<boolean>((res, _) => {
      try {
        if (this.spreadsheetId == null) {
          res(false);
          return;
        }
        this.Gapi.client.sheets.spreadsheets
          .get({
            spreadsheetId: this.spreadsheetId,
            fields: 'spreadsheetId',
          })
          .then(_ => res(true))
          .catch(_ => res(false));
      } catch (_) {
        res(false);
      }
    });
  }

  getSpreadsheetId(spreadsheetUrl: string) {
    return /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/g.exec(spreadsheetUrl)![1];
  }

  read(range: string) {
    return new Promise<any[][] | undefined>((res, rej) => {
      this.Gapi.client.sheets.spreadsheets.values
        .get({
          spreadsheetId: this.spreadsheetId!,
          range: range
        })
        .then(response => res(response.result.values))
        .catch(rej);
    });
  }

  async write(range: string, values: any[][]) {
    await this.Gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId!,
      range: range,
      valueInputOption: 'USER_ENTERED',
      resource: { values: values }
    })
  }

  private loadLibraries(initCallBack: () => void) {
    this.Gapi.load('client:auth2', initCallBack);
  }

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

}
