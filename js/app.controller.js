import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
import { utilService } from './services/util.service.js'
console.log(utilService)

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
window.onSaveLocation = onSaveLocation
window.closeModal = closeModal
window.onDeleteClick = onDeleteClick
window.onSearchLocation = onSearchLocation

function onInit() {
  mapService
    .initMap()
    .then(() => {
      console.log('Map is ready')
      //   console.log(res);

      return mapService.getMap()
    })
    .then((currMap) => {
      currMap.addListener('click', function (event) {
        let clickedLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        }
        onMapClick(clickedLocation)
      })
    })
    .then(() => renderLocations)
    .catch((err) => console.log('Error:', err))
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
  console.log('Getting Pos')
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

function onAddMarker() {
  console.log('Adding a marker')
  mapService.addMarker({ lat: 32.0749831, lng: 34.9120554 })
}

function onGetLocs() {
  locService.getLocs().then((locs) => {
    console.log('Locations:', locs)
    document.querySelector('.locs').innerText = JSON.stringify(locs, null, 2)
  })
}

function onGetUserPos() {
  getPosition()
    .then((pos) => {
      console.log('User position is:', pos.coords)
      document.querySelector(
        '.user-pos'
      ).innerText = `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`
    })
    .catch((err) => {
      console.log('err!!!', err)
    })
}

function onPanTo(locId) {
  console.log('Panning the Map')
  const locs = locService.getLocs()
  const { lat, lng } = locs.find((loc) => loc.id === locId)
  mapService.panTo(lat, lng)
}

function onDeleteClick(locId) {
  locService.remove(locId)
}

function onMapClick(location) {
  showModal()
  window.clickedLocation = location
  mapService.addMarker(location)
}

function onSaveLocation() {
  const nameInput = document.getElementById('location-name')
  if (!nameInput.value) return

  const { lat, lng } = window.clickedLocation

  locService
    .saveLocs(nameInput.value, lat, lng)
    .then(() => {
      renderLocsTable()
      closeModal()
    })
    .catch((err) => {
      console.error('Error saving location:', err)
    })
}

function onSearchLocation() {
  const searchInput = document.getElementById('.search-input').value
  if (!searchInput) return

  locService.getPositionByInput(searchInput).then((res) => {
    console.log(res)
  })
}

function renderLocsTable() {
  locService.getLocs().then((locations) => {
    const table = document.querySelector('.locations-table')
    const htmlStr = locations
      .map(
        (loc) => `
            <tr>
                <td>${loc.name}</td>
                <td>${loc.lat}</td>
                <td>${loc.lng}</td>
                <td>${loc.createdAt}</td>
                <td>${loc.updatedAt}</td>
            </tr>
        `
      )
      .join('')

    table.innerHTML = htmlStr
  })
}

function showModal() {
  const modal = document.querySelector('.modal')
  modal.style.display = 'block'
}

function closeModal() {
  const modal = document.querySelector('.modal')
  modal.style.display = 'none'
  document.getElementById('location-name').value = ''
}

function renderLocations() {
  const locs = locService.getLocs()
  const strHTMLs = locs
    .map(
      (loc) => `
    <li>
    ${loc.name}
    <button class="btn btn-go-to" onclick="onPanTo(${loc.id})">Go</button>
    <button class="btn btn-delete-location" onclick="onDeleteClick(${loc.id})">Delete</button>
    </li>
  `
    )
    .join('')

  document.querySelector('.map-controls').innerHTML = strHTMLs
}
