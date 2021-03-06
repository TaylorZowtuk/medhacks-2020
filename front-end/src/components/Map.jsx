import React, { useEffect, useRef } from 'react';
import axios from 'axios';

// Variables
const GOOGLE_MAP_API_KEY = process.env.REACT_APP_API_KEY;
const myLocation = {
  // Edmonton
  lat: 53.54,
  lng: -113.49,
};

// styles
const mapStyles = {
  width: '100%',
  height: '900px',
};

const getTable = () => {
  return axios('http://localhost:3001/getTable', {
    method: 'GET',
  });
};

const getRiskFactors = () => {
  return axios('http://localhost:3001/getRiskFactors', {
    method: 'GET',
  });
};

function GoogleMaps(props) {
  // refs
  const googleMapRef = React.createRef();
  const googleMap = useRef(null);

  // helper functions
  const createGoogleMap = () =>
    new window.google.maps.Map(googleMapRef.current, {
      zoom: 14,
      center: {
        lat: myLocation.lat,
        lng: myLocation.lng,
      },
      // styles: [
      //   { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      //   { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      //   { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      //   {
      //     featureType: 'administrative.locality',
      //     elementType: 'labels.text.fill',
      //     stylers: [{ color: '#d59563' }],
      //   },
      //   {
      //     featureType: 'poi',
      //     elementType: 'labels.text.fill',
      //     stylers: [{ color: '#d59563' }],
      //   },
      //   {
      //     featureType: 'poi.park',
      //     elementType: 'geometry',
      //     stylers: [{ color: '#263c3f' }],
      //   },
      //   {
      //     featureType: 'poi.park',
      //     elementType: 'labels.text.fill',
      //     stylers: [{ color: '#6b9a76' }],
      //   },
      //   {
      //     featureType: 'road',
      //     elementType: 'geometry',
      //     stylers: [{ color: '#38414e' }],
      //   },
      //   {
      //     featureType: 'road',
      //     elementType: 'geometry.stroke',
      //     stylers: [{ color: '#212a37' }],
      //   },
      //   {
      //     featureType: 'road',
      //     elementType: 'labels.text.fill',
      //     stylers: [{ color: '#9ca5b3' }],
      //   },
      //   {
      //     featureType: 'road.highway',
      //     elementType: 'geometry',
      //     stylers: [{ color: '#746855' }],
      //   },
      //   {
      //     featureType: 'road.highway',
      //     elementType: 'geometry.stroke',
      //     stylers: [{ color: '#1f2835' }],
      //   },
      //   {
      //     featureType: 'road.highway',
      //     elementType: 'labels.text.fill',
      //     stylers: [{ color: '#f3d19c' }],
      //   },
      //   {
      //     featureType: 'transit',
      //     elementType: 'geometry',
      //     stylers: [{ color: '#2f3948' }],
      //   },
      //   {
      //     featureType: 'transit.station',
      //     elementType: 'labels.text.fill',
      //     stylers: [{ color: '#d59563' }],
      //   },
      //   {
      //     featureType: 'water',
      //     elementType: 'geometry',
      //     stylers: [{ color: '#17263c' }],
      //   },
      //   {
      //     featureType: 'water',
      //     elementType: 'labels.text.fill',
      //     stylers: [{ color: '#515c6d' }],
      //   },
      //   {
      //     featureType: 'water',
      //     elementType: 'labels.text.stroke',
      //     stylers: [{ color: '#17263c' }],
      //   },
      // ],
    });

  const getWeight = (rf, s) => {
    return rf * s * 1000;
  };

  const getPoint = (buildings, riskFactors) => {
    let dataPoints = [];
    for (let i = 0; i < buildings.length; i++) {
      dataPoints.push({
        location: new window.google.maps.LatLng(
          buildings[i].center.latitude,
          buildings[i].center.longitude
        ),
        weight: getWeight(riskFactors[i], buildings[i].size),
      });
    }

    return dataPoints;
  };

  const createHeatMap = (buildings, googleMap, riskFactors) => {
    const points = getPoint(buildings, riskFactors);
    new window.google.maps.visualization.HeatmapLayer({
      data: points,
      map: googleMap,
      options: {
        radius: 1,
        opacity: 0.5,
        dissipating: false,
        gradient: [
          '#3d5366',
          '#277da1',
          '#4d908e',
          '#43aa8b',
          '#90be6d',
          '#f9c74f',
          '#f9844a',
          '#f8961e',
          '#f3722c',
          '#f94144',
        ],
      },
    });
  };

  // useEffect Hook
  useEffect(() => {
    let buildings;
    let riskFactors;
    getTable().then((resp) => {
      buildings = resp.data;
      getRiskFactors().then((resp) => {
        riskFactors = resp.data;
        const googleMapScript = document.createElement('script');
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&libraries=visualization`;
        window.document.body.appendChild(googleMapScript);

        googleMapScript.addEventListener('load', () => {
          googleMap.current = createGoogleMap();
          createHeatMap(buildings.rows, googleMap.current, riskFactors);
        });
      });
    });
  }, []);

  return <div id='google-map' ref={googleMapRef} style={mapStyles} />;
}

export default GoogleMaps;
