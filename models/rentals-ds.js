var rentals = [
    {
      headline: "Luxury High End House",
      numSleeps: 2,
      numBedrooms: 1,
      numBathrooms: 1,
      pricePerNight: 125.99,
      city: "Scugog",
      province: "Ontario",
      imageUrl: "/images/rental1.jpg",
      featuredRental: true,
    },
    {
      headline: "Yellow Ambience with pool",
      numSleeps: 2,
      numBedrooms: 1,
      numBathrooms: 1,
      pricePerNight: 125.99,
      city: "Scugog",
      province: "Ontario",
      imageUrl: "./images/rental2.jpg",
      featuredRental: true,
    },
    {
      headline: "Classic House with Garden",
      numSleeps: 2,
      numBedrooms: 1,
      numBathrooms: 1,
      pricePerNight: 125.99,
      city: "Scugog",
      province: "Ontario",
      imageUrl: "./images/rentalSecond.jpg",
      featuredRental: true,
    },
    {
      headline: "Cozy Lakefront Log Cabin",
      numSleeps: 2,
      numBedrooms: 1,
      numBathrooms: 1,
      pricePerNight: 125.99,
      city: "Scugog",
      province: "Ontario",
      imageUrl: "./images/rentalSmall.jpg",
      featuredRental: false,
    },
    {
      headline: "Log Cabin",
      numSleeps: 2,
      numBedrooms: 1,
      numBathrooms: 1,
      pricePerNight: 125.99,
      city: "Toronto",
      province: "Ontario",
      imageUrl: "./images/4rental.jpg",
      featuredRental: false,
    },
    {
      headline: "Cozy Cabin",
      numSleeps: 2,
      numBedrooms: 1,
      numBathrooms: 1,
      pricePerNight: 125.99,
      city: "Toronto",
      province: "Ontario",
      imageUrl: "./images/3rdrental.jpg",
      featuredRental: false,
    }
  ];
  
  module.exports.getFeaturedRentals = function () {
    var filteredArr = [];
    for (let i = 0; i < rentals.length; i++) {
      if (rentals[i].featuredRental) {
        filteredArr.push(rentals[i]);
      }
    }
    return filteredArr;
  };
  
  var tempArr;
  
  module.exports.getRentalsByCityAndProvince = function () {
    tempArr = [];
    var keepOn = true;
  
    for (let i = 0; i < rentals.length; i++) {
      let emptyArr = [];
      var tempObj = {};
      var x = rentals[i].city + "," + rentals[i].province;
      tempObj.cityProvince = x;
      keepOn = true;
  
      if (tempArr.length == 0){
          for (var k = 0; k < rentals.length; k++){
              if (rentals[i].city == rentals[k].city &&
               rentals[i].province == rentals[k].province)
               emptyArr.push(rentals[k]);
           }
           tempObj.rentals = emptyArr;
           tempArr.push(tempObj);
      }
  
      for (let j = 0; (j < tempArr.length) && keepOn == true; j++) {
        if (
          tempArr.length != 0 && (rentals[i].city == tempArr[j].rentals[0].city &&
          rentals[i].province == tempArr[j].rentals[0].province)
        ) {
          keepOn = false;
        }
      }
        if (keepOn && tempArr.length != 0) {
          for (var k = 0; k < rentals.length; k++){
             if (rentals[i].city == rentals[k].city &&
              rentals[i].province == rentals[k].province)
              emptyArr.push(rentals[k]);
          }
          tempObj.rentals = emptyArr;
          tempArr.push(tempObj);
        }
      }
      return tempArr;
    };