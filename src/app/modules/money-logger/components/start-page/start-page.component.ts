import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from 'src/app/shared/services/helper.service';
import { GoogleCredential } from '../../models/google-credential';
import { GoogleSheetsService } from '../../services/google-sheets.service';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {

  form = new FormGroup({
    spreadsheetUrl: new FormControl(''),
  });

  credential: GoogleCredential | undefined;
  isOpening = false;

  constructor(private helper: HelperService,
    private googleSheets: GoogleSheetsService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  onFileOpened(e: Event) {
    let selected = (e.target as HTMLInputElement).files?.item(0);
    if (!selected) {
      return;
    }
    
    this.helper.readFile(selected).then(
      v => this.credential = JSON.parse(v) as GoogleCredential);
  }

  openMoneyLogger() {
    if (!this.credential) {
      return;
    }
    this.isOpening = true;
    let spreadsheetId = this.googleSheets
      .extractSpreadsheetId(this.form.value.spreadsheetUrl);
    this.googleSheets
      .checkAccessSpreadsheetUsingCredential(this.credential, spreadsheetId)
      .then(_ => this.router.navigate(['today'], { relativeTo: this.route}))
      .catch(err => {
        alert('There\'s some error, see details in Console.');
        console.log(err);
      });
  }
}
