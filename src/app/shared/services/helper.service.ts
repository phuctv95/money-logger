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

  nextCharOf(char: string) {
    if (char.length > 1) {
      throw 'char length must be 1';
    }
    return String.fromCharCode(char.charCodeAt(0) + 1);
  }

}
