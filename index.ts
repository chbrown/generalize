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
  properties: {[index: string]: Schema[]};
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

/**
Returns one of the seven primitive JSON schema types, or 'undefined':
  array, boolean, integer, number, null, object, string, undefined
(Except it does not actually ever return 'integer'.)
*/
function valueType(value: any): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  // TODO: Ensure that the only other possibilities are 'object', 'boolean', 'number', and 'string'
  return typeof value;
}

/**
Create an empty schema with an empty collection value, depending on the value
of the given type.
*/
function createEmptySchema(type: string): Schema {
  if (type == 'object') {
    return {type, properties: {}};
  }
  else if (type == 'array') {
    return {type, items: []};
  }
  return {type};
}

/**
Return the schema in schemas such that schema.type == `type`, or `undefined`
if no schema matches.
*/
function find(schemas: Schema[], type: string) {
  for (var i = 0, schema: Schema; (schema = schemas[i]); i++) {
    if (schema.type == type) {
      return schema;
    }
  }
}

export function union(schemas: Schema[], value: any): Schema[] {
  var type = valueType(value);
  if (type == 'undefined') {
    // TODO: handle this case. What should I do with an array of values like
    // `['laugh', 100, undefined]`? change all of the schemas to optional?
    // schemas.forEach(schema => schema.optional = true);
    return schemas;
  }

  // find a pre-existing schema, if there is one
  var schema = find(schemas, type);
  if (schema === undefined) {
    // if the schema is unset, there's no precedent, so it's easy
    schema = createEmptySchema(type);
    schemas.push(schema);
  }

  // merge into existing schema.
  if (type == 'object') {
    // only the nested types, object and array (below), require merging.
    var object_schema = <ObjectSchema>schema;
    for (var key in value) {
      // should we actually do the `hasOwnProperty` check?
      if (value.hasOwnProperty(key)) {
        object_schema.properties[key] = union(object_schema.properties[key] || [], value[key]);
      }
    }
  }
  else if (type == 'array') {
    // throw new Error('array merge not yet supported');
    var array_schema = <ArraySchema>schema;
    value.forEach(item => {
      array_schema.items = union(array_schema.items, item);
    });
  }
  else {
    // otherwise, nothing needs to be done.
  }
  return schemas;
}

export function generalizeArray(values: any[]): Schema[] {
  return values.reduce((accumulator_schemas, value) => {
    return union(accumulator_schemas, value);
  }, []);
}
