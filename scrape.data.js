const QUERY_OBJECT = {
  address: { sel: '.backend_data' },
  imageUrl: { sel: '#carousel .image-gallery .item .first-img', attr: 'src' },
  price: { sel: '.details_info_price > .price' },
  neighborhood: { sel: '.details:first > .details_info:last > span > a' },
  unitType: { sel: '.details:first > .details_info:last > span:first' },
  sqft: { sel: '.details:first > .details_info > span.first_detail_cell' },
  rooms: { sel: '.details:first > .details_info > span:nth-child(3)' },
  bedrooms: { sel: '.details:first > .details_info > span:nth-child(4)' },
  bathrooms: { sel: '.details:first > .details_info > span:nth-child(5)' },
}

const cleanAddress = function (dirtyString) {
  return dirtyString.replace(/(\r\n|\n|\r|(  ))/gm, "").trim();
};

const cleanPrice = function (dirtyString) {
  cleanerString = dirtyString.replace('for rent', '');
  cleanerString = cleanerString.replace(/(\r\n|\n|\r|(  ))/gm, "").trim();
  cleanerString = cleanerString.replace('↓$', '');
  cleanerString = cleanerString.replace('↑$', '');
  cleanerString = cleanerString.replace(',', '');
  const value = parseInt(cleanerString, 10);
  return value;
};

const cleanSqft = function (dirtyString) {
  return parseInt(dirtyString.replace(' ft²', '').replace(',', ''), 10);
};

const cleanRooms = function (dirtyString) {
  const clearString = dirtyString ? dirtyString.replace('rooms', '').trim() : '';
  return parseInt(clearString, 10);
};

const cleanBedrooms = function (dirtyString) {
  const clearString = dirtyString ? dirtyString.replace('beds', '').replace('bed', '').trim() : '';
  return parseInt(clearString, 10);
};

const cleanBathrooms = function (dirtyString) {
  const clearString = dirtyString ? dirtyString.replace('baths', '').replace('bath', '').trim() : '';
  console.log('Bathrooms: ', clearString);
  return parseFloat(clearString);
};

function scapPageByQuery(queryObject) {
  let scapObject = {};
  if (queryObject) {
    Object.keys(queryObject).forEach((paramKey) => {
      const selector = queryObject[paramKey].sel;
      const attribute = queryObject[paramKey].attr;
      if (!attribute) {
        scapObject[paramKey] = $(selector).first().text();
      } else {
        scapObject[paramKey] = $(selector).first().attr(attribute);
      }
    });
  }

  return scapObject;
}

function cleanupResult(scrapeResult) {
  const result = {
    'URI': document.location.toString(),
    'Unit Type': scrapeResult.unitType,
    'Price': cleanPrice(scrapeResult.price),
    'Status': '',
    'Neighborhood': scrapeResult.neighborhood,
    'Level One Area': '',
    'Level Two Area': '',
    'Address': cleanAddress(scrapeResult.address),
    'Unit': '',
    'City': '',
    'ZIP': '',
    'State': '',
    'Building': '',
    'Sqft': cleanSqft(scrapeResult.sqft),
    'Bedrooms': cleanBedrooms(scrapeResult.bedrooms),
    'Baths': cleanBathrooms(scrapeResult.bathrooms),
    'Total Rooms': cleanRooms(scrapeResult.rooms),
    'Maintenance': '',
    'Taxes': '',
    'Created At': '',
    'Closed At': '',
    'Days on Market': '',
    'Source': '',
    'Listing Agent Names': '',
    'Closing Price': '',
    'Tax Abatement Type': '',
    'Tax Abatement Expiration': '',
    imageUrl: scrapeResult.imageUrl
  };

  return result;
}



function test() {
  //$('.Container').css('background-color', 'red');
  console.log('test runned!!!');

  const url = window.location.href;
  const postedData = {};
  const scrapedData = scapPageByQuery(QUERY_OBJECT);
  const data = cleanupResult(scrapedData);
  postedData[url] = data;
  chrome.storage.sync.set(postedData);

  console.log('Posted data', postedData);
}


test();
