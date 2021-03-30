import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Base as Base } from 'src/app/shared/components/base';
import { LogRecord } from '../../models/log-record';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { MoneyLoggerService } from '../../services/money-logger.service';
@Component({
  selector: 'app-today-logger',
  templateUrl: './today-logger.component.html',
  styleUrls: ['./today-logger.component.scss']
})
export class TodayLoggerComponent extends Base implements OnInit {

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
    private moneyLogger: MoneyLoggerService) { super(); }

  ngOnInit(): void {
    this.googleSheets
      .checkAccessSpreadsheet()
      .then(canAccess => {
        if (canAccess) {
          this.loadData();
        } else {
          this.router.navigate([''], { relativeTo: this.route });
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
    let records = this.moneyLogger
      .getTodayRecords()
      .then(records => {
        (records as LogRecord[]).forEach(record => {
          this.records.push(this.fb.group({
            description: [record.description],
            cost: [record.cost],
          }));
        });
      })
      .catch(this.handleErr);
  }
}
