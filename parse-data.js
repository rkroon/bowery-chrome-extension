(($, document) => {
  const getSelectors = () => {
    const staticSelectors = {
      unit: {
        sel: '.building-title .incognito',
        parse: value => cleanUnit(value),
      },
      address: {
        sel: '.backend_data > .subtitle',
        parse: value => cleanAddress(value),
      },
      zip: {
        sel: '.backend_data',
        parse: value => getZip(value),
      },
      photos: {
        sel: '.image-gallery > li.item.photo.lslide',
        multi: true,
        attr: 'data-original',
        parse: value => value,
      },
      rent: {
        sel: '.details_info_price > .price',
        parse: value => cleanIntNumber(value),
      },
      neighborhood: {
        sel: '.details:first > .details_info > span.nobreak > a',
        parse: value => value,
      },
      unitType: {
        sel: '.details:first > .details_info > span.nobreak:first',
        parse: value => value,
      },

    };
    const detailsSelector = {
      sel: '.details:first > .details_info > span',
      fields: {
        sqft: { test: /ft/, parse: value => cleanIntNumber(value) },
        rooms: { test: /room/, parse: value => cleanIntNumber(value) },
        bedrooms: {
          testArray: [
            { test: /bed/, parse: value => cleanIntNumber(value) },
            { test: /studio/, parse: value => 0 },
          ],
        },
        bathrooms: { test: /bath/, parse: value => cleanIntNumber(value) },
      },
    };

    return { staticSelectors, detailsSelector };
  };

  const cleanUnit = function (dirtyString) {
    const cleanString = dirtyString.replace(/(\r\n|\n|\r|(  ))/gm, "").trim();
    const parts = cleanString.split('#');
    if (parts[1]) {
      return '#' + parts[1];
    }
  };
  const cleanAddress = function (dirtyString) {
    return dirtyString.replace(/(\r\n|\n|\r|(  ))/gm, "").trim();
  };
  const getZip = function (dirtyString) {
    const cleanString = dirtyString.replace(/(\r\n|\n|\r|(  ))/gm, "").trim();
    let zip;
    cleanString.split(' ').forEach((item) => {
      if (Number(item)) {
        zip = Number(item);
      }
    });
    return zip;
  };

  const cleanIntNumber = function (dirtyString) {
    const filterNumbersDotsAndCommas = str => str.replace(/[^\d.,]/g, '');
    const filterNumbers = str => str.replace(/[^\d.]/g, '');

    const trimmedString = filterNumbersDotsAndCommas(dirtyString);
    const numberString = filterNumbers(trimmedString);

    return Number(numberString);
  };

  const scrapePage = () => {
    const selectors = getSelectors();
    const scrapeResult = {};
    Object.keys(selectors.staticSelectors).forEach((key) => {
      const selector = selectors.staticSelectors[key];
      let value;
      if (selector.multi) {
        const valuesArr = [];
        $(selector.sel).each(function () {
          valuesArr.push($(this).attr(selector.attr));
        });
        value = valuesArr;
      } else if (selector.attr) {
        value = $(selector.sel).attr(selector.attr);
      } else {
        value = $(selector.sel).text();
      }

      scrapeResult[key] = selector.parse(value);
    });
    $(selectors.detailsSelector.sel).each(function (i, value) {
      const item = $(value).text();
      const fields = selectors.detailsSelector.fields;
      Object.keys(fields).forEach((key) => {
        if (!scrapeResult[key]) {
          const testArray = fields[key].testArray;
          if (!testArray) {
            const test = fields[key].test;
            const parse = fields[key].parse;
            if (test.test(item)) {
              scrapeResult[key] = parse(item);
            }
          } else {
            testArray.forEach((arrayItem) => {
              if (!scrapeResult[key]) {
                if (arrayItem.test.test(item)) {
                  scrapeResult[key] = arrayItem.parse(item);
                }
              }
            });
          }
        }
      });
    });

    scrapeResult.url = document.location.toString();

    findDataLayer();
    if (dataLayer && dataLayer[0]) {
      const compData = dataLayer[0];
      // Get Info from Global variable dataLayer
      scrapeResult.borough = compData.listBoro;
      scrapeResult.coords = {};
      scrapeResult.coords.latitude = compData.listGeoLat;
      scrapeResult.coords.longitude = compData.listGeoLon;
      scrapeResult.agent = compData.listAgent;
      scrapeResult.amenities = compData.listAmen.split('|');
    }
    return scrapeResult;
  };

  const findDataLayer = () => {
    const dataLayerScript = Array.prototype.find.call($('script'), (script) => {
      return script.text.includes('dataLayer = [');
    });
    if (dataLayerScript) {
      eval(dataLayerScript.text);
    }
  };

  const init = function () {
    const result = scrapePage();
    chrome.extension.sendRequest(result);
  };

  init();
})(jQuery, document);
