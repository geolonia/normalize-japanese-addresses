import enrichment from './imi-enrichment-address/main'

window.getLatLng = (str, callback) => {
  const code = enrichment(str)
  const prefCode = code.substr(0, 2)
  const cityCode = code.substr(0, 5)

  const base = "https://geolonia.github.io/simple-geocoder/api"
  const api = `${base}/${prefCode}/${cityCode}/${code}.json`

  fetch(api).then((res) => {
    return res.json()
  }).then((json) => {
    callback(json)
  })
}
