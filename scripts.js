const form = document.querySelector(".excercise-form");
const inputType = document.querySelector("#type");
const inputDistance = document.querySelector("#distance");
const inputDuration = document.querySelector("#duration");
const inputSteps = document.querySelector("#steps");
const inputElevation = document.querySelector("#elevation");

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener(
      "change",
      this._handleWorkoutTypeChange.bind(this)
    );
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._initMap.bind(this),
        function () {
          console.log("Unable to get the position");
        }
      );
    }
    this._hideForm();
  }

  _initMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 15);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);

    this.#map.on("click", (e) => {
      this.#mapEvent = e;
      this._showForm();
    });
  }

  _newWorkout(e) {
    e.preventDefault();
    let { lat, lng } = this.#mapEvent.latlng;
    let workout;
    let type = inputType.value;
    if (type == "cycling") {
      workout = new Cycling(
        [lat, lng],
        inputDistance.value,
        inputDuration.value,
        inputElevation.value
      );
    } else {
      workout = new Running(
        [lat, lng],
        inputDistance.value,
        inputDuration.value,
        inputSteps.value
      );
    }
    this.#workouts.push(workout);
    this._renderPopup(workout);
  }

  _renderPopup(workout) {
    let marker = L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 200,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type == 'running'?'🏃‍♂️':'🚴'} ${workout.type.charAt(0).toUpperCase()+ workout.type.slice(1)} on ${workout.dateFormated}`)
      .openPopup();
    this._renderWorkout(workout);
    this._hideForm();
  }

  _renderWorkout(workout) {
    let html = `<article class="card ${workout.type}-card">
    <span class="card-title mb">${workout.type.charAt(0).toUpperCase()+ workout.type.slice(1)} on ${workout.dateFormated}</span>
    <div class="card-desc">
      <span>${workout.type == 'running'?'🏃‍♂️':'🚴'} ${workout.distance} KM</span>
      <span>⏱️ ${workout.duration} Min</span>`;
    if (workout.type === "cycling") {
      html += `<span>⚡ ${workout.speed} KM/H</span>
        <span>⛰️ ${workout.elevation} M</span>`;
    } else {
      html += `<span>⚡ ${workout.pace} MIN/KM</span>
        <span>🦶 ${workout.steps} M</span>`;
    }
    html += `</div>
  </article>`;

    form.insertAdjacentHTML("afterend", html);
  }

  _handleWorkoutTypeChange() {
    inputElevation
      .closest(".elevation-input-container")
      .classList.toggle("hidden");
    inputSteps.closest(".steps-input-container").classList.toggle("hidden");
  }

  _showForm() {
    form.style.display = "grid";
    inputDistance.focus();
  }

  _hideForm() {
    form.style.display = "none";
  }
}

class Workout {
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.date = new Date();
    this.dateFormated = this.date.getDate()+' '+months[this.date.getMonth()]+' '+this.date.getFullYear()
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, steps) {
    super(coords, distance, duration);
    this.steps = steps;
    this._calcPace();
  }

  _calcPace() {
    this.pace = (this.distance / this.duration).toFixed(2);
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this._calcSpeed();
  }

  _calcSpeed() {
    this.speed = (this.distance / (this.duration / 60)).toFixed(2);
    return this.speed;
  }
}

new App();
