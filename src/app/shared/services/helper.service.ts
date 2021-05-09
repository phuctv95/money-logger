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

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
  * Returns the index of the last element in the array where predicate is true, and -1
  * otherwise.
  * @param array The source array to search in
  * @param predicate find calls predicate once for each element of the array, in descending
  * order, until it finds one where predicate returns true. If such an element is found,
  * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
  */
  findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return l;
    }
    return -1;
  }

}
