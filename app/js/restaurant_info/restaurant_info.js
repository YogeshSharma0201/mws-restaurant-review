let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  DBHelper.submitPendingReviews();
});

/**
 * Lazy load Images
 */
lazyLoadImages = () => {
  console.log('loaded');
  let lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
  console.log(lazyImages);

  if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataSrc;
          lazyImage.srcset = lazyImage.dataSrcset;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  }
}

// /**
//  * Lazy Load
//  */
// window.onload = lazyLoadImages;

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoieW9nZXNoOTgiLCJhIjoiY2ppbW94b2ZtMDZnajNxcDhmbWZ3YXg3ZiJ9.MOurj7HhMK-IbyH2NP1_Ow',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      lazyLoadImages();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const like = document.getElementById('restaurant-like');
  console.log(restaurant.is_favorite);
  if(restaurant.is_favorite === false || restaurant.is_favorite === 'false') {
    like.innerHTML = 'Like &#x1F44D;'
  } else {
    like.innerHTML = 'Dislike &#x1F44E;';
  }

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img lazy';
  image.src = '/img/blur.jpg';
  image.dataSrc = DBHelper.imageUrlForRestaurant(restaurant);
  image.dataSrcset = DBHelper.imageSrcsetForRestaurant(restaurant);
  image.sizes = "(max-width: 320px) 300px, (max-width: 425px) 400px, (max-width: 635px) 600px, 800px";
  const altText = restaurant.name + ' restaurant in ' + restaurant.neighborhood;
  image.title = altText;
  image.alt = altText;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  // const title = document.createElement('h2');
  // title.innerHTML = 'Reviews';
  // container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  let _Date = new Date(review.createdAt);
  let Month = ['Jan','Feb','March','April','May','Jun','July','Aug','Sept','Oct','Nov','Dec'];
  date.innerHTML = `${_Date.getDate()} ${Month[_Date.getMonth()]} ${_Date.getFullYear()}`;
  console.log(_Date, `${_Date.getDate()} ${Month[_Date.getMonth()]} ${_Date.getFullYear()}`);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

likeHandler = async () => {
  const like = document.getElementById('restaurant-like');
  const id = parseInt(location.search.slice(4));
  let res, type;
  console.log(like.innerHTML.includes('Like'));
  if(like.innerHTML.includes('Like')) {
    type='true';
  } else {
    type='false';
  }
  res = await fetch(`${DBHelper.RESTAURANT_URL}/${id}/?is_favorite=${type}`, {
    method: 'put',
  });
  const json = await res.json();
  console.log(json, type);
  if(json.is_favorite === 'false' || json.is_favorite=== false) {
    like.innerHTML = 'Like &#x1F44D;'
  } else {
    like.innerHTML = 'Dislike &#x1F44E;';
  }

};

closeModal = () => {
  const modal = document.getElementById('form-modal-out');
  modal.style.display = 'none';
};

openModal = () => {
  const modal = document.getElementById('form-modal-out');
  modal.style.display = 'block';
};

submitReview = (e) => {
  e.preventDefault();
  // console.log(e);
  const name = e.target["name"].value;
  const rating = e.target["rating"].value;
  const comments = e.target["comments"].value;
  const id = parseInt(location.search.slice(4));
  // console.log(name, rating, comments);

  const reviewHtml = createReviewHTML({
    name,
    rating,
    comments,
    createdAt: (new Date()).getTime(),
  });
  const ul = document.getElementById('reviews-list');
  ul.appendChild(reviewHtml);
  let reviewObj = {
    restaurant_id: id,
    name,
    rating,
    comments,
  };
  addToidb(reviewObj);
  previews = [];
  let pendingReviews = localStorage.getItem('pendingReviews');
  if(pendingReviews) {
    pendingReviews = JSON.parse(pendingReviews);
    previews = [
      ...pendingReviews
    ]
  }
  previews.push(reviewObj);
  localStorage.setItem('pendingReviews', JSON.stringify(previews));
  fetch('http://localhost:1337/reviews/', {
    method: 'post',
    contentType: 'json',
    body: JSON.stringify(reviewObj)
  }).then(res=>res.json())
    .then(res=>console.log(res))
    .catch((err)=>{
      alert('Not connected to internet! Review will be sent once connected...');
      DBHelper.submitOffline([reviewObj]);
    });

  e.target["name"].value = '';
  e.target["rating"].value = 1;
  e.target["comments"].value = '';
  const modal = document.getElementById('form-modal-out');
  modal.style.display = 'none';
  return false;
};

addToidb = (reviewObj) => {
  reviewObj = {
    ...reviewObj,
    createdAt: (new Date()).getTime()
  };

  let dbPromise = idb.open('restaurants', 1);

  dbPromise.then(function (db) {
    let tx = db.transaction('restaurants');
    let keyValStore = tx.objectStore('restaurants');
    return keyValStore.get(reviewObj.restaurant_id);
  }).then(function (val) {
    console.log(val);
    let DbPromise = idb.open('restaurants', 1);

    DbPromise.then(function (db) {
      let tx = db.transaction('restaurants', 'readwrite');
      let keyValStore = tx.objectStore('restaurants');
      keyValStore.put({
        ...val,
        reviews: [...val.reviews, reviewObj],
      });
      return tx.complete;
    }).then(function () {
      console.log('tx complete...');
    }).catch((err)=>{
      console.log(err);
    })

  }).catch( (err) => {
    console.log(err);
  });

};