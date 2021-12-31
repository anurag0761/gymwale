import React, { Component } from 'react';
import { Text, Image, View, Dimensions, StyleSheet, StatusBar, TextInput, Keyboard
    ,TouchableOpacity, Alert, ActivityIndicator, TouchableWithoutFeedback
    , KeyboardAvoidingView, PermissionsAndroid } from 'react-native';

import CardView from 'react-native-rn-cardview';

import CountryPicker from 'react-native-country-picker-modal';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const headerImageWidth = screenWidth*(420/750);
const headerImageHeight = screenWidth*(76/750);

const phoneIconWidth = screenWidth*(50/750);
const phoneIconHeight = screenWidth*(57/750);

const lockIconWidth = screenWidth*(50/750);
const lockIconHeight = screenWidth*(31/750);

const API_URL_GET_USER_INFO = "https://gymvale.com/api/v1/api/login";

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

const countries = require('country-data').countries;


class StartScreenIOS extends Component {
    
    constructor(properties) {
        super(properties);

        let motivationalQuotes = globals.getMotivationalQuotes();
        let randomQuoteIndex = Math.floor(Math.random()* motivationalQuotes.length);
        let motivationalQuote = motivationalQuotes[randomQuoteIndex];

        this.state = {
            phoneNumber: '',
            countryCode: "IN",
            callingCode:'91',
            isLoading: false,
            motivationalQuote: motivationalQuote,
        };
    }

    componentDidMount() {
        console.log("StartScreenIOS componentDidMount:::");
        //console.log("Countries:::");
        //console.log(countries);

        //this.requestForPhotosPermissionIfNotGranted();
        
    }

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

    onPhoneNumberChange = (text) => {
        this.setState({
            phoneNumber:text
        });
    };

    proceed() {
        if(this.state.phoneNumber.length === 0) {
            this.showAlert("Error!", "Please enter your phone number.");
            return;
        }
        this.checkWhetherUserExistsOrNot(this.state.callingCode, this.state.phoneNumber);
    }

    verifyThroughTrueCaller() {
        /*
        TRUECALLER.isUsable(result => {
            if (result === true) {
                console.log('Authenticate via truecaller flow can be used');
                TRUECALLER.requestTrueProfile();
            }
            else {
                console.log('Either truecaller app is not installed or user is not logged in')
                Utils.showAlert("", "App is not installed or not logged in. Please install TrueCaller app and log in.");
            }
        });
        */
    }

