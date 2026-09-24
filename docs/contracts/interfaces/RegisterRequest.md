[**@template/types**](../README.md)

***

[@template/types](../README.md) / RegisterRequest

# Interface: RegisterRequest

Defined in: auth/requests.ts:10

Client request payload for self-service user registration.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-displayname"></a> `displayName` | `string` | Public display name or real name. | auth/requests.ts:18 |
| <a id="property-email"></a> `email` | `string` | Valid email format required for authentication. | auth/requests.ts:12 |
| <a id="property-password"></a> `password` | `string` | Raw plaintext password meeting platform complexity requirements. | auth/requests.ts:15 |
| <a id="property-termsaccepted"></a> `termsAccepted` | `boolean` | Explicit legal acknowledgment of the Terms of Service and Privacy Policy. | auth/requests.ts:21 |
