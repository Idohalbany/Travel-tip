import { utilService } from './util.service.js'

export const locService = {
  getLocs,
  saveLocs,
  remove: removeLocation,
}

let gLocs = utilService.loadFromStorage('locs') || [
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
  const currLoc = gLocs.findIndex(loc => loc.id === id)
  gLocs.splice(currLoc, 1)
  console.log('gLocs:', gLocs)
  return Promise.resolve('Deleted')
}
