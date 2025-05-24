"use strict";

import { API_URL, MASTER_KEY, ACCESS_KEY, UPDATE_API } from "./config.js";

const container = document.querySelector(".petal-container");
const countEl = document.querySelector(".counter");
const allElements = document.querySelectorAll(".element");
const guestsList = document.querySelector(".guests");
const guestsNumber = document.querySelector(".n_invitees");
const confirmBtn = document.querySelector(".confirmation-btn");
const confirmation_msg = document.querySelector(".confirmation-message");
const linkSection = document.querySelector(".place-links");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");

const eventDate = new Date(2025, 5, 21);
const daysLeft = calcDaysBetween(eventDate);
// console.log("days left: " + daysLeft);

// ## Petal Effect starts here ##
function createPetal() {
  const petal = document.createElement("div");
  petal.classList.add("petal");
  petal.style.left = Math.random() * 100 + "vw";
  petal.style.animationDuration = 15 + Math.random() * 3 + "s";
  petal.style.opacity = 0.7 + Math.random() * 0.3;
  petal.style.transform = `rotate(${Math.random() * 360}deg)`;
  container.appendChild(petal);

  // **Removing the petal after it falls
  setTimeout(() => {
    petal.remove();
  }, 12000);
}

setInterval(createPetal, 800);

// ## Petal Effects ends here ##

// ## Background music starts here ##
const bgMusic = document.getElementById("bgMusic");

// Play on first interaction
window.addEventListener(
  "click",
  () => {
    bgMusic.volume = 0.02;
    bgMusic.play();
  },
  { once: false }
);

// ## Background music ends here ##

// ## Counter effect starts here ##

function calcDaysBetween(endDate) {
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const diff = end - start;

  return Math.round(diff / millisecondsPerDay);
}

function animateCount(targetCount, duration = 1000) {
  if (targetCount < 1) return;

  const frameRate = 80;
  const totalFrames = Math.round((duration / 1000) * frameRate);
  const increment = targetCount / totalFrames;
  // console.log("increment value : " + increment);

  let current = 0;
  let frame = 0;

  const counter = setInterval(() => {
    current += increment;
    // console.log(current);
    if (frame >= totalFrames) {
      clearInterval(counter);
      countEl.textContent = targetCount;
    } else {
      countEl.textContent = Math.round(current);
      frame++;
    }
  }, 1000 / frameRate);
}

setTimeout(function () {
  animateCount(daysLeft, 1000);
}, 4000);

// ## Counter Effect ends here ##

// ## Reveal elements effect starts here ##
const revealElement = function (entries, observer) {
  // const [entry] = entries;
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.remove("element--hidden");
    observer.unobserve(entry.target);
  });
};

const elementObserver = new IntersectionObserver(revealElement, {
  root: null,
  threshold: 0.05,
});

allElements.forEach((el) => {
  elementObserver.observe(el);
  el.classList.add("element--hidden");
});

// Functions
function loadError(err = "") {
  // document.getElementById('error').textContent = "Error fetching data: " + err;
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function validateGuestID(id, array) {
  const indexArray = array.findIndex((obj) => obj.id === id);
  return indexArray;
}

// ### API Call to JsonBIN ##

async function fetchData() {
  try {
    const guestID = window.location.pathname.slice(1);
    // const guestID = window.location.hash.slice(2);  test only
    console.log("The guest ID is: ", guestID);
    // const guestID = "A9K4L2M7QX";
    const response = await fetch(API_URL, {
      method: "GET",
      headers: { "X-Master-Key": MASTER_KEY },
      "X-Access-Key": ACCESS_KEY,
      "X-Bin-Meta": false,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const { guests } = data.record;

    const index = validateGuestID(guestID, guests);
    if (index !== -1) {
      const { names, status } = guests[index];
      guestsNumber.textContent = `${names.length} ${
        names.length > 1 ? " espacios" : "espacio"
      }`;
      guestsList.textContent = "";
      names.forEach(function (name) {
        guestsList.insertAdjacentHTML(
          "beforeend",
          `<li class="guest">${name.trim()}</li>`
        );
      });

      // Hide confirmation button if already confirmed
      if (status === "Confirmed") hideBtn();

      // Add Event listener to confirm btn

      confirmBtn.addEventListener("click", function () {
        updateGuest(guests, guestID);
      });
    } else {
      loadError("Invalid URL");
    }
  } catch (error) {
    loadError(error.message);
  }
}

async function updateGuest(guests_obj, guest_id) {
  try {
    const updatedGuests = guests_obj.map((guest) =>
      guest.id === guest_id ? { ...guest, status: "Confirmed" } : guest
    );

    const updateGuestsJson = await fetch(UPDATE_API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY,
        "X-Access-Key": ACCESS_KEY,
      },
      body: JSON.stringify({ guests: updatedGuests }),
    });

    if (!updateGuestsJson.ok) {
      throw new Error(`HTTP error! Status: ${result.status}`);
    }

    const result = await updateGuestsJson.json();

    hideBtn();
  } catch (err) {
    alert("An error has occured", err);
  }
}

function hideBtn() {
  confirmBtn.classList.add("hidden");
  confirmation_msg.classList.remove("hidden");
  linkSection.classList.remove("hidden");
}

fetchData();
