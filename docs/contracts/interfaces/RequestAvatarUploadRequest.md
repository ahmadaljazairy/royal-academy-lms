[**@template/types**](../README.md)

***

[@template/types](../README.md) / RequestAvatarUploadRequest

# Interface: RequestAvatarUploadRequest

Defined in: user/requests.ts:37

Request payload to initiate an avatar direct-upload sequence.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-mimetype"></a> `mimeType` | `string` | MIME type of the avatar image asset. Supported: `image/jpeg`, `image/png`, `image/webp`. | user/requests.ts:42 |
| <a id="property-originalfilename"></a> `originalFilename?` | `string` | Original filename on the client device for audit logging. | user/requests.ts:45 |
