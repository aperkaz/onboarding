# Campaign Information API documentation

---

## /campaigns

### /campaigns

#### **GET**:

###### Query parameters

| Name | Type | Description | Required | Examples |
|:-----|:----:|:------------|:--------:|---------:|
| campaignId | string |  | true | 
| status | string |  | true | 
| campaignType | string |  | true | 

### Response code: 200

#### application/json (application/json) 

```
[{
  "campaignId" : "1",
  "campaignType" : "SupplierOnboarding",
  "description" : "asd",
  "endsOn" : "2017-02-28T00:00:00.000Z",
  "owner" : "john.doe@ncc.com",
  "startsOn" : "2017-03-08T00:00:00.000Z",
  "status" : "new"
},{
  "campaignId" : "2",
  "campaignType" : "SupplierOnboarding",
  "description" : "Campaign for documenttaion",
  "endsOn" : "2017-02-28T00:00:00.000Z",
  "owner" : "john.doe@ncc.com",
  "startsOn" : "2017-03-08T00:00:00.000Z",
  "status" : "inprogress"
}]
 ```

| Name | Type | Description | Required | Pattern |
|:-----|:----:|:------------|:--------:|--------:|

---
#### **POST**:
To create new campaign.

###### Headers

| Name | Type | Description | Required | Examples |
|:-----|:----:|:------------|:--------:|---------:|
| Accept-Language | string | Header containing a sorted list of accepted languages. | false | ``` de, en-gb;q=0.8, en;q=0.7 ``` 

#### application/json (application/json) 

```
{
  "campaignId" : "asd",
  "campaignType" : "SupplierOnboarding",
  "description" : "asd",
  "endsOn" : "2017-02-28T00:00:00.000Z",
  "owner" : "john.doe@ncc.com",
  "startsOn" : "2017-03-08T00:00:00.000Z",
  "status" : "new"
}
 ```

| Name | Type | Description | Required | Pattern |
|:-----|:----:|:------------|:--------:|--------:|

### Response code: 201

#### application/json (application/json) 

```
{
  "message" : "Not found",
  "campaignId" : "asd",
  "campaignType" : "SupplierOnboarding",
  "description" : "asd",
  "endsOn" : "2017-02-28T00:00:00.000Z",
  "owner" : "john.doe@ncc.com",
  "startsOn" : "2017-03-08T00:00:00.000Z",
  "status" : "new"
}
 ```

| Name | Type | Description | Required | Pattern |
|:-----|:----:|:------------|:--------:|--------:|

---

### /campaigns/campaignId
Type: string
Pattern: \w{3}
Required: true

#### **GET**:
Single Campaign Object

###### Headers

| Name | Type | Description | Required | Examples |
|:-----|:----:|:------------|:--------:|---------:|
| Accept-Language | string | Header containing a sorted list of accepted languages. | false | ``` de, en-gb;q=0.8, en;q=0.7 ``` 

### Response code: 200

#### application/json (application/json) 

```
{
  "campaignId": "2344",
  "description": "Camapaign description",
  "startsOn": 12/03/2017,
  "endsOn": "15/03/2017",
  "status": "complete",
  "campaignType": 'SupplierOnboarding',
  "owner": 'john',
  "companyId": 'xyz'
}
 ```

| Name | Type | Description | Required | Pattern |
|:-----|:----:|:------------|:--------:|--------:|

### Response code: 404

#### application/json (application/json) 

```
{
  "message" : "Not found"
}
 ```

| Name | Type | Description | Required | Pattern |
|:-----|:----:|:------------|:--------:|--------:|

---

### /campaigns/{campaignId}

* **campaignId**: 
    * Type: string
    
    * Required: true

#### **DELETE**:
To delete camapign by ID.

###### Headers

| Name | Type | Description | Required | Examples |
|:-----|:----:|:------------|:--------:|---------:|
| Accept-Language | string | Header containing a sorted list of accepted languages. | false | ``` de, en-gb;q=0.8, en;q=0.7 ``` 

### Response code: 200

#### application/json (application/json) 

```
{}
 ```

| Name | Type | Description | Required | Pattern |
|:-----|:----:|:------------|:--------:|--------:|

---
#### **PUT**:
To update campaign by campaignId.

###### Headers

| Name | Type | Description | Required | Examples |
|:-----|:----:|:------------|:--------:|---------:|
| Accept-Language | string | Header containing a sorted list of accepted languages. | false | ``` de, en-gb;q=0.8, en;q=0.7 ``` 

#### application/json (application/json) 

```
{
  "campaignId": "2344",
  "description": "Updated Camapaign description",
  "startsOn": "12/03/2017",
  "endsOn": "15/03/2017",
  "status": "complete",
  "campaignType": "SupplierOnboarding",
  "owner": "john",
  "companyId": "xyz"
} ```

| Name | Type | Description | Required | Pattern |
|:-----|:----:|:------------|:--------:|--------:|

### Response code: 200

#### application/json (application/json) 

```
{
  "campaignId": "2344",
  "description": "Updated Camapaign description",
  "startsOn": "12/03/2017",
  "endsOn": "15/03/2017",
  "status": "complete",
  "campaignType": "SupplierOnboarding",
  "owner": "john",
  "companyId": "xyz"
} ```

| Name | Type | Description | Required | Pattern |
|:-----|:----:|:------------|:--------:|--------:|

---

