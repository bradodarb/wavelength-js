interface Indexed<T = any> {
    [propName: string]: T;
}
interface Callback {
    (error: any, result?: any): void;

    (error?: any, result?: any): void;
}
type Serializable = string | Object | number | boolean | undefined | Error;

interface Serializer{
    (item:Serializable): string
}
interface Deserializer<T = any> {
    (item:string): T
}

export {Indexed, Callback, Serializable, Serializer, Deserializer}