    checkWhetherUserExistsOrNot(phoneCode, phoneNumber) {

        let thisInstance = this;

        this.setState({
            isLoading: true
        });

        fetch(API_URL_GET_USER_INFO, {
			method: 'post',
			body: 'phone='+ phoneNumber+"&country_code="+phoneCode,
  			headers: { 
				'Content-type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
			}
		  })
		.then((response) => response.json())
		.then((responseJson) => {
			console.log("User Check response:::");
            console.log(responseJson);
            
            thisInstance.setState({
                isLoading: false
            });

            if(responseJson[Constants.KEY_VALID]) {
                globals.setOneSetting(globals.KEY_USER_INFO, responseJson);
                let body = responseJson[Constants.KEY_BODY];
                let passwordStatus = body[Constants.KEY_PASSWORD_STATUS];
                if(passwordStatus === Constants.STATUS_ACTIVE) {
                    thisInstance.showAlertForLoginOptions();
                } else {
                    thisInstance.goToOTPVerificationScreenWithTask(Constants.OTP_VERIFICATION_TASK_LOGIN);
                }
                
            } else {
                thisInstance.goToOTPVerificationScreenWithTask(Constants.OTP_VERIFICATION_TASK_REGISTER);
                
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
                isLoading: false
            });
            console.log("Error while login....");
            console.log(error);
		});
    }

    showAlert(title, body) {
		Alert.alert(
		  title, body,
		  [
			  { text: 'OK', onPress: () => console.log('OK Pressed') },
		  ],
		  { cancelable: true },
		);
    }
    
    showAlertForLoginOptions() {
		Alert.alert(
		  "Already Registered", "Which option you want to use to login?",
		  [
              { text: 'OTP', onPress: () => {
                  //this.sendOTP(Constants.OTP_VERIFICATION_TASK_LOGIN)
                  this.goToOTPVerificationScreenWithTask(Constants.OTP_VERIFICATION_TASK_LOGIN);
                }
              },
              { text: 'With Password', onPress: () => this.goToLoginWithPasswordScreen() },
		  ],
		  { cancelable: true },
		);
    }
    
    sendOTP(otpVerificationTask) {

        this.setState({
            isLoading: true
        });

        let thisInstance = this;

        fetch(Constants.API_URL_RESEND_OTP, {
			method: 'post',
            body: Constants.KEY_PHONE+'='+this.state.phoneNumber
                    + "&"+Constants.KEY_COUNTRYCODE+"="+ this.state.callingCode,
  			headers: { 
				'Content-type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
			}
		  })
		.then((response) => response.json())
		.then((responseJson) => {

            thisInstance.setState({
                isLoading: false
            });

			console.log("OTP response:::");
            console.log(responseJson);
            
            if(responseJson[Constants.KEY_VALID]) {
                let otpCode = responseJson[Constants.KEY_OTP];
                thisInstance.goToOTPVerificationScreenWithOTP(otpCode, otpVerificationTask);
            } else {
                //thisInstance.showAlert("Login Error!!!", "Invalid Password. Please give correct password.");
                let message = responseJson[Constants.KEY_MESSAGE];
                if(message === null || message === undefined) {
                    message = "Some error occurred. Please try again later.";
                }
                Utils.showAlert("", message);
            }

			
		})
		.catch((error) => {
            thisInstance.setState({
                isLoading: false
            });
            Utils.showAlert("", "Please check your internet connection.");
            console.log("Error while sending otp....");
            console.log(error);
		});
    }

    goToOTPVerificationScreenWithOTP(otpCode, otpVerificationTask) {
        let navigationParams = {};
        navigationParams[Constants.PARAM_CALLING_CODE] = this.state.callingCode;
        navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
        navigationParams[Constants.PARAM_PHONE_NUMBER] = this.state.phoneNumber;
        navigationParams[Constants.KEY_OTP] = otpCode;
        navigationParams[Constants.KEY_OTP_VERIFICATION_TASK] = otpVerificationTask;
        console.log(navigationParams);
        this.props.navigation.navigate("OTPVerificationScreen", navigationParams);
    }

    goToOTPVerificationScreenWithTask(otpVerificationTask) {
        let navigationParams = {};
        navigationParams[Constants.PARAM_CALLING_CODE] = this.state.callingCode;
        navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
        navigationParams[Constants.PARAM_PHONE_NUMBER] = this.state.phoneNumber;
        navigationParams[Constants.KEY_OTP_VERIFICATION_TASK] = otpVerificationTask;
        console.log(navigationParams);
        this.props.navigation.navigate("OTPVerificationScreen", navigationParams);
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
            isLoading: true
        });

        fetch(API_URL_GET_USER_INFO, {
			method: 'post',
			body: 'phone=' + phoneNumber + "&country_code="+countryCode,
  			headers: { 
				'Content-type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json',
			}
		  })
		.then((response) => response.json())
		.then((responseJson) => {
			console.log("User Check response:::");
            console.log(responseJson);
            
            thisInstance.setState({
                isLoading: false
            });

            if(responseJson[Constants.KEY_VALID]) {
                globals.setOneSetting(globals.KEY_USER_INFO, responseJson);
                thisInstance.goToHomeScreen();
            } else {
                thisInstance.goToProfileSelectionScreen();
            }
			
		})
		.catch((error) => {
            thisInstance.setState({
                isLoading: false
            });
            console.log("Error while login....");
            console.log(error);
		});
    }

    goToHomeScreen() {
        let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
        userInfo[Constants.KEY_USER_DATA] = userInfo[Constants.KEY_BODY];
        globals.setOneSetting(globals.KEY_USER_INFO, userInfo);
        globals.setOneSetting(globals.KEY_IS_USER_LOGGED_IN, true);
        globals.setOneSetting(globals.KEY_USER_ACCOUNT_SETUP_STATUS, globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED);
        //this.props.navigation.navigate('MainApp');
        let body = userInfo[Constants.KEY_USER_DATA];
        let userType = body[Constants.KEY_USER_TYPE];
        if(userType === Constants.USER_TYPE_OWNER) {
            this.props.navigation.navigate('MainApp');
        } else if(userType === Constants.USER_TYPE_MEMBER) {
            this.props.navigation.navigate('MemberMainApp');
        }
    }

    goToProfileSelectionScreen() {
        let navigationParams = {};
        navigationParams[Constants.PARAM_CALLING_CODE] = this.state.callingCode;
        navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
        navigationParams[Constants.PARAM_PHONE_NUMBER] = this.state.phoneNumber;
        this.props.navigation.navigate("ProfileSelectionForRegister", navigationParams);
    }

    render() {

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}}>
                <KeyboardAvoidingView behavior="padding" style={{flex:1}}>
                    <View
                        style={styles.mainContainer}
                    >
                        <StatusBar backgroundColor="#161a1e" barStyle="light-content" />

                        <View style={styles.headerContainer}>
                            <Image 
                                source={require('../../assets/images/gymvale_name_logo.png')} 
                                style={{ resizeMode: 'contain' }} 
                                width={headerImageWidth}
                                height={headerImageHeight}/>

                            <Text style={{color:'white', marginTop:30, marginHorizontal:10, textAlign:'center'}}>
                            {this.state.motivationalQuote}
                            </Text>
                        </View>
                        <View style={styles.bottomContainer}>
                            
                            <TouchableOpacity
                                style={{marginTop:130}}
                                onPress={() => this.proceed()}
                                >
                                <Text style={styles.blueButton}>
                                Proceed
                                </Text>
                            </TouchableOpacity>

                        </View>

                        <View style={{marginVertical:20}}>
                            <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height: 25}}>
                                <View style={[styles.separator, {width:60, marginTop: 0}]}></View>
                                <Text style={{marginHorizontal:20, lineHeight: 25, textAlign:'center', fontSize:20}}>or</Text>
                                <View style={[styles.separator, {width:60, marginTop: 0}]}></View>
                            </View>

                            <TouchableOpacity
                                style={{marginTop:30}}
                                onPress={() => this.verifyThroughTrueCaller()}
                                >
                                <Text style={styles.blueBorderButton}>
                                Sign In with TrueCaller
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <CardView 
                                cardElevation={4}
                                maxCardElevation={4}
                                radius={10}
                                backgroundColor={'#ffffff'}
                                style={styles.cardViewStyle}
                            >

                            <View style={styles.inputContainer}>
                                <View style={styles.inputRow}>
                                    <CountryPicker
                                        disabled={this.state.isLoading}
                                        onChange={value => {
                                        console.log("selected country value::");
                                        console.log(value);
                                        this.setState({ countryCode: value.cca2, country: value.name, callingCode: value.callingCode });
                                        }}
                                        onClose= {() => {

                                        }}
                                        cca2={this.state.countryCode}
                                        translation="eng"
                                        showCountryNameWithFlag = {true}
                                        closeable = {true}
                                        filterable = {true}
                                    />

                                </View>
                                <View style={styles.separator}></View>
                                <View style={styles.inputRow}>
                                    <Text style={{color:'black', marginLeft: 10}}>
                                    +{this.state.callingCode}
                                    </Text>

                                    <TextInput
                                        editable={!this.state.isLoading}
                                        autoCorrect={false}
                                        style={styles.textInput}
                                        onChangeText={this.onPhoneNumberChange}
                                        placeholder={"Phone Number"}
                                        keyboardType={"phone-pad"}
                                        enablesReturnKeyAutomatically
                                        returnKeyType={"done"}
                                        onSubmitEditing={()=> Keyboard.dismiss}
                                    />

                                </View>
                            </View>
                            
                        </CardView>
                        {
                            this.state.isLoading ? (
                                <View style={styles.activityIndicatorContainer}>
                                    <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                                </View>
                            ): null
                        }
                        
                            
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
			
		);
	}
}

