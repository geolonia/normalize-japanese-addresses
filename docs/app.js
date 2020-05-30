document.addEventListener('DOMContentLoaded', () => {
  const map = new geolonia.Map('#map')

  map.on('moveend', () => {
    const {lng, lat} = map.getCenter()
    document.getElementById('lat').value = lat
    document.getElementById('lng').value = lng
  })

  document.getElementById('address').addEventListener('focus', (e) => {
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
