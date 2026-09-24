[**@template/types**](../README.md)

***

[@template/types](../README.md) / PresignedPostUploadRequest

# Interface: PresignedPostUploadRequest

Defined in: storage/requests.ts:11

Client request payload to generate an S3-compatible pre-signed direct upload ticket.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-mimetype"></a> `mimeType` | `string` | MIME type used to enforce Content-Type restrictions on the storage policy. | storage/requests.ts:16 |
| <a id="property-originalfilename"></a> `originalFilename?` | `string` | Original filename for auditing and extension preservation. | storage/requests.ts:19 |
| <a id="property-scope"></a> `scope` | [`StorageScope`](../type-aliases/StorageScope.md) | Target storage partition governing bucket path and byte quotas. | storage/requests.ts:13 |
