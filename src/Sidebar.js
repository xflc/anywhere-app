import React from 'react';
import './Sidebar.css'

function FlightSegment({ segment }) {
  return (
    <div className='dropdown-flight-detail' style={{ marginLeft: '20px' }}>

              <div className={'flight-detail1'}> 
                <div className={'dates-places'}>
                  <span className={'text24'}>
                    <span>02 Feb</span>
                  </span>
                  <span className={'text26'}>
                    <span>{segment.departure.iataCode + ' - ' + segment.arrival.iataCode}</span>
                  </span>
                </div>
                <div className={'dates-places'}>
                  <span className={'text28'}>
                    <span>{new Date(segment.departure.at).toLocaleString()} - {new Date(segment.arrival.at).toLocaleString()} </span>
                  </span>
                </div>
              </div>
            </div>
  );
}

function Flight({ flight }) {
  return (
    <div className='flight' style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      
      <strong>Departure City:</strong> {flight.itineraries[0].segments[0].departure.iataCode}<br />
      <strong>Destination City:</strong> {flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}<br />
      <strong>Departure Time:</strong> {new Date(flight.itineraries[0].segments[0].departure.at).toLocaleString()}<br />
      <strong>Arrival Time:</strong> {new Date(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at).toLocaleString()}<br />
      <strong>Price:</strong> {flight.price.currency} {flight.price.total}<br />
      <h4>Ida</h4>
      {flight.itineraries[0].segments.map((segment, segmentIndex) => (
        <FlightSegment key={segmentIndex} segment={segment} />
      ))}
      <h4>Volta</h4>
      {flight.itineraries[1].segments.map((segment, segmentIndex) => (
        <FlightSegment key={segmentIndex} segment={segment} />
      ))}
    </div>
  )
}

function LoadingAnimation() {
  return (
    <span class="loader"> <img
    alt="Polygon37158"
    src="/loading.svg"
    className={'arrow_down_ico_load'}
  /></span>  );
}



function FlightSummary({ flight, flights  }) {
  const departureDate = new Date(flight.itineraries[0].segments[0].departure.at); // Get the current date
  const formattedDepartureDate = departureDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }); // Format the date
  const returnDate = new Date(flight.itineraries[1].segments[0].arrival.at); // Get the current date
  const formattedReturnDate = returnDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }); // Format the date

  return (
  <div >
    <div className={'title'}>
      <span className={'text'}>
        <span>{}</span>
      </span>
      <div className={'summary-from-to-div'}>
        <span className={'summary-from-to'}>
            <span>To:</span>
          </span>
        <span className={'summary-from-to-value'}>
          <span>{flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}</span>
        </span>
        </div>
        <div className={'summary-from-to-div'}>
          <span className={'summary-from-to'}>
            <span>From:</span>
          </span>
          <span className={'summary-from-to-value'}>
            <span>{flight.itineraries[0].segments[0].departure.iataCode}</span>
          </span>
        </div>
      
    </div>
    <div className={'flight-div'}>
      <div className={'dates'}>
        <span className={'text08'}>
          <span>{formattedDepartureDate} - {formattedReturnDate}</span>
        </span>
        <span className={'text10'}>
          <span>21 noites | Fri - Tue</span>
        </span>
      </div>
      <div className={'frame21'}>
        <img
          alt="Line27157"
          src="/line27157-v467.svg"
          className={'line2'}
        />
        <div className={'price-stops'}>
          <span className={'price'}>
            <span>{flight.price.currency} {flight.price.total}</span>
          </span>
          <div className={'frame22'}>
            <span className={'text14'}>
              <span>{flight.itineraries[0].segments.length} stops</span>
            </span>
            <img
              alt="Polygon37158"
              src="/arrow_down_ico.svg"
              className={'arrow_down_ico'}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

function Sidebar({ selectedPin, flights, loading }) {
  return (
    <div className='side-bar'>
      {loading ? (
        <LoadingAnimation />
      ) : 
      (
        selectedPin && (
          <div className='sidebar-container'>
            <div className='title-sidebar'>
              <h2>{selectedPin.properties.title}</h2>
              <h3>Flights:</h3>
            </div>
            {flights.map((flight, index) => (
              <FlightSummary  key={index} flight={flight} flights/>
            ))}
          </div>
        )
      )
      }
    </div>
  );
}

export default Sidebar;
