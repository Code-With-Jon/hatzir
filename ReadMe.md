# Community Watch App

A mobile application built with React Native and Expo that enables community members to report and track incidents in their neighborhood.

## Features

- 📱 Real-time incident reporting
- 🗺️ Interactive map view of incidents
- 👤 User authentication
- 📝 Detailed incident reports
- 📍 Location-based services
- 🔔 Push notifications

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

## Installation

1. Clone the repository:
git clone https://github.com/yourusername/community-watch-app.git
cd community-watch-app

2. Install dependencies:
npm install

3. Create a `.env` file in the root directory and add your Firebase configuration:

FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id

## Running the App

1. Start the development server:
npx expo start

2. Use the Expo Go app on your mobile device to scan the QR code, or run on an emulator.

## Project Structure
src/
├── config/ # Configuration files
├── navigation/ # Navigation setup
├── redux/ # Redux store and slices
├── screens/ # Screen components
│ ├── Auth/ # Authentication screens
│ ├── Map/ # Map-related screens
│ └── Reports/ # Reporting screens
└── components/ # Reusable components


## Technologies Used

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)
Project Link: [https://github.com/yourusername/community-watch-app](https://github.com/yourusername/community-watch-app)# hatzir
