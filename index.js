/**
Returns one of the seven primitive JSON schema types, or 'undefined':
  array, boolean, integer, number, null, object, string, undefined
(Except it does not actually ever return 'integer'.)
*/
function valueType(value) {
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
function createEmptySchema(type) {
    if (type == 'object') {
        return { type: type, properties: {} };
    }
    else if (type == 'array') {
        return { type: type, items: [] };
    }
    return { type: type };
}
/**
Return the schema in schemas such that schema.type == `type`, or `undefined`
if no schema matches.
*/
function find(schemas, type) {
    for (var i = 0, schema; (schema = schemas[i]); i++) {
        if (schema.type == type) {
            return schema;
        }
    }
}
function union(schemas, value) {
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
        var object_schema = schema;
        for (var key in value) {
            // should we actually do the `hasOwnProperty` check?
            if (value.hasOwnProperty(key)) {
                object_schema.properties[key] = union(object_schema.properties[key] || [], value[key]);
            }
        }
    }
    else if (type == 'array') {
        // throw new Error('array merge not yet supported');
        var array_schema = schema;
        value.forEach(function (item) {
            array_schema.items = union(array_schema.items, item);
        });
    }
    else {
    }
    return schemas;
}
exports.union = union;
function generalizeArray(values) {
    return values.reduce(function (accumulator_schemas, value) {
        return union(accumulator_schemas, value);
    }, []);
}
exports.generalizeArray = generalizeArray;
