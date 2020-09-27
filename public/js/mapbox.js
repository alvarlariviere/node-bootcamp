/* eslint-disable */
export const displayMap = locations => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiYWx2YXJsYXJpdmllcmUiLCJhIjoiY2tmaDR3cWlrMHZhajJxbzNjcDNpOHN1aCJ9.A_z217Yt_br6mG1YyCnaVA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/alvarlariviere/ckfh872l204pe19s3s0b8fbjy',
    scrollZoom: false,
    // center: [-118.113491, 34.1111745],
    // zoom: 10,
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat(loc.coordinates).addTo(map);

    // Add popup
    new mapboxgl.Popup({ offset: 30 }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, { padding: { top: 200, bottom: 150, left: 100, right: 100 } });
};
