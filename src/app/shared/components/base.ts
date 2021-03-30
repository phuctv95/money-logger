export class Base {
    protected handleErr(err: any) {
        alert('Something wrong, see details in consol.');
        console.log(err);
    }
}
