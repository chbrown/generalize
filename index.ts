/*!
Many documentation snippets below are taken verbatim from the JSON Schema spec:
http://json-schema.org/documentation.html
*/

// not sure if this const of primitives is useful.
/**
JSON Schema defines seven primitive types for JSON values:
*/
const primitives = {
  /** A JSON array. */
  'array': 'array',
  /** A JSON boolean. */
  'boolean': 'boolean',
  /** A JSON number without a fraction or exponent part. */
  'integer': 'integer',
  /** Any JSON number. Number includes integer. */
  'number': 'number',
  /** The JSON null value. */
  'null': 'null',
  /** A JSON object. */
  'object': 'object',
  /** A JSON string. */
  'string': 'string',
};

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

  Or if is undefined, the schema is considered 'empty' and will match anything.
  */
  type?: string | string[];
  [index: string]: any;
}

/**
JSON Schema calls both tuple types and list types 'array'.
See http://json-schema.org/latest/json-schema-validation.html#anchor128

The list type interpretation is indicated when `items` is a Schema.
The tuple type interpretation is indicated when `items` is an array of Schemas.
*/
export interface ArraySchema extends Schema {
  // type: "array",
  /**
  The value of "additionalItems" MUST be either a boolean or an object. If it
  is an object, this object MUST be a valid JSON Schema.
  */
  additionalItems?: boolean | Schema;
  /**
  The value of "items" MUST be either an object or an array. If it is an object,
  this object MUST be a valid JSON Schema. If it is an array, items of this
  array MUST be objects, and each of these objects MUST be a valid JSON Schema.

  * If "items" is a schema, then the child instances must be valid against this
    schema, regardless of their index, and regardless of the value of
    "additionalItems".
  * If "items" is an array, the schema depends on the index:
    - if the index is less than, or equal to, the size of "items", the child
      instance must be valid against the corresponding schema in the "items" array;
    - otherwise, it must be valid against the schema defined by "additionalItems".
  */
  items: Schema | Schema[];
}

export interface ObjectSchema extends Schema {
  // type: "object",
  /**
  The value of this keyword MUST be an integer. This integer MUST be greater
  than, or equal to, 0. An object instance is valid against "maxProperties" if
  its number of properties is less than, or equal to, the value of this keyword.
  */
  maxProperties?: number;
  /**
  The value of this keyword MUST be an integer. This integer MUST be greater
  than, or equal to, 0. An object instance is valid against "minProperties" if
  its number of properties is greater than, or equal to, the value of this
  keyword. If this keyword is not present, it may be considered present with a
  value of 0.
  */
  minProperties?: number;
  /**
  The value of this keyword MUST be an array. This array MUST have at least
  one element. Elements of this array MUST be strings, and MUST be unique. An
  object instance is valid against this keyword if its property set contains all
  elements in this keyword's array value.
  */
  required?: string[];
  /**
  The value of "additionalProperties" MUST be a boolean or an object. If it
  is an object, it MUST also be a valid JSON Schema. If it is absent, it may be
  considered present with an empty schema as a value. Successful validation of
  an object instance against the three keywords, "additionalProperties",
  "properties", and "patternProperties", depends on the value of
  "additionalProperties":
  1. if its value is boolean true or a schema, validation succeeds;
  2. if its value is boolean false, validation of the instance depends on the
    property set of "properties" and "patternProperties":
    a. Collect the following sets:
       s: The property set of the instance to validate.
       p: The property set from "properties".
       pp: The property set from "patternProperties".
    b. Remove from "s" all elements of "p", if any;
    c. For each regex in "pp", remove all elements of "s" which this regex
       matches.
    Validation of the instance succeeds if set "s" is now empty.
  */
  additionalProperties?: boolean | Schema;
  /**
  The value of "properties" MUST be an object. Each value of this object MUST be
  an object, and each object MUST be a valid JSON Schema. If it is absent, it
  can be considered present with an empty object as a value.
  */
  properties?: {[index: string]: Schema};
  /**
  The value of "patternProperties" MUST be an object. Each property name of this
  object SHOULD be a valid regular expression, according to the ECMA 262 regular
  expression dialect. Each property value of this object MUST be an object, and
  each object MUST be a valid JSON Schema. If it is absent, it can be considered
  present with an empty object as a value.
  */
  patternProperties?: {[index: string]: Schema};
}

/**
Returns one of the seven primitive JSON schema types, or 'undefined':
  array, boolean, integer, number, null, object, string, undefined
(Except it does not actually ever return 'integer'.)
*/
function primitiveType(value: any): string {
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

function typeMatches(instanceType: string, schemaType: string | string[]): boolean {
  if (schemaType === undefined) {
    return false;
  }
  else if (Array.isArray(schemaType)) {
    return schemaType.indexOf(instanceType) > -1;
  }
  else {
    return instanceType === schemaType;
  }
}
/**
Assumes that schemaType does not already equal or include instanceType.
*/
function addType(instanceType: string, schemaType: string | string[]): string | string[] {
  if (schemaType === undefined) {
    // if we are adding a type to an empty schema, its type will be undefined
    return instanceType;
  }
  else if (Array.isArray(schemaType)) {
    return schemaType.concat(instanceType);
  }
  else {
    return [schemaType, instanceType];
  }
}

/**
union takes a potentially insufficiently general schema, and an instance that
the schema must be extended to include, and returns a new schema that matches
everything the original schema did, as well as the new instance.
*/
export function union(schema: Schema, instance: any): Schema {
  const type = primitiveType(instance);
  if (type == 'undefined') {
    // TODO: handle this case. What should I do with an array of values like
    // `['laugh', 100, undefined]`? change all of the schemas to optional?
    // schemas.forEach(schema => schema.optional = true);
    return schema;
  }
  else if (type == 'object') {
    // TODO: clone the schema instead of mutating it
    let objectSchema = <ObjectSchema>schema;
    if (!typeMatches(type, objectSchema.type)) {
      // the schema does not currently handle objects, so we need to add the type
      objectSchema.type = addType(type, objectSchema.type)
      // and the appropriate field
      objectSchema.properties = {};
    }
    // now we can merge the object's fields
    for (var key in instance) {
      // should we do a `hasOwnProperty` check?
      objectSchema.properties[key] = union(objectSchema.properties[key] || {}, instance[key]);
    }
    return objectSchema;
  }
  else if (type == 'array') {
    // TODO: support tuple-type arrays?
    // TODO: clone the existing schema
    let arraySchema = <ArraySchema>schema;
    if (!typeMatches(type, arraySchema.type)) {
      // the schema does not currently handle arrays, so we need to add the type
      arraySchema.type = addType(type, arraySchema.type)
      // and the appropriate field
      arraySchema.items = {};
    }
    // now we can merge the array's schema
    instance.forEach(item => {
      arraySchema.items = union(arraySchema.items, item);
    });
    return arraySchema;
  }
  else {
    if (!typeMatches(type, schema.type)) {
      schema.type = addType(type, schema.type)
    }
    // only the nested types, object and array, require merging. otherwise, nothing needs to be done.
    return schema;
  }
}

export function generalizeFrom(...instances: any[]): Schema {
  return instances.reduce((schema, instance) => {
    return union(schema, instance);
  }, {});
}

export default generalizeFrom;
