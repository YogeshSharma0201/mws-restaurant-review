/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get RESTAURANT_URL() {
    const port = 1337; // Change this to your server port
    return `http://ec2-3-218-93-91.compute-1.amazonaws.com:1337/restaurants`;
  }

  static get RESTAURANT_REVIEWS_URL() {
    const port = 1337; // Change this to your server port
    return `http://ec2-3-218-93-91.compute-1.amazonaws.com:1337/reviews`;
  }

  /**
   * Fetch from idb or network
   */
  static fetchRestaurantsFromIdb(callback) {
    let dbPromise = idb.open('restaurants', 1, function (upgradeDB) {
      let restuarantStore = upgradeDB.createObjectStore('restaurants', {
        keyPath: 'id'
      });
    });

    dbPromise.then(function (db) {
      let tx = db.transaction('restaurants');
      let keyValStore = tx.objectStore('restaurants');
      return keyValStore.getAll();
    }).then(function (val) {
      // console.log(val);
      if(val.length !== 0)
        callback(null, val);
      else throw "no value stored";
    }).catch( (err) => {
      console.log(err);
      // DBHelper.fetchRestaurantsFromNetwork(callback);
    });
  }

  /**
   * Fetch all restaurants from network.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.RESTAURANT_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        let Restaurants = json;
        Restaurants = Restaurants.map(async (restaurant) => {
          let reviewsPromise = await fetch(`${DBHelper.RESTAURANT_REVIEWS_URL}/?restaurant_id=${restaurant.id}`);
          let reviews = await reviewsPromise.json();
          // console.log(reviews);
          const id = restaurant.id;
          return {
            ...restaurant,
            reviews: reviews,
            photograph: `${id}-300.jpg`,
            srcset_index: `img/${id}-300.jpg 1x, img/${id}-600_2x.jpg 2x`,
            srcset_restaurant: `img/${id}-300.jpg 300w, img/${id}-400.jpg 400w, img/${id}-600_2x.jpg 600w, img/${id}-800_2x.jpg 800w`
          };
        });

        Promise.all(Restaurants).then((restaurants)=>{
          // console.log(restaurants);

          // let dbPromise = idb.open('restaurants', 1);
          let dbPromise = idb.open('restaurants', 1, function (upgradeDB) {
            let restuarantStore = upgradeDB.createObjectStore('restaurants', {
              keyPath: 'id'
            });
          });

          dbPromise.then(function (db) {
            let tx = db.transaction('restaurants', 'readwrite');
            let keyValStore = tx.objectStore('restaurants');
            // keyValStore.put('foo', 'bar');
            restaurants.forEach((restaurant) => {
              keyValStore.put(restaurant);
            });
            return tx.complete;
          }).then(function () {
            console.log('tx complete');
            callback(null, restaurants);
          }).catch((err)=>{
            console.log(err);
            callback(null, restaurants);
          })
        });

      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        DBHelper.fetchRestaurantsFromIdb(callback);
      }
    };
    xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Index image Srcset.
   */
  static imageSrcsetForIndex(restaurant) {
    return (`${restaurant.srcset_index}`);
  }

  /**
   * Restaurant image Srcset.
   */
  static imageSrcsetForRestaurant(restaurant) {
    return (`${restaurant.srcset_restaurant}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

  static submitOffline(reviews) {
    let interval = setInterval(()=> {
      reviews.map((review, idx) => {
        fetch(DBHelper.RESTAURANT_REVIEWS_URL, {
          method: 'post',
          contentType: 'json',
          body: JSON.stringify(review)
        }).then(res=>res.json())
          .then((res) => {
            console.log('review sent');
            if(idx === reviews.length - 1) {
              localStorage.removeItem('pendingReviews');
              clearInterval(interval);
            }
          })
          .catch((err)=>{
            // alert('Post request unsuccessful! Retrying...');
            console.log(err, 'Retrying...');
          });
      })
    }, 3000);
  };

  static submitPendingReviews () {
    let previews = localStorage.getItem('pendingReviews');
    if(previews) {
      let data = JSON.parse(previews);
      DBHelper.submitOffline(data);
    }
  };

}
