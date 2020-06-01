document.addEventListener('DOMContentLoaded', () => {
  const map = new geolonia.Map('#map')

  map.on('moveend', () => {
    const {lng, lat} = map.getCenter()
    document.getElementById('lat').value = Math.round(lat * 1000000) / 1000000
    document.getElementById('lng').value = Math.round(lng * 1000000) / 1000000
  })

  document.getElementById('address').addEventListener('focus', (e) => {
    e.target.select()
  })

  document.getElementById('lat').addEventListener('focus', (e) => {
    e.target.select()
  })

  document.getElementById('lng').addEventListener('focus', (e) => {
    e.target.select()
  })

  const showMessage = (msg) => {
    document.querySelector('#err .msg').textContent = msg
    document.getElementById('err').style.visibility = 'visible'

    const title = `[誤判定] ${document.getElementById('address').value}`
    const body = `住所が判定できませんでした。`
    const url = `https://github.com/geolonia/community-geocoder/issues/new?title=${encodeURI(title)}&body=${encodeURI(body)}`
    document.querySelector('#err a').href = url
  }

  const search = () => {
    document.getElementById('err').style.visibility = 'hidden'

    if (document.getElementById('address').value) {
      getLatLng(document.getElementById('address').value, (latlng) => {
        console.log(latlng)
        if (5 === latlng.code.length) {
          showMessage(`住所の判定ができなかったので「${latlng.addr}」に移動します。`)
        }
        map.flyTo({center: latlng, zoom: 16, essential: true})
      }, (e) => {
        document.querySelector('#err .msg').textContent = e.message
        showMessage(e.message)
      })
    }
  }

  document.getElementById('exec').addEventListener('click', search)
})
