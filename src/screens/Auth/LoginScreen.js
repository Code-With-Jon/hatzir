import React from 'react';
import { Image, View, StyleSheet, Button } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/authSlice';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "372676417589-1ugh97dvbq2vsfj77cugfsovuv5di2jq.apps.googleusercontent.com",
    iosClientId: "372676417589-1ugh97dvbq2vsfj77cugfsovuv5di2jq.apps.googleusercontent.com",
    expoClientId: "372676417589-j9ij7rfalkcbg8u05bfda2mqg473i5sk.apps.googleusercontent.com",
    scopes: ['profile', 'email']
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('Authentication successful:', authentication);
      handleGoogleLogin(authentication.accessToken);
    } else if (response?.type === 'error') {
      console.error('Authentication error:', response.error);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken) => {
    try {
      // Fetch user info using the access token
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      const userData = await userInfoResponse.json();
      console.log('User data:', userData);

      // Create user object from Google data
      const user = {
        uid: userData.id,
        email: userData.email,
        name: userData.name,
        photoURL: userData.picture
      };
      
      dispatch(setUser(user));
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleTestLogin = () => {
    const testUser = {
      uid: 'test123',
      email: 'test@example.com',
      name: 'Test User'
    };
    dispatch(setUser(testUser));
  };

  return (
    <View style={styles.container}>
      {/* <Image 
        source={require('../../../assets/logo.png')}
        style={styles.logo}
      /> */}
      <Button
        title="Sign in with Google"
        disabled={!request}
        onPress={() => promptAsync()}
      />
      <Button
        title="Test Login (Dev Only)"
        onPress={handleTestLogin}
        color="#666"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  }
});

export default LoginScreen; 