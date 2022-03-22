v1.1.5 (May 10, 2021)

- Fixed an issue with how JSON bodies are shown in code snippets for Ruby, C#, and Dart.

v1.1.4 (May 6, 2021)

- Fix an issue with empty GraphQL body

v1.1.3 (Mar 2, 2021)

- Use proper indentation for JSON bodies in Javascript and Nodejs codegens
- Fix for - [445](https://github.com/postmanlabs/postman-code-generators/issues/445) Add proper indentation in nodejs-axios when bodytype is urlencoded
- Fix for - [248](https://github.com/postmanlabs/postman-code-generators/issues/248) Use quoteType everywhere in curl, not just in the url
- Fix for - [454](https://github.com/postmanlabs/postman-code-generators/issues/454) Fix encoding when generating HTTP code snippets
- Fix for - [426](https://github.com/postmanlabs/postman-code-generators/issues/426) Use json.dumps in Python codegens if Content-Type is JSON

v1.1.2 (Dec 15, 2020)

- Fix for - [8736](https://github.com/postmanlabs/postman-app-support/issues/8736) Add content type support for individual form-data fields
- Fix for - [8635](https://github.com/postmanlabs/postman-app-support/issues/8635) Use Json.parse for all json like application types
- Fix for - [9212](https://github.com/postmanlabs/postman-app-support/issues/9212) Add semicolon after header key in curl codegen if the value is empty string.
- Add Newman test for powershell

v1.1.1 (Nov 10, 2020)

- Change string to enum in cURL quoteType option.
- Fix new line issue in dart-http and HTTP codegen
- Fix an issue where deepinstall was failing when folder name had spaces.

v1.1.0 (Nov 2, 2020)

- Added support for Dart http
- Fix for - [315](https://github.com/postmanlabs/postman-code-generators/issues/315): Manually parse url provided in the request.
- Fix for - [253](https://github.com/postmanlabs/postman-code-generators/issues/253): Add -g flag to curl if braces ({}) or brackets ([]) are present in the url.
- Fix for - [257](https://github.com/postmanlabs/postman-code-generators/issues/257): Use double quotes to escape semicolon in curl requests
- Fix for - [247](https://github.com/postmanlabs/postman-code-generators/issues/247): Add ContentType to python snippets for multipart/formdata
- Fix for - [186](https://github.com/postmanlabs/postman-code-generators/issues/186): Add ` as line continuation delimiter for curl codegen
- Fix for - [248](https://github.com/postmanlabs/postman-code-generators/issues/248): Add quoteType as an additional option in curl codegen
- Fix deadlock in error case in Swift and Objective-C codegens.
- Fix for - [325](https://github.com/postmanlabs/postman-code-generators/issues/325): Use encodeURIComponent instead of escape for urlencoded request body.
- Fix for - [350](https://github.com/postmanlabs/postman-code-generators/issues/350): Sanitize \r in request body.
- Fix for - [366](https://github.com/postmanlabs/postman-code-generators/issues/366): Add support for uploading binary files for multipart/form-data bodies in python-http.client.
- Fix for - [353](https://github.com/postmanlabs/postman-code-generators/issues/353): Add optional import of FoundationNetworking in swift codegen
- Fix for - [284](https://github.com/postmanlabs/postman-code-generators/issues/284): Replace double-quotes by single-quotes in codegen/php-curl
- Fix for - [330](https://github.com/postmanlabs/postman-code-generators/issues/330): Use url.toString method for converting url in shell-httpie codegen

v1.0.2 (Oct 15, 2020)

- Fixed spaces around variables and arguments in Python codgen to comply with PEP 8.
- Added Content-Length header to generated HTTP snippets.
- Switched to multiline strings for Raw bodies in Go.
- Stopped manually encoding response bodes in `utf8` for Python-requests.
- Removed unnecessary semicolons at the end of statements in Ruby.
- Fixed wrong name of HTTP codegen in README

v1.0.1 (Jun 29, 2020)

- Fix for - [8674](https://github.com/postmanlabs/postman-app-support/issues/8674): Add URL sanitization for quotes in cURL, Java Unirest, NodeJS Native, Python http.client, and Swift.

v1.0.0 (May 29, 2020)

- Add axios framework support
- Add ES6 syntax support for NodeJS Request, NodeJS Native and NodeJS Unirest
- Fix snippet generation for powershell and jquery, where form data params had no type field
