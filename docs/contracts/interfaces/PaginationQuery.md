[**@template/types**](../README.md)

***

[@template/types](../README.md) / PaginationQuery

# Interface: PaginationQuery

Defined in: api/requests.ts:13

Standard query parameters for paginated list endpoints.
Consumed by query DTOs and URL query string parsers.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-limit"></a> `limit?` | `number` | Maximum records to retrieve per page. **Default** `10` | api/requests.ts:24 |
| <a id="property-page"></a> `page?` | `number` | 1-based page number to retrieve. **Default** `1` | api/requests.ts:18 |
| <a id="property-sortby"></a> `sortBy?` | `string` | Property/column name to sort results by. | api/requests.ts:27 |
| <a id="property-sortorder"></a> `sortOrder?` | [`SortOrder`](../type-aliases/SortOrder.md) | Sort direction. **Default** `'desc'` | api/requests.ts:33 |
