import React, { Component } from 'react';

import {StatusBar, StyleSheet, TouchableOpacity, View, Image, Dimensions, ActivityIndicator, Text} from 'react-native';

import { withNavigationFocus } from "react-navigation";
import { getStatusBarHeight } from 'react-native-status-bar-height';
const deviceWidth = Dimensions.get("window").width;
import ScrollableTabView, {ScrollableTabBar} from 'rn-collapsing-tab-bar';
const containerHeight = Dimensions.get('window').height;

import ServicesScreen from '../screens/ServicesScreen';
import GalleryScreen from '../screens/GalleryScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import FacilitiesScreen from '../screens/FacilitiesScreen';
import SubsriptionsScreen from '../screens/SubscriptionsScreen';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import ActionButton from 'react-native-action-button';
import Share from 'react-native-share';

export const TAB_INDEX_SUBSCRIPTION = 0;
export const TAB_INDEX_GALLERY = 1;
export const TAB_INDEX_SERVICES = 2;
export const TAB_INDEX_FACILITIES = 3;

//import { ScrollableTabView, ScrollableTabBar } from '@valdio/react-native-scrollable-tabview'
// import { ScrollableTabBar } from '@valdio/react-native-scrollable-tabview'

class MembershipTab extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;
        let userData = userInfo[Constants.KEY_USER_DATA];
        let userType = userData[Constants.KEY_USER_TYPE];

        let initialPage = 0;
        let gymID = "";
        let gymName = "";
        let gymLocation = "";
        let profileImageURL = "";
        let coverImageURL = "";
        let isLoading = false;

        if(userType === Constants.USER_TYPE_OWNER) {
            initialPage = globals.getSetting()[Constants.KEY_INITIAL_TAB_INDEX];
            let gymData = userInfo[Constants.KEY_GYM_DATA];
            gymID = gymData[Constants.KEY_ID];
            gymName = gymData[Constants.KEY_GYM_NAME];
            gymLocation = gymData[Constants.KEY_GYM_DISPLAY_LOCATION];
            profileImageURL = gymData[Constants.KEY_PROFILE_IMAGE];
            coverImageURL = gymData[Constants.KEY_COVER_IMAGE];
        } else if(userType === Constants.USER_TYPE_MEMBER) {
            initialPage = 0;
            gymID = properties.navigation.getParam(Constants.KEY_GYM_ID, "");
            gymName = properties.navigation.getParam(Constants.KEY_GYM_NAME, "");
            gymLocation = properties.navigation.getParam(Constants.KEY_GYM_DISPLAY_LOCATION, "");
            profileImageURL = properties.navigation.getParam(Constants.KEY_PROFILE_IMAGE, "");
            coverImageURL = properties.navigation.getParam(Constants.KEY_COVER_IMAGE, "");
        }

        /*
        let initialPage = 0;
        let accountSetupStatus = globals.getSetting()[globals.KEY_USER_ACCOUNT_SETUP_STATUS];
        if(accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED) {
            initialPage = 0;
        } else if(accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_GYM_GALLERY_DONE) {
            initialPage = 3;
        } else if(accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_GYM_FACILITIES_DONE) {
            initialPage = 2;
        } else if(accountSetupStatus === globals.KEY_ACCOUNT_SETUP_STATUS_GYM_SERVICES_DONE) {
            initialPage = 1;
        } else {
            initialPage = 0;
        }
        */
       

       console.log("Initital Page:::" + initialPage);

        this.state = {
            isLoading: isLoading,
            initialPage: initialPage,
            userType: userType,
            gymID: gymID,
            gymName: gymName,
            gymLocation: gymLocation,
            gymProfileImageURL: profileImageURL,
            gymCoverImageURL: coverImageURL,
            tabOneHeight: containerHeight+80,
            tabTwoHeight: containerHeight - 230,
            tabThreeHeight: containerHeight,
            tabFourHeight: containerHeight,
            tabFiveHeight: containerHeight,
            currentPage: initialPage,
            endReachedOfSubscriptionPage: false,
            willShowUserNameProfileImageHeader: false,
            willStopChildFlatListScrolling: true,
        };
    }

    componentDidMount() {
        console.log('============d========================');
        let userIfo = globals.getSetting().isLoggedIn
        console.log(userIfo);
        console.log('==============d======================');
        this.focusListener = this.props.navigation.addListener("didFocus", () => {
            
            this.setState({
                endReachedOfSubscriptionPage: false,
            })
            let initialPage = globals.getSetting()[Constants.KEY_INITIAL_TAB_INDEX];

            this.tabView.goToPage(initialPage);
        });
    }

    componentWillUnmount() {
        if(this.focusListener) {
            this.focusListener.remove();
        }
    }


    measureTabOne = (event) => {
        console.log("measureTabOne::::");
        console.log(event.nativeEvent.layout.height);
        if(this.state.endReachedOfSubscriptionPage === false) {
            this.setState({
                tabOneHeight: event.nativeEvent.layout.height + 30,
            });
        }
        
    }
    measureTabTwo = (event) => {
        /*
        this.setState({
            tabTwoHeight: event.nativeEvent.layout.height
        })
        */
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
                    <View style={styles.gymInfoContainer}>
                        <Text style={styles.gymNameText}>{this.state.gymName}</Text>
                        <View style={styles.gymLocationInfoRow}>
                            <Image style={styles.locationIcon} source={require('../../assets/images/location_icon.png')} />
                            <Text style={styles.locationInfoText}>{this.state.gymLocation}</Text>
                        </View>
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
                    <View style={styles.gymInfoContainer}>
                        <Text style={styles.gymNameText}>{this.state.gymName}</Text>
                        <View style={styles.gymLocationInfoRow}>
                            <Image style={styles.locationIcon} source={require('../../assets/images/location_icon.png')} />
                            <Text style={styles.locationInfoText}>{this.state.gymLocation}</Text>
                        </View>
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
                    {/*
                    <TouchableOpacity
                        onPress={this.goBack}
                        style={{width: 30, height: 30, justifyContent:'center', alignItems:'center'}}
                    >
                        <Image style={styles.backIcon} source={require('../../assets/images/back_icon_white.png')}/>
                    </TouchableOpacity>
                    */}
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
                    initialPage={this.state.initialPage}
                    collapsableBar={collapsableComponent}
                    renderTabBar={() => 
                        <ScrollableTabBar 
                            backgroundColor={"white"} 
                            inactiveTextColor="#8e9092" 
                            activeTextColor="#121619" />}
                    onChangeTab={this.handleChangeTab}
                    tabBarUnderlineStyle={{backgroundColor:'#121619',height:2,}}
                    onCollapsibleStartedCollapsing={() => {
                        //console.log("Collapsible Component is starting collapsing:::");
                        if(this.state.willShowUserNameProfileImageHeader === false) {
                            this.setState({
                                willShowUserNameProfileImageHeader: true,
                            });
                        }
                        if(this.state.willStopChildFlatListScrolling === true) {
                            this.setState({
                                willStopChildFlatListScrolling: false,
                            });
                        }
                    }}
                    onCollapsibleFullyShown={() => {
                        //console.log("Collapsible Component is fully shown:::");
                        this.setState({
                            willShowUserNameProfileImageHeader: false,
                        });
                        this.setState({
                                willStopChildFlatListScrolling: true,
                            });
                    }}  
                >
                    <View 
                        tabLabel={"SUBSCRIPTION"}
                    >
                        <SubsriptionsScreen 
                            onEndReachedOfSubscriptionPage={this.onEndReachedOfSubscriptionPage}
                            onSubscriptionScreenMainHeightCalculated={this.onSubscriptionScreenMainHeightCalculated}
                            onSubscriptionPageListHeightChanged={this.onSubscriptionPageListHeightChanged}
                            willStopChildFlatListScrolling={this.state.willStopChildFlatListScrolling}
                        />
                    </View>
                    <View 
                        onLayout={(event) => {this.measureTabTwo(event)}}
                        tabLabel={"GALLERY"}
                    >
                        {/*
                        <View
                            style={
                                {
                                    height:containerHeight-44
                                }
                            }
                        >*/}
                            <GalleryScreen 
                                onRef={ ref => this.galleryScreen = ref} 
                                onLoadingStatusChanged={this.onLoadingStatusChanged} 
                                willStopChildFlatListScrolling={this.state.willStopChildFlatListScrolling}
                            />
                        {/*</View>
                        */}
                    </View>
                    <View onLayout={(event) => this.measureTabThree(event)} tabLabel={"SERVICES"}>
                        <View
                            style={
                                {
                                    height:containerHeight-44
                                }
                            }
                        >
                            <ServicesScreen 
                                onRef={ ref => this.servicesScreen = ref} 
                                willStopChildFlatListScrolling={this.state.willStopChildFlatListScrolling}
                            />
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
                            <FacilitiesScreen 
                                onRef={ ref => this.facilitiesScreen = ref}
                                willStopChildFlatListScrolling={this.state.willStopChildFlatListScrolling}
                            />
                        </View>
                    </View>
                    
                    
                    
                </ScrollableTabView>


                <TouchableOpacity 
                    style={{width:'100%', padding:0,}}
                    onPress={this.goToMembershipPlansScreen}
                >
                    <View
                        style={{
                            width:'100%',
                            height: 20,
                            backgroundColor:'red',
                            justifyContent:'center',
                            alignItems:'center',
                            padding:0,
                            margin:0,
                        }}
                    >
                        <Text style={{
                           width:'100%',
                           textAlign:'center',
                           fontSize:12,
                           color:'white',
                           textTransform:'uppercase', 
                        }}>{bottomText}</Text>
                    </View>
                </TouchableOpacity>

                {
                    this.state.currentPage === TAB_INDEX_SUBSCRIPTION ? (
                        <ActionButton
                            buttonColor="#3fd458"
                            onPress={this.addMembershipPlan}
                            
                        />
                    ) : null
                }
                {/*
                        <ActionButton
                            buttonColor="#3fd458"
                            size={40}
                        >
                            <ActionButton.Item 
                                buttonColor='#ec386c' 
                                title="Add Photos" 
                                onPress={() => this.galleryScreen.addImage()}
                            >
                                <Image style={{width:19.5, height:17.5}} resizeMode={"cover"} source={require("../../assets/images/add_photo_icon.png")} />
                            </ActionButton.Item>
                            <ActionButton.Item 
                                buttonColor='white' 
                                title="Save" 
                                onPress={() => this.galleryScreen.next()}
                            >
                                <Image style={{width:25, height:16.5}} resizeMode={"cover"} source={require("../../assets/images/green_right_mark.png")} />
                            </ActionButton.Item>
                        </ActionButton>
                        */}
                {
                    this.state.currentPage === TAB_INDEX_GALLERY ? (
                        <ActionButton
                            buttonColor={"#ec386c"}
                            onPress={ () => this.galleryScreen.addImage()}
                            renderIcon={(active) => {
                                return (
                                    <Image style={{width:19.5, height:17.5}} resizeMode={"cover"} source={require("../../assets/images/add_photo_icon.png")} />
                                );
                            }}
                            
                        />
                        
                    ):null
                }
                {
                    this.state.currentPage === TAB_INDEX_SERVICES ? (
                        <ActionButton
                            buttonColor={"white"}
                            onPress={ () => this.servicesScreen.next()}
                            renderIcon={(active) => {
                                return (
                                    <Image style={{width:25, height:16.5}} source={require('../../assets/images/green_right_mark.png')} />
                                );
                            }}
                            
                        />
                    ):null
                }

                {
                    this.state.currentPage === TAB_INDEX_FACILITIES ? (
                        <ActionButton
                            buttonColor={"white"}
                            onPress={ () => this.facilitiesScreen.next()}
                            renderIcon={(active) => {
                                return (
                                    <Image style={{width:25, height:16.5}} source={require('../../assets/images/green_right_mark.png')} />
                                );
                            }}
                            
                        />
                        
                    ):null
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

    onLoadingStatusChanged = (isLoading) => {
        this.setState({
            isLoading: isLoading,
        })
    }

    goToMembershipPlansScreen = () => {
        this.props.navigation.navigate("MembershipPlans");
    }

    goToPage = (index) => {
        if(index < 4) {
            this.tabView.goToPage(index);
        } else {
            this.props.navigation.navigate("MainApp");
        }
    }

    goToNotificationsScreen = () => {
        this.props.navigation.navigate("NotificationsScreen");
    }

    shareGymVale = () => {
        let title = "Join Our Gym Login Now";
        let referralURL = Constants.REFERRAL_URL_PREFIX+"g"+this.state.gymID;
        let shareOptions = {
            title: title,
            message: "Join Our Gym Login Now",
            url: referralURL,
            subject: title,
            
        };

        Share.open(shareOptions)
        .then((res) => { console.log(res) })
        .catch((err) => { err && console.log(err); });
    }

    addMembershipPlan = () => {
        let params = {};
        params[Constants.KEY_MEMBERSHIP_PLAN] = null;
        this.props.navigation.navigate("AddOrEditMembershipPlan", params);
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

export default withNavigationFocus(MembershipTab);