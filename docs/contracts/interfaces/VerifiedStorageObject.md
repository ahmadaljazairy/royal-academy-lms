[**@template/types**](../README.md)

***

[@template/types](../README.md) / VerifiedStorageObject

# Interface: VerifiedStorageObject

Defined in: storage/models.ts:34

Metadata retrieved from object storage after performing a `headObject` verification.
Confirms an asset exists and meets bounds before storing references in PostgreSQL.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-filekey"></a> `fileKey` | `string` | Object path inside the target bucket. | storage/models.ts:36 |
| <a id="property-mimetype"></a> `mimeType` | `string` | Standardized MIME type confirmed by the storage provider. | storage/models.ts:45 |
| <a id="property-publicurl"></a> `publicUrl` | `string` | Fully qualified public CDN or internal URI. | storage/models.ts:39 |
| <a id="property-sizebytes"></a> `sizeBytes` | `number` | Physical byte size of the binary payload. | storage/models.ts:42 |
