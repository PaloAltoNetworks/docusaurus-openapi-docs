function init({
  path,
  method,
  parameters = [],
  requestBody = {},
  responses = {},
  postman,
  jsonRequestBodyExample,
  servers,
}) {
  const { content = {} } = requestBody;

  const contentTypeArray = Object.keys(content);

  const acceptArray = [
    ...new Set(
      Object.values(responses)
        .map((response) => Object.keys(response.content || {}))
        .flat()
    ),
  ];

  let params = {
    path: [],
    query: [],
    header: [],
    cookie: [],
  };

  parameters.forEach((param) => {
    params[param.in].push({
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

  return {
    jsonRequestBodyExample: jsonRequestBodyExample,
    requestBodyMetadata: requestBody, // TODO: no...
    acceptOptions: acceptArray,
    contentTypeOptions: contentTypeArray,
    path: path,
    method: method,
    params: params,
    contentType: contentTypeArray[0],
    accept: acceptArray[0],
    body: undefined,
    response: undefined,
    postman: postman,
    servers: servers,
    endpoint: servers[0]?.url,
  };
}

export default init;
