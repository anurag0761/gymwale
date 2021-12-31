import React, {Component} from 'react';
import AppContainer from './src/navigation/navigator';
import * as globals from './src/utils/globals';
import {Provider as StoreProvider} from 'react-redux';
import {Alert, Platform} from 'react-native';
// import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import {TestIds, BannerAd, BannerAdSize} from '@react-native-firebase/admob';
import { PersistGate } from 'redux-persist/integration/react';

// import { notifications, NotificationMessage, Android, } from 'react-native-firebase-push-notifications'

// import persistor from './src/Redux/Store';
import {Store, Persistor} from './src/Redux/Store';
// import {Store} from './src/Redux/Store'
// import {Store,Persistor} from './src/Redux/Store'
import AsyncStorage from '@react-native-community/async-storage';

// if (Platform.OS === 'android') {
//   const channel = new firebase.notifications.Android.Channel(
//     'test-channel',
//     'Test Channel',
//     firebase.notifications.Android.Importance.Max,
//   ).setDescription('My apps test channel');
//   firebase.notifications().android.createChannel(channel);
// }
// const messaging = firebase.messaging();

// messaging
//   .hasPermission()
//   .then((enabled) => {
//     if (enabled) {
//       messaging
//         .getToken()
//         .then(async (token) => {
//           console.log('====================================');
//           console.log(token);
//           console.log('====================================');
//         })
//         .catch((error) => {
//           console.log('erorr::', error);
//         });
//     } else {
//       messaging
//         .requestPermission()
//         .then(() => {})
//         .catch((error) => {
//           console.log('erorr:::', error);
//         });
//     }
//   })
//   .catch((error) => {});
export default class App extends Component {
  constructor(properties) {
    super(properties);
  }

  componentWillUnmount() {
    // this.listener1();
    // this.listener2();
    // this.listener3();
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }
  async check() {
    let value = await AsyncStorage.getItem('newsetting');
    let data = JSON.parse(value);
    return data;
  }

  async componentDidMount() {
    await globals.loadAppData();
    messaging().onMessage(async (remoteMessage) => {
      Alert.alert(
        'A new FCM message arrived!',
        JSON.stringify(remoteMessage.notification.body),
      );
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    });

    this.requestUserPermission();
  }

  getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log(fcmToken);
      console.log('Your Firebase Token is:', fcmToken);
    } else {
      console.log('Failed', 'No token received');
    }
  };
  requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      this.getFcmToken(); //<---- Add this
      console.log('Authorization status:', authStatus);
    }
  };

  render() {
    return (
      <StoreProvider store={Store}>
        <PersistGate persistor={Persistor}>
          <AppContainer />
      </PersistGate>
      </StoreProvider>
    );
  }
}
// //Production signature::: HfMMsIqhrQU
