import { Injectable } from '@angular/core';

// Ref: https://stackoverflow.com/a/24103596

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor() { }

  write(name: string, value: string, days: number) {
    var expires = '';
    if (days) {
      var date = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      date.setTime(date.getTime() + (days * oneDay));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/`;
  }

  get(name: string) {
    var nameEq = `${name}=`;
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEq) == 0) {
        return c.substring(nameEq.length, c.length);
      }
    }
    return null;
  }

  erase(name: string) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }

}
