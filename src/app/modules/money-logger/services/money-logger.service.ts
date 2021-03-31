import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Base } from 'src/app/shared/components/base';
import { HelperService } from 'src/app/shared/services/helper.service';
import { DayLog } from '../models/day-log';
import { LogRecord } from '../models/log-record';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
  providedIn: 'root'
})
export class MoneyLoggerService extends Base {

  readonly DateHeaderRanges = [
    'B3:C3', 'D3:E3', 'F3:G3', 'H3:I3', 'J3:K3', 'L3:M3', 'N3:O3',
    'B13:C13', 'D13:E13', 'F13:G13', 'H13:I13', 'J13:K13', 'L13:M13', 'N13:O13',
    'B23:C23', 'D23:E23', 'F23:G23', 'H23:I23', 'J23:K23', 'L23:M23', 'N23:O23',
    'B33:C33', 'D33:E33', 'F33:G33', 'H33:I33', 'J33:K33', 'L33:M33', 'N33:O33',
    'B43:C43', 'D43:E43', 'F43:G43', 'H43:I43', 'J43:K43', 'L43:M43', 'N43:O43',
    'B53:C53', 'D53:E53', 'F53:G53', 'H53:I53', 'J53:K53', 'L53:M53', 'N53:O53',
  ]

  readonly NoRecords = 6;

  constructor(private helper: HelperService,
    private googleSheets: GoogleSheetsService) { super(); }

  async getTodayLog() {
    const today = moment();
    const sheetName = today.format('MMM');
    try {
      const firstDayHeader = (await this.googleSheets.getRangeValues(`${sheetName}!${this.DateHeaderRanges[0]}`))![0][0];
      const rangeOfTodayHeader = this.getRangeOfTodayHeader(today, firstDayHeader, sheetName);
      await this.validateRangeOfDayHeader(rangeOfTodayHeader, today);
      
      let from = rangeOfTodayHeader!.split('!')[1].split(':')[0];
      from = `${from[0]}${+from.substring(1) + 1}`;
      let to = `${this.helper.nextCharOf(from[0])}${+from.substring(1) + this.NoRecords - 1}`;
      let values = await this.googleSheets.getRangeValues(`${sheetName}!${from}:${to}`);
      if (values === undefined) {
        values = [];
      }

      const records = [] as LogRecord[];
      values.forEach(
        v => records.push({ description: v[0], cost: +v[1] || null })
      );
      for (let i = 0; i < this.NoRecords - values.length; i++) {
        records.push({ description: '', cost: null });
      }

      return {
        headerRange: rangeOfTodayHeader,
        recordsRange: `${sheetName}!${from}:${to}`,
        records: records
      } as DayLog;
    } catch (err) {
      return this.handleErr(err);
    }
  }

  getRangeOfTodayHeader(today: moment.Moment, firstDayHeader: string, sheetName: string) {
    let date = moment(`${today.format('YYYY')} ${firstDayHeader}`);
    for (let i = 0; i < this.DateHeaderRanges.length; i++) {
      const range = this.DateHeaderRanges[i];
      if (date.format('MMM DD') === today.format('MMM DD')) {
        return `${sheetName}!${range}`;
      }
      date = date.add(1, 'days');
    }
    return null;
  }

  async writeToday(records: LogRecord[], recordsRange: string) {
    if (records.length !== this.NoRecords) {
      throw `Number of records to save must be ${this.NoRecords}`;
    }
    await this.validateDayHeader(recordsRange, moment());
    this.googleSheets.write(recordsRange, records.map(r => [r.description, r.cost]));
  }

  private async validateDayHeader(recordsRange: string, day: moment.Moment) {
    const sheetName = recordsRange.split('!')[0];
    const from = recordsRange.split('!')[1].split(':')[0];
    const dayRange = `${sheetName}!${from[0]}${+from[1] - 1}`
      + `:${this.helper.nextCharOf(from[0])}${+from[1] - 1}`
    await this.validateRangeOfDayHeader(dayRange, day);
  }

  private async validateRangeOfDayHeader(rangeOfDayHeader: string | null, day: moment.Moment) {
    if (!rangeOfDayHeader) {
      throw Error('rangeOfTodayHeader must has value.');
    }
    try {
      const values = await this.googleSheets.getRangeValues(rangeOfDayHeader);
      if (!values) {
        throw Error('validation failed.');
      }
      const value = values[0][0];
      if (day.format('MMM DD') === moment(value).format('MMM DD')) {
        return;
      }
      throw Error('validation failed.');
    } catch (err) {
      throw Error(err);
    }
  }

}
