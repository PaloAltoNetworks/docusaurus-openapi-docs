/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

var codegenList = [
  {
    type: "code_generator",
    lang: "curl",
    variant: "cURL",
    syntax_mode: "powershell",
    author: "Postman Labs <help@getpostman.com>",
    homepage:
      "https://github.com/postmanlabs/code-generators/tree/master/codegens/curl",
    main: require("../../codegens/curl/index.js"),
  },
  {
    type: "code_generator",
    lang: "go",
    variant: "Native",
    syntax_mode: "golang",
    author: "Postman Labs <help@getpostman.com>",
    homepage:
      "https://github.com/postmanlabs/code-generators/tree/master/codegens/golang",
    main: require("../../codegens/golang/index.js"),
  },
  {
    type: "code_generator",
    lang: "nodejs",
    variant: "Axios",
    syntax_mode: "javascript",
    author: "Postman Labs <help@getpostman.com>",
    homepage:
      "https://github.com/postmanlabs/code-generators/tree/master/codegens/nodejs-axios",
    main: require("../../codegens/nodejs-axios/index.js"),
  },
  {
    type: "code_generator",
    lang: "python",
    variant: "Requests",
    syntax_mode: "python",
    author: "Postman Labs <help@getpostman.com>",
    homepage:
      "https://github.com/postmanlabs/code-generators/tree/master/codegens/python-requests",
    main: require("../../codegens/python-requests/index.js"),
  },
];
module.exports = codegenList;
