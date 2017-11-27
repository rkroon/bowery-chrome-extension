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
      imageUrl: {
        sel: '#carousel .image-gallery .item .first-img',
        attr: 'src',
        parse: value => value,
      },
      price: {
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
      if (selector.attr) {
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
    return scrapeResult;
  };

  const init = function () {
    const result = scrapePage();
    chrome.extension.sendRequest(result);
  };

  init();
})(jQuery, document);