import enrichment from './imi-enrichment-address/main'

window.getLatLng = (str, callback, errorCallback = () => {}) => {
  try {
    let code = enrichment(str)

    const prefCode = code.substr(0, 2)
    const cityCode = code.substr(0, 5)

    const base = 'https://community-geocoder.geolonia.com/api'
    const api = `${base}/${prefCode}/${cityCode}/${code}.json`

    fetch(api).then(res => {
      return res.json()
    }).then(json => {
      json.code = code
      callback(json)
    }).catch(() => {
      const e = new Error('見つかりませんでした。住所を修正して、もう一度お試しください。')
      errorCallback(e)
    })
  } catch (e) {
    errorCallback(e)
  }
}
