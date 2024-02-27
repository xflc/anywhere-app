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

function App() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [selectedPin, setSelectedPin] = useState("");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [searchClicked, setSearchClicked] = useState(false); // Track whether search button is clicked

  const [endDate, setEndDate] = useState('');

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



    // randomly generate some line arcs (not essential for understanding this demo)






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
            // 	return (direction)/arcSegments;
            // })

            for (var l = 0; l <= arcSegments; l++) {
              var waypoint = [lisbon_coor[0] + increment[0] * l, lisbon_coor[1] + increment[1] * l]

              var waypointElevation = Math.sin(Math.PI * l / arcSegments) * maxElevation;

              waypoint.push(waypointElevation);
              line.push(waypoint);
            }

            lines.push(line)




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
                var lineOptions = {
                  geometry: line,
                  color: 0x34a203, // color based on latitude of endpoint
                  width: 1, // random width between 1 and 2
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
                'circle-color': '#34a203',
                'circle-radius': 4,
                //'circle-stroke-width': 1,
                //'circle-stroke-color': '#333',
              }
            },
          );
            map.on('click', 'places_circles', function (e) {
              setSelectedPin(e.features[0]);
              fetchFlights(e.features[0].id);
            });
          setLoading(false); // Set loading to false after data is loaded
        });
    });
  
    return () => {
      // Clean up function to remove map instance when component unmounts
      map.remove();
    };
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
            <RightSideBar flights={flights} rightSidebarCollapsed={rightSidebarCollapsed} toggleRightSidebar= {toggleRightSidebar}></RightSideBar>

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






