[**@template/types**](../README.md)

***

[@template/types](../README.md) / PresignedPostUploadResponse

# Interface: PresignedPostUploadResponse

Defined in: storage/responses.ts:9

Pre-signed POST direct-upload ticket payload returned to clients.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-bucket"></a> `bucket` | `string` | Destination storage bucket name. | storage/responses.ts:20 |
| <a id="property-expiresinseconds"></a> `expiresInSeconds` | `number` | Window of validity for the presigned signature (in seconds). | storage/responses.ts:23 |
| <a id="property-fields"></a> `fields` | `Record`\<`string`, `string`\> | Form fields and policy signatures (policy, x-amz-signature, etc.). | storage/responses.ts:14 |
| <a id="property-filekey"></a> `fileKey` | `string` | Storage object key where the uploaded file will reside. | storage/responses.ts:17 |
| <a id="property-uploadurl"></a> `uploadUrl` | `string` | Target bucket endpoint where the multipart form upload must be submitted. | storage/responses.ts:11 |
