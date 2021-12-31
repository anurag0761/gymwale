import React, { Component } from 'react';

import {StyleSheet, TouchableOpacity, View, Image, Dimensions, Text, Alert, 
    ActivityIndicator ,Linking, StatusBar} from 'react-native';

const deviceWidth = Dimensions.get("window").width;
import ScrollableTabView, {ScrollableTabBar} from 'rn-collapsing-tab-bar';
const containerHeight = Dimensions.get('window').height;
import { getStatusBarHeight } from 'react-native-status-bar-height';
import ServicesScreen from '../screens/GymServicesScreen';
import GalleryScreen from '../screens/GymGalleryScreen';
//import ReviewsScreen from '../screens/ReviewsScreen';
import FacilitiesScreen from '../screens/GymFacilitiesScreen';
import SubsriptionsScreen from '../screens/GymSubscriptionsScreen';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import ActionButton from 'react-native-action-button';
import Share from 'react-native-share';
import { memberAllGym } from '../Redux/Actions/memberallGymAction';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';


class GymDetailsScreen extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;
        let userData = userInfo[Constants.KEY_USER_DATA];
        let memberPhone = userData[Constants.KEY_COUNTRY_ID] + userData[Constants.KEY_PHONE];
        let memberData = userInfo[Constants.KEY_MEMBER_DATA];
        memberData = memberData[0];
        let memberID = memberData[Constants.KEY_MEMBER_ID];
        let memberName = memberData[Constants.KEY_NAME];
        let gymID = properties.navigation.getParam(Constants.KEY_GYM_ID, "");
        let gymName = properties.navigation.getParam(Constants.KEY_GYM_NAME, "");
        let gymLocation = properties.navigation.getParam(Constants.KEY_GYM_DISPLAY_LOCATION, "");
        let gymProfileImageURL = properties.navigation.getParam(Constants.KEY_PROFILE_IMAGE, "");
        let gymCoverImageURL = properties.navigation.getParam(Constants.KEY_COVER_IMAGE, "");
        let countryID = properties.navigation.getParam(Constants.KEY_COUNTRY_ID, "");
        let gymMobilePhone = properties.navigation.getParam(Constants.KEY_GYM_MOBILE_PHONE, "");
        let gymLatitude = properties.navigation.getParam(Constants.KEY_LATITUDE, "");
        let gymLongitude = properties.navigation.getParam(Constants.KEY_LONGITUDE, "");

        this.state = {
            isLoading: false,
            memberPhone: memberPhone,
            memberID: memberID,
            memberName: memberName,
            gymID: gymID,
            gymName: gymName,
            gymLocation: gymLocation,
            gymProfileImageURL: gymProfileImageURL,
            gymCoverImageURL: gymCoverImageURL,
            tabOneHeight: containerHeight+80,
            tabTwoHeight: containerHeight,
            tabThreeHeight: containerHeight,
            tabFourHeight: containerHeight,
            tabFiveHeight: containerHeight,
            endReachedOfSubscriptionPage: false,
            countryID: countryID,
            gymMobilePhone: gymMobilePhone,
            gymLatitude: gymLatitude,
            gymLongitude: gymLongitude,
            willShowIAmInterestedButton: false,
        };
    }

    componentDidMount() {
        this.fetchMemberGymList();
    }

    measureTabOne = (event) => {
        console.log("measureTabOne::::");
        console.log(event.nativeEvent.layout.height);
        if(this.state.endReachedOfSubscriptionPage === false) {
            this.setState({
                tabOneHeight: event.nativeEvent.layout.height + 10,
            });
        }
        
    }
    measureTabTwo = (event) => {
        this.setState({
            tabTwoHeight: event.nativeEvent.layout.height
        })
    }

    measureTabThree = (event) => {
        this.setState({
            tabThreeHeight: event.nativeEvent.layout.height
        })
    }
    
    measureTabFour = (event) => {
        this.setState({
            tabFourHeight: event.nativeEvent.layout.height
        })
    }

    measureTabFive = (event) => {
        this.setState({
            tabFiveHeight: event.nativeEvent.layout.height
        })
    }

    handleChangeTab = ({i, ref, from, }) =>{
        globals.setOneSetting(Constants.KEY_INITIAL_TAB_INDEX, i);
        this.setState({
            currentPage: i,
        });
    }

    onEndReachedOfSubscriptionPage = () => {
        console.log("onEndReachedOfSubscriptionPage::::::");
        this.setState({
            endReachedOfSubscriptionPage: true,
        });
    }

    onSubscriptionScreenMainHeightCalculated = (mainHeight) => {
        let tabOneHeight = this.state.tabOneHeight;
        if(mainHeight > tabOneHeight){
            tabOneHeight = mainHeight;
        }
        this.setState({
            tabOneHeight: tabOneHeight,
        });
    }

    onSubscriptionPageListHeightChanged = (isExpanded, height) => {
        console.log("onSubscriptionPageListHeightChanged:::::");
        let currentHeight = this.state.tabOneHeight;
        if(isExpanded) {
            currentHeight += height;
        } else {
            currentHeight -= height;
        }
        this.setState({
            tabOneHeight: currentHeight,
        });
    }

    collapsableComponent = () => {
        return (
            <View style={styles.gymHeaderContainer}>
                <Image style={styles.gymCoverImage} source={{uri:this.state.gymCoverImageURL}} />
                <View style={styles.gymHeaderInfoContainer}>
                    <View style={{width:'100%', height:24}}></View>
                    <View style={styles.gymInfoContainer}>
                        <Text style={styles.gymNameText}>{this.state.gymName}</Text>
                        <View style={styles.gymLocationInfoRow}>
                            <TouchableOpacity>
                                <Image style={styles.locationIcon} source={require('../../assets/images/location_icon.png')} />
                            </TouchableOpacity>
                            <Text style={styles.locationInfoText}>{this.state.gymLocation}</Text>
                        </View>
                    </View>
                    <View style={{position:'absolute', top:0, right:20,width:48, height:48, backgroundColor:'red',}}>
                        <TouchableOpacity onPress={this.callPhoneNumber}>
                            <Image style={{width:48, aspectRatio:1}} source={require('../../assets/images/green_call_icon.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        

        let bottomText = "";
        let canUsePaidFeatures = globals.getSetting().canUsePaidFeatures;
        if(canUsePaidFeatures === 'true') {
            bottomText = "Your Prime Membership is expired on "+ globals.getSetting().membershipExpireDate +".";
        } else {
            bottomText = "Current member "+ globals.getSetting().member + "/" +
            globals.getSetting().totalAddOn  + ". Upgrade your plan now.";
        }

        const { tabOneHeight, tabTwoHeight, tabThreeHeight, tabFourHeight, tabFiveHeight } = this.state;

        const collapsableComponent = (
            <View style={styles.gymHeaderContainer}>
                <Image style={styles.gymCoverImage} source={{uri:this.state.gymCoverImageURL}} />
                <View style={styles.gymHeaderInfoContainer}>
                    <View style={{width:'100%', height:24}}></View>
                    <View style={styles.gymInfoContainer}>
                        <Text style={styles.gymNameText}>{this.state.gymName}</Text>
                        <View style={styles.gymLocationInfoRow}>

                            <TouchableOpacity onPress={this.showGymLocationInMap}>
                                <Image style={styles.locationIcon} source={require('../../assets/images/location_icon.png')} />
                            </TouchableOpacity>
                            <Text style={styles.locationInfoText}>{this.state.gymLocation}</Text>
                        </View>
                    </View>
                    <View style={{position:'absolute', top:0, right:20, justifyContent:'center', alignItems:'center'}}>
                        <TouchableOpacity onPress={this.callPhoneNumber} style={{width:48, height:48}}>
                            <View style={{justifyContent:'center', alignItems:'center', width:48, height:48}}>
                                <Image resizeMode={"contain"} style={{width:48, height:48}} source={require('../../assets/images/green_call_icon.png')} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
        
        
        return (
            <>
                <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
					<StatusBar backgroundColor="#161a1e" barStyle="light-content" />
				</View>
                <View style={styles.headerContainer}>
                    
                    <TouchableOpacity
                        onPress={this.goBack}
                        style={{width: 30, height: 30, justifyContent:'center', alignItems:'center'}}
                    >
                        <Image style={styles.backIcon} source={require('../../assets/images/back_icon_white.png')}/>
                    </TouchableOpacity>
                    
                    <View style={styles.titleBannerContainer}>
                        <Image style={styles.titleBanner} resizeMode={"cover"} source={require('../../assets/images/gymvale_name_logo.png')} />
                    </View>
                    <TouchableOpacity onPress={this.shareGymVale}>
                        <Image style={styles.shareIcon} source={require('../../assets/images/share_icon.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.goToNotificationsScreen}>
                        <Image style={styles.notificationIcon} source={require('../../assets/images/notification_icon.png')}/>
                    </TouchableOpacity>

                </View>
                
                <ScrollableTabView
                    ref={(tabView) => { this.tabView = tabView}}
                    tabContentHeights={[tabOneHeight, tabTwoHeight, tabThreeHeight, tabFourHeight]}
                    scrollEnabled
                    prerenderingSiblingsNumber={Infinity}
                    collapsableBar={collapsableComponent}
                    renderTabBar={() => 
                        <ScrollableTabBar 
                            backgroundColor={"white"} 
                            inactiveTextColor="#8e9092" 
                            activeTextColor="#121619" />}
                    onChangeTab={this.handleChangeTab}
                    tabBarUnderlineStyle={{backgroundColor:'#121619',height:2,}}
                >
                    <View tabLabel={"SUBSCRIPTION"}>
                        <SubsriptionsScreen 
                            onEndReachedOfSubscriptionPage={this.onEndReachedOfSubscriptionPage}
                            onSubscriptionScreenMainHeightCalculated={this.onSubscriptionScreenMainHeightCalculated}
                            onSubscriptionPageListHeightChanged={this.onSubscriptionPageListHeightChanged}
                            gymID={this.state.gymID}
                            memberID={this.state.memberID}
                            memberPhone={this.state.memberPhone}
                            memberName={this.state.memberName}
                            parentNav={this.props.navigation}
                        />
                    </View>
                    <View onLayout={(event) => this.measureTabTwo(event)} tabLabel={"GALLERY"}>
                        <View
                            style={
                                {
                                    height:containerHeight-44
                                }
                            }
                        >
                            <GalleryScreen onRef={ ref => this.galleryScreen = ref} gymID={this.state.gymID}/>
                        </View>
                    </View>
                    <View onLayout={(event) => this.measureTabThree(event)} tabLabel={"SERVICES"}>
                        <View
                            style={
                                {
                                    height:containerHeight-44
                                }
                            }
                        >
                            <ServicesScreen onRef={ ref => this.servicesScreen = ref} gymID={this.state.gymID}/>
                        </View>
                    </View>
                    
                    
                    <View onLayout={(event) => this.measureTabFour(event)} tabLabel={"FACILITIES"}>
                        <View
                            style={
                                {
                                    height:containerHeight-44
                                }
                            }
                        >
                            <FacilitiesScreen onRef={ ref => this.facilitiesScreen = ref} gymID={this.state.gymID}/>
                        </View>
                    </View>
                    
                    
                    
                </ScrollableTabView>
                {
                    this.state.willShowIAmInterestedButton === true ? (
                        <TouchableOpacity onPress={this.showGymJoinConfirmationAlert}>
                            <View
                                style={{
                                    backgroundColor:'#17aae0',
                                    width:'100%',
                                    height:35,
                                    justifyContent:'center',
                                    alignItems:'center',
                                }}
                            >
                                <Text style={{color:'white', textTransform:'uppercase', fontSize:12, fontWeight:'500'}}>I am interested</Text>
                            </View>
                        </TouchableOpacity>
                    ) : null
                }
                {
                    this.state.isLoading ? (
                        <View style={styles.activityIndicatorContainer}>
                            <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                        </View>
                    ): null
                    
                }
            </>
            
        );
        
    }

    fetchMemberGymList() {
        this.setState({
            isLoading: true,
        });
        
        let thisInstance = this;
        let body = Constants.KEY_MEMBER_ID+'='+this.state.memberID;
        //+ "&" + Constants.KEY_S_SEARCH + "=" + searchText;

        console.log("BODY:::" + body);
        this.props.dispatchmemberAllGym(body);
        setTimeout(() => {
            
            let gymList = this.props.memberAllGymdata.data[Constants.KEY_DATA];
            console.log("Total gyms:::" + gymList.length);
            let  willShowIAmInterestedButton = true;
            for(let i = 0; i < gymList.length; i++) {
                let gymData = gymList[i];
                if(gymData[Constants.KEY_GYM_ID] === thisInstance.state.gymID) {
                    willShowIAmInterestedButton = false;
                    break;
                }
            }

            thisInstance.setState({
                willShowIAmInterestedButton: willShowIAmInterestedButton,
                isLoading: false,
            });
            if(this.props.memberAllGymdata.error){
console.log('error white loadig');
            }
        }, 2000);
       
          
		
	
    }

    goBack = () => {
        this.props.navigation.pop();
    }


    goToNotificationsScreen = () => {
        this.props.navigation.navigate("NotificationsScreen");
    }

    showGymLocationInMap = () => {
        if(this.state.gymLatitude !== '' && this.state.gymLongitude !== '') {
            Linking.openURL("http://maps.google.com/?q="+this.state.gymLatitude+","+this.state.gymLongitude);
        }
    }

    shareGymVale = () => {
        let title = "Have you look this fitness application ?Download Now -";
        let referralURL = Constants.REFERRAL_APP_URL_PREFIX+"m"+this.state.memberID;
        let shareOptions = {
            title: title,
            message: "Have you look this fitness application ?Download Now -",
            url: referralURL,
            subject: title,
            
        };

        Share.open(shareOptions)
        .then((res) => { console.log(res) })
        .catch((err) => { err && console.log(err); });
    }

    callPhoneNumber = () => {
        Linking.openURL(`tel:${this.state.countryID+this.state.gymMobilePhone}`);
    }

    joinGym = () => {
        this.setState({
            isLoading: true,
        });
        
        let thisInstance = this;

        let data = new FormData();
        data.append(Constants.KEY_QRCODE, "gym_id="+ this.state.gymID);
        data.append(Constants.KEY_LOGGED_IN_ID, this.state.memberID);
        
        
        console.log("BODY:::");
        console.log(data);


        fetch(Constants.API_URL_ADD_GYM_MEMBER_APP, {
			method: 'post',
            body: data,
  			headers: { 
                'content-type':'multipart/form-data',
				'Accept': 'application/json',
			}
		  })
		.then((response) => {
            return response.json();
        })
		.then((responseJson) => {
            console.log("Response JSON:::");
            console.log(responseJson);
            let valid = responseJson[Constants.KEY_VALID];
            if(valid) {
                thisInstance.setState({
                    isLoading:false
                });
                let attendanceList = responseJson[Constants.KEY_ATTENDANCE];
                if(responseJson[Constants.KEY_MEMBER_DATA]) {
                    attendanceList = responseJson[Constants.KEY_MEMBER_DATA];
                }
                let message = responseJson[Constants.KEY_MESSAGE];
                Utils.showAlert("", message);
            } else {
                let message = responseJson[Constants.KEY_MESSAGE];
                if(!(message && message.length > 0)) {
                    message = 'Some error occurred. Please try agian.';
                }
                thisInstance.setState({
                    isLoading:false
                });
                Utils.showAlert("Error!", message);
            }
		})
		.catch((error) => {
            thisInstance.setState({
                isLoading: false
            });
            console.log("Error while saving data....");
            console.log(error);
            Utils.showAlert("Some error occurred. Please try again.");
        });
        
    }

    showGymJoinConfirmationAlert = () => {
        Alert.alert(
            "Show Interest", "Your contact details will share with gym.",
            //"Join Gym", "Are you sure want to join this gym?",
            [
              { text: 'OK', onPress: () => this.joinGym() },
              { text: 'CANCEL', onPress: () => console.log("Not joining...") },
            ],
            { cancelable: false },
        );
    }

    
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        height:44,
        backgroundColor:'#161a1e',
        paddingHorizontal: 10,
    },
    gymHeaderContainer: {
        width:'100%',
        backgroundColor:'white',
        height:180,
        justifyContent:'flex-start',
        alignItems:'flex-start',
    },
    gymCoverImage: {
        backgroundColor:'#161a1e',
        width:'100%',
        height: 150,
        resizeMode:'cover',
    },
    gymHeaderInfoContainer: {
        backgroundColor:'transparent',
        width:'100%',
        paddingHorizontal: 20,
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        left:0,
        bottom: 0,
    },
    gymInfoContainer: {
        backgroundColor:'#f7f7f7',
        width:'100%',
        height:60,
        borderRadius: 8,
        padding:10,
        justifyContent:'center',
        alignItems:'center',
    },
    gymNameText: {
        color:'#202020',
        fontSize: 14,
        fontWeight:'bold',
        textAlign:'left',
        width:'100%'
    },
    gymLocationInfoRow: {
        flexDirection:'row',
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        marginTop: 5,
    },
    locationIcon: {
        width:10,
        height: 15,
        marginRight: 10,
    },
    locationInfoText: {
        flexGrow:1,
        textAlign:'left',
        color:'#202020',
        fontSize: 12,
    },
    titleBannerContainer: {
        flexGrow:1,
        alignItems:'flex-start',
        justifyContent:'center',
    },
    titleBanner: {
        width:150,
        height:21.5,
    },
    backIcon: {
        width:11,
        height:20,
        resizeMode:'cover',
        marginRight:10,
    },
    shareIcon: {
        width:13,
        height:14,
        resizeMode:'cover',
        marginRight:20,
    },
    notificationIcon: {
        width:13,
        height:15,
        resizeMode:'cover',
        marginRight:20,
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
        backgroundColor:'rgba(0,0,0,0.5)'
    },
});

const mapStateToprops = (state) => {
    return {
      memberAllGymdata: state.memberAllGymReducer,
    };
  };
  
  function mapDispatchToprops(dispatch) {
    return bindActionCreators(
      {
        dispatchmemberAllGym: memberAllGym,
      },
      dispatch,
    );
  }
  
  export default connect(mapStateToprops, mapDispatchToprops) (GymDetailsScreen);