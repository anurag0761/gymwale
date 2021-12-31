import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  TouchableHighlight,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import CodeInput from 'react-native-confirmation-code-input';
import SmsRetriever from 'react-native-sms-retriever';
//import SmsListener from 'react-native-android-sms-listener'
import {getStatusBarHeight} from 'react-native-status-bar-height';

import Toast, {DURATION} from 'react-native-easy-toast';
import {bindActionCreators} from 'redux';
import {resendOtpCode} from '../Redux/Actions/SendOtpAction';
import {connect} from 'react-redux';

class OTPVerificationScreen extends Component {
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
    let otpCode = properties.navigation.getParam(Constants.KEY_OTP, '');
    let optVerificationTask = properties.navigation.getParam(
      Constants.KEY_OTP_VERIFICATION_TASK,
    );

    this.state = {
      isLoading: false,
      phoneNumber: phoneNumber,
      callingCode: callingCode,
      countryCode: countryCode,
      optVerificationTask: optVerificationTask,
      otpCode: otpCode,
      pinCode1: '',
      pinCode2: '',
      pinCode3: '',
      pinCode4: '',
      isPinCode1InFocus: false,
      isPinCode2InFocus: false,
      isPinCode3InFocus: false,
      isPinCode4InFocus: false,
      pinCode: '',
    };
  }

  componentDidMount() {
    this.resendOtpCode();
  }

  render() {
    return (
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
        style={{flex: 1}}>
        <KeyboardAvoidingView
          behavior="padding"
          style={{flex: 1, backgroundColor: '#161a1e'}}>
          <View style={styles.mainContainer}>
            <View
              style={{
                height: getStatusBarHeight(true),
                backgroundColor: '#161a1e',
              }}>
              <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
            </View>

            <View
              style={[
                styles.headerContainer,
                {padding: 10, justifyContent: 'flex-start'},
              ]}>
              <TouchableOpacity
                onPress={this.goBack}
                style={{
                  width: 30,
                  height: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={styles.backIcon}
                  source={require('../../assets/images/back_icon_white.png')}
                />
              </TouchableOpacity>
            </View>

            <Image
              style={styles.otpGraphic}
              source={require('../../assets/images/otp_graphic.png')}
            />

            <Text
              style={{
                color: 'white',
                fontSize: 14,
                textAlign: 'center',
                flexWrap: 'wrap',
                paddingHorizontal: 30,
                marginBottom: 30,
              }}>
              A sms with verification code has been sent to the following number
            </Text>

            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                flexWrap: 'wrap',
                paddingHorizontal: 30,
                marginBottom: 30,
              }}>
              +{this.state.callingCode} - {this.state.phoneNumber}
            </Text>

            <Text
              style={{
                color: '#596c7b',
                fontSize: 18,
                textAlign: 'center',
                flexWrap: 'wrap',
                paddingHorizontal: 30,
                marginBottom: 5,
              }}>
              Enter 4-Digit Code
            </Text>

            <View style={styles.pinCodeInputContainer}>
              <CodeInput
                ref="codeInputRef1"
                className={'border-b'}
                space={5}
                codeLength={4}
                keyboardType="numeric"
                size={50}
                inputPosition="center"
                onFulfill={(code) => this._onFulfill(code)}
                onCodeChange={(code) => this._onCodeChange(code)}
                code={this.state.pinCode}
                autoFocus={false}
              />
              {/*
                            <TextInput
                                style={this.state.isPinCode1InFocus? styles.focusedPinCodeInput : styles.unFocusedPinCodeInput}
                                value={this.state.pinCode1}
                                onChangeText={this.onPinCode1Change}
                                keyboardType={"numeric"}
                                enablesReturnKeyAutomatically
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    this.pinCode2TextInput.focus();
                                }}
                                onFocus={ () => {
                                    this.setState({
                                        isPinCode1InFocus: true,
                                        pinCode1:'',
                                    });
                                }}
                                onEndEditing={ () => {
                                    this.setState({
                                        isPinCode1InFocus: false,
                                    });
                                }}
                                ref={ref => this.pinCode1TextInput = ref}
                            />
                            <TextInput
                                style={this.state.isPinCode2InFocus? styles.focusedPinCodeInput : styles.unFocusedPinCodeInput}
                                value={this.state.pinCode2}
                                onChangeText={this.onPinCode2Change}
                                keyboardType={"numeric"}
                                enablesReturnKeyAutomatically
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    this.pinCode3TextInput.focus();
                                }}
                                onFocus={ () => {
                                    this.setState({
                                        isPinCode2InFocus: true,
                                        pinCode2:'',
                                    });
                                }}
                                onEndEditing={ () => {
                                    this.setState({
                                        isPinCode2InFocus: false,
                                    });
                                }}
                                ref={ref => this.pinCode2TextInput = ref}
                            />
                            <TextInput
                                style={this.state.isPinCode3InFocus? styles.focusedPinCodeInput : styles.unFocusedPinCodeInput}
                                value={this.state.pinCode3}
                                onChangeText={this.onPinCode3Change}
                                keyboardType={"numeric"}
                                enablesReturnKeyAutomatically
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    this.pinCode4TextInput.focus();
                                }}
                                onFocus={ () => {
                                    this.setState({
                                        isPinCode3InFocus: true,
                                        pinCode3:'',
                                    });
                                }}
                                onEndEditing={ () => {
                                    this.setState({
                                        isPinCode3InFocus: false,
                                    });
                                }}
                                ref={ref => this.pinCode3TextInput = ref}
                            />
                            <TextInput
                                style={this.state.isPinCode4InFocus? styles.focusedPinCodeInput : styles.unFocusedPinCodeInput}
                                value={this.state.pinCode4}
                                onChangeText={this.onPinCode4Change}
                                keyboardType={"numeric"}
                                enablesReturnKeyAutomatically
                                returnKeyType={"done"}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    Keyboard.dismiss();
                                }}
                                onFocus={ () => {
                                    this.setState({
                                        isPinCode4InFocus: true,
                                        pinCode4:'',
                                    });
                                }}
                                onEndEditing={ () => {
                                    this.setState({
                                        isPinCode4InFocus: false,
                                    });
                                }}
                                ref={ref => this.pinCode4TextInput = ref}
                            />
                            */}
            </View>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 30,
              }}>
              <Text
                style={{
                  color: '#596c7b',
                  fontSize: 18,
                  textAlign: 'center',
                  flexWrap: 'wrap',
                }}>
                Didn't get the Code?
              </Text>
              <TouchableOpacity onPress={this.resendOtpCode}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginLeft: 10,
                  }}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{flex: 1, flexGrow: 1}} />
            <TouchableOpacity
              onPress={() => this.verifyPinCode(this.state.pinCode)}
              style={styles.button}>
              <Image
                style={styles.correctSignIcon}
                source={require('../../assets/images/correct_sign.png')}
              />
            </TouchableOpacity>
            {this.state.isLoading ? (
              <View style={styles.activityIndicatorContainer}>
                <ActivityIndicator
                  size="large"
                  color="#161a1e"
                  style={{marginTop: 35}}
                />
              </View>
            ) : null}
            <Toast ref="otp_verification_toast" />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  _onFulfill = (code) => {
    if (code === this.state.otpCode) {
      if (
        this.state.optVerificationTask === Constants.OTP_VERIFICATION_TASK_LOGIN
      ) {
        this.goToHomeScreen();
      } else {
        this.goToProfileSelectionScreen();
      }
    } else {
      Utils.showAlert(
        '',
        'OTP verification failed. Please enter correct code or resend again.',
      );
    }
  };

  _onCodeChange = (code) => {
    this.setState({
      pinCode: code,
    });
  };

  onPinCode1Change = (text) => {
    this.setState({
      pinCode1: text,
    });
    if (text !== '') {
      this.pinCode2TextInput.focus();
    }
  };

  onPinCode2Change = (text) => {
    this.setState({
      pinCode2: text,
    });
    if (text !== '') {
      this.pinCode3TextInput.focus();
    } else {
      this.pinCode1TextInput.focus();
    }
  };

  onPinCode3Change = (text) => {
    this.setState({
      pinCode3: text,
    });
    if (text !== '') {
      this.pinCode4TextInput.focus();
    } else {
      this.pinCode2TextInput.focus();
    }
  };

  onPinCode4Change = (text) => {
    this.setState({
      pinCode4: text,
    });
    if (text == '') {
      this.pinCode3TextInput.focus();
    }
  };

  startListeningSMSAndSendOTP = async () => {
    let thisInstance = this;
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        console.log('Registered for SmsRetriever:::');
        SmsRetriever.addSmsListener((event) => {
          console.log('SMS Event:::');
          console.log(event);

          if (event.message) {
            let message = event.message;
            console.log('message receiveed::::');
            console.log(message);
            let length = '<#> Welcome to www.GymVale.com your OTP is '.length;
            console.log('length::' + length);

            let code = message.substring(length, length + 4);
            console.log('Pincode:::' + code);
            thisInstance.setState({
              pinCode: code,
            });

            thisInstance.verifyPinCode(code);
          }

          SmsRetriever.removeSmsListener();
        });
      } else {
        console.log('Not registered....');
      }
    } catch (error) {
      console.log('Error while starting sms retriever:::');
      console.log(error);
      console.log(JSON.stringify(error));
    }

    this.resendOtpCode();
  };

  startListeningSMS = async () => {
    let thisInstance = this;
    try {
      const registered = await SmsRetriever.startSmsRetriever();
      if (registered) {
        console.log('Registered for SmsRetriever:::');
        SmsRetriever.addSmsListener((event) => {
          console.log('SMS Event:::');
          console.log(event);
          if (event.timeout) {
            thisInstance.startListeningSMS();
            return;
          }

          if (event.message) {
            let message = event.message;
            console.log('message receiveed::::');
            console.log(message);
            let length = '<#> Welcome to www.GymVale.com your OTP is '.length;
            console.log('length::' + length);

            let code = message.substring(length, length + 4);
            console.log('Pincode:::' + code);
            thisInstance.setState({
              pinCode: code,
            });

            thisInstance.verifyPinCode(code);
          }

          SmsRetriever.removeSmsListener();
        });
      } else {
        console.log('Not registered....');
      }
    } catch (error) {
      console.log('Error while starting sms retriever:::');
      console.log(error);
      console.log(JSON.stringify(error));
    }
  };

  resendOtpCode = () => {
    // this.setState({
    //     isLoading: true
    // });

    // let thisInstance = this;
    let data = Constants.KEY_PHONE + '=' + this.state.phoneNumber;
    '&' + Constants.KEY_COUNTRYCODE + '=' + this.state.callingCode;
    // thisInstance.startListeningSMS();
    this.props
      .resendOtpCode(
        Constants.KEY_PHONE +
          '=' +
          this.state.phoneNumber +
          '&' +
          Constants.KEY_COUNTRYCODE +
          '=' +
          this.state.callingCode,
      )
      .then(() => {
        if (this.props.Success) {
          let otpCode = this.props.OtpData[Constants.KEY_OTP];
          console.log('OTP Code sent:::' + otpCode);
          this.setState({
            otpCode: otpCode,
            isLoading: false,
          });
          console.log('OTp');
          console.log(this.props.OtpData[Constants.KEY_OTP]);
          console.log('OTp');
          this.refs.otp_verification_toast.show(
            'Verification code has been send to the phone number',
            DURATION.LENGTH_LONG,
          );
        }
        let message = this.props.OtpData[Constants.KEY_MESSAGE];
        if (message === null || message === undefined) {
          message = 'Some error occurred. Please try again later.';
          Utils.showAlert('', message);
        }
        if (this.props.error) {
          Utils.showAlert('', 'Please check your internet connection.');
        }
      });

    // setTimeout(() => {

    // }, 3000);
  };

  verifyPinCode = (enteredPinCode) => {
    //let enteredPinCode = this.state.pinCode1 + this.state.pinCode2
    //+ this.state.pinCode3 + this.state.pinCode4;
    //let enteredPinCode = this.state.pinCode;
    console.log('entered pin code:::' + enteredPinCode);
    console.log('OTP Code:::' + this.state.otpCode);
    if (enteredPinCode === this.state.otpCode) {
      if (
        this.state.optVerificationTask === Constants.OTP_VERIFICATION_TASK_LOGIN
      ) {
        this.goToHomeScreen();
      } else {
        this.goToProfileSelectionScreen();
      }
    } else {
      Utils.showAlert(
        '',
        'OTP verification failed. Please enter correct code or resend again.',
      );
    }
  };

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

  goToHomeScreen() {
    let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
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
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#161a1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#3d4a55',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#161a1e',
    paddingHorizontal: 10,
  },
  backIcon: {
    width: 11,
    height: 20,
    resizeMode: 'cover',
    marginRight: 10,
  },
  otpGraphic: {
    width: 196,
    height: 174,
    resizeMode: 'cover',
    marginVertical: 20,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pinCodeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unFocusedPinCodeInput: {
    width: 26,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderColor: '#596c7b',
    color: '#596c7b',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  focusedPinCodeInput: {
    width: 26,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderColor: 'white',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  correctSignIcon: {
    width: 27,
    height: 20,
    resizeMode: 'cover',
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
export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(OTPVerificationScreen);
