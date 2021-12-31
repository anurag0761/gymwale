import React, { Component } from 'react';
import { Text, ActivityIndicator, Image, View, Dimensions, StyleSheet, TouchableOpacity, Linking } from 'react-native';

import ScrollableTabView, {ScrollableTabBar} from 'rn-collapsing-tab-bar';

import CardView from 'react-native-rn-cardview';
import Share from 'react-native-share';

import AboutScreen from '../screens/MemberAboutScreen';
import AttendanceScreen from '../screens/MemberAttendanceScreen';

import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import * as globals from '../utils/globals';
import { fetchMemberDetails } from '../Redux/Actions/memberDetailAction';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const containerHeight = Dimensions.get('window').height;

class GuestDetailsScreen extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];

        let memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, "");
        let memberMembershipID = properties.navigation.getParam(Constants.KEY_MEMBER_MEMBERSHIP_ID, "");

        this.state = {
            memberID: memberID,
            memberMembershipID: memberMembershipID,
            gymID: gymID,
            isFetchingList: false,
            isDataLoaded: false,
            memberAboutList: [],
            membershipList: [],
            isShowingSearchView: false,
            searchText: '',
            tabOneHeight: containerHeight,
            tabTwoHeight: containerHeight,
            phoneNumber:'',
            phoneNumberWithoutCountryCode: '',
            age:"Unknown",
            currentBMI:"Unknown",
            name:"",
            memberType: "user",
            profileImageURL: null,
            gymMemberManageID:"",
            currentPage: 0,
            willShowUserNameProfileImageHeader: false,
        };
    }

    componentDidMount() {
        this.fetchMemberDetails(this.state.memberID);
    }

    measureTabOne = (event) => {
        this.setState({
            tabOneHeight: event.nativeEvent.layout.height
        })
    }
    measureTabTwo = (event) => {
        if(this.state.endReachedOfSubscriptionPage === false) {
            this.setState({
                tabTwoHeight: event.nativeEvent.layout.height
            })
        }
    }

    handleChangeTab = ({i, ref, from, }) =>{
        this.setState({
            currentPage: i,
        });
    }

    fetchMemberDetails(memberID) {
        this.setState({
            isFetchingList: true,
        });
        let thisInstance = this;
        
        let body = Constants.KEY_GYM_ID+'='+this.state.gymID
        +"&"+Constants.KEY_MEMBER_ID + "=" + memberID;
        this.props.DispatchFetchmember(body)
       if (this.props.GetMemberDetaildata.success) {
        let responseJson = this.props.GetMemberDetaildata.data; 
        let valid = responseJson[Constants.KEY_VALID];
        if(valid) {
            let aboutList = responseJson[Constants.KEY_ABOUT];
            let detailAboutList = aboutList[Constants.KEY_DETAIL];
            let bmiAboutList = aboutList[Constants.KEY_BMI];

            let profileImageURL = null;
            let name = "";
            let dateOfBirth = "";
            let currentBMI = "Unknown";
            let age = "Unknown";
            let phoneNo = "";
            let countryID = "";
            let memberType = "user";
            let comment = "";
            let gymMemberManageID = "";

            for(let i = 0; i < detailAboutList.length; i++) {
                let aboutItem = detailAboutList[i];
                if(aboutItem[Constants.KEY_LEFT_VALUE] === Constants.KEY_ABOUT_DATE_OF_BIRTH) {
                    dateOfBirth = aboutItem[Constants.KEY_RIGHT_VALUE];
                } 
            }

            if(dateOfBirth.length > 0) {
                age = "" + Utils.calculateAge(new Date(Date.parse(dateOfBirth)));
            }

            for(let i = 0; i < bmiAboutList.length; i++) {
                let aboutItem = bmiAboutList[i];
                if(aboutItem[Constants.KEY_LEFT_VALUE] === Constants.KEY_ABOUT_PROFILE_IMAGE) {
                    profileImageURL = aboutItem[Constants.KEY_RIGHT_VALUE];
                } else if(aboutItem[Constants.KEY_LEFT_VALUE] === Constants.KEY_ABOUT_MOBILE_NO) {
                    phoneNo = aboutItem[Constants.KEY_RIGHT_VALUE];
                } else if(aboutItem[Constants.KEY_LEFT_VALUE] === Constants.KEY_ABOUT_NAME) {
                    name = aboutItem[Constants.KEY_RIGHT_VALUE];
                } else if(aboutItem[Constants.KEY_LEFT_VALUE] === Constants.KEY_COUNTRY_ID) {
                    countryID = aboutItem[Constants.KEY_RIGHT_VALUE];
                } else if(aboutItem[Constants.KEY_LEFT_VALUE] === Constants.KEY_MEMBER_TYPE) {
                    memberType = aboutItem[Constants.KEY_RIGHT_VALUE];
                } else if(aboutItem[Constants.KEY_LEFT_VALUE] === Constants.KEY_ABOUT_COMMENT) {
                    detailAboutList.push(aboutItem);
                } else if(aboutItem[Constants.KEY_LEFT_VALUE] === Constants.KEY_ABOUT_BMI) {
                    currentBMI = aboutItem[Constants.KEY_RIGHT_VALUE];
                } else if(aboutItem[Constants.KEY_LEFT_VALUE] === Constants.KEY_ABOUT_GYM_MEMBER_MANAGE_ID) {
                    gymMemberManageID = aboutItem[Constants.KEY_RIGHT_VALUE];
                }
            }
            let phoneNumberWithoutCountryCode = phoneNo;
            phoneNo = countryID + phoneNo;
            
            let allMembershipPlanList = responseJson[Constants.KEY_MEMBERSHIP];
            
            
            thisInstance.setState({
                name:name,
                profileImageURL: profileImageURL,
                age: age,
                currentBMI: currentBMI,
                phoneNumber: phoneNo,
                phoneNumberWithoutCountryCode: phoneNumberWithoutCountryCode,
                memberType: memberType,
                memberAboutList: detailAboutList,
                membershipList: allMembershipPlanList,
                gymMemberManageID: gymMemberManageID,
                isFetchingList:false,
                isDataLoaded: true,
            });
        } 
       }
           else {
                thisInstance.setState({
                    isFetchingList:false,
                })
            }
			
		
    }

    renderTabBar= props => {
        return (
            <TabBar
                {...props}
                indicatorStyle={{ backgroundColor: '#121619' }}
                style={{ backgroundColor: 'white' }}
                activeColor={"#121619"}
                inactiveColor={"#8e9092"}
            />
        );
    }

    onSearchTextChanged = (text) => {
        this.setState({
            searchText:text
        });
        
    };

    showSearchBar = () => {
        this.setState({
            isShowingSearchView: true,
        })
    }

    hideSearchBar = () => {
        this.setState({
            isShowingSearchView: false,
            searchText: '',
        });
    }
    

	render() {

        if(this.state.isFetchingList) {
            return (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="large" color="#121619" />
                </View>
            );
        }

        if(this.state.isDataLoaded === false) {
            return (
                <View style={styles.mainContainer}>
                    <TouchableOpacity 
                        onPress={()=> {
                            this.fetchMemberDetails(this.state.memberID);
                        }}
                        style={{width:'100%'}}
                    >
                        <Text
                            style={styles.button}
                        >
                        Retry to fetch data
                        </Text>
                    </TouchableOpacity>
                </View>
            );
            
        }

        const { tabOneHeight, tabTwoHeight } = this.state;

        const collapsableComponent = (
            <View
                style={styles.headerContainer}
            >
                
                <View
                    style={styles.profileInfoCardContainer}
                >
                    <CardView 
                        cardElevation={4}
                        maxCardElevation={4}
                        radius={10}
                        backgroundColor={'#ffffff'}
                        style={styles.profileInfoCard}
                    >
                        <View
                            style={styles.profileInfoContainer}
                        >
                            <Text style={styles.profileNameText}>{this.state.name}</Text>
                            <View
                                style={styles.profileInfoRow}
                            >
                                <View style={{flex:1}}>
                                    <Text style={styles.profileInfoColumnTitleText}>Age</Text>
                                </View>
                                <View style={{flex:1}}>
                                    <Text style={styles.profileInfoColumnTitleText}>Current BMI</Text>
                                </View>
                            </View>
                            <View
                                style={styles.profileInfoRow}
                            >
                                <View style={{flex:1}}>
                                    <Text style={styles.profileInfoColumnSubtitleText}>{this.state.age}</Text>
                                </View>
                                <View style={{flex:1}}>
                                    <Text style={styles.profileInfoColumnSubtitleText}>{this.state.currentBMI}</Text>
                                </View>
                            </View>
                            <View style={styles.separator} />
                            <View
                                style={styles.profileInfoRow}
                            >
                                <TouchableOpacity
                                    style={{flex:1}}
                                    onPress={this.openWhatsapp}
                                >
                                    <View style={styles.profileInfoRow}>
                                        <Image style={{width:20, height:20, marginRight:10}} resizeMode={"cover"} source={require('../../assets/images/whatsapp_icon.png')} />
                                        <Text style={{color:"#00a82d", fontSize:18, fontWeight:'bold', textAlign:'left'}}>Whatsapp</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{flex:1}}
                                    onPress={this.callPhoneNumber}
                                >
                                    <View style={styles.profileInfoRow}>
                                        <Image style={{width:20, height:20, marginRight:10}} resizeMode={"cover"} source={require('../../assets/images/call_icon.png')} />
                                        <Text style={{color:"#2c9fc9", fontSize:18, fontWeight:'bold', textAlign:'left'}}>Call Me</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CardView>
                    
                    
                </View>
                <View
                    style={styles.profileImageContainer}
                >
                    <Image style={styles.profileImage}  resizeMode={"cover"} source={{uri:this.state.profileImageURL}} />
                </View>
            </View>
        );

        

        return (
            <>
                <View style={styles.headerNavContainer}>
                    
                    <TouchableOpacity
                        onPress={this.goBack}
                        style={{width: 30, height: 30, justifyContent:'center', alignItems:'center'}}
                    >
                        <Image style={styles.backIcon} source={require('../../assets/images/back_icon_white.png')}/>
                    </TouchableOpacity>
                    
                    <View style={styles.titleBannerContainer}>
                        {
                            this.state.willShowUserNameProfileImageHeader ? (
                                <View
                                    style={{
                                        backgroundColor:'#161a1e',
                                        width:'100%',
                                        height:50,
                                        flexDirection:'row',
                                        justifyContent:'flex-start',
                                        alignItems:'center',
                                    }}
                                >
                                    <Image style={{borderWidth:1, borderColor:'white', width: 40, aspectRatio:1, borderRadius:20,}}  resizeMode={"cover"} source={{uri:this.state.profileImageURL}} />
                                    <Text style={{marginLeft:20, color:'white', fontWeight:'500', fontSize:15}}>{this.state.name}</Text>
                                </View>
                            ) : (
                                <Image style={styles.titleBanner} resizeMode={"cover"} source={require('../../assets/images/gymvale_name_logo.png')} />
                            )
                        }
                    </View>
                    <TouchableOpacity onPress={this.shareGymVale}>
                        <Image style={styles.shareIcon} source={require('../../assets/images/share_icon.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.goToNotificationsScreen}>
                        <Image style={styles.notificationIcon} source={require('../../assets/images/notification_icon.png')}/>
                    </TouchableOpacity>

                </View>
                
                <ScrollableTabView
                    
                    tabContentHeights={[tabOneHeight, tabTwoHeight]}
                    scrollEnabled
                    prerenderingSiblingsNumber={Infinity}
                    initialPage={0}
                    collapsableBar={collapsableComponent}
                    renderTabBar={() => <ScrollableTabBar backgroundColor={"white"} inactiveTextColor="#747474" activeTextColor="#162029" />}
                    ref={(tabView) => { this.tabView = tabView}}
                    onChangeTab={this.handleChangeTab}
                    onCollapsibleStartedCollapsing={() => {
                        //console.log("Collapsible Component is starting collapsing:::");
                        if(this.state.willShowUserNameProfileImageHeader === false) {
                            this.setState({
                                willShowUserNameProfileImageHeader: true,
                            });
                        }
                    }}
                    onCollapsibleFullyShown={() => {
                        //console.log("Collapsible Component is fully shown:::");
                        this.setState({
                                willShowUserNameProfileImageHeader: false,
                            });
                    }} 
                >
                    <View onLayout={(event) => this.measureTabOne(event)} tabLabel={"ABOUT"}>
                        <View
                            style={
                                {
                                    height:containerHeight-44
                                }
                            }
                        >
                            <AboutScreen gymMemberManageID={this.state.gymMemberManageID} aboutList={this.state.memberAboutList}/>
                        </View>
                    </View>
                    
                    <View onLayout={(event) => this.measureTabTwo(event)} tabLabel={"ATTENDANCE"}>
                        <View
                            style={
                                {
                                    height:containerHeight-44
                                }
                            }
                        >
                            <AttendanceScreen memberID={this.state.memberID} membershipPlans={[]}/>
                        </View>
                    </View>
                    
                </ScrollableTabView>

            </>
            
        );
    }
    
    goBack = () => {
        this.props.navigation.pop();
    }

    openWhatsapp = () => {
        let url = "https://api.whatsapp.com/send?phone="+this.state.phoneNumber;
        Linking.openURL(url);
    }

    callPhoneNumber = () => {
        Linking.openURL(`tel:${this.state.phoneNumberWithoutCountryCode}`)
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
}

const styles = StyleSheet.create({
    mainContainer: {
        width:'100%',
        height:'100%',
        backgroundColor:'white',
        justifyContent:'flex-start',
        alignItems:'center',
    },
    activityIndicatorContainer: {
        width:'100%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:0,
        left:0,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    headerContainer: {
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        backgroundColor:'#161a1e',
    },
    headerNavContainer: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        height:44,
        backgroundColor:'#161a1e',
        paddingHorizontal: 10,
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
        width:9,
        height:16,
        resizeMode:'cover',
        marginRight:10,
    },
    searchTextInput: {
        flexGrow:1, 
        textAlign:'left', 
        color:'#41464c',
    },
    searchIcon: {
        width:13,
        height:14,
        resizeMode:'cover',
        marginRight:20,
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
    profileInfoCardContainer: {
        width:'100%',
        backgroundColor:'#161a1e',
        //paddingTop:40,
        justifyContent:'center',
        alignItems:'center',
        paddingHorizontal:20,
    },
    profileInfoCard: {
        width:'100%',
        height:200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent:'flex-start',
        marginTop:35,
    },
    profileImageContainer: {
        width:'100%',
        height:70,
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top: 10,
        left:0,
    },
    profileImage: {
        width: 70,
        aspectRatio:1,
        borderRadius: 35,
        borderWidth:1,
        borderColor:'white',
    },
    profileInfoContainer: {
        justifyContent:'flex-start',
        alignItems:'center',
        marginTop: 45,
        width:'100%',
    },
    profileNameText:{
        width:'100%',
        textAlign:'center',
        fontSize:20,
        color:'#343434',
        fontWeight:'bold',
        marginBottom:15,
    },
    profileInfoRow: {
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
    },
    profileInfoColumnTitleText: {
        width:'100%',
        color:'#504f4f', 
        fontSize:16, 
        fontWeight:'bold', 
        textAlign:'center',
    },
    profileInfoColumnSubtitleText: {
        width:'100%',
        color:'#9e9e9e', 
        fontSize:14, 
        textAlign:'center',
    },
    separator: {
        width:'100%',
        height:1,
        backgroundColor:'#d6d6d6',
        marginVertical:10,
    },
    button: {
        borderColor:'black',
        borderWidth:2,
        borderRadius:3,
        color:'black',
        fontSize:16,
        fontWeight:'bold',
        textTransform: 'uppercase',
        width:'100%',
        textAlign:'center',
        textAlignVertical:'center',
        height:40,
        lineHeight:40,
        marginTop: 20,
    },
});

const mapStateToprops = (state) => {
    return {
      GetMemberDetaildata: state.MemberDetailReducer,
  
      
    };
  };
  function mapDispatchToprops(dispatch) {
    return bindActionCreators(
      {
        DispatchFetchmember: fetchMemberDetails,
      },
      dispatch,
    );
  }
  export default connect(
    mapStateToprops,
    mapDispatchToprops,
  ) (GuestDetailsScreen);
