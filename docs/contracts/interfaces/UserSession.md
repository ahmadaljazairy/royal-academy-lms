[**@template/types**](../README.md)

***

[@template/types](../README.md) / UserSession

# Interface: UserSession

Defined in: auth/models.ts:13

Stateful session payload stored in Redis and bound to an HTTP session cookie.
Contains minimal identity data required to authenticate incoming requests without a database hit.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-createdat"></a> `createdAt` | `number` | Epoch timestamp in milliseconds indicating when the session was initialized. | auth/models.ts:24 |
| <a id="property-email"></a> `email` | `string` | Primary user email address. | auth/models.ts:18 |
| <a id="property-isemailverified"></a> `isEmailVerified` | `boolean` | Cached verification status to quickly guard email-restricted routes. | auth/models.ts:27 |
| <a id="property-role"></a> `role` | [`Role`](../type-aliases/Role.md) | Access control tier for immediate guard-level evaluation. | auth/models.ts:21 |
| <a id="property-userid"></a> `userId` | `string` | Owning user identifier (CUID). | auth/models.ts:15 |
