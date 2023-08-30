import { locService } from './loc.service'

export const mapService = {
  initMap,
  addMarker,
  panTo,
  getMap,
  saveLocation,
}
// Var that is used throughout this Module (not global)
var gMap

function initMap(lat = 32.0749831, lng = 34.9120554) {
  console.log('InitMap')

  return new Promise((resolve, reject) => {
    _connectGoogleApi()
      .then((res) => {
        console.log(res)
        console.log('google available')

        gMap = new google.maps.Map(document.querySelector('#map'), {
          center: { lat, lng },
          zoom: 15,
        })
        console.log('Map!', gMap)
        resolve(gMap)
      })
      .catch((err) => {
        console.error('Error connecting to Google API:', err)
        reject(err)
      })
  })
}

function getMap() {
  return new Promise((resolve, reject) => {
    if (gMap) {
      resolve(gMap)
    } else {
      reject('Map is not initialized yet.')
    }
  })
}

function addMarker(loc) {
  var marker = new google.maps.Marker({
    position: loc,
    map: gMap,
    title: 'Hello World!',
  })
  return marker
}

function panTo(lat, lng) {
  var laLatLng = new google.maps.LatLng(lat, lng)
  gMap.panTo(laLatLng)
}

function _connectGoogleApi() {
  if (window.google) return Promise.resolve()
  const API_KEY = 'AIzaSyBr2M08iZivUJTxbCBbCdWJ5bO4gEs34MA' //TODO: Enter your API Key
  var elGoogleApi = document.createElement('script')
  elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
  elGoogleApi.async = true
  document.body.append(elGoogleApi)

  return new Promise((resolve, reject) => {
    elGoogleApi.onload = resolve
    elGoogleApi.onerror = () => reject('Google script failed to load')
  })
}

function saveLocation(name, lat, lng) {
  return locService.saveLocs(name, lat, lng)
}
