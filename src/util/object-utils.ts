import {Serializable} from "./type-utils";

const safeJsonParse = (item: string): Serializable => {
    try {
        return JSON.parse(item);
    } catch (e) {
        return item;
    }
}


export {safeJsonParse};
