import * as data from '../../../../data.json';
import { JsonObject } from 'src/app/interfaces/JsonObject.js';

export function readData() : void {
    let object : JsonObject = data[0];
    console.log(object);
}
