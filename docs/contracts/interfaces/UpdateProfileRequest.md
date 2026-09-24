[**@template/types**](../README.md)

***

[@template/types](../README.md) / UpdateProfileRequest

# Interface: UpdateProfileRequest

Defined in: user/requests.ts:11

Client request payload for updating profile metadata.
Partial fields support HTTP PATCH semantics.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-bio"></a> `bio?` | `string` | Extended Markdown-compatible biography or portfolio summary. | user/requests.ts:19 |
| <a id="property-displayname"></a> `displayName?` | `string` | Updated public display name. | user/requests.ts:13 |
| <a id="property-githuburl"></a> `githubUrl?` | `string` | Public GitHub profile URL or handle. | user/requests.ts:28 |
| <a id="property-headline"></a> `headline?` | `string` | Short professional headline or academic focus (max 120 chars). | user/requests.ts:16 |
| <a id="property-linkedinurl"></a> `linkedinUrl?` | `string` | Public LinkedIn profile URL. | user/requests.ts:31 |
| <a id="property-phonenumber"></a> `phoneNumber?` | `string` | Contact phone number in standardized format. | user/requests.ts:22 |
| <a id="property-websiteurl"></a> `websiteUrl?` | `string` | Fully qualified personal portfolio or organization website URL. | user/requests.ts:25 |
