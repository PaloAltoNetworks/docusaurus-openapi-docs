/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

var _ = require("./lodash"),
  sanitize = require("./util").sanitize;

/**
 * Parses URLEncoded body from request to axios syntax
 *
 * @param {Object} body URLEncoded Body
 * @param {boolean} trim trim body option
 * @param {boolean} ES6_enabled ES6 syntax option
 * @param {string} indentString The indentation string
 */
function parseURLEncodedBody(body, trim, ES6_enabled, indentString) {
  var varDeclare = ES6_enabled ? "const" : "var",
    bodySnippet = varDeclare + " qs = require('qs');\n",
    dataArray = [];

  _.forEach(body, function (data) {
    if (!data.disabled) {
      dataArray.push(
        `'${sanitize(data.key, trim)}': '${sanitize(data.value, trim)}'`
      );
    }
  });
  if (ES6_enabled) {
    bodySnippet += "let";
  } else {
    bodySnippet += "var";
  }
  bodySnippet += ` data = qs.stringify({\n${indentString}${dataArray.join(
    ",\n" + indentString
  )} \n});`;
  return bodySnippet;
}

/**
 * Parses Formdata from request to axios syntax
 *
 * @param {Object} body FormData body
 * @param {boolean} trim trim body option
 * @param {boolean} ES6_enabled ES6 syntax option
 */
function parseFormData(body, trim, ES6_enabled) {
  var varDeclare = ES6_enabled ? "const" : "var",
    bodySnippet = varDeclare + " FormData = require('form-data');\n";
  // check if there's file
  const fileArray = body.filter(function (item) {
    return !item.disabled && item.type === "file";
  });
  if (fileArray.length > 0) {
    bodySnippet += varDeclare + " fs = require('fs');\n";
  }
  if (ES6_enabled) {
    bodySnippet += "let";
  } else {
    bodySnippet += "var";
  }
  bodySnippet += " data = new FormData();\n";

  _.forEach(body, function (data) {
    if (!data.disabled) {
      if (data.type === "file") {
        var fileContent = `fs.createReadStream('${data.src}')`;
        bodySnippet += `data.append('${sanitize(
          data.key,
          trim
        )}', ${fileContent});\n`;
      } else {
        bodySnippet += `data.append('${sanitize(data.key, trim)}', '${sanitize(
          data.value,
          trim
        )}'`;
        if (data.contentType) {
          bodySnippet += `, {contentType: '${sanitize(
            data.contentType,
            trim
          )}'}`;
        }
        bodySnippet += ");\n";
      }
    }
  });
  return bodySnippet;
}

/**
 * Parses Raw data to axios syntax
 *
 * @param {Object} body Raw body data
 * @param {boolean} trim trim body option
 * @param {String} contentType Content type of the body being sent
 * @param {boolean} ES6_enabled ES6 syntax option
 * @param {String} indentString Indentation string
 */
function parseRawBody(body, trim, contentType, ES6_enabled, indentString) {
  var varDeclare = ES6_enabled ? "let" : "var",
    bodySnippet = varDeclare + " data = ";
  // Match any application type whose underlying structure is json
  // For example application/vnd.api+json
  // All of them have +json as suffix
  if (
    contentType &&
    (contentType === "application/json" || contentType.match(/\+json$/))
  ) {
    try {
      let jsonBody = JSON.parse(body);
      bodySnippet += `JSON.stringify(${JSON.stringify(
        jsonBody,
        null,
        indentString.length
      )});\n`;
    } catch (error) {
      bodySnippet += `'${sanitize(body.toString(), trim)}';\n`;
    }
  } else {
    bodySnippet += `'${sanitize(body.toString(), trim)}';\n`;
  }
  return bodySnippet;
}

/**
 * Parses graphql data to axios syntax
 *
 * @param {Object} body graphql body data
 * @param {boolean} trim trim body option
 * @param {String} indentString indentation to be added to the snippet
 * @param {boolean} ES6_enabled ES6 syntax option
 */
function parseGraphQL(body, trim, indentString, ES6_enabled) {
  var varDeclare = ES6_enabled ? "let" : "var";
  let query = body ? body.query : "",
    graphqlVariables = body ? body.variables : "{}",
    bodySnippet;
  try {
    graphqlVariables = JSON.parse(graphqlVariables || "{}");
  } catch (e) {
    graphqlVariables = {};
  }
  bodySnippet = varDeclare + " data = JSON.stringify({\n";
  bodySnippet += `${indentString}query: \`${query ? query.trim() : ""}\`,\n`;
  bodySnippet += `${indentString}variables: ${JSON.stringify(
    graphqlVariables
  )}\n});\n`;
  return bodySnippet;
}

/* istanbul ignore next */
/**
 * parses binamry file data
 *
 * @param {boolean} ES6_enabled ES6 syntax option
 */
function parseFileData(ES6_enabled) {
  var varDeclare = ES6_enabled ? "let" : "var",
    bodySnippet = varDeclare + " data = '<file contents here>';\n";
  return bodySnippet;
}

/**
 * Parses Body from the Request
 *
 * @param {Object} body body object from request.
 * @param {boolean} trim trim body option
 * @param {String} indentString indentation to be added to the snippet
 * @param {String} contentType Content type of the body being sent
 * @param {boolean} ES6_enabled ES6 syntax option
 */
function parseBody(body, trim, indentString, contentType, ES6_enabled) {
  if (body && !_.isEmpty(body)) {
    switch (body.mode) {
      case "urlencoded":
        return parseURLEncodedBody(
          body.urlencoded,
          trim,
          ES6_enabled,
          indentString
        );
      case "raw":
        return parseRawBody(
          body.raw,
          trim,
          contentType,
          ES6_enabled,
          indentString
        );
      case "graphql":
        return parseGraphQL(body.graphql, trim, indentString, ES6_enabled);
      case "formdata":
        return parseFormData(body.formdata, trim, ES6_enabled);
      /* istanbul ignore next */
      case "file":
        return parseFileData(ES6_enabled);
      default:
        return parseRawBody(body[body.mode], trim, contentType, ES6_enabled);
    }
  }
  return "";
}

/**
 * parses header of request object and returns code snippet of nodejs axios to add headers
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required in code snippet
 * @returns {String} - code snippet of nodejs request to add header
 */
function parseHeader(request, indentString) {
  var headerObject = request.getHeaders({ enabled: true }),
    headerArray = [];

  if (!_.isEmpty(headerObject)) {
    headerArray = _.reduce(
      Object.keys(headerObject),
      function (accumalator, key) {
        if (Array.isArray(headerObject[key])) {
          var headerValues = [];
          _.forEach(headerObject[key], (value) => {
            headerValues.push(`${sanitize(value)}`);
          });
          accumalator.push(
            indentString.repeat(2) +
              `'${sanitize(key, true)}': '${headerValues.join(", ")}'`
          );
        } else {
          accumalator.push(
            indentString.repeat(2) +
              `'${sanitize(key, true)}': '${sanitize(headerObject[key])}'`
          );
        }
        return accumalator;
      },
      []
    );
  }

  return headerArray;
}

module.exports = {
  parseBody: parseBody,
  parseHeader: parseHeader,
  parseFormData: parseFormData,
};
