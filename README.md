# generalize

[![npm version](https://badge.fury.io/js/generalize.svg)](https://www.npmjs.com/package/generalize)
[![Travis CI Build Status](https://travis-ci.org/chbrown/generalize.svg)](https://travis-ci.org/chbrown/generalize)
[![Coverage Status](https://coveralls.io/repos/chbrown/generalize/badge.svg)](https://coveralls.io/github/chbrown/urlio)

**Install:**

    npm install -g generalize-cli

## Example

Suppose you want a schema for the NPM downloads API range results:

    $ curl -s https://api.npmjs.org/downloads/range/last-week/npm
    {
      "downloads": [
        {
          "day": "2015-05-21",
          "downloads": 136536
        },
        {
          "day": "2015-05-22",
          "downloads": 140254
        },
        {
          "day": "2015-05-23",
          "downloads": 95945
        },
        {
          "day": "2015-05-24",
          "downloads": 88592
        },
        {
          "day": "2015-05-25",
          "downloads": 115167
        },
        {
          "day": "2015-05-26",
          "downloads": 127149
        },
        {
          "day": "2015-05-27",
          "downloads": 131255
        }
      ],
      "start": "2015-05-21",
      "end": "2015-05-27",
      "package": "npm"
    }

Run `generalize` on it!

    $ curl -s https://api.npmjs.org/downloads/range/last-week/npm | generalize | jq .
    [
      {
        "type": "object",
        "properties": {
          "downloads": [
            {
              "type": "array",
              "items": [
                {
                  "type": "object",
                  "properties": {
                    "day": [
                      {
                        "type": "string"
                      }
                    ],
                    "downloads": [
                      {
                        "type": "number"
                      }
                    ]
                  }
                }
              ]
            }
          ],
          "start": [
            {
              "type": "string"
            }
          ],
          "end": [
            {
              "type": "string"
            }
          ],
          "package": [
            {
              "type": "string"
            }
          ]
        }
      }
    ]

In the current output, instead of proper [JSON schema](http://json-schema.org/) `anyOf` types, `generalize` uses arrays.
If an array of schemas is 1-long, the array can be collapsed to just the single entry.


## TODO

* Proper JSON output
* Optionality recognition


## License

Copyright 2015 Christopher Brown. [MIT Licensed](http://chbrown.github.io/licenses/MIT/#2015).
