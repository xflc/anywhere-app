// PopupCard.js
import React from 'react';

const PopupCard = ({ place }) => {
    return (
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
        <img src={place.features[0].properties.link} alt="Place" className="w-full mb-2 rounded-lg" />
        <h2 className="text-xl font-semibold mb-2">{place.features[0].properties.title}</h2>
        <p className="text-sm">{place.features[0].properties.description}</p>
      </div>
    );
  };
  

export default PopupCard;
