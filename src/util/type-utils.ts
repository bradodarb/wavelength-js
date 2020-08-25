interface IIndexed {
    [propName: string]: any;
}
interface ICallback {
    (error: any, result?: any): void;

    (error?: any, result?: any): void;
}

export {IIndexed, ICallback}
