import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { HelperService } from 'src/app/shared/services/helper.service';
import { LogRecord } from '../../models/log-record';
import { GoogleSheetsService } from '../../services/google-sheets.service';

@Component({
  selector: 'app-today-logger',
  templateUrl: './today-logger.component.html',
  styleUrls: ['./today-logger.component.scss']
})
export class TodayLoggerComponent implements OnInit {

  readonly DateRanges = [
    'B3:C3', 'D3:E3', 'F3:G3', 'H3:I3', 'J3:K3', 'L3:M3', 'N3:O3',
    'B13:C13', 'D13:E13', 'F13:G13', 'H13:I13', 'J13:K13', 'L13:M13', 'N13:O13',
    'B23:C23', 'D23:E23', 'F23:G23', 'H23:I23', 'J23:K23', 'L23:M23', 'N23:O23',
    'B33:C33', 'D33:E33', 'F33:G33', 'H33:I33', 'J33:K33', 'L33:M33', 'N33:O33',
    'B43:C43', 'D43:E43', 'F43:G43', 'H43:I43', 'J43:K43', 'L43:M43', 'N43:O43',
    'B53:C53', 'D53:E53', 'F53:G53', 'H53:I53', 'J53:K53', 'L53:M53', 'N53:O53',
  ]
  readonly NoRecords = 6;

  todayHeader = `Today (${new Date().toLocaleDateString()})`;
  isSaving = false;

  form = this.fb.group({
    records: this.fb.array([])
  });

  get total() {
    if (!this.form.value) {
      return 0;
    }
    return this.form.value.records
      .reduce((prev: number, curr: { cost: string; }) => prev + (+curr.cost ?? 0), 0);
  }

  get records() {
    return this.form.get('records') as FormArray;
  }

  constructor(private googleSheets: GoogleSheetsService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService) { }

  ngOnInit(): void {
    this.googleSheets
      .checkAccessSpreadsheet()
      .then(canAccess => {
        if (canAccess) {
          this.loadData();
        } else {
          this.router.navigate([''], { relativeTo: this.route});
        }
      });
  }

  save() {
    this.isSaving = true;
    (this.records.value as LogRecord[]).forEach(record => {
      // TODO: save record.
      this.googleSheets
        .write('A1', record.cost + '')
        .then(_ => {
          this.isSaving = false;
          this.form.markAsPristine();
        })
        .catch(this.handleErr);
    })
  }

  private loadData() {
    let records = this
      .getTodayRecords()
      .then(records => {
        (records as LogRecord[]).forEach(record => {
          this.records.push(this.fb.group({
            description: [record.description],
            cost: [record.cost],
          }));
        });
      }, this.handleErr);
  }

  private getTodayRecords() {
    const today = moment();
    const sheetName = today.format('MMM');
    return this.googleSheets
      .getRange(`${sheetName}!${this.DateRanges[0]}`)
      .then(values => {
        let date = moment(`${today.format('YYYY')} ${values![0][0]}`);
        for (let i = 0; i < this.DateRanges.length; i++) {
          const range = this.DateRanges[i];
          if (date.format('MMM DD') === today.format('MMM DD')) {
            return range;
          }
          date = date.add(1, 'days');
        }
        return null;
      }, this.handleErr)
      .then(rangeOfCurrentMonth => {
        let from = (rangeOfCurrentMonth as string)!.split(':')[0];
        from = `${from[0]}${+from.substring(1) + 1}`;
        let to = `${this.helper.nextCharOf(from[0])}${+from.substring(1) + this.NoRecords - 1}`;
        return this.googleSheets.getRange(`${sheetName}!${from}:${to}`);
      }, this.handleErr)
      .then(values => {
        const result = [] as LogRecord[];
        (values as string[][]).forEach(
          v => result.push({ description: v[0], cost: +v[1] || null }));
        for (let i = 0; i < this.NoRecords - (values as string[][]).length; i++) {
          result.push({ description: '', cost: null });
        }
        return result;
      }, this.handleErr);
  }

  private handleErr(err: any) {
    alert('Something wrong, see details in consol.');
    console.log(err);
  }
}
