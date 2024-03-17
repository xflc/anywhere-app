import { useState, useEffect } from 'react'
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/solid'
//import places from './assets/places.json'
import mapboxgl from 'mapbox-gl';
import airportCodes from './assets/airport_codes.json'
import Sidebar from './Sidebar';
//import DateRangePickerWrapper from './DateRange'
import DateRangePicker from 'flowbite-datepicker/DateRangePicker';
import Datepicker from "react-tailwindcss-datepicker";
import { Threebox } from 'threebox-plugin';
import RightSideBar from './components/RightSideBar';
import * as THREE from 'three';
import ReactDOMServer from 'react-dom/server';
import PopupCard from './components/PopupCard'; // Path to your PopupMessage component
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [selectedPin, setSelectedPin] = useState("");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [searchClicked, setSearchClicked] = useState(false); // Track whether search button is clicked

  const [endDate, setEndDate] = useState('');
  const [allPrices, setAllPrices] = useState({});

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
    console.log("rendering map")
    mapboxgl.accessToken = 'pk.eyJ1IjoiZnJhbmNpc2NvY2FsZGFzIiwiYSI6ImNsc2Y5MDYyNzFhNnUyamw1bjhsbTc3bjAifQ.4ypYMELBLioE2ZVgf9pfjA';

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/franciscocaldas/clsmc2pye003401pkciheh8y9',
      center: [-9.1406, 38.7223], // Lisbon
      zoom: 1.5
    });

    let lisbon_coor = [-9.1406, 38.7223]

    map.on('load', () => {

      var lines = [];

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

          // Iterate through places and add price to each place object
          places.forEach(place => {
            const id = place.id;
            if (allPrices[id]) {
              place.properties.price = allPrices[id]; // Add price to place object
            }
            else {
              place.properties.price = null
            }
          });

          map.addSource('places', {
            'type': 'geojson',
            'data': {
              'type': 'FeatureCollection',
              'features': places
            }
          });



          places.forEach(function (place) {
            var coordinates = place.geometry.coordinates;
            setSelectedPin(place)

            var arcSegments = 150;


            var line = [];
            var destination = coordinates;
            var maxElevation = Math.pow(Math.abs(destination[0] * destination[1]), 0.5) * 60000;

            var increment = [(destination[0] - lisbon_coor[0]) / arcSegments, (destination[1] - lisbon_coor[1]) / arcSegments]// destination.map(function(direction){

            for (var l = 0; l <= arcSegments; l++) {
              var waypoint = [lisbon_coor[0] + increment[0] * l, lisbon_coor[1] + increment[1] * l]

              var waypointElevation = Math.sin(Math.PI * l / arcSegments) * maxElevation;

              waypoint.push(waypointElevation);
              line.push(waypoint);
            }

            lines.push([line, place.id])




          });


          map.addLayer({
            id: 'custom_layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: function (map, mbxContext) {

              // instantiate threebox
              window.tb = new Threebox(
                map,
                mbxContext,
                { defaultLights: true }
              );

              for (let line of lines) {
                var color_ = 0x34a203;
                if (line[1] in Object.keys(allPrices)) {
                  var color_ = getColorByPrice(allPrices[line[1]]);
                }
                var lineOptions = {
                  geometry: line[0],
                  color: color_,// 0x34a203, // color based on latitude of endpoint
                  width: 1.5, // random width between 1 and 2
                  opacity: 0.4
                }

                let lineMesh = window.tb.line(lineOptions);

                window.tb.add(lineMesh)
              }

            },

            render: function (gl, matrix) {
              window.tb.update();
            }
          });

          map.addLayer(
            {
              'id': 'places_circles',
              'type': 'circle',
              'source': 'places',
              'paint': {
                'circle-color': ["case",
                  ["==", ["typeof", ["get", "price"]], "number"],
                  ['interpolate', ['linear'], ['get', 'price'], // 'property_name' is the property in your data source
                    /* Define your property values and corresponding colors here */
                    Math.min(...Object.values(allPrices).filter(value => value< 100000)), '#98fb98', // For example, if property value is 0, color the circle with '#34a203'
                    Math.max(...Object.values(allPrices).filter(value => value< 100000)), '#ffa500', // For example, if property value is 50, color the circle with '#ff0000'
                    /* Add more property values and corresponding colors as needed */
                  ]
                  ,
                  "gray"
                ],
                'circle-radius': 5,
                //'circle-stroke-width': 1,
                //'circle-stroke-color': '#333',
              }
            },
          );
          map.on('click', 'places_circles', function (e) {
            setSelectedPin(e.features[0]);
            fetchFlights(e.features[0].id);
          });
          //Create a popup, but don't add it to the map yet.
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
      });


        //   map.on('mouseenter', 'places_circles', (e) => {
        //     console.log(e)
        //     // Change the cursor style as a UI indicator.
        //     map.getCanvas().style.cursor = 'pointer';

        //     // Copy coordinates array.
        //     const coordinates = e.features[0].geometry.coordinates.slice();
        //     const description = e.features[0].properties.description;

        //     // Ensure that if the map is zoomed out such that multiple
        //     // copies of the feature are visible, the popup appears
        //     // over the copy being pointed to.
        //     while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        //         coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        //     }

        //     // Populate the popup and set its coordinates
        //     // based on the feature found.
        //     popup.setLngLat(coordinates).setHTML(description).addTo(map);
        // });

        map.on('mouseenter', 'places_circles', (e) => {
          console.log(e);
        
          // Change the cursor style as a UI indicator.
          map.getCanvas().style.cursor = 'pointer';
        
          // Copy coordinates array.
          const coordinates = e.features[0].geometry.coordinates.slice();
          const description = e.features[0].properties.description;
        
          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
        
          // Render popup message using React component.
          const formattedDate = 'Some formatted date'; // Replace with your date formatting logic
          const popupContent = ReactDOMServer.renderToStaticMarkup(
            <PopupCard place={e} />
          );
        


            popup.setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
        });

        map.on('mouseleave', 'places_circles', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

          
          setLoading(false); // Set loading to false after data is loaded
        });
    });

    return () => {
      // Clean up function to remove map instance when component unmounts
      map.remove();
    };
  }, [leftSidebarCollapsed, rightSidebarCollapsed, allPrices]);

  const generateMockFlights = () => {
    const mockFlights = [];
  
    for (let i = 0; i < 31; i++) {
      const departureDateTime = new Date(Date.now() + Math.random() * 86400000); // Random departure time within the next 24 hours
      const arrivalDateTime = new Date(departureDateTime.getTime() + Math.random() * 10800000); // Random arrival time within 3 hours after departure
      const duration = `${Math.floor((arrivalDateTime - departureDateTime) / 3600000)}h ${Math.floor(((arrivalDateTime - departureDateTime) % 3600000) / 60000)}m`; // Duration in hours and minutes
      const price = Math.floor(Math.random() * 500) + 100; // Random price between 100 and 600
      const stops = Math.floor(Math.random() * 4); // Random number of stops between 0 and 3
  
      const flight = {
        destinationId: i + 1,
        data:[{
        itineraries: [
          {
            segments: [
              {
                departure: {
                  at: departureDateTime.toISOString() // ISO 8601 formatted departure time
                },
                arrival: {
                  at: arrivalDateTime.toISOString() // ISO 8601 formatted arrival time
                }
              }
            ],
            duration: duration
          }
        ],
        price: {
          total: price,
          grandTotal: price
        },
        stops: stops
      }]};
  
      mockFlights.push(flight);
    }
  
    return mockFlights;
  };
  


  useEffect(() => {
    if (searchClicked && startDate !== '' && endDate !== '') {
      const mockData = generateMockFlights();
      setFlights(mockData);
      setSearchClicked(false); // Reset searchClicked after search is triggered
    }
  }, [searchClicked, startDate, endDate]);

  useEffect(() => {
    // Fetch flight prices for all destinations from Lisbon
    const fetchAllPrices = async () => {
      try {
        const originCode = 'LIS'; // Lisbon airport code
        const departureDate = startDate || '2024-07-15'; // Default departure date
        const returnDate = endDate || '2024-07-20'; // Default return date
        const maxPrice = 250; // Maximum price for filtering
        const prices = {};
        const data = generateMockFlights() //await fetchFlightOffersParallel(originCode, airportCodes.codes, departureDate, returnDate, maxPrice);
        
        data.map((d)=>{
          const lowestPrice = Math.min(...d.data.map((d) => parseInt(d.price.grandTotal)));
          prices[d['destinationId']] = lowestPrice;
      })

        // for (const d in Object.values(data)) {
        //   //const destinationCode = d[0].itineraries[0].segments[-1].arrival.iataCode
        //   const lowestPrice = Math.min(...d.data.map((d) => parseInt(d.price.grandTotal)));
        //   prices[d['destinationId']] = lowestPrice;
        // }

        setAllPrices(prices);
      } catch (error) {
        console.error('Error fetching flight prices for all destinations:', error);
      }
    };

    fetchAllPrices(); // Fetch flight prices when component mounts or when date changes

  }, [startDate, endDate]); // Trigger effect when startDate or endDate changes

  const rgbToHex = (rgb) => {
    return `0x${rgb.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
  };
  // Function to determine color gradient based on price
  const getColorByPrice = (price) => {
    try {
      // Define color range from light green to orange
      const colorRange = [
        { price: Math.min(...Object.values(allPrices).filter(value => value< 100000)), color: [152, 251, 152] }, // Light green
        { price: Math.max(...Object.values(allPrices).filter(value => value< 100000)), color: [255, 165, 0] }  // Orange
      ];

      // Find appropriate color based on price
      for (let i = 1; i < colorRange.length; i++) {
        if (price <= colorRange[i].price) {
          const prevColor = colorRange[i - 1].color;
          const nextColor = colorRange[i].color;
          const ratio = (price - colorRange[i - 1].price) / (colorRange[i].price - colorRange[i - 1].price);
          const color = prevColor.map((channel, index) => Math.round(channel + ratio * (nextColor[index] - channel)));
          const color_threejs = new THREE.Color(`rgb(${color.join(',')})`);
          return color_threejs;
        }
      }

      return new THREE.Color('gray'); // Default to red if price exceeds range
    }
    catch (error) {
      return new THREE.Color('gray');
    }
  };


  const fetchFlightOffersParallel = async (originCode, destinationCodes, departureDate, returnDate, maxPrice, signal, retries = 3) => {
    try {
      const token = await fetchAccessToken();
  
      async function get_responses(destinationCodeId, retryCount) {
        if (retryCount === 0) return null; // No more retries left
  
        const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destinationCodes[destinationCodeId]}&departureDate=${departureDate}&returnDate=${returnDate}&adults=1&nonStop=false&max=10`;
  
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal: signal // Pass the signal to the fetch options
          });
  
          if (!response.ok) {
            console.log(`Failed to fetch flight offers for ${destinationCodes[destinationCodeId]}: ${response.status}`);
            return await get_responses(destinationCodeId, retryCount - 1); // Retry
          }
  
          const responseData = await response.json();
          responseData.destinationId = destinationCodeId;
          console.log(`Success fetching flight offers for ${destinationCodes[destinationCodeId]}: ${response.status}`);
          return responseData;
        } catch (error) {
          console.error(`Error fetching flight offers for ${destinationCodes[destinationCodeId]}:`, error);
          return await get_responses(destinationCodeId, retryCount - 1); // Retry
        }
      };
  
      const requests = Object.keys(destinationCodes).map(destinationCodeId => get_responses(destinationCodeId, retries));
      const results = await Promise.all(requests);
      return results.filter(x => x !== null && x.data && x.data.length);
    } catch (error) {
      console.error('Error fetching flight offers in parallel:', error);
      return []; // Return empty array instead of throwing error
    }
  };
  

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

      const data = generateMockFlights() 
      // await fetchFlightOffers(originCode, destinationCode, departureDate, returnDate, maxPrice, signal);
      setLoading(false);
      setFlights(data.data);
    } catch (error) {
      console.error('Error fetching flight offers:', error);
    }
  };


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





  return (

    <div className="flex flex-col h-screen">
      <div className="w-full z-40 flex flex-wrap items-center justify-between mx-auto p-4  bg-white border-white">
        <div id='logo' className="logo flex flex-col items-center px-8">
          <span className="logo-text font-[Glendale] text-[21px] font-bold text-black">ANYWHERE</span>
          <span className="logo-sub-text font-[Gilroy] text-[13px] text-black">By GPTur</span>
        </div>
        <div className="md:flex md:order-2 space-x-3 hidden md:space-x-0 rtl:space-x-reverse">
          <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Get started</button>
          <button data-collapse-toggle="navbar-cta" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-cta" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>
        <div className="items-center justify-between w-full md:flex md:w-auto md:order-1 gap-6" id="navbar-cta">
          <div className='flex  gap-3'>
            Dates:<Datepicker showShortcuts={false} value={startDateObj} onChange={handleDateChange} />
          </div>

          <button type="button" onClick={handleButtonClick} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
        </div>
      </div>

      <div className="flex flex-1">


        <div className="flex-1 bg-white h-full">
          <div className='relative w-[100%] h-[100%] z-10' id="map" >
            <div id='left-bar' className={`w-1/4 absolute left-0 top-0 bg-gray-200 h-full z-10 ${leftSidebarCollapsed ? 'hidden' : ''}`}>
              <div className='w-8 absolute left-[100%] z-60'>
                <ChevronDoubleLeftIcon onClick={toggleLeftSidebar}>Toggle Right Sidebar</ChevronDoubleLeftIcon>
              </div>
            </div>
            <div className={`absolute left-0 top-0 ${!leftSidebarCollapsed ? 'hidden' : ''}`}>
              <div className='w-8 relative left-0 z-60'>
                <ChevronDoubleRightIcon onClick={toggleLeftSidebar}>Toggle Right Sidebar</ChevronDoubleRightIcon>
              </div>
            </div>
            <RightSideBar flights={flights} rightSidebarCollapsed={rightSidebarCollapsed} toggleRightSidebar={toggleRightSidebar}></RightSideBar>

            <div className={`absolute right-0 top-0 ${!rightSidebarCollapsed ? 'hidden' : ''}`}>
              <div className='w-8 relative right-0 z-60'>
                <ChevronDoubleLeftIcon onClick={toggleRightSidebar}>Toggle Right Sidebar</ChevronDoubleLeftIcon>
              </div>

            </div>
          </div>
        </div>


      </div>
    </div>


  )
}

export default App






