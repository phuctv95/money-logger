import { Component, OnInit } from '@angular/core';
import { GoogleSheetsService } from '../../services/google-sheets.service';

@Component({
  selector: 'app-today-logger',
  templateUrl: './today-logger.component.html',
  styleUrls: ['./today-logger.component.scss']
})
export class TodayLoggerComponent implements OnInit {

  constructor(private googleSheets: GoogleSheetsService) { }

  ngOnInit(): void {
    // this.googleSheets
    //   .getRange('', 'A1:E10')
    //   .then(res => console.log(res))
    //   .catch(console.log);
  }

}
