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

  const search = () => {
    document.getElementById('err').textContent = ''
    if (document.getElementById('address').value) {
      getLatLng(document.getElementById('address').value, (latlng) => {
        console.log(latlng)
        map.flyTo({center: latlng, zoom: 16, essential: true})
      }, (e) => {
        document.getElementById('err').textContent = e.message
      })
    }
  }

  document.getElementById('exec').addEventListener('click', search)
})
