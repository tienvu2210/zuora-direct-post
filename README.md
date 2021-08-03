Local webapp demo that shows how to use Zuora HPM to create a new PaymentMethod and pay Invoices

## Installation

```sh
npm install
```
## Setup
Create a `.env` file in the root of the project and supply the following values

```
ZUORA_CLIENT_ID='<Client ID of your OAuth Client>'
ZUORA_CLIENT_SECRET='<Client Secret of your OAuth Client>'
ZUORA_ACCOUNT_ID='<Zuora Account ID GUID>'
ZUORA_HPM_PAGE_ID='<Zuora HPM ID GUID>'
ZUORA_GATEWAY_NAME='<Gateway Name used by ZUORA_HPM_PAGE_ID>'
```
## Usage
```sh
node webapp.js
```

**Main Page**
* http://localhost:8080/

**Backend Endpoints**
* http://localhost:8080/api/invoices
* http://localhost:8080/api/hpmParams
