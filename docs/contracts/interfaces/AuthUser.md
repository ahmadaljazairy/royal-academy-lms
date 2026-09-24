[**@template/types**](../README.md)

***

[@template/types](../README.md) / AuthUser

# Interface: AuthUser

Defined in: user/models.ts:20

Public, sanitized identity representation.
Excludes sensitive credentials such as password hashes.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-displayname"></a> `displayName` | `string` | Full display name shown across platform surfaces. | user/models.ts:28 |
| <a id="property-email"></a> `email` | `string` | Primary verified or pending email address. | user/models.ts:25 |
| <a id="property-id"></a> `id` | `string` | Unique user identifier (CUID). | user/models.ts:22 |
| <a id="property-isemailverified"></a> `isEmailVerified` | `boolean` | Verification flag confirming email ownership. | user/models.ts:34 |
| <a id="property-role"></a> `role` | [`Role`](../type-aliases/Role.md) | System authorization role. | user/models.ts:31 |
