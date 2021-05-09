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

  async checkSheetNameExist(sheetName: string): Promise<boolean> {
    const response = await this.Gapi.client.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId!,
      fields: 'sheets.properties.sheetId,sheets.properties.title',
    });
    return response.result.sheets!.findIndex(x => x.properties!.title === sheetName) > -1;
  }

  async updateCellsStyle(
    range: gapi.client.sheets.GridRange,
    textFormat: gapi.client.sheets.TextFormat) {
    const params = {
      spreadsheetId: this.spreadsheetId!
    };
    const batchUpdateSpreadsheetRequestBody = {
      requests: [
        {
          repeatCell: {
            range: range,
            cell: {
              userEnteredFormat: {
                textFormat: textFormat,
              },
            },
            fields: 'userEnteredFormat.textFormat'
          }
        }
      ]
    };
    await this.Gapi.client.sheets.spreadsheets.batchUpdate(
      params, batchUpdateSpreadsheetRequestBody);
  }
  
  async multipleWrite(values: gapi.client.sheets.ValueRange[]) {
    const body = {
      data: values,
      valueInputOption: 'USER_ENTERED',
    };
    return await this.Gapi.client.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId!,
      resource: body,
    });
  }

  async getSheetId(sheetName: string): Promise<number | undefined> {
    const response = await this.Gapi.client.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId!,
      fields: 'sheets.properties.sheetId,sheets.properties.title',
    });
    const sheet = response.result.sheets!.find(x => x.properties!.title === sheetName);
    return sheet?.properties!.sheetId;
  }

  async duplicateSheet(sheetName: string, targetName: string): Promise<number> {
    const sheetId = await this.getSheetId(sheetName);
    if (!sheetId) {
      throw `Not found sheet name: ${sheetName}`;
    }
    const batchUpdateRequest = {
      requests: [
        {
          duplicateSheet: {
            sourceSheetId: sheetId,
            insertSheetIndex: 0,
            newSheetName: targetName,
          }
        }
      ]
    } as any;
    const response = await this.Gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId!,
      resource: batchUpdateRequest,
    });
    return response.result.replies![0].duplicateSheet!.properties!.sheetId!;
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
