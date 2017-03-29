# Entities

* [Campaign](#campaign)

## Campaign
Data model representing Campaign information.

##### Attributes

| Name | Type | Attributes | Key Target | Description |
|------|:----:|:----------:|:----------:|------------:|
| campaignId | STRING(30) | PK, NN |  | ISO 3166-1 alpha2 campaign code. |
| description | STRING(50) |  |  | Campaign description. |
| startsOn | DATE() |  |  | Camapign Start Date. |
| endsOn | DATE() |  |  | Campaign end date. |
| status | STRING(30) | NN |  | Current status of Campaign. |
| campaignType | STRING(30) | NN |  | Type of Camapign. |
| owner | STRING(30) |  |  | Owner of Campaign. |
| companyId | STRING(30) |  |  | ISO 3166-1 company code. |