const styles = StyleSheet.create({
    mainContainer: {
        flex:1,
        backgroundColor:'rgba(245,245,245,1)',
        justifyContent:'flex-start',
        alignItems:'center',
        padding:0,
    },
    headerContainer: {
        width:'100%',
        backgroundColor:'#161a1e',
        justifyContent:'flex-start',
        alignItems:'center',
        paddingTop:50,
        paddingBottom: 70,
        margin:0,
    },
    bottomContainer: {
        width:'100%',
        justifyContent:'flex-start',
        alignItems:'center',
        backgroundColor:'transparent',
    },
    cardViewStyle: {
        width:'90%',
        height: screenWidth*(280/750),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent:'center',
        position:'absolute',
        top:160,
        zIndex:99999
    },
    inputContainer: {
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white',
        paddingHorizontal: 20,
        paddingVertical: 5,
    },
    inputRow: {
        width:'100%',
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        marginHorizontal:20,
    },
    textInput: {
        flexGrow:1, 
        textAlign:'left', 
        color:'#41464c',
    },
    separator: {
        width:'100%',
        height:1,
        backgroundColor:'#b5b5b5',
        marginTop: 20,
    },
    blueButton: {
        backgroundColor:'#17aae0',
        color:'white',
        borderRadius:15,
        width:250,
        textAlign:'center',
        height:40,
        lineHeight:40,
    },
    blueBorderButton: {
        borderColor:'#0086fe',
        borderWidth:1,
        backgroundColor:'white',
        color:'#0086fe',
        borderRadius:15,
        width:250,
        height:40,
        lineHeight:40,
        textAlign:'center',
    },
    activityIndicatorContainer: {
        width:'100%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:0,
        left:0,
        zIndex:99999999,
    },
});

export default StartScreenIOS;
