const synonyms = {
  customerSupplierId: ['Supplier', 'SupplierId', 'SupplierNumber', 'CustomerSupplierId', 'Lieferant', 'Kreditor'],
  email: ['email', 'mail', 'contactEmail', 'campaignContactEmail','email-adresse', 'EmailAddress', 'E-Mail', 'E-Mail-Adresse'],
  companyName: ['companyName', 'campaignContactCompany', 'company', 'company Name', 'supplier', 'supplier name', 'Firmenname', 'Firma','Lieferant', 'Name'],
  contactFirstName: ['firstName', 'name', 'First Name', 'Vorname'],
  contactLastName: ['lastName', 'last name', 'surname', 'Nachname'],
  address: ['address', 'street address', 'street', 'Adresse', 'Straße'],
  telephone: ['telephone', 'phone', 'contactTelephone', 'campaignContactTelephone', 'phoneNumber','Telefon', 'Telefon-Nr', 'Telefonnummer'],
  cell: ['cell', 'contactCell', 'campaignContactCell', 'cellPhone', 'cell phone','Handy','Mobiltelefon', 'Handy-Nr.', 'Mobiltel.-Nr.'],
  dunsNo: ['dunsNo','duns no', 'duns number', 'duns-number', 'd-u-n-s no', 'D-U-N-S', 'DUNS', 'D-U-N-S Nr', 'DUNS-Nummer', 'DUNS-Nr'],
  zipCode: ['zipCode', 'PostalCode', 'PostCode', 'PLZ', 'Postleitzahl'],
  city: ['city', 'Stadt', 'Ort'],
  pobox: ['PoBox', 'PostOfficeBox', 'Postfach', 'Postschließfach'],
  country: ['country', 'state', 'countryCode', 'Land', 'Staat'],
  commercialRegisterNo: ['register number', 'commercial registration no', 'commercial registration', 'commercial registration number', 'HandelsregisterNr', 'Handelsregister Nr', 'Handelsregister Nummer'],
  taxIdentNo: ['tax identification number', 'tax identification no', 'tax no', 'tax ident no','Steuernummer', 'Steuer-Identifikationsnummer'],
  vatIdentNo: ['vatIdentNo', 'vat id', 'vat ident no', 'vat id no', 'vat id number', 'VATRegistrationNumber', 'Ust-Nr', 'Umsatzsteuer-Id.Nr' ,'Mwst.-Nr.','Ust.-Nr.']
};

module.exports = function(fieldName)
{
    const lowerField = fieldName.toLowerCase();

    for(let key in synonyms)
    {
        const list = synonyms[key];

        for(let i in list)
        {
            if(list[i].toLowerCase() === lowerField)
                return key;
        }
    }

    return null;
}

module.exports.synonyms = synonyms;
