import { utilService } from './util.service.js'

export const locService = {
  getLocs,
  saveLocs,
  remove: removeLocation,
  getPositionByInput,
}

let gLocs = utilService.loadFromStorage('locsDB') || [
  {
    id: utilService.makeId(),
    name: 'Greatplace',
    lat: 32.047104,
    lng: 34.832384,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: utilService.makeId(),
    name: 'Neveragain',
    lat: 32.047201,
    lng: 34.832581,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

function getLocs() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (gLocs) {
        resolve(gLocs)
        // console.log(gLocs)
      } else {
        reject('No locations found')
      }
    }, 2000)
  })
}

function saveLocs(name, lat, lng, weather = null) {
  return new Promise((resolve) => {
    const loc = {
      id: utilService.makeId(),
      name,
      lat,
      lng,
      weather,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    gLocs.push(loc)
    utilService.saveToStorage('locsDB', gLocs)

    resolve(loc)
  })
}

function removeLocation(id) {
  const currLoc = gLocs.findIndex((loc) => loc.id === id)
  gLocs.splice(currLoc, 1)
  // console.log('gLocs:', gLocs)
  return Promise.resolve('Deleted')
}

function getPositionByInput(cityName) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=AIzaSyArwZLwu8qpwO8J1vkedj-qYnK7mdLmhYE`
  return fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error('Network res was not ok')
    }
    utilService.saveToStorage('locsDB', gLocs)
    return res.json()
  })
}
