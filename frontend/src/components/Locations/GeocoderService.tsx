// Helper service to handle geocoding and reverse geocoding operations
export const GeocoderService = {
  /**
   * Gets an address from coordinates using Google Maps Geocoder API
   * @param lat Latitude
   * @param lng Longitude
   * @returns Promise with the formatted address
   */
  getAddressFromCoordinates: (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat, lng };

        geocoder.geocode({ location: latlng }, (results, status) => {
          if (
            status === google.maps.GeocoderStatus.OK &&
            results &&
            results.length > 0
          ) {
            // Usually the first result is the most accurate full address
            resolve(results[0].formatted_address);
          } else {
            reject(new Error('No address found for these coordinates'));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Gets coordinates from an address using Google Maps Geocoder API
   * @param address The address to geocode
   * @returns Promise with the coordinates {lat, lng}
   */
  getCoordinatesFromAddress: (
    address: string
  ): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      try {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
          if (
            status === google.maps.GeocoderStatus.OK &&
            results &&
            results.length > 0
          ) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng(),
            });
          } else {
            reject(new Error('No coordinates found for this address'));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },
};

export default GeocoderService;
