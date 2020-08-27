interface Indexed {
    [propName: string]: any;
}
interface Callback {
    (error: any, result?: any): void;

    (error?: any, result?: any): void;
}
type Serializable = string | Object | number | boolean | undefined | Error;

interface Serializer{
    (item:Serializable): string
}

export {Indexed, Callback, Serializable, Serializer}
