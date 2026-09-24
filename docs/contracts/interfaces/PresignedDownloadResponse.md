[**@template/types**](../README.md)

***

[@template/types](../README.md) / PresignedDownloadResponse

# Interface: PresignedDownloadResponse

Defined in: storage/responses.ts:29

Response payload containing a time-limited pre-signed GET download URL.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-downloadurl"></a> `downloadUrl` | `string` | Authenticated temporary read URL. | storage/responses.ts:31 |
| <a id="property-expiresinseconds"></a> `expiresInSeconds` | `number` | Validity duration in seconds. | storage/responses.ts:34 |
