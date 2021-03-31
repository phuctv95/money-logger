import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Base as Base } from 'src/app/shared/components/base';
import { DayLog } from '../../models/day-log';
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
  todayLog: DayLog | undefined;

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

  async save() {
    this.isSaving = true;
    const records = this.records.value as LogRecord[];
    try {
      await this.moneyLogger.writeToday(records, this.todayLog!.recordsRange);
      this.form.markAsPristine();
      this.isSaving = false;
    } catch (error) {
      this.handleErr(error);
    }
  }

  private loadData() {
    let records = this.moneyLogger
      .getTodayLog()
      .then(log => {
        this.todayLog = log as DayLog;
        this.todayLog.records.forEach(record => {
          this.records.push(this.fb.group({
            description: [record.description],
            cost: [record.cost],
          }));
        });
      })
      .catch(this.handleErr);
  }
}
