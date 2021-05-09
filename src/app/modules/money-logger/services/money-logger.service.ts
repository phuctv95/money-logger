import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Base } from 'src/app/shared/components/base';
import { CookieService } from 'src/app/shared/services/cookie.service';
import { HelperService } from 'src/app/shared/services/helper.service';
import { DayLog } from '../models/day-log';
import { GoogleCredential } from '../models/google-credential';
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

  readonly DateHeaderRangesInNumbers = [
    {r: 2, c: 1}, {r: 2, c: 3}, {r: 2, c: 5}, {r: 2, c: 7}, {r: 2, c: 9}, {r: 2, c: 11}, {r: 2, c: 13},
    {r: 12, c: 1}, {r: 12, c: 3}, {r: 12, c: 5}, {r: 12, c: 7}, {r: 12, c: 9}, {r: 12, c: 11}, {r: 12, c: 13},
    {r: 22, c: 1}, {r: 22, c: 3}, {r: 22, c: 5}, {r: 22, c: 7}, {r: 22, c: 9}, {r: 22, c: 11}, {r: 22, c: 13},
    {r: 32, c: 1}, {r: 32, c: 3}, {r: 32, c: 5}, {r: 32, c: 7}, {r: 32, c: 9}, {r: 32, c: 11}, {r: 32, c: 13},
    {r: 42, c: 1}, {r: 42, c: 3}, {r: 42, c: 5}, {r: 42, c: 7}, {r: 42, c: 9}, {r: 42, c: 11}, {r: 42, c: 13},
    {r: 52, c: 1}, {r: 52, c: 3}, {r: 52, c: 5}, {r: 52, c: 7}, {r: 52, c: 9}, {r: 52, c: 11}, {r: 52, c: 13},
  ]

  readonly NoRecords = 6;
  readonly Cookie_ApiKey = 'ApiKey';
  readonly Cookie_ClientId = 'ClientId';
  readonly Cookie_SpreadsheetId = 'SpreadsheetId';

  constructor(private helper: HelperService,
    private googleSheets: GoogleSheetsService,
    private cookie: CookieService) { super(); }

  async getTodayLog() {
    const today = moment();
    const sheetName = today.format('MMM');
    try {
      await this.createMonthSheetIfNotExist(sheetName);
      const firstDayHeader = (await this.googleSheets.read(`${sheetName}!${this.DateHeaderRanges[0]}`))![0][0];
      const rangeOfTodayHeader = this.getRangeOfTodayHeader(today, firstDayHeader, sheetName);
      await this.validateDayHeaderRange(rangeOfTodayHeader, today);

      let from = rangeOfTodayHeader!.split('!')[1].split(':')[0];
      from = `${from[0]}${+from.substring(1) + 1}`;
      let to = `${this.helper.nextCharOf(from[0])}${+from.substring(1) + this.NoRecords - 1}`;
      let values = await this.googleSheets.read(`${sheetName}!${from}:${to}`);
      if (values === undefined) {
        values = [];
      }

      const records = [] as LogRecord[];
      values.forEach(
        v => records.push({ description: v[0], cost: !!v[1] ? +v[1] : null })
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

  async createMonthSheetIfNotExist(month: string) {
    if (await this.googleSheets.checkSheetNameExist(month)) {
      return;
    }
    const sheetId = await this.googleSheets.duplicateSheet('Template', month);
    let day = moment(`${month} 01`, 'MMM DD').startOf('isoWeek');
    const values: gapi.client.sheets.ValueRange[] = [];
    const days = [day];
    this.DateHeaderRanges.forEach(range => {
      values.push({
        range: `${month}!${range}`,
        values: [[day.format('MMM DD')]],
      });
      if (day.format('MMM') === month) {
        const char = range.split(':')[0][0];
        const number = + range.split(':')[0].substring(1);
        values.push({
          range: `${month}!${char}${number + 1}:${char}${number + 3}`,
          values: [['Breakfast'], ['Lunch'], ['Dinner']],
        });
      }
      day = day.clone().add(1, 'days');
      days.push(day);
    });
    await this.googleSheets.multipleWrite(values);
    await this.setStrikethroghForNotCurrentMonth(days, sheetId, month);
  }

  async writeToday(records: LogRecord[], recordsRange: string) {
    if (records.length !== this.NoRecords) {
      throw `Number of records to save must be ${this.NoRecords}`;
    }
    await this.validateDayLog(recordsRange, moment());
    this.googleSheets.write(recordsRange, records.map(r => [r.description, r.cost]));
  }

  writeLoginToCookie(credential: GoogleCredential, spreadsheetId: string) {
    this.cookie.write(this.Cookie_ApiKey, credential.apiKey, 7);
    this.cookie.write(this.Cookie_ClientId, credential.clientId, 7);
    this.cookie.write(this.Cookie_SpreadsheetId, spreadsheetId, 7);
  }

  readLoginCookie() {
    const apiKey = this.cookie.get(this.Cookie_ApiKey);
    const clientId = this.cookie.get(this.Cookie_ClientId);
    const spreadsheetId = this.cookie.get(this.Cookie_SpreadsheetId);
    
    if (!apiKey || !clientId || !spreadsheetId) {
      return null;
    }

    return {
      credential: {
        apiKey: apiKey,
        clientId: clientId
      } as GoogleCredential,
      spreadsheetId: spreadsheetId,
    };
  }

  private async setStrikethroghForNotCurrentMonth(
    daysInSheet: moment.Moment[], sheetId: number, currentMonth: string) {
    
    const prevMonth = moment(currentMonth, 'MMM').add(-1, 'months').month();
    const nextMonth = moment(currentMonth, 'MMM').add(1, 'months').month();
    const hasPreviousMonth = daysInSheet.some(d => d.month() === prevMonth);
    const hasNextMonth = daysInSheet.some(d => d.month() === nextMonth);
    if (hasPreviousMonth) {
      const index = this.helper.findLastIndex(daysInSheet, d => d.month() === prevMonth);
      await this.googleSheets.updateCellsStyle(
        {
          sheetId: sheetId,
          startRowIndex: this.DateHeaderRangesInNumbers[0].r,
          endRowIndex: this.DateHeaderRangesInNumbers[0].r + 1,
          startColumnIndex: this.DateHeaderRangesInNumbers[0].c,
          endColumnIndex: this.DateHeaderRangesInNumbers[index].c + 2,
        },
        {
          strikethrough: true
        });
    }
    if (hasNextMonth) {
      const index = daysInSheet.findIndex( d => d.month() === nextMonth);
      const n = this.DateHeaderRangesInNumbers.length;
      await this.googleSheets.updateCellsStyle(
        {
          sheetId: sheetId,
          startRowIndex: this.DateHeaderRangesInNumbers[n - 1].r,
          endRowIndex: this.DateHeaderRangesInNumbers[n - 1].r + 1,
          startColumnIndex: this.DateHeaderRangesInNumbers[index].c,
          endColumnIndex: this.DateHeaderRangesInNumbers[n - 1].c + 2,
        },
        {
          strikethrough: true
        });
    }
  }

  private getRangeOfTodayHeader(today: moment.Moment, firstDayHeader: string, sheetName: string) {
    let date = moment(`${today.format('YYYY')} ${firstDayHeader}`, 'YYYY MMM DD');
    for (let i = 0; i < this.DateHeaderRanges.length; i++) {
      const range = this.DateHeaderRanges[i];
      if (date.format('MMM DD') === today.format('MMM DD')) {
        return `${sheetName}!${range}`;
      }
      date = date.add(1, 'days');
    }
    return null;
  }

  private async validateDayLog(recordsRange: string, day: moment.Moment) {
    const sheetName = recordsRange.split('!')[0];
    const from = recordsRange.split('!')[1].split(':')[0];
    const dayRange = `${sheetName}`
      + `!${from[0]}${+from.substring(1) - 1}`
      + `:${this.helper.nextCharOf(from[0])}${+from.substring(1) - 1}`
    await this.validateDayHeaderRange(dayRange, day);
  }

  private async validateDayHeaderRange(rangeOfDayHeader: string | null, day: moment.Moment) {
    if (!rangeOfDayHeader) {
      throw Error('rangeOfTodayHeader must has value.');
    }
    try {
      const values = await this.googleSheets.read(rangeOfDayHeader);
      if (!values) {
        throw Error('validation failed.');
      }
      const value = values[0][0];
      if (day.format('MMM DD') === moment(value, 'MMM DD').format('MMM DD')) {
        return;
      }
      throw Error('validation failed.');
    } catch (err) {
      throw Error(err);
    }
  }

}
