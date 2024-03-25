import React from 'react';
import places_tags from './places_tags.json';
import places_details from './places_details.json';

function Leftbar({ id: selected_place }) {
  // Find the data for the given ID
  const countryData = places_tags[selected_place.id];
  const placeDetails = places_details[selected_place.id];

  if (!countryData) {
    return <div>No data found for the provided ID.</div>;
  }

  // Helper function to render tags with emojis
  const renderTagsWithEmojis = (tags) => {
    const emojis = {
      'Beach': '🏖️',
      'Mountain': '⛰️',
      'City': '🏙️',
      'Island': '🏝️',
      'Countryside': '🏞️',
      'Desert': '🏜️',
      'Rainforest': '🌳',
      'Historic': '🏛️',
      'Adventure': '⛷️',
      'Relaxation': '🧘',
      'Romance': '💖',
      'Cultural': '🎭',
      'Wildlife': '🦁',
      'Tropical': '🌴',
      'Temperate': '🌤️',
      'Arctic/Antarctic': '❄️',
      'Overwater_Bungalows': '🏠',
      'Boutique_Hotels': '🏨',
      'Luxury_Resorts': '🏰',
      'Eco-Friendly': '🌿',
      'Gourmet': '🍽️',
      'Local_Cuisine': '🥘',
      'Remote': '🏞️',
      'Easily Accessible': '🚗',
      'Luxury': '💎',
      'Budget-Friendly': '💰',
      'Spa_&_Wellness': '💆‍♂️',
      'Photography': '📸',
      'Adventure Sports': '🚵‍♂️',
    };

    return tags.map((tag) => (
      <div key={tag} className="rounded-full bg-white border border-gray-300 p-1 mr-1">
        <span>{emojis[tag]} {tag}</span>
      </div>
    ));
  };

  return (
    <div className="bg-gray-200 p-4">
        {selected_place.properties.link && <img src={selected_place.properties.link} alt="Country" className="mb-4" />}

      <h2 className="text-lg font-bold">{countryData.country_name}</h2>
      <div className="mt-6">
        <h3 className="text-sm font-semibold">Weather Description:</h3>
        <p className="text-sm">{placeDetails.weather_description}</p>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Destination Tags:</h3>
        <div className="flex flex-wrap">{renderTagsWithEmojis(countryData.destination_tags)}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Activity Tags:</h3>
        <div className="flex flex-wrap">{renderTagsWithEmojis(countryData.activity_tags)}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Climate Tags:</h3>
        <div className="flex flex-wrap">{renderTagsWithEmojis(countryData.climate_tags)}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Accommodation Tags:</h3>
        <div className="flex flex-wrap">{renderTagsWithEmojis(countryData.accommodation_tags)}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Cuisine Tags:</h3>
        <div className="flex flex-wrap">{renderTagsWithEmojis(countryData.cuisine_tags)}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Accessibility Tags:</h3>
        <div className="flex flex-wrap">{renderTagsWithEmojis(countryData.accessibility_tags)}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Budget Tags:</h3>
        <div className="flex flex-wrap">{renderTagsWithEmojis(countryData.budget_tags)}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Special Interests Tags:</h3>
        <div className="flex flex-wrap">{renderTagsWithEmojis(countryData.special_interests_tags)}</div>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-semibold">Average Hotel Prices:</h3>
        <p className="text-sm">3 Star: ${placeDetails.hotel_prices['3_star']}</p>
        <p className="text-sm">4 Star: ${placeDetails.hotel_prices['4_star']}</p>
        <p className="text-sm">5 Star: ${placeDetails.hotel_prices['5_star']}</p>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold">Peak Tourist Months:</h3>
        <ul className="text-sm">
          {placeDetails.peak_tourist_months.map(month => (
            <li key={month}>{month}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default Leftbar;
