class DBHelper{static get RESTAURANT_URL(){return"http://localhost:1337/restaurants"}static get REVIEWS_URL(){return"http://localhost:1337/reviews"}static fetchRestaurants(t){let e=new XMLHttpRequest;e.open("GET",DBHelper.RESTAURANT_URL),e.onload=(()=>{if(200===e.status){let r=JSON.parse(e.responseText);r=r.map(t=>{const e=t.id;return{...t,photograph:`${e}-300.jpg`,srcset_index:`img/${e}-300.jpg 1x, img/${e}-600_2x.jpg 2x`,srcset_restaurant:`img/${e}-300.jpg 300w, img/${e}-400.jpg 400w, img/${e}-600_2x.jpg 600w, img/${e}-800_2x.jpg 800w`}});let n=idb.open("restaurants",1,function(t){t.createObjectStore("restaurants",{keyPath:"id"})});DBHelper.fetchReviews((e,s)=>{e&&console.log(e);const a=["January","February","March","April","May","June","July","August","September","October","November","December"];r=r.map(t=>{let e=[];return s.forEach(r=>{if(r.restaurant_id===t.id){let t=new Date(r.createdAt);e=[{name:r.name,rating:r.rating,comments:r.comments,date:`${a[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()}`},...e]}}),t.reviews=e,t}),n.then(function(t){let e=t.transaction("restaurants","readwrite"),n=e.objectStore("restaurants");return r.forEach(t=>{n.put(t)}),e.complete}).then(function(){console.log("tx complete")}),t(null,r)})}else{const r=`Request failed. Returned status of ${e.status}`;idb.open("restaurants",1).then(function(t){let e=t.transaction("restaurants").objectStore("restaurants");return console.log(e),e.getAll()}).then(function(e){t(null,e)}),t(r,null)}}),e.send()}static fetchReviews(t){let e=new XMLHttpRequest;e.open("GET",DBHelper.REVIEWS_URL),e.onload=(()=>{if(200===e.status){const r=JSON.parse(e.responseText);t(null,r)}else{const r=`Request failed. Returned status of ${e.status}`;t(r,null)}}),e.send()}static fetchRestaurantById(t,e){DBHelper.fetchRestaurants((r,n)=>{if(r)e(r,null);else{const r=n.find(e=>e.id==t);r?e(null,r):e("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(t,e){DBHelper.fetchRestaurants((r,n)=>{if(r)e(r,null);else{const r=n.filter(e=>e.cuisine_type==t);e(null,r)}})}static fetchRestaurantByNeighborhood(t,e){DBHelper.fetchRestaurants((r,n)=>{if(r)e(r,null);else{const r=n.filter(e=>e.neighborhood==t);e(null,r)}})}static fetchRestaurantByCuisineAndNeighborhood(t,e,r){DBHelper.fetchRestaurants((n,s)=>{if(n)r(n,null);else{let n=s;"all"!=t&&(n=n.filter(e=>e.cuisine_type==t)),"all"!=e&&(n=n.filter(t=>t.neighborhood==e)),r(null,n)}})}static fetchNeighborhoods(t){DBHelper.fetchRestaurants((e,r)=>{if(e)t(e,null);else{const e=r.map((t,e)=>r[e].neighborhood),n=e.filter((t,r)=>e.indexOf(t)==r);t(null,n)}})}static fetchCuisines(t){DBHelper.fetchRestaurants((e,r)=>{if(e)t(e,null);else{const e=r.map((t,e)=>r[e].cuisine_type),n=e.filter((t,r)=>e.indexOf(t)==r);t(null,n)}})}static urlForRestaurant(t){return`./restaurant.html?id=${t.id}`}static imageUrlForRestaurant(t){return`/img/${t.photograph}`}static imageSrcsetForIndex(t){return`${t.srcset_index}`}static imageSrcsetForRestaurant(t){return`${t.srcset_restaurant}`}static mapMarkerForRestaurant(t,e){const r=new L.marker([t.latlng.lat,t.latlng.lng],{title:t.name,alt:t.name,url:DBHelper.urlForRestaurant(t)});return r.addTo(newMap),r}}