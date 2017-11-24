(($, document) => {
  const getSelectors = () => {
    const staticSelectors = {
      address: {
        sel: '.backend_data',
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
        sel: '.details:first > .details_info:last > span > a',
        parse: value => value,
      },
      unitType: {
        sel: '.details:first > .details_info:last > span:first',
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

  const loadToServer = (result) => {
    const POST_DATA_URL = 'http://localhost:8080/api/rent-comparables/upload/extension';
    console.log(result);

    $.ajax({
      type: "POST",
      url: POST_DATA_URL,
      data: result,
    })
      .done((data, status) => {
        console.log("Status", status);
        if (data.error) {
          console.log('Error occured, mesage:');
          console.log(data.message);
        } else {
          console.log('Data was saved, saved item:');
          console.log(data.saved);
        }
      })
      .fail((jqXHR, status, errorThrown) => {
        console.error('Error:', status);
        console.error('Thrown:', errorThrown);
      });
  };
  const init = function () {
    const result = scrapePage();

    loadToServer(result);
  };

  init();
})(jQuery, document);