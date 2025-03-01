import * as Location from 'expo-location';

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    
    if (response[0]) {
      return {
        city: response[0].city,
        state: response[0].region,
        country: response[0].country,
        postalCode: response[0].postalCode,
      };
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

const handleSubmit = async () => {
  try {
    const locationDetails = await reverseGeocode(
      location.latitude,
      location.longitude
    );

    const incidentData = {
      title,
      description,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      locationDetails,
      createdAt: new Date().toISOString(),
      reportedBy: user.uid,
      isAnonymous,
      mediaUrls: uploadedMediaUrls,
      votes: 0,
      commentCount: 0,
      flagCount: 0,
    };

    await addDoc(collection(db, 'incidents'), incidentData);
  } catch (error) {
    console.error('Error submitting incident:', error);
  }
}; 