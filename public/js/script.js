// const socket = io({ forceNew: true });

// console.log("script.js is loaded");

// let username = prompt("Enter your name:") || "Anonymous";
// socket.emit("register-user", username);

// socket.on("connect", () => {
//   console.log("Connected with socket id:", socket.id);
// });

// if (navigator.geolocation) {
//   navigator.geolocation.watchPosition(
//     (position) => {
//       const { latitude, longitude } = position.coords;
//       console.log("Sending location:", latitude, longitude);
//       socket.emit("send-location", { latitude, longitude });
//     },
//     (error) => {
//       console.log("Location error:", error);
//     },
//     {
//       enableHighAccuracy: true,
//       timeout: 5000,
//       maximumAge: 0,
//     }
//   );
// } else {
//   console.log("Geolocation not supported");
// }

// const map = L.map("map").setView([0, 0], 16);

// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution: "OpenStreetMap contributors",
// }).addTo(map);

// const markers = {};

// socket.on("recieve-location", (data) => {
//   const { id, latitude, longitude, username } = data;

//   console.log("Location received from:", id, latitude, longitude);

//   if (id === socket.id) {
//     map.setView([latitude, longitude]);
//   }

//   if (markers[id]) {
//     markers[id].setLatLng([latitude, longitude]);
//   } else {
//     markers[id] = L.marker([latitude, longitude])
//       .addTo(map)
//       .bindPopup(`${username}`)
//       .openPopup();
//   }
// });

// socket.on("user-disconnected", (id) => {
//   console.log("Removing marker of:", id);
//   if (markers[id]) {
//     map.removeLayer(markers[id]);
//     delete markers[id];
//   }
// });

// socket.on("update-user-count", (count) => {
//   const counter = document.getElementById("user-count");
//   if (counter) counter.innerText = `Online Users: ${count}`;
// });

const socket = io({ forceNew: true });

console.log("script.js is loaded");

let username = prompt("Enter your name:") || "Anonymous";
socket.emit("register-user", username);

socket.on("connect", () => {
  console.log("Connected with socket id:", socket.id);
});

const map = L.map("map"); // No default view here!

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap contributors",
}).addTo(map);

const markers = {};
let mapInitialized = false;

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Sending location:", latitude, longitude);

      if (!mapInitialized) {
        map.setView([latitude, longitude], 16); // Set center only once
        mapInitialized = true;
      }

      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.log("Location error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  console.log("Geolocation not supported");
}

socket.on("recieve-location", (data) => {
  const { id, latitude, longitude, username } = data;

  console.log("Location received from:", id, latitude, longitude);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`${username}`)
      .openPopup();
  }
});

socket.on("user-disconnected", (id) => {
  console.log("Removing marker of:", id);
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

socket.on("update-user-count", (count) => {
  const counter = document.getElementById("user-count");
  if (counter) counter.innerText = `Online Users: ${count}`;
});
