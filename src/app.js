import geojsonExtent from '@mapbox/geojson-extent'

document.addEventListener('DOMContentLoaded', () => {
  const map = new window.geolonia.Map('#map')

  map.on('moveend', () => {
    const { lng, lat } = map.getCenter()
    document.getElementById('lat').value = Math.round(lat * 1000000) / 1000000
    document.getElementById('lng').value = Math.round(lng * 1000000) / 1000000
  })

  document.getElementById('address').addEventListener('focus', e => {
    e.target.select()
  })

  document.getElementById('lat').addEventListener('focus', e => {
    e.target.select()
  })

  document.getElementById('lng').addEventListener('focus', e => {
    e.target.select()
  })

  const showMessage = msg => {
    document.querySelector('#err .msg').textContent = msg
    document.getElementById('err').style.visibility = 'visible'

    const title = `[誤判定] ${document.getElementById('address').value}`
    const body = '住所が判定できませんでした。'
    const url = `https://github.com/geolonia/community-geocoder/issues/new?title=${encodeURI(title)}&body=${encodeURI(body)}`
    document.querySelector('#err a').href = url
  }

  const search = () => {
    if ('undefined' !== typeof map.getLayer('japanese-administration')) {
      map.removeLayer('japanese-administration')
      map.removeSource('japanese-administration')
    }

    document.getElementById('err').style.visibility = 'hidden'

    if (document.getElementById('address').value) {
      window.getLatLng(document.getElementById('address').value, latlng => {
        // eslint-disable-next-line no-console
        console.log(latlng)
        if (5 === latlng.code.length) {
          const endpoint = `https://geolonia.github.io/japanese-admins/${latlng.code.substr(0, 2)}/${latlng.code}.json`
          fetch(endpoint).then(res => {
            return res.json()
          }).then(data => {
            map.fitBounds(geojsonExtent(data))
            map.addLayer({
              id: 'japanese-administration',
              type: 'fill',
              source: {
                type: 'geojson',
                data: data,
              },
              layout: {},
              paint: {
                'fill-color': '#ff0000',
                'fill-opacity': 0.08,
              },
            })
            showMessage(`住所の判定ができなかったので「${data.features[0].properties.name}」に移動します。`)
          })
        } else {
          map.flyTo({ center: latlng, zoom: 16, essential: true })
        }
      }, e => {
        document.querySelector('#err .msg').textContent = e.message
        showMessage(e)
      })
    }
  }

  document.getElementById('exec').addEventListener('click', search)
})
