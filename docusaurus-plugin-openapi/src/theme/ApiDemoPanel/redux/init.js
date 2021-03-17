function init({
  path,
  method,
  parameters = [],
  requestBody = {},
  responses = {},
  'x-code-samples': codeSamples = [],
  postman,
  jsonRequestBodyExample,
  servers,
  security,
}) {
  const { content = {} } = requestBody;

  const contentTypeArray = Object.keys(content);

  const acceptArray = Array.from(
    new Set(
      Object.values(responses)
        .map((response) => Object.keys(response.content || {}))
        .flat()
    )
  );

  let params = {
    path: [],
    query: [],
    header: [],
    cookie: [],
  };

  parameters.forEach((param) => {
    params[param.in].push({
      ...param,
      name: param.name,
      value: undefined,
      description: param.description,
      type: param.in,
      required: param.required,
      schema: param.schema,
    });
  });

  if (!servers) {
    servers = [];
  }

  let bearerToken = sessionStorage.getItem("bearerToken");
  if (!bearerToken) {
    bearerToken = undefined;
  }

  return {
    jsonRequestBodyExample: jsonRequestBodyExample,
    requestBodyMetadata: requestBody, // TODO: no...
    acceptOptions: acceptArray,
    contentTypeOptions: contentTypeArray,
    path: path,
    method: method,
    params: params,
    contentType: contentTypeArray[0],
    codeSamples: codeSamples,
    accept: acceptArray[0],
    body: undefined,
    response: undefined,
    postman: postman,
    servers: servers,
    endpoint: servers[0],
    security: security,
    bearerToken: bearerToken,
  };
}

export default init;
