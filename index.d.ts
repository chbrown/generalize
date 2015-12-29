export interface Schema {
    /**
    type must be one of the seven primitive JSON schema types:
    - array
    - boolean
    - integer
    - number
    - null
    - object
    - string
  
    number is a superset of integer.
    */
    type: string;
    [index: string]: any;
}
export interface ObjectSchema extends Schema {
    properties: {
        [index: string]: Schema[];
    };
}
/**
JSON Schema calls both tuple types and list types 'array'.
See http://json-schema.org/latest/json-schema-validation.html#anchor128

ArraySchema implements the list sense, i.e., when `items` is a schema, not an
array.
*/
export interface ArraySchema extends Schema {
    items: Schema[];
}
export declare function union(schemas: Schema[], value: any): Schema[];
export declare function generalizeArray(values: any[]): Schema[];
