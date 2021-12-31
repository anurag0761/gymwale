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
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';

import CardView from 'react-native-rn-cardview';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const headerImageWidth = screenWidth * (420 / 750);
const headerImageHeight = screenWidth * (76 / 750);

const phoneIconWidth = screenWidth * (50 / 750);
const phoneIconHeight = screenWidth * (57 / 750);

const lockIconWidth = screenWidth * (50 / 750);
const lockIconHeight = screenWidth * (31 / 750);

class Login extends Component {
  constructor(properties) {
    super(properties);

    let phoneNumber = properties.navigation.getParam(
      Constants.PARAM_PHONE_NUMBER,
    );
    let callingCode = properties.navigation.getParam(
      Constants.PARAM_CALLING_CODE,
    );
    let countryCode = properties.navigation.getParam(
      Constants.PARAM_COUNTRY_CODE,
    );
    let tokenID = '';
    let userInfo = globals.getSetting().userInfo;
    if (userInfo) {
      if (userInfo[Constants.KEY_BODY]) {
        let body = userInfo[Constants.KEY_BODY];
        if (body[Constants.KEY_TOKEN_ID]) {
          tokenID = body[Constants.KEY_TOKEN_ID];
        }
      }
    }

    let motivationalQuotes = globals.getMotivationalQuotes();
    let randomQuoteIndex = Math.floor(
      Math.random() * motivationalQuotes.length,
    );
    let motivationalQuote = motivationalQuotes[randomQuoteIndex];

    this.state = {
      phoneNumber: phoneNumber,
      countryCode: countryCode,
      callingCode: callingCode,
      password: '',
      isLoading: false,
      tokenID: tokenID,
      motivationalQuote: motivationalQuote,
    };
  }

  onPhoneNumberChange = (text) => {
    this.setState({
      phoneNumber: text,
    });
  };

  onPasswordChange = (text) => {
    this.setState({
      password: text,
    });
  };

  logIn() {
    if (this.state.phoneNumber.length === 0) {
      this.showAlert('', 'Please enter your phone number');
      return;
    }

    if (this.state.password.length === 0) {
      this.showAlert('', 'Please enter your password');
      return;
    }

    this.setState({
      isLoading: true,
    });

    let thisInstance = this;

    fetch(Constants.API_URL_LOGIN, {
      method: 'post',
      body:
        Constants.KEY_PHONE +
        '=' +
        this.state.phoneNumber +
        '&' +
        Constants.KEY_PASSWORD +
        '=' +
        this.state.password +
        '&' +
        Constants.KEY_TOKEN_ID +
        '=' +
        this.state.tokenID,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        thisInstance.setState({
          isLoading: false,
        });

        console.log('Login response:::');
        console.log(responseJson);

        if (responseJson[Constants.KEY_VALID]) {
          globals.setOneSetting(globals.KEY_USER_INFO, responseJson);
          globals.setOneSetting(globals.KEY_IS_USER_LOGGED_IN, true);
          globals.setOneSetting(
            globals.KEY_USER_ACCOUNT_SETUP_STATUS,
            globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED,
          );

          let userInfo = responseJson;
          let body = userInfo[Constants.KEY_USER_DATA];
          let userType = body[Constants.KEY_USER_TYPE];
          if (userType === Constants.USER_TYPE_OWNER) {
            thisInstance.props.navigation.navigate('MainApp');
          } else if (userType === Constants.USER_TYPE_MEMBER) {
            thisInstance.props.navigation.navigate('MemberMainApp');
          }
        } else {
          thisInstance.showAlert(
            'Login Error!!!',
            'Invalid Password. Please give correct password.',
          );
        }
      })
      .catch((error) => {
        thisInstance.setState({
          isLoading: false,
        });
        thisInstance.showAlert(
          'Login',
          'Some error occurred. Please try again later.',
        );
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

  render() {
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
                resizeMode={'contain'}
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
                onPress={() => this.logIn()}>
                <Text style={styles.loginButton}>Login</Text>
              </TouchableOpacity>
            </View>

            <CardView
              cardElevation={4}
              maxCardElevation={4}
              radius={10}
              backgroundColor={'#ffffff'}
              style={styles.cardViewStyle}>
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <Image
                    source={require('../../assets/images/phone_icon.png')}
                    style={{
                      marginHorizontal: 15,
                      width: phoneIconWidth,
                      height: phoneIconHeight,
                    }}
                    resizeMode={'contain'}
                  />

                  <TextInput
                    editable={false}
                    autoCorrect={false}
                    style={styles.textInput}
                    value={this.state.phoneNumber}
                    onChangeText={this.onPhoneNumberChange}
                    placeholder={'Phone Number'}
                    keyboardType={'phone-pad'}
                    enablesReturnKeyAutomatically
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      this.passwordTextInput.focus();
                    }}
                  />
                </View>
                <View style={styles.separator}></View>
                <View style={styles.inputRow}>
                  <Image
                    source={require('../../assets/images/lock_icon.png')}
                    style={{
                      marginHorizontal: 15,
                      width: lockIconWidth,
                      height: lockIconHeight,
                    }}
                    resizeMode={'contain'}
                  />

                  <TextInput
                    autoCorrect={false}
                    secureTextEntry
                    style={styles.textInput}
                    onChangeText={this.onPasswordChange}
                    placeholder={'Password'}
                    enablesReturnKeyAutomatically
                    returnKeyType={'done'}
                    ref={(input) => {
                      this.passwordTextInput = input;
                    }}
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
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }
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
  },
  inputContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    //paddingVertical: 5,
  },
  inputRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  textInput: {
    flexGrow: 1,
    textAlign: 'left',
    color: '#41464c',
  },
  separator: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#b5b5b5',
    marginVertical: 5,
  },
  loginButton: {
    backgroundColor: '#17aae0',
    color: 'white',
    borderRadius: 15,
    width: 200,
    textAlign: 'center',
    height: 40,
    lineHeight: 40,
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

export default Login;
