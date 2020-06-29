/**
 * POST /identity/token
 * @tag Authentication
 * @summary Generating an IAM token
 * @description Generate an IBM Cloud® Identity and Access Management (IAM) token by using either your [IAM API key](https://cloud.ibm.com/docs/iam?topic=iam-userapikey#userapikey) or a [service ID's API key](https://cloud.ibm.com/docs/iam?topic=iam-serviceidapikeys#serviceidapikeys) IBM Cloud APIs can be accessed only by users who are authorized by an assigned IAM role.
 * Each user who is calling the API must pass credentials for the API to authenticate.
 *
 * You can generate an IAM token by using either your IBM Cloud API key or a service ID's API key.
 * The API key is a permanent credential that can be reused if you don't lose the API key value or delete the API key in the account.
 * This process is also used if you are developing an application that needs to work with other IBM Cloud services.
 * You must use a service ID API key to get an access token to be passed to each of the IBM Cloud services.
 *
 * :::note
 * An access token is a temporary credential that expires after 1 hour.
 * After the acquired token expires, you must generate a new token to continue calling IBM Cloud or service APIs, and you can perform only actions that are allowed by your level of assigned access within all accounts.
 * :::
 *
 * @bodyContent {AuthForm} application/x-www-form-urlencoded
 * @bodyRequired
 *
 * @security // TODO: no way to unset security
 *
 * @response 200 - ok
 */
