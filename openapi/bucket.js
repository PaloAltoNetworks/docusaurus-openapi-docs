/**
 * GET /
 * @tag Bucket operations
 * @summary List buckets
 * @description A `GET` request sent to the endpoint root returns a list of buckets that are associated with the specified service instance.
 * For more information about endpoints, see [Endpoints and storage locations](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-endpoints#endpoints).
 *
 * @paramComponent {Extended}
 * @headerParam {string} ibm-service-instance-id - List buckets that were created in this service instance.
 *
 * @response 200 - ok
 */

/**
 * PUT /{bucketName}
 * @tag Bucket operations
 * @summary Create a bucket
 * @description A `PUT` request sent to the endpoint root followed by a string will create a bucket.
 * For more information about endpoints, see [Endpoints and storage locations](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-endpoints#endpoints).
 * Bucket names must be globally unique and DNS-compliant; names between 3 and 63 characters long must be made of lowercase letters, numbers, and dashes.
 * Bucket names must begin and end with a lowercase letter or number.
 * Bucket names resembling IP addresses are not allowed.
 * This operation doesn't make use of operation specific query parameters.
 *
 * :::info important
 * Bucket names must be unique because all buckets in the public cloud share a global namespace.
 * This allows for access to a bucket without needing to provide any service instance or account information.
 * It is also not possible to create a bucket with a name beginning with `cosv1-` or `account-` as these prefixes are reserved by the system.
 * :::
 *
 * :::note
 * Personally Identifiable Information (PII): When creating buckets or adding objects, please ensure to not use any information that can identify any user (natural person) by name, location or any other means in the name of the bucket or object.
 * :::
 *
 * ## Create a bucket with a different storage class
 *
 * To create a bucket with a different storage class, send an XML block specifying a bucket configuration with a `LocationConstraint` of `{provisioning code}` in the body of a `PUT` request to a bucket endpoint.
 * For more information about endpoints, see [Endpoints and storage locations](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-endpoints#endpoints).
 * Note that standard bucket [naming rules](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-compatibility-api-bucket-operations#compatibility-api-new-bucket) apply.
 * This operation does not make use of operation specific query parameters.
 *
 * The body of the request must contain an XML block with the following schema:
 *
 * ```xml
 * <CreateBucketConfiguration>
 *   <LocationConstraint>us-vault</LocationConstraint>
 * </CreateBucketConfiguration>
 * ```
 *
 * A list of valid provisioning codes for `LocationConstraint` can be referenced in [the Storage Classes guide](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-classes#classes-locationconstraint).
 *
 * ## Create a new bucket with Key Protect or Hyper Protect Crypto Services managed encryption keys (SSE-KP)
 *
 * To create a bucket where the encryption keys are managed by Key Protect or Hyper Protect Crypto Services, it is necessary to have access to an active Key Protect or Hyper Protect Crypto Services service instance located in the same location as the new bucket.
 * This operation does not make use of operation specific query parameters.
 *
 * For more information on using Key Protect to manage your encryption keys, [see the documentation for Key Protect](https://cloud.ibm.com/docs/key-protect?topic=key-protect-getting-started-tutorial).
 *
 * For more information on Hyper Protect Crypto Services, [see the documentation](https://cloud.ibm.com/docs/hs-crypto?topic=hs-crypto-get-started).
 *
 * :::note
 * Note that managed encryption is **not** available in a Cross Region configuration and any SSE-KP buckets must be Regional.
 * :::
 *
 * @pathParam {string} bucketName
 * @headerParam {string} ibm-service-instance-id - This header references the service instance where the bucket will be created and to which data usage will be billed.
 * @headerParam {string} [ibm-sse-kp-encryption-algorithm] - This header is used to specify the algorithm and key size to use with the encryption key stored by using Key Protect. This value must be set to the string `AES256`.
 * @headerParam {string} [ibm-sse-kp-customer-root-key-crn] - This header is used to reference the specific root key used by Key Protect or Hyper Protect Crypto Services to encrypt this bucket. This value must be the full CRN of the root key.
 *
 * @bodyContent {CreateBucketConfiguration} text/plain
 *
 * @response 200 - ok
 */

/**
 * HEAD /{bucketName}
 * @tag Bucket operations
 * @summary Retrieve a bucket's headers
 * @description A `HEAD` issued to a bucket will return the headers for that bucket.
 *
 * @pathParam {string} bucketName
 *
 * @response 200 - ok
 */
