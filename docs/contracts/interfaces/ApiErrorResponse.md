[**@template/types**](../README.md)

***

[@template/types](../README.md) / ApiErrorResponse

# Interface: ApiErrorResponse

Defined in: api/responses.ts:41

Standard HTTP error envelope returned by `AllExceptionsFilter`.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-data"></a> `data` | `null` | Explicitly nullified to maintain consistent JSON structural symmetry on error states. | api/responses.ts:55 |
| <a id="property-debugstack"></a> `debugStack?` | `string` | Diagnostic stack trace. Stripped automatically in production environments. | api/responses.ts:67 |
| <a id="property-error"></a> `error` | `string` | High-level HTTP error title or category (e.g., 'Not Found', 'Unauthorized'). | api/responses.ts:49 |
| <a id="property-message"></a> `message` | `string` \| `string`[] | Descriptive failure explanation or array of validation errors. | api/responses.ts:52 |
| <a id="property-statuscode"></a> `statusCode` | `number` | HTTP error status code (e.g., 400, 401, 403, 404, 500). | api/responses.ts:46 |
| <a id="property-success"></a> `success` | `false` | Discriminator confirming the operation failed. | api/responses.ts:43 |
| <a id="property-timestamp"></a> `timestamp` | `string` | ISO 8601 formatted timestamp of when the error occurred. | api/responses.ts:61 |
| <a id="property-traceid"></a> `traceId` | `string` | Correlation trace ID matching server audit logs for incident reporting. | api/responses.ts:58 |
