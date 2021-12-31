import React, { Component } from 'react';
import { Text, StatusBar, Image, Animated, Dimensions, StyleSheet, View, Platform } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';

import { PermissionsAndroid } from 'react-native';

const screenWidth = Dimensions.get("window").width;
const logoSize = screenWidth*(476/750);

class Splash extends Component {
	constructor(props) {
		super(props);
		let motivationalQuotes = globals.getMotivationalQuotes();
        let randomQuoteIndex = Math.floor(Math.random()* motivationalQuotes.length);
		let motivationalQuote = motivationalQuotes[randomQuoteIndex];
		
		this.state = {
			value: new Animated.Value(1),
			motivationalQuote: motivationalQuote,
		};
	}
    
    componentDidMount() {
		/*
		if(Platform.OS === "android") {
			PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
		}
		*/

		this.fetchMotivationalQuotes();
		Animated.sequence([
			Animated.timing(this.state.value, {
				toValue: 0.8,
				duration: 1000,
				useNativeDriver: true
			}),

			Animated.timing(this.state.value, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true
			})
		]).start();

        setTimeout(() => this.onSplashShownCompleted(), 3000);
	}

	onSplashShownCompleted() {

		let willShowIntro = globals.getSetting()[globals.KEY_WILL_SHOW_INTRO];
		if(willShowIntro) {
			this.props.navigation.navigate('IntroScreen');
			
		} else {
			let isLoggedIn = globals.getSetting()[globals.KEY_IS_USER_LOGGED_IN];
		
			if(isLoggedIn === true) {
				let accountSetupStatus = globals.getSetting()[globals.KEY_USER_ACCOUNT_SETUP_STATUS];
				
				if(accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED) {
					let userInfo = globals.getSetting().userInfo;
					let body = userInfo[Constants.KEY_USER_DATA];
					let userType = body[Constants.KEY_USER_TYPE];
					if(userType === Constants.USER_TYPE_OWNER) {
						this.props.navigation.navigate('MainApp');
					} else if(userType === Constants.USER_TYPE_MEMBER) {
						this.props.navigation.navigate('MemberMainApp');
					}
					
				} else if(accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_OWNER_CREATED
					|| accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_MEMBER_CREATED) {
					this.goToEditProfileInfoScreen();
				} else if(accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_USER_DETAILS_ADDED) {
					this.goToEditBMIDetailsScreen();
				} else if(accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_GYM_ADDED
					|| accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_GYM_SERVICES_DONE
					|| accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_GYM_FACILITIES_DONE
					|| accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_GYM_GALLERY_DONE) {
					this.goToEditGymProfileScreen();
				}
				
			} else {
				this.props.navigation.navigate('Auth');
			}
		}
	}

	goToEditProfileInfoScreen() {
		let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
		let body = userInfo[Constants.KEY_BODY];
		let userID = body[Constants.KEY_ID];
		let name = body[Constants.KEY_NAME];
		let phoneNumber = body[Constants.KEY_PHONE];
		let countryID = body[Constants.KEY_COUNTRY_ID];
		if(countryID === null || countryID === undefined) {
			countryID = "91";
		}
		let userType = body[Constants.KEY_USER_TYPE];
		let navigationParams = {};
		navigationParams[Constants.PARAM_CALLING_CODE] = countryID;
		//navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
		navigationParams[Constants.PARAM_PHONE_NUMBER] = phoneNumber;
		navigationParams[Constants.KEY_USER_TYPE] = userType;
		navigationParams[Constants.KEY_NAME] = name;
		navigationParams[Constants.KEY_USER_ID] = userID;
		this.props.navigation.navigate("EditProfileInfo", navigationParams);
	}

	goToEditGymProfileScreen(){
		console.log("Going to EditGymProfile:::");
		//this.props.navigation.navigate("EditGymProfile");
		globals.setOneSetting(Constants.KEY_INITIAL_TAB_INDEX, 0);
        this.props.navigation.navigate("MembershipTab");
	}
	
	goToEditBMIDetailsScreen(){
        this.props.navigation.navigate("EditBMIDetails");
    }

	render() {

        return (
			<Animated.View
				style={[
					//{ opacity: this.state.value },
					{ flex: 1 },
					{ backgroundColor: '#161a1e' },
					{ justifyContent: 'center' },
					{ alignItems: 'center' }
				]}
			>
				<View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
					<StatusBar backgroundColor="#161a1e" barStyle="light-content" />
				</View>

				<Image 
                    source={require('../../assets/images/splash_logo.png')} 
                    style={{ 
						width: logoSize,
						height: logoSize,
					}} 
					resizeMode={"contain"}
                    width={logoSize}
                    height={logoSize}/>

                <Text 
                    style={styles.bottomTextStyle}
                >
                {this.state.motivationalQuote}
                </Text>
			</Animated.View>
		);
	}

	fetchMotivationalQuotes() {
		let thisInstance = this;
        fetch(Constants.API_URL_MOTIVATIONAL_QUOTES)
		.then((response) => response.json())
		.then((responseJson) => {
			console.log(responseJson);
			let valid = responseJson[Constants.KEY_VALID];
			if(valid === true) {
				let quotes = responseJson[Constants.KEY_TEXT];
				let quoteTexts = [];
				for(let i = 0; i < quotes.length; i++) {
					let quote = quotes[i];
					quoteTexts.push(quote[Constants.KEY_QUOTE_TITLE]);
				}
				globals.setMotivationalQuotes(quoteTexts);
			} else {
				thisInstance.fetchMotivationalQuotes();
			}
		})
		.catch((error) => {
            thisInstance.setState({
                isLoading: false,
            });
            console.log("Error while fetching list....");
            console.log(error);
		});
	}
}

const styles = StyleSheet.create({
    bottomTextStyle: {
        color:"white", 
        marginTop:20, 
        width:logoSize, 
        textAlign:'center', 
        paddingHorizontal:20,
    },
});

export default Splash;
