# Entities

* [CampaignContact](#campaigncontact)

## CampaignContact
Data model representing information of Campaign Contact.

##### Attributes

| Name | Type | Attributes | Key Target | Description |
|------|:----:|:----------:|:----------:|------------:|
| id | BIGINT() | PK, AI, NN |  | ISO 3166-1 alpha2 campaign code. |
| email | STRING(30) | NN |  | Contact&#39;s email address. |
| campaignId | STRING(30) | NN |  | ISO 3166-1 alpha2 Contacts Campaign code. |
| status | STRING(30) |  |  | Contact&#39;s tansition status. |
| companyName | STRING(30) | NN |  | Contact&#39;s company Name. |
| contactFirstName | STRING(30) | NN |  | First name of contact. |
| contactLastName | STRING(30) | NN |  | Last name of contact. |
| address | STRING(30) |  |  | Constacts address. |
| dunsNo | STRING(30) |  |  | ISO 3166-1 alpha2 campaign code. |
| telephone | STRING(30) |  |  | Contacts phone number. |
| cell | STRING(30) |  |  | cell. |
| supplierId | STRING(30) |  |  | ISO 3166-1 alpha2 supplier code. |
| city | STRING(30) |  |  | Contacts city name. |
| country | STRING(30) |  |  | Contact&#39;s country code. |
| commercialRegisterNo | STRING(30) |  |  | Commercial Registerartion number. |
| taxIdentNo | STRING(30) |  |  | Tax identification number. |
| vatIdentNo | STRING(30) |  |  | vat Identification nuber. |
| lastStatusChange | DATE() |  |  | Last transition status update time. |

