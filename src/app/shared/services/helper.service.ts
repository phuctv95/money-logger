import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  readFile(selected: File): Promise<string> {
    return new Promise<string>(res => {
      const reader = new FileReader();
      reader.addEventListener('load', _ => {
        res(reader.result as string);
      });
      reader.readAsText(selected);
    });
  }

}
