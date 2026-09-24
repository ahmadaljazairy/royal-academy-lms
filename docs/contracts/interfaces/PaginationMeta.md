[**@template/types**](../README.md)

***

[@template/types](../README.md) / PaginationMeta

# Interface: PaginationMeta

Defined in: api/models.ts:10

Standard pagination metadata supplied when listing collection resources.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="property-hasnextpage"></a> `hasNextPage` | `boolean` | Indicates whether a subsequent page of records exists. | api/models.ts:24 |
| <a id="property-haspreviouspage"></a> `hasPreviousPage` | `boolean` | Indicates whether an antecedent page of records exists. | api/models.ts:27 |
| <a id="property-limit"></a> `limit` | `number` | Maximum number of records requested per page. | api/models.ts:15 |
| <a id="property-page"></a> `page` | `number` | Current 1-based page index. | api/models.ts:12 |
| <a id="property-totalitems"></a> `totalItems` | `number` | Total count of records matching the query criteria across the entire dataset. | api/models.ts:18 |
| <a id="property-totalpages"></a> `totalPages` | `number` | Total number of pages calculated as `Math.ceil(totalItems / limit)`. | api/models.ts:21 |
