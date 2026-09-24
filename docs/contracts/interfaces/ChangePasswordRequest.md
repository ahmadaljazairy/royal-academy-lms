[**@template/types**](../README.md)

***

[@template/types](../README.md) / ChangePasswordRequest

# Interface: ChangePasswordRequest

Defined in: user/requests.ts:59

Request payload for self-service password changes.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-currentpassword"></a> `currentPassword` | `string` | Current plaintext password for credential re-verification. | user/requests.ts:61 |
| <a id="property-newpassword"></a> `newPassword` | `string` | New plaintext password meeting complexity rules. | user/requests.ts:64 |
