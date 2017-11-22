(($) => {
  const selectors = {
    address: { sel: '.backend_data' },
    imageUrl: { sel: '#carousel .image-gallery .item .first-img', attr: 'src' },
    price: { sel: '.details_info_price > .price' },
    neighborhood: { sel: '.details:first > .details_info:last > span > a' },
    unitType: { sel: '.details:first > .details_info:last > span:first' },
    sqft: { sel: '.details:first > .details_info > span.first_detail_cell' },
    rooms: { sel: '.details:first > .details_info > span:nth-child(3)' },
    bedrooms: { sel: '.details:first > .details_info > span:nth-child(4)' },
    bathrooms: { sel: '.details:first > .details_info > span:nth-child(5)' },
  };

  const scrapePage = () => {
    const scrapeResult = {};
    Object.keys(selectors).forEach((key) => {
      const selector = selectors[key];
      if (selector.attr) {
        scrapeResult[key] = $(selector.sel).attr(selector.attr);
      } else {
        scrapeResult[key] = $(selector.sel).text();
      }
    });
    return scrapeResult;
  };

  const cleanAddress = function (dirtyString) {
    return dirtyString.replace(/(\r\n|\n|\r|(  ))/gm, "").trim();
  };

  const cleanIntNumber = function (dirtyString) {
    const filterNumbersDotsAndCommas = (str) => str.replace(/[^\d.,]/g, '');
    const filterNumbers = (str) => str.replace(/[^\d]/g, '');

    const trimmedString = filterNumbersDotsAndCommas(dirtyString);
    const numberString = filterNumbers(trimmedString);

    return Number(numberString);
  };

  const loadToServer = (result) => {
    console.log(result);
  };
  const init = function () {
    const scrapeResult = scrapePage();

    const result = {
      url: document.location.toString(),
      unitType: scrapeResult.unitType,
      price: cleanIntNumber(scrapeResult.price),
      neighborhood: scrapeResult.neighborhood,
      address: cleanAddress(scrapeResult.address),
      sqft: cleanIntNumber(scrapeResult.sqft),
      bedrooms: cleanIntNumber(scrapeResult.bedrooms),
      bathrooms: cleanIntNumber(scrapeResult.bathrooms),
      rooms: cleanIntNumber(scrapeResult.rooms),
      imageUrl: scrapeResult.imageUrl
    };

    loadToServer(result);
  };

  init();
})(jQuery);