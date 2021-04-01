import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from 'src/app/shared/services/helper.service';
import { GoogleCredential } from '../../models/google-credential';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { MoneyLoggerService } from '../../services/money-logger.service';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {

  form = new FormGroup({
    spreadsheetUrl: new FormControl(''),
  });

  isBusy = true;
  credential: GoogleCredential | undefined;
  isOpening = false;

  constructor(private helper: HelperService,
    private googleSheets: GoogleSheetsService,
    private moneyLogger: MoneyLoggerService,
    private router: Router,
    private route: ActivatedRoute) { }

  async ngOnInit() {
    const loginData = this.moneyLogger.readLoginCookie();
    if (!!loginData) {
      await this.openMoneyLogger(loginData.credential, loginData.spreadsheetId, false);
    }
    this.isBusy = false;
  }

  onFileOpened(e: Event) {
    let selected = (e.target as HTMLInputElement).files?.item(0);
    if (!selected) {
      return;
    }

    this.helper.readFile(selected).then(
      v => this.credential = JSON.parse(v) as GoogleCredential);
  }

  async onClickOpen() {
    if (!this.credential) {
      return;
    }
    this.isOpening = true;

    const spreadsheetId = this.googleSheets.getSpreadsheetId(this.form.value.spreadsheetUrl);
    await this.openMoneyLogger(this.credential, spreadsheetId, true);
  }

  async openMoneyLogger(credential: GoogleCredential, spreadsheetId: string, saveCookie: boolean) {
    try {
      await this.googleSheets.accessSpreadsheetUsingCredential(credential, spreadsheetId);
      if (saveCookie) {
        this.moneyLogger.writeLoginToCookie(credential, spreadsheetId);
      }
      
      this.router.navigate(['today'], { relativeTo: this.route });

    } catch (err) {
      alert('There\'s some error, see details in Console.');
      console.log(err);
    }
  }
}
