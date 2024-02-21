import { useState, useEffect } from 'react'
import { ChevronDoubleLeftIcon } from '@heroicons/react/24/solid'
//import places from './assets/places.json'
import mapboxgl from 'mapbox-gl';
import airportCodes from './assets/airport_codes.json'
import Sidebar from './Sidebar';
//import DateRangePickerWrapper from './DateRange'
import DateRangePicker from 'flowbite-datepicker/DateRangePicker';
import Datepicker from "react-tailwindcss-datepicker";

function App() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [selectedPin, setSelectedPin] = useState("");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [searchClicked, setSearchClicked] = useState(false); // Track whether search button is clicked

  const [endDate, setEndDate] = useState('');
  //   const [startDateObj, setStartDateObj] = useState({
  //     startDate: new Date(),
  //     endDate: new Date().setMonth(11)
  // });
  const startDateObj = {
    startDate: startDate,
    endDate: endDate
  }

  const handleDateChange = newValue => {
    console.log("newValue:", newValue);
    setStartDate(newValue.startDate);
    setEndDate(newValue.endDate);

  };

  const handleButtonClick = () => {
    setSearchClicked(true); // Set searchClicked to true when button is clicked
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);

  };

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
  };



  useEffect(() => {
    if (searchClicked && startDate !== '' && endDate !== '') {
      fetchFlights(selectedPin.id);
      setSearchClicked(false); // Reset searchClicked after search is triggered
    }
  }, [searchClicked, startDate, endDate]);



  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZnJhbmNpc2NvY2FsZGFzIiwiYSI6ImNsc2Y5MDYyNzFhNnUyamw1bjhsbTc3bjAifQ.4ypYMELBLioE2ZVgf9pfjA';

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/franciscocaldas/clsmc2pye003401pkciheh8y9',
      center: [-9.1406, 38.7223], // Lisbon
      zoom: 1.5
    });



    map.on('load', () => {
      // Load an image from an external URL.
      map.loadImage('https://static.vecteezy.com/system/resources/previews/015/165/175/non_2x/orange-round-background-for-text-create-posts-stories-headlines-highlights-transparent-clipart-free-png.png', (error, image) => {
        if (error) throw error;
        // Add the loaded image to the style's sprite with the ID 'kitten'.
        map.addImage('pin', image);
      });

      fetch('places.json')
        .then(function (response) {
          return response.json()
        })
        .then(data => {
          var places = data.features;

          map.addSource('places', {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': places
            }
          });




          places.forEach(function (place) {
            map.addLayer({
              'id': 'places-' + place.properties.title,
              'type': 'symbol',
              'source': 'places',
              'layout': {
                'icon-image': 'pin', // Mapbox marker icon
                'icon-allow-overlap': true,
                'text-allow-overlap': true,
                'icon-size': 0.02,
                'icon-offset': [0, 0],
              },
              'paint': {}
            });
          });


          places.forEach(function (place) {
            var coordinates = place.geometry.coordinates;
            setSelectedPin(place)


            // // Add label
            // map.addLayer({
            //   'id': 'label-' + place.properties.title,
            //   'type': 'symbol',
            //   'source': 'places',
            //   'layout': {s
            //     'text-field': ['get', 'title'],
            //     'text-font': ['Open Sans Regular'],
            //     'text-size': 16,
            //     'text-anchor': 'top',
            //     'text-offset': [0, -3],
            //     'icon-allow-overlap': true
            //   },
            //   'paint': {
            //     'text-color': '#000000'
            //   },
            // });

            // Add line from Lisbon to place
            map.addLayer({
              'id': 'line-' + place.properties.title,
              'type': 'line',
              'source': {
                'type': 'geojson',
                'data': {
                  'type': 'Feature',
                  'properties': {},
                  'geometry': {
                    'type': 'LineString',
                    'coordinates': [
                      [-9.1406, 38.7223], // Lisbon
                      coordinates
                    ]
                  }
                }
              },
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': '#14481d',
                'line-width': 1
              }
            });



            map.on('click', 'places-' + place.properties.title, function (e) {
              setSelectedPin(e.features[0]);
              fetchFlights(e.features[0].id);
            });
          });

          setLoading(false); // Set loading to false after data is loaded
        });
    });
  }, [leftSidebarCollapsed, rightSidebarCollapsed]);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const fetchFlightOffers = async (originCode, destinationCode, departureDate, returnDate, maxPrice, signal) => {
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const token = await fetchAccessToken();
        const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destinationCode}&departureDate=${departureDate}&returnDate=${returnDate}&adults=1&nonStop=false&max=10`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: signal // Pass the signal to the fetch options
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch flight offers: ${response.status}`);
        }

        const data = await response.json();
        console.log(data)
        return data;
      } catch (error) {
        console.error('Error fetching flight offers:', error);

        // Retry if it's a network-related error or if it's a 5xx server error
        if (error instanceof TypeError || (error.response && error.response.status >= 500)) {
          retries++;
          console.log(`Retrying... Attempt ${retries}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries)); // Exponential backoff
        } else {
          throw error; // Rethrow other types of errors
        }
      }
    }

    throw new Error('Max retries reached. Failed to fetch flight offers.');
  };



  const fetchFlights = async (destinationId) => {
    try {
      setLoading(true);

      // Create an instance of AbortController
      const abortController = new AbortController();
      const signal = abortController.signal;

      const originCode = 'LIS'; // Assuming Lisbon is the origin
      const destinationCode = airportCodes.codes[destinationId];
      const maxPrice = 250; // Example maximum price

      // Example dates (use startDate and endDate state values instead)
      const departureDate = startDate || '2024-07-15';
      const returnDate = endDate || '2024-07-20';

      // Check if there's an ongoing fetch, if yes, abort it
      if (fetchFlights.currentRequest) {
        fetchFlights.currentRequest.abort();
      }

      // Store the current fetch request
      fetchFlights.currentRequest = abortController;

      const data = await fetchFlightOffers(originCode, destinationCode, departureDate, returnDate, maxPrice, signal);
      setLoading(false);
      setFlights(data.data);
    } catch (error) {
      console.error('Error fetching flight offers:', error);
    }
  };


  // const fetchFlightOffers = async (originCode, destinationCode, departureDate, returnDate, maxPrice, signal) => {
  //   const token = await fetchAccessToken();
  //   const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destinationCode}&departureDate=${departureDate}&returnDate=${returnDate}&adults=1&nonStop=false&max=10`;
  //   const response = await fetch(url, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${token}`
  //     },
  //     signal: signal // Pass the signal to the fetch options
  //   });
  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch flight offers: ${response.status}`);
  //   }
  //   const data = await response.json();
  //   return data;
  // };

  const fetchAccessToken = async () => {
    const clientId = 'uS5EhacEI4gBUsM2NX3cvtEWnguAfvmV';
    const clientSecret = '0zQH6bKT8HV3D8DE';
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch access token: ${response.status}`);
    }
    const data = await response.json();
    return data.access_token;
  };



  // const fetchFlights = async (destinationId) => {
  //   try {
  //     setLoading(true);

  //     // Create an instance of AbortController
  //     const abortController = new AbortController();
  //     const signal = abortController.signal;

  //     const originCode = 'LIS'; // Assuming Lisbon is the origin
  //     const destinationCode = airportCodes.codes[destinationId];
  //     const maxPrice = 250; // Example maximum price

  //     // Example dates (use startDate and endDate state values instead)
  //     const departureDate = startDate || '2024-07-15';
  //     const returnDate = endDate || '2024-07-20';

  //     // Check if there's an ongoing fetch, if yes, abort it
  //     if (fetchFlights.currentRequest) {
  //       fetchFlights.currentRequest.abort();
  //     }

  //     // Store the current fetch request
  //     fetchFlights.currentRequest = abortController;

  //     const data = await fetchFlightOffers(originCode, destinationCode, departureDate, returnDate, maxPrice, signal);
  //     setLoading(false);
  //     setFlights(data.data);

  //   } catch (error) {
  //     console.error('Error fetching flight offers:', error);
  //   }
  // };



  return (


    <div className="flex flex-col h-screen">
      <div className="flex flex-shrink-0 justify-between flex-row py-4">
        <div className="w-full flex flex-wrap items-center justify-between mx-auto p-4  bg-white border-white">
          <div id='logo' className="logo flex flex-col items-center px-8">
            <span className="logo-text font-[Glendale] text-[21px] font-bold text-black">ANYWHERE</span>
            <span className="logo-sub-text font-[Gilroy] text-[13px] text-black">By GPTur</span>
          </div>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Get started</button>
            <button data-collapse-toggle="navbar-cta" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-cta" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>
          </div>
          <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1 gap-6" id="navbar-cta">
            <div className='flex  gap-3'>
              Dates:<Datepicker showShortcuts={false} value={startDateObj} onChange={handleDateChange} />
            </div>
            
            <button type="button" onClick={handleButtonClick} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
          </div>
        </div>

      </div>


      <div className="flex flex-1">
        <div className={`flex-shrink-0 w-1/4 bg-blue-200 ${leftSidebarCollapsed ? 'hidden' : ''}`}>
          left sidebar

        </div>

        <div className="flex-1 bg-gray-100" id='main-content'>

          <div className='w-[100%] h-[100%]' id="map" ></div>


        </div>


        <div className={`flex-shrink-0 w-1/4 bg-green-200 ${rightSidebarCollapsed ? 'hidden' : ''}`}>
          Right Sidebar
          <div className='w-8 absolute left-20'>
            <Sidebar selectedPin={selectedPin} flights={flights} loading={loading} />

            <ChevronDoubleLeftIcon onClick={toggleLeftSidebar}>Toggle Left Sidebar</ChevronDoubleLeftIcon>
          </div>
          <div className='w-8 absolute'>
            <ChevronDoubleLeftIcon onClick={toggleRightSidebar}>Toggle Right Sidebar</ChevronDoubleLeftIcon>
          </div>
        </div>
      </div>


    </div>

  )
}

export default App






