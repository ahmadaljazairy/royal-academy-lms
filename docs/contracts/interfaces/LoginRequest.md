[**@template/types**](../README.md)

***

[@template/types](../README.md) / LoginRequest

# Interface: LoginRequest

Defined in: auth/requests.ts:30

Client request payload for session authentication.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-email"></a> `email` | `string` | Registered user email address. | auth/requests.ts:32 |
| <a id="property-password"></a> `password` | `string` | Account password. | auth/requests.ts:35 |
| <a id="property-rememberme"></a> `rememberMe?` | `boolean` | Extends the session TTL (e.g., 30 days vs standard 24-hour session). **Default** `false` | auth/requests.ts:41 |
