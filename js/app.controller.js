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
window.onCopyLink = onCopyLink
window.onMyLoc = onMyLoc

function onInit() {
  // console.log('onInit function is being called')
  const urlParams = new URLSearchParams(window.location.search)
  const lat = parseFloat(urlParams.get('lat'))
  const lng = parseFloat(urlParams.get('lng'))

  if (!isNaN(lat) && !isNaN(lng)) mapService.panTo(lat, lng)
  mapService
    .initMap()
    .then(() => {
      // console.log('Map is ready')
      //   console.log(res);
      renderLocations()
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

function onMyLoc() {
  getPosition().then((res) => {
    mapService.panTo(res.coords.latitude, res.coords.longitude)
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
  locService.getLocs().then((locs) => {
    const { lat, lng } = locs.find((loc) => loc.id === locId)
    mapService.panTo(lat, lng)
  })
}

function onDeleteClick(locId) {
  locService.remove(locId).then(() => renderLocations())
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
  const cityName = document.getElementById('search-input').value
  if (!cityName) return

  locService
    .getPositionByInput(cityName)
    .then((res) => {
      console.log(res)
      if (res.status === 'OK') {
        const location = res.results[0].geometry.location
        mapService.panTo(location.lat, location.lng)

        return locService.saveLocs(cityName, location.lat, location.lng)
      } else {
        throw new Error('Geocode was not successful: ', res.status)
      }
    })
    .then(() => {
      renderLocsTable()
      renderLocations()
    })
    .catch((error) => {
      console.error('error: ', error)
    })
}

function renderLocsTable() {
  locService.getLocs().then((locations) => {
    const table = document.querySelector('.locations-table-body')
    console.log('table:', table)
    const htmlStr = locations
      .map(
        (loc) => `
            <tr>
                <td>${loc.name}</td>
                <td>${loc.lat}</td>
                <td>${loc.lng}</td>
                <td>-</td>
                <td>${loc.createdAt}</td>
                <td>${loc.updatedAt}</td>
            </tr>
        `
      )
      .join('')

    document.querySelector('.locations-table').classList.remove('hide')
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
  locService.getLocs().then((locs) => {
    const strHTMLs = locs
      .map(
        (loc) => `
              <li>
              <span>${loc.name}</span>
              <button class="btn btn-go-to" onclick="onPanTo('${loc.id}')">Go</button>
              <button class="btn btn-delete-location" onclick="onDeleteClick('${loc.id}')">Delete</button>
              </li>
            `
      )
      .join('')

    document.querySelector('.map-controls ul').innerHTML = strHTMLs
  })
}

function onCopyLink() {
  mapService
    .getMapCenter()
    .then((res) => {
      const link = generateLink(res.lat, res.lng)
      console.log(res.lat, res.lng)
      navigator.clipboard.writeText(link)
      console.log(link)
    })
    .catch((err) => {
      console.error('Failed to get map center:', err)
    })
}

function generateLink(lat, lng) {
  const baseUrl = 'https://jinja-ninja.github.io/travel-tip/'
  return `${baseUrl}?lat=${lat}&lng=${lng}`
}
