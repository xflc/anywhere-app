import React from 'react';
import { ChevronDoubleRightIcon } from '@heroicons/react/24/solid';


function FlightCard({ flight, flights }){
  // Extracting relevant information from the flight object
  const { id, itineraries, price, lastTicketingDate } = flight;
  const departureDateTime = itineraries[0].segments[0].departure.at;
  const arrivalDateTime = itineraries[0].segments[itineraries[0].segments.length - 1].arrival.at;
  const duration = itineraries[0].duration;

  return (
    <div className="h-14 p-2.5 bg-white rounded-lg shadow border border-neutral-200 justify-start items-center gap-16 inline-flex">
      <div className="flex-col justify-start items-start gap-0.5 inline-flex">
        <div className="w-36 text-neutral-900 text-xs font-extrabold font-['Inter'] leading-none">{departureDateTime.slice(8, 10)}/{departureDateTime.slice(5, 7)} ({departureDateTime.slice(11, 16)}) - {arrivalDateTime.slice(8, 10)}/{arrivalDateTime.slice(5, 7)}({arrivalDateTime.slice(11, 16)})</div>
        <div className="w-40 text-neutral-900 text-xs font-light font-['Inter'] leading-none">{duration}</div>
      </div>
      <div className="justify-end items-center gap-3.5 flex">
        <div className="w-9 h-px rotate-90 border border-neutral-200"></div>
        <div className="flex-col justify-center items-center gap-1 inline-flex">
          <div className="w-12 text-center text-green-700 text-xs font-extrabold font-['Inter'] leading-3">{price.total}€</div>
          <div className="justify-center items-center gap-0.5 inline-flex">
            <div className="text-right text-neutral-900 text-xs font-light font-['Inter'] leading-3">{itineraries[0].segments.length - 1} stops</div>
          </div>
        </div>
      </div>
    </div>
  );
}
  

function RightSideBar({flights, rightSidebarCollapsed, toggleRightSidebar }) {
    return (
        <div id='right-bar' className={`w-1/4 absolute right-0 top-0 bg-gray-200 h-full p-4 z-10 ${rightSidebarCollapsed ? 'hidden' : ''}`}>
            <div className='w-8 relative right-12 z-60'>
                <ChevronDoubleRightIcon onClick={toggleRightSidebar}>Toggle Right Sidebar</ChevronDoubleRightIcon>
            </div>

            {flights.map((flight, index) => (
              <FlightCard key={index} flight={flight} flights />
            ))}

        </div>
    );
}

export default RightSideBar;

