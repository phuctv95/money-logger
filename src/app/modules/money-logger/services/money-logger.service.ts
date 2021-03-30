import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Base } from 'src/app/shared/components/base';
import { HelperService } from 'src/app/shared/services/helper.service';
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

  getTodayRecords() {
    const today = moment();
    const sheetName = today.format('MMM');
    return this.googleSheets
      .getRange(`${sheetName}!${this.DateHeaderRanges[0]}`)
      .then(values => this.getRangeOfTodayHeader(today, values![0][0]))
      .then(rangeOfTodayHeader => this.getRangeOfTodayRecords(rangeOfTodayHeader!, sheetName))
      .then(values => {
        if (values === undefined) {
          values = []
        }
        const result = [] as LogRecord[];
        values.forEach(
          v => result.push({ description: v[0], cost: +v[1] || null })
        );
        for (let i = 0; i < this.NoRecords - values.length; i++) {
          result.push({ description: '', cost: null });
        }
        return result;
      })
      .catch(this.handleErr);
  }

  getRangeOfTodayHeader(today: moment.Moment, firstDayHeader: string) {
    let date = moment(`${today.format('YYYY')} ${firstDayHeader}`);
    for (let i = 0; i < this.DateHeaderRanges.length; i++) {
      const range = this.DateHeaderRanges[i];
      if (date.format('MMM DD') === today.format('MMM DD')) {
        return range;
      }
      date = date.add(1, 'days');
    }
    return null;
  }

  getRangeOfTodayRecords(rangeOfTodayHeader: string, sheetName: string) {
    let from = rangeOfTodayHeader.split(':')[0];
    from = `${from[0]}${+from.substring(1) + 1}`;
    let to = `${this.helper.nextCharOf(from[0])}${+from.substring(1) + this.NoRecords - 1}`;
    return this.googleSheets.getRange(`${sheetName}!${from}:${to}`);
  }

}
