import React, {Component} from 'react';
import {
  Text,
  Image,
  View,
  Dimensions,
  StyleSheet,
  StatusBar,
  TextInput,
  Keyboard,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import CardView from 'react-native-rn-cardview';
import DeviceInfo from 'react-native-device-info';
import CountryPicker from 'react-native-country-picker-modal';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import RNSimData from 'react-native-sim-data';
import ActionSheet from 'react-native-action-sheet';
//import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
//import TruecallerAuthModule from 'react-native-truecallerwrapper';
//"react-native-truecallerwrapper": "file:.../", in package.json

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const headerImageWidth = screenWidth * (420 / 750);
const headerImageHeight = screenWidth * (76 / 750);

const phoneIconWidth = screenWidth * (50 / 750);
const phoneIconHeight = screenWidth * (57 / 750);

const lockIconWidth = screenWidth * (50 / 750);
const lockIconHeight = screenWidth * (31 / 750);

const API_URL_GET_USER_INFO = 'https://gymvale.com/api/v1/api/login';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

const countries = require('country-data').countries;

let phoneNumberSelectionOptions = [];
let phoneNumberSelectionOptionsIOS = [];

//Uncomment the following codes for Android

import TRUECALLER, {
  TRUECALLER_EVENT,
  TRUECALLER_CONSENT_MODE,
  TRUECALLER_CONSENT_TITLE,
  TRUECALLER_FOOTER_TYPE,
} from 'react-native-truecaller-sdk';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {resendOtpCode} from '../Redux/Actions/SendOtpAction';
import AsyncStorage from '@react-native-community/async-storage';

//Uncomment the following codes for Android

//import TRUECALLER,{TRUECALLEREvent} from "react-native-truecaller";
let data;
class StartScreen extends Component {
  constructor(properties) {
    super(properties);

    let motivationalQuotes = globals.getMotivationalQuotes();
    let randomQuoteIndex = Math.floor(
      Math.random() * motivationalQuotes.length,
    );
    let motivationalQuote = motivationalQuotes[randomQuoteIndex];

    this.state = {
      phoneNumber: '',
      countryCode: 'IN',
      callingCode: '91',
      isLoading: false,
      motivationalQuote: motivationalQuote,
      sim1CallingCode: '',
      sim1PhoneNumber: '',
      sim1CountryCode: '',
      sim2CallingCode: '',
      sim2PhoneNumber: '',
      sim2CountryCode: '',
      willShowSimNumberSelectionDialog: false,
    };
  }

  componentDidMount() {
    this._retrieveData();
    //console.log(countries);
    /*
        if(Platform.OS === "android") {
            this.getAndShowSimPhoneNumbersIfAvailable();
        }
        */

    //this.requestForPhotosPermissionIfNotGranted();
    /*
        if(Platform.OS === "ios"){
            TRUECALLER.initializeClientIOS('H23wLc602704e7f104abb9c0dc721d7f2123d','https://sibe2a8f83ad9a4cd5a1206a3df9989341.truecallerdevs.com');
        }
        else{
            TRUECALLER.initializeClient();
        }
        */

    //Uncomment the following codes for Android

    TRUECALLER.initializeClient(
      TRUECALLER_CONSENT_MODE.Popup,
      TRUECALLER_CONSENT_TITLE.Login,
      TRUECALLER_FOOTER_TYPE.Continue,
    );
    TRUECALLER.on(TRUECALLER_EVENT.TrueProfileResponse, (profile) => {
      console.log('Truecaller profile data: ', profile);
      let countryCode = profile.countryCode;
      let country = countries[countryCode];
      console.log('User Country:::');
      console.log(country);
      let phoneNumber = profile.phoneNumber;
      phoneNumber = phoneNumber.replace('+', '');
      let callingCode = country.countryCallingCodes[0];
      callingCode = callingCode.replace('+', '');
      phoneNumber = phoneNumber.substring(callingCode.length);
      console.log(
        'callingCode::' + callingCode + '##phone number::' + phoneNumber,
      );
      this.setState({
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        callingCode: callingCode,
      });

      this.signUpOrSignInWithTrueCaller(callingCode, phoneNumber);
    });

    TRUECALLER.on(TRUECALLER_EVENT.TrueProfileResponseError, (error) => {
      console.log('User rejected the truecaller consent request! ', error);
      //Utils.showAlert("", "Some error occurred while signing with TrueCaller. Please try again.");
    });

    //Uncomment the following codes for Android
  }

  /*
    requestForPhotosPermissionIfNotGranted() {
        try {
            const granted = PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              {
                title: "Access External Storage",
                message:
                  "Cool Photo App needs access to your camera " +
                  "so you can take awesome pictures.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
              }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              //console.log("You can use the gallery");
            } else {
              //console.log("Camera permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    }
    */

  onPhoneNumberChange = (text) => {
    this.setState({
      phoneNumber: text,
    });
  };

  proceed() {
    if (this.state.phoneNumber.length === 0) {
      this.showAlert('Error!', 'Please enter your phone number.');
      return;
    }
    this.checkWhetherUserExistsOrNot(
      this.state.callingCode,
      this.state.phoneNumber,
    );
  }

  verifyThroughTrueCaller() {
    /*
        TRUECALLER.on(TRUECALLEREvent.TrueProfileResponse, (profile) => 
        {
            console.log('Truecaller profile data: ',profile);
            let countryCode = profile.countryCode;
            let country = countries[countryCode];
            console.log("User Country:::");
            console.log(country);
            let phoneNumber = profile.phoneNumber;
            phoneNumber = phoneNumber.replace('+', "");
            let callingCode = country.countryCallingCodes[0];
            callingCode = callingCode.replace("+", "");
            phoneNumber = phoneNumber.substring(callingCode.length);
            console.log("callingCode::" + callingCode + "##phone number::" + phoneNumber);
            this.setState({
                phoneNumber: phoneNumber,
                countryCode: countryCode,
                callingCode: callingCode,
            });

            this.signUpOrSignInWithTrueCaller(callingCode, phoneNumber);
        });
        
        TRUECALLER.on(TRUECALLEREvent.TrueProfileResponseError, (error) => 
        {
            //Toast.show(error.profile,Toast.SHORT);
            console.log('User rejected the truecaller consent request! ', error);
        });
        */
    //TRUECALLER.requestTrueProfile();

    //Uncomment the following codes for Android

    TRUECALLER.isUsable((result) => {
      if (result === true) {
        console.log('Authenticate via truecaller flow can be used');
        TRUECALLER.requestTrueProfile();
      } else {
        console.log(
          'Either truecaller app is not installed or user is not logged in',
        );
        Utils.showAlert(
          '',
          'App is not installed or not logged in. Please install TrueCaller app and log in.',
        );
      }
    });

    //Uncomment the following codes for Android
  }

  checkWhetherUserExistsOrNot(phoneCode, phoneNumber) {
    let thisInstance = this;

    this.setState({
      isLoading: true,
    });
    let body = 'phone=' + phoneNumber + '&country_code=' + phoneCode;
    console.log('Body:::' + body);
    fetch(API_URL_GET_USER_INFO, {
      method: 'post',
      body: body,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log('User Check response:::');
        console.log(responseJson);

        thisInstance.setState({
          isLoading: false,
        });

        if (responseJson[Constants.KEY_VALID]) {
          globals.setOneSetting(globals.KEY_USER_INFO, responseJson);
          let body = responseJson[Constants.KEY_BODY];
          let passwordStatus = body[Constants.KEY_PASSWORD_STATUS];
          if (
            passwordStatus !== null &&
            passwordStatus === Constants.STATUS_ACTIVE
          ) {
            thisInstance.showAlertForLoginOptions();
          } else {
            thisInstance.goToOTPVerificationScreenWithTask(
              Constants.OTP_VERIFICATION_TASK_LOGIN,
            );
          }
        } else {
          thisInstance.goToOTPVerificationScreenWithTask(
            Constants.OTP_VERIFICATION_TASK_REGISTER,
          );

          /*
                let navigationParams = {};
                navigationParams[Constants.PARAM_CALLING_CODE] = this.state.callingCode;
                navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
                navigationParams[Constants.PARAM_PHONE_NUMBER] = this.state.phoneNumber;
                this.props.navigation.navigate("ProfileSelectionForRegister", navigationParams);
                */
        }
      })
      .catch((error) => {
        thisInstance.setState({
          isLoading: false,
        });
        console.log('Error while login....');
        console.log(error);
      });
  }

  showAlert(title, body) {
    Alert.alert(
      title,
      body,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: true},
    );
  }

  showAlertForLoginOptions() {
    Alert.alert(
      'Already Registered',
      'Which option you want to use to login?',
      [
        {
          text: 'OTP',
          onPress: () => {
            //this.sendOTP(Constants.OTP_VERIFICATION_TASK_LOGIN)
            this.goToOTPVerificationScreenWithTask(
              Constants.OTP_VERIFICATION_TASK_LOGIN,
            );
          },
        },
        {
          text: 'With Password',
          onPress: () => this.goToLoginWithPasswordScreen(),
        },
      ],
      {cancelable: true},
    );
  }

  sendOTP(otpVerificationTask) {
    this.setState({
      isLoading: true,
    });

    let thisInstance = this;
    this.props.resendOtpCode(
      Constants.KEY_PHONE +
        '=' +
        this.state.phoneNumber +
        '&' +
        Constants.KEY_COUNTRYCODE +
        '=' +
        this.state.callingCode,
    );
    setTimeout(() => {
      if (this.props.Success) {
        thisInstance.setState({
          isLoading: false,
        });

        console.log('OTP response:::');
        console.log(this.props.OtpData);

        if (this.props.OtpData[Constants.KEY_VALID]) {
          let otpCode = this.props.OtpData[Constants.KEY_OTP];
          thisInstance.goToOTPVerificationScreenWithOTP(
            otpCode,
            otpVerificationTask,
          );
        }
      } else {
        //thisInstance.showAlert("Login Error!!!", "Invalid Password. Please give correct password.");

        let message = 'Some error occurred. Please try again later.';

        Utils.showAlert('', message);
      }
    }, 2000);
  }

  goToOTPVerificationScreenWithOTP(otpCode, otpVerificationTask) {
    let navigationParams = {};
    navigationParams[Constants.PARAM_CALLING_CODE] = this.state.callingCode;
    navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
    navigationParams[Constants.PARAM_PHONE_NUMBER] = this.state.phoneNumber;
    navigationParams[Constants.KEY_OTP] = otpCode;
    navigationParams[Constants.KEY_OTP_VERIFICATION_TASK] = otpVerificationTask;
    console.log(navigationParams);
    this.props.navigation.navigate('OTPVerificationScreen', navigationParams);
  }

  goToOTPVerificationScreenWithTask(otpVerificationTask) {
    let navigationParams = {};
    navigationParams[Constants.PARAM_CALLING_CODE] = this.state.callingCode;
    navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
    navigationParams[Constants.PARAM_PHONE_NUMBER] = this.state.phoneNumber;
    navigationParams[Constants.KEY_OTP_VERIFICATION_TASK] = otpVerificationTask;
    console.log(navigationParams);
    this.props.navigation.navigate('OTPVerificationScreen', navigationParams);
  }

  goToLoginWithPasswordScreen() {
    let navigationParams = {};
    navigationParams[Constants.PARAM_CALLING_CODE] = this.state.callingCode;
    navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
    navigationParams[Constants.PARAM_PHONE_NUMBER] = this.state.phoneNumber;

    this.props.navigation.navigate('Login', navigationParams);
  }

  signUpOrSignInWithTrueCaller(countryCode, phoneNumber) {
    let thisInstance = this;

    this.setState({
      isLoading: true,
    });
    let body = 'phone=' + phoneNumber + '&country_code=' + countryCode;
    console.log('Body:::' + body);
    fetch(API_URL_GET_USER_INFO, {
      method: 'post',
      body: body,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log('User Check response:::');
        console.log(responseJson);

        thisInstance.setState({
          isLoading: false,
        });

        if (responseJson[Constants.KEY_VALID]) {
          globals.setOneSetting(globals.KEY_USER_INFO, responseJson);
          thisInstance.goToHomeScreen();
        } else {
          thisInstance.goToProfileSelectionScreen();
        }
      })
      .catch((error) => {
        thisInstance.setState({
          isLoading: false,
        });
        console.log('Error while login....');
        console.log(error);
      });
  }
  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('@home');
      if (value !== null) {
        // We have data!!
        data = await JSON.parse(value);
    
        // return getset(data);
      }
    } catch (error) {
      // Error retrieving data
      console.log('error', error);
    }
  };

  goToHomeScreen() {
    let userInfo = data[globals.KEY_USER_INFO];
    userInfo[Constants.KEY_USER_DATA] = userInfo[Constants.KEY_BODY];
    globals.setOneSetting(globals.KEY_USER_INFO, userInfo);
    globals.setOneSetting(globals.KEY_IS_USER_LOGGED_IN, true);
    globals.setOneSetting(
      globals.KEY_USER_ACCOUNT_SETUP_STATUS,
      globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED,
    );
    //this.props.navigation.navigate('MainApp');
    let body = userInfo[Constants.KEY_USER_DATA];
    let userType = body[Constants.KEY_USER_TYPE];
    if (userType === Constants.USER_TYPE_OWNER) {
      this.props.navigation.navigate('MainApp');
    } else if (userType === Constants.USER_TYPE_MEMBER) {
      this.props.navigation.navigate('MemberMainApp');
    }
  }

  goToProfileSelectionScreen() {
    let navigationParams = {};
    navigationParams[Constants.PARAM_CALLING_CODE] = this.state.callingCode;
    navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
    navigationParams[Constants.PARAM_PHONE_NUMBER] = this.state.phoneNumber;
    this.props.navigation.navigate(
      'ProfileSelectionForRegister',
      navigationParams,
    );
  }

  /*
    getAndShowSimPhoneNumbersIfAvailable() {
        try {
            
            console.log("Sim Info:::");
            console.log(RNSimData.getSimInfo());
            console.log("country code:::" + RNSimData.getSimInfo().countryCode0);
            console.log("phone number:::" + RNSimData.getSimInfo().phoneNumber0);
            
            phoneNumberSelectionOptions = [];
            phoneNumberSelectionOptionsIOS = [];
            let sim1CallingCode = '';
            let sim1PhoneNumber = '';
            let sim1CountryCode = '';
            let sim2CallingCode = '';
            let sim2PhoneNumber = '';
            let sim2CountryCode = '';
            let countryCode = RNSimData.getSimInfo().countryCode0;
            if(countryCode !== undefined && countryCode.length > 0) {
                countryCode = countryCode.toUpperCase();
                let country = countries[countryCode];
                // console.log("User Country:::");
                // console.log(country);
                let phoneNumber = RNSimData.getSimInfo().phoneNumber0;
                phoneNumberSelectionOptions.push(phoneNumber);
                phoneNumberSelectionOptionsIOS.push(phoneNumber);
                
                let callingCode = country.countryCallingCodes[0];
                callingCode = callingCode.replace("+", "");

                if(phoneNumber.charAt(0) === '+') {
                    phoneNumber = phoneNumber.replace('+', "");
                    phoneNumber = phoneNumber.substring(callingCode.length);
                }
                
                sim1CallingCode = callingCode;
                sim1PhoneNumber = phoneNumber;
                sim1CountryCode = countryCode;
                
            }

            countryCode = RNSimData.getSimInfo().countryCode1;
            if(countryCode !== undefined && countryCode.length > 0) {
                countryCode = countryCode.toUpperCase();
                let country = countries[countryCode];
                // console.log("User Country:::");
                // console.log(country);
                let phoneNumber = RNSimData.getSimInfo().phoneNumber1;
                phoneNumberSelectionOptions.push(phoneNumber);
                phoneNumberSelectionOptionsIOS.push(phoneNumber);
                
                let callingCode = country.countryCallingCodes[0];
                callingCode = callingCode.replace("+", "");
                if(phoneNumber.charAt(0) === '+') {
                    phoneNumber = phoneNumber.replace('+', "");
                    phoneNumber = phoneNumber.substring(callingCode.length);
                }
                sim2CallingCode = callingCode;
                sim2PhoneNumber = phoneNumber;
                sim2CountryCode = countryCode;
            }

            phoneNumberSelectionOptions.push("Other Number");
            phoneNumberSelectionOptionsIOS.push("Other Number");
            phoneNumberSelectionOptionsIOS.push("Cancel");

            this.setState({
                sim1CallingCode: sim1CallingCode,
                sim1CountryCode: sim1CountryCode,
                sim1PhoneNumber: sim1PhoneNumber,
                sim2CallingCode: sim2CallingCode,
                sim2CountryCode: sim2CountryCode,
                sim2PhoneNumber: sim2PhoneNumber,
            });

            if(sim1PhoneNumber.length > 0 || sim2PhoneNumber.length > 0) {
                this.showSimPhoneNumberSelectionOptions();
            }
            
            
        } catch(error) {
            console.log("Error:::");
            console.log(error);
        }
    }
    */

  fetchSimNumberAndShow = () => {
    try {
      console.log('Sim Info:::');
      console.log(RNSimData.getSimInfo());
      console.log('country code:::' + RNSimData.getSimInfo().countryCode0);
      console.log('phone number:::' + RNSimData.getSimInfo().phoneNumber0);

      phoneNumberSelectionOptions = [];
      phoneNumberSelectionOptionsIOS = [];
      let sim1CallingCode = '';
      let sim1PhoneNumber = '';
      let sim1CountryCode = '';
      let sim2CallingCode = '';
      let sim2PhoneNumber = '';
      let sim2CountryCode = '';
      let countryCode = RNSimData.getSimInfo().countryCode0;
      if (countryCode !== undefined && countryCode.length > 0) {
        countryCode = countryCode.toUpperCase();
        let country = countries[countryCode];
        // console.log("User Country:::");
        // console.log(country);
        let phoneNumber = RNSimData.getSimInfo().phoneNumber0;
        console.log('phoneNumber1:::' + phoneNumber);
        phoneNumberSelectionOptions.push(phoneNumber);
        phoneNumberSelectionOptionsIOS.push(phoneNumber);

        let callingCode = country.countryCallingCodes[0];
        callingCode = callingCode.replace('+', '');

        if (phoneNumber.charAt(0) === '+') {
          phoneNumber = phoneNumber.replace('+', '');
          phoneNumber = phoneNumber.substring(callingCode.length);
        }

        sim1CallingCode = callingCode;
        sim1PhoneNumber = phoneNumber;
        sim1CountryCode = countryCode;
      }

      countryCode = RNSimData.getSimInfo().countryCode1;
      if (countryCode !== undefined && countryCode.length > 0) {
        countryCode = countryCode.toUpperCase();
        let country = countries[countryCode];
        // console.log("User Country:::");
        // console.log(country);
        let phoneNumber = RNSimData.getSimInfo().phoneNumber1;
        console.log('phoneNumber2:::' + phoneNumber);
        phoneNumberSelectionOptions.push(phoneNumber);
        phoneNumberSelectionOptionsIOS.push(phoneNumber);

        let callingCode = country.countryCallingCodes[0];
        callingCode = callingCode.replace('+', '');
        if (phoneNumber.charAt(0) === '+') {
          phoneNumber = phoneNumber.replace('+', '');
          phoneNumber = phoneNumber.substring(callingCode.length);
        }
        sim2CallingCode = callingCode;
        sim2PhoneNumber = phoneNumber;
        sim2CountryCode = countryCode;
      }

      phoneNumberSelectionOptions.push('Other Number');
      phoneNumberSelectionOptionsIOS.push('Other Number');
      phoneNumberSelectionOptionsIOS.push('Cancel');

      this.setState({
        sim1CallingCode: sim1CallingCode,
        sim1CountryCode: sim1CountryCode,
        sim1PhoneNumber: sim1PhoneNumber,
        sim2CallingCode: sim2CallingCode,
        sim2CountryCode: sim2CountryCode,
        sim2PhoneNumber: sim2PhoneNumber,
        willShowSimNumberSelectionDialog: true,
      });
    } catch (error) {
      console.log('Error:::');
      console.log(error);
      this.fetchPhoneNumberUsingDeviceInfo();
    }
  };

  fetchPhoneNumberUsingDeviceInfo() {
    DeviceInfo.getPhoneNumber().then((phoneNumber) => {
      console.log('Phone Number:::' + phoneNumber);

      if (phoneNumber === null || phoneNumber === undefined) {
        return;
      }
      if (phoneNumber.length === 0) {
        return;
      }
      if (phoneNumber === 'unknown') {
        return;
      }
      let countryCode = '';
      let callingCode = '';
      let found = false;
      for (let i = 0; i < countries.all.length; i++) {
        let countryData = countries.all[i];
        let countryDialingCodes = countryData['countryCallingCodes'];
        for (let j = 0; j < countryDialingCodes.length; j++) {
          let dialingCode = countryDialingCodes[j];
          dialingCode = dialingCode.replace(' ', '');
          let index = phoneNumber.indexOf(dialingCode);
          if (index === 0) {
            callingCode = dialingCode.replace('+', '');
            countryCode = countryData['alpha2'];
            if (phoneNumber.charAt(0) === '+') {
              phoneNumber = phoneNumber.replace('+', '');
              phoneNumber = phoneNumber.substring(callingCode.length);
            }

            found = true;

            break;
          }
        }
        if (found) {
          this.setState({
            sim1CallingCode: callingCode,
            sim1CountryCode: countryCode,
            sim1PhoneNumber: phoneNumber,
            sim2CallingCode: '',
            sim2CountryCode: '',
            sim2PhoneNumber: '',
            willShowSimNumberSelectionDialog: true,
          });
          break;
        }
      }
    });
  }

  /*
    showSimPhoneNumberSelectionOptions = async () => {

        let thisInstance = this;
        request(PERMISSIONS.ANDROID.READ_PHONE_STATE).then(result => {
            if(result === RESULTS.GRANTED) {
                thisInstance.fetchSimNumberAndShow();
            }
        });
       
    }
    */

  selectSim1PhoneNumber = () => {
    this.setState({
      callingCode: this.state.sim1CallingCode,
      countryCode: this.state.sim1CountryCode,
      phoneNumber: this.state.sim1PhoneNumber,
      willShowSimNumberSelectionDialog: false,
    });
    this.signUpOrSignInWithTrueCaller(
      this.state.sim1CallingCode,
      this.state.sim1PhoneNumber,
    );
  };

  selectSim2PhoneNumber = () => {
    this.setState({
      callingCode: this.state.sim2CallingCode,
      countryCode: this.state.sim2CountryCode,
      phoneNumber: this.state.sim2PhoneNumber,
      willShowSimNumberSelectionDialog: false,
    });
    this.signUpOrSignInWithTrueCaller(
      this.state.sim2CallingCode,
      this.state.sim2PhoneNumber,
    );
  };

  selectNoneOfTheSimNumbers = () => {
    this.setState({
      willShowSimNumberSelectionDialog: false,
    });
  };

  onPhoneNumberSelected(buttonIndex) {
    if (buttonIndex === 0) {
      if (this.state.sim1PhoneNumber.length > 0) {
        this.setState({
          callingCode: this.state.sim1CallingCode,
          countryCode: this.state.sim1CountryCode,
          phoneNumber: this.state.sim1PhoneNumber,
        });
        this.signUpOrSignInWithTrueCaller(
          this.state.sim1CallingCode,
          this.state.sim1PhoneNumber,
        );
      } else {
        this.setState({
          callingCode: this.state.sim2CallingCode,
          countryCode: this.state.sim2CountryCode,
          phoneNumber: this.state.sim2PhoneNumber,
        });
        this.signUpOrSignInWithTrueCaller(
          this.state.sim2CallingCode,
          this.state.sim2PhoneNumber,
        );
      }
    } else if (buttonIndex === 1 && this.state.sim2PhoneNumber.length > 0) {
      this.setState({
        callingCode: this.state.sim2CallingCode,
        countryCode: this.state.sim2CountryCode,
        phoneNumber: this.state.sim2PhoneNumber,
      });
      this.signUpOrSignInWithTrueCaller(
        this.state.sim2CallingCode,
        this.state.sim2PhoneNumber,
      );
    }
  }

  render() {
    let cardViewStyles = [styles.cardViewStyle];
    return (
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
        style={{flex: 1}}>
        <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
          <View style={styles.mainContainer}>
            <View
              style={{
                height: getStatusBarHeight(true),
                backgroundColor: '#161a1e',
              }}>
              <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
            </View>

            <View style={styles.headerContainer}>
              <Image
                source={require('../../assets/images/gymvale_name_logo.png')}
                style={{
                  width: headerImageWidth,
                  height: headerImageHeight,
                }}
                resizeMode="contain"
                width={headerImageWidth}
                height={headerImageHeight}
              />

              <Text
                style={{
                  color: 'white',
                  marginTop: 30,
                  marginHorizontal: 10,
                  textAlign: 'center',
                }}>
                {this.state.motivationalQuote}
              </Text>
            </View>
            <View style={styles.bottomContainer}>
              <TouchableOpacity
                style={{marginTop: 130}}
                onPress={() => this.proceed()}
                // onPress={() =>  this.props.navigation.navigate('ProfileSelectionForRegister')}
              >
                <Text style={styles.blueButton}>Proceed</Text>
              </TouchableOpacity>
            </View>

            {/*
                            Platform.OS === "android" ? (
                                <View style={{marginVertical:20}}>
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height: 25}}>
                                        <View style={[styles.separator, {width:60, marginTop: 0}]}></View>
                                        <Text style={{marginHorizontal:20, lineHeight: 25, textAlign:'center', fontSize:20}}>or</Text>
                                        <View style={[styles.separator, {width:60, marginTop: 0}]}></View>
                                    </View>

                                    <TouchableOpacity
                                        style={{marginTop:30}}
                                        onPress={this.showSimPhoneNumberSelectionOptions}
                                    >
                                        <Text style={styles.blueBorderButton}>
                                        SIGN IN WITH SIM
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : null
                        */}

            {Platform.OS === 'android' ? (
              <View style={{marginVertical: 20}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 25,
                  }}>
                  <View
                    style={[
                      styles.separator,
                      {width: 60, marginTop: 0},
                    ]}></View>
                  <Text
                    style={{
                      marginHorizontal: 20,
                      lineHeight: 25,
                      textAlign: 'center',
                      fontSize: 20,
                    }}>
                    or
                  </Text>
                  <View
                    style={[
                      styles.separator,
                      {width: 60, marginTop: 0},
                    ]}></View>
                </View>

                <TouchableOpacity
                  style={{marginTop: 30}}
                  onPress={() => this.verifyThroughTrueCaller()}>
                  <Text style={styles.blueBorderButton}>
                    Sign In with TrueCaller
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <CardView
              cardElevation={
                this.state.willShowSimNumberSelectionDialog ? 0 : 4
              }
              maxCardElevation={4}
              radius={10}
              backgroundColor={'#ffffff'}
              style={cardViewStyles}>
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <CountryPicker
                    {...{
                      countryCode: this.state.countryCode,
                      withFilter: true,
                      withFlag: true,
                      withCountryNameButton: true,
                      withCallingCode: true,
                      onSelect: this.onSelectCountry,
                    }}
                  />
                </View>
                <View style={styles.separator}></View>
                <View style={styles.inputRow}>
                  <Text style={{color: 'black', marginLeft: 10}}>
                    +{this.state.callingCode}
                  </Text>

                  <TextInput
                    editable={!this.state.isLoading}
                    autoCorrect={false}
                    style={styles.textInput}
                    onChangeText={this.onPhoneNumberChange}
                    placeholder={'Phone Number'}
                    keyboardType={'phone-pad'}
                    enablesReturnKeyAutomatically
                    returnKeyType={'done'}
                    onSubmitEditing={() => Keyboard.dismiss}
                  />
                </View>
              </View>
            </CardView>
            {this.state.isLoading ? (
              <View style={styles.activityIndicatorContainer}>
                <ActivityIndicator
                  size="large"
                  color="#161a1e"
                  style={{marginTop: 35}}
                />
              </View>
            ) : null}
            {this.state.willShowSimNumberSelectionDialog ? (
              <View
                style={[
                  styles.activityIndicatorContainer,
                  {backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2147483647},
                ]}>
                <View
                  style={{
                    width: 270,
                    height: 270,
                    padding: 20,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'white',
                  }}>
                  <Text
                    style={{
                      fontSize: 17.5,
                      fontWeight: 'bold',
                      color: '#1d2b36',
                    }}>
                    Countinue With
                  </Text>
                  {this.state.sim1PhoneNumber.length > 0 ? (
                    <TouchableOpacity onPress={this.selectSim1PhoneNumber}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Image
                          source={require('../../assets/images/sim_icon.png')}
                          style={{resizeMode: 'contain'}}
                          width={25}
                          height={34}
                        />
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: '#1d2b36',
                            marginHorizontal: 10,
                          }}>
                          SIM 1
                        </Text>
                        <Text
                          style={{
                            fontSize: 17.5,
                            fontWeight: 'bold',
                            color: '#1d2b36',
                          }}>
                          {this.state.sim1PhoneNumber}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                  {this.state.sim2PhoneNumber.length > 0 ? (
                    <TouchableOpacity onPress={this.selectSim2PhoneNumber}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Image
                          source={require('../../assets/images/sim_icon.png')}
                          style={{resizeMode: 'contain'}}
                          width={25}
                          height={34}
                        />
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: '#1d2b36',
                            marginHorizontal: 10,
                          }}>
                          SIM 2
                        </Text>
                        <Text
                          style={{
                            fontSize: 17.5,
                            fontWeight: 'bold',
                            color: '#1d2b36',
                          }}>
                          {this.state.sim2PhoneNumber}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  <View
                    style={{justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress={this.selectNoneOfTheSimNumbers}>
                      <Text
                        style={{
                          color: '#17aae0',
                          fontSize: 15,
                          fontWeight: 'bold',
                        }}>
                        NONE OF THE ABOVE
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }

  onSelectCountry = (country) => {
    console.log('selected country value::');
    console.log(country);
    this.setState({
      countryCode: country.cca2,
      country: country.name,
      callingCode: country.callingCode[0],
    });
  };
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'rgba(245,245,245,1)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 0,
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#161a1e',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 70,
    margin: 0,
  },
  bottomContainer: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cardViewStyle: {
    width: '90%',
    height: Platform.OS === 'android' ? screenWidth * (280 / 750) : 100,
    //height:100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: Platform.OS === 'android' ? 160 : 220,
    //top:220,
    //zIndex:99999
  },
  inputContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  inputRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 20,
    //paddingVertical: 10,
  },
  textInput: {
    flexGrow: 1,
    textAlign: 'left',
    color: '#41464c',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#b5b5b5',
    //marginTop: 20,
    marginVertical: 5,
  },
  blueButton: {
    backgroundColor: '#17aae0',
    color: 'white',
    borderRadius: 15,
    width: 250,
    textAlign: 'center',
    height: 40,
    lineHeight: 40,
  },
  blueBorderButton: {
    borderColor: '#0086fe',
    borderWidth: 1,
    backgroundColor: 'white',
    color: '#0086fe',
    borderRadius: 15,
    width: 250,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
  },
  activityIndicatorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99999999,
  },
});

const mapStateToprops = (state) => {
  return {
    OtpData: state.SendOtpRedux.otpdata,
    Loading: state.SendOtpRedux.isLoading,
    Success: state.SendOtpRedux.success,
    error: state.SendOtpRedux.error,
  };
};
function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      resendOtpCode: resendOtpCode,
      // DispatchOwnerPaytm: fetchOwnerpaytm,
    },
    dispatch,
  );
}
export default connect(mapStateToprops, mapDispatchToprops)(StartScreen);
