[**@template/types**](../README.md)

***

[@template/types](../README.md) / ApiSuccessResponse

# Interface: ApiSuccessResponse\<T, M\>

Defined in: api/responses.ts:15

Standard HTTP success envelope returned by `TransformResponseInterceptor`.

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | - | The payload shape enclosed within `data`. |
| `M` | `Record`\<`string`, `unknown`\> | The metadata object shape (defaults to a generic dictionary). |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-data"></a> `data` | `T` | The primary serialized domain entity or payload. | api/responses.ts:26 |
| <a id="property-message"></a> `message` | `string` | Human-readable status description or confirmation message. | api/responses.ts:23 |
| <a id="property-meta"></a> `meta?` | `M` | Optional context-specific metadata (e.g., pagination, performance timers). | api/responses.ts:35 |
| <a id="property-statuscode"></a> `statusCode` | `number` | HTTP response status code (e.g., 200, 201, 204). | api/responses.ts:20 |
| <a id="property-success"></a> `success` | `true` | Discriminator confirming the request succeeded. | api/responses.ts:17 |
| <a id="property-timestamp"></a> `timestamp` | `string` | ISO 8601 formatted timestamp of when the response was serialized. | api/responses.ts:32 |
| <a id="property-traceid"></a> `traceId` | `string` | Unique distributed trace or correlation ID for end-to-end request tracing. | api/responses.ts:29 |
