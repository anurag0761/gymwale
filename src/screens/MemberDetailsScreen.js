import React, {Component} from 'react';
import {
  StatusBar,
  Text,
  ActivityIndicator,
  Image,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';

import {withNavigationFocus} from 'react-navigation';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import ScrollableTabView, {ScrollableTabBar} from 'rn-collapsing-tab-bar';
import Share from 'react-native-share';
import CardView from 'react-native-rn-cardview';
import ActionButton from 'react-native-action-button';

import AboutScreen from '../screens/MemberAboutScreen';
import SubscriptionScreen from '../screens/MemberSubscriptionsScreen';
import WorkoutScreen from '../screens/MemberWorkoutScreen';
import AttendanceScreen from '../screens/MemberAttendanceScreen';

import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import * as globals from '../utils/globals';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchMemberDetails} from '../Redux/Actions/memberDetailAction';
import { TabBar } from 'react-native-tab-view';

const containerHeight = Dimensions.get('window').height;

class MemberDetailsScreen extends Component {
  constructor(properties) {
    super(properties);

    let gymID = '';
    let memberID = '';
    let memberMembershipID = '';

    let userInfo = globals.getSetting().userInfo;
    let body = userInfo[Constants.KEY_USER_DATA];
    let userType = body[Constants.KEY_USER_TYPE];
    if (userType === Constants.USER_TYPE_OWNER) {
      let gymData = userInfo[Constants.KEY_GYM_DATA];
      gymID = gymData[Constants.KEY_ID];
      memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, '');
      memberMembershipID = properties.navigation.getParam(
        Constants.KEY_MEMBER_MEMBERSHIP_ID,
        '',
      );
    } else if (userType === Constants.USER_TYPE_MEMBER) {
      let memberData = userInfo[Constants.KEY_MEMBER_DATA];
      memberData = memberData[0];
      memberID = memberData[Constants.KEY_MEMBER_ID];
      gymID = memberData[Constants.KEY_GYM_ID];
    }

    this.state = {
      memberID: memberID,
      memberMembershipID: memberMembershipID,
      gymID: gymID,
      userType: userType,
      isFetchingList: true,
      isDataLoaded: false,
      memberAboutList: [],
      membershipList: [],
      isShowingSearchView: false,
      searchText: '',
      tabOneHeight: containerHeight,
      tabTwoHeight: containerHeight + 80,
      tabThreeHeight: containerHeight,
      tabFourHeight: containerHeight,
      phoneNumber: '',
      age: 'Unknown',
      currentBMI: 'Unknown',
      name: '',
      memberType: 'user',
      profileImageURL: null,
      gymMemberManageID: '',
      currentPage: 0,
      endReachedOfSubscriptionPage: false,
      willShowEnlargedProfileImage: false,
      willShowUserNameProfileImageHeader: false,
      willStopChildFlatListScrolling: true,
    };
  }

  componentDidMount() {
  
  
    let thisInstance = this;
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      thisInstance.fetchMemberDetails(this.state.memberID);
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  measureTabOne = (event) => {
    this.setState({
      tabOneHeight: event.nativeEvent.layout.height,
    });
  };
  measureTabTwo = (event) => {
    if (this.state.endReachedOfSubscriptionPage === true) {
      this.setState({
        tabTwoHeight: event.nativeEvent.layout.height + 80,
        endReachedOfSubscriptionPage: false,
      });
      console.log('tabTwoHeight::' + this.state.tabTwoHeight);
    }
  };

  measureTabThree = (event) => {
    this.setState({
      tabThreeHeight: event.nativeEvent.layout.height,
    });
  };

  measureTabFour = (event) => {
    this.setState({
      tabFourHeight: event.nativeEvent.layout.height,
    });
  };

  handleChangeTab = ({i, ref, from}) => {
    this.setState({
      currentPage: i,
    });
  };

  onEndReachedOfSubscriptionPage = () => {
    console.log('onEndReachedOfSubscriptionPage');
    this.setState({
      endReachedOfSubscriptionPage: true,
    });
  };

  fetchMemberDetails(memberID) {
    this.setState({
      isFetchingList: true,
    });
    let thisInstance = this;

    let body = Constants.KEY_MEMBER_ID + '=' + memberID;
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      body += '&' + Constants.KEY_GYM_ID + '=' + this.state.gymID;
    }
    this.props.DispatchFetchmember(body).then(()=> {

      let responseJson = this.props.GetMemberDetaildata.data;
   
      console.log('Member Details:::');
      
      let valid = responseJson[Constants.KEY_VALID];
      if (valid) {
        let aboutList = responseJson[Constants.KEY_ABOUT];
        let detailAboutList = aboutList[Constants.KEY_DETAIL];
        let bmiAboutList = aboutList[Constants.KEY_BMI];
        
       

        let profileImageURL = null;
        let name = '';
        let dateOfBirth = '';
        let currentBMI = 'Unknown';
        let age = 'Unknown';
        let phoneNo = '';
        let countryID = '';
        let memberType = 'user';
        let comment = '';
        let gymMemberManageID = '';
        let largeProfileImageURL = null;

        for (let i = 0; i < detailAboutList.length; i++) {
          let aboutItem = detailAboutList[i];
          if (
            aboutItem[Constants.KEY_LEFT_VALUE] ===
            Constants.KEY_ABOUT_DATE_OF_BIRTH
          ) {
            dateOfBirth = aboutItem[Constants.KEY_RIGHT_VALUE];
          }
        }

        if (dateOfBirth.length > 0) {
          age = '' + Utils.calculateAge(new Date(Date.parse(dateOfBirth)));
        }

        for (let i = 0; i < bmiAboutList.length; i++) {
          let aboutItem = bmiAboutList[i];
          let leftValue = aboutItem[Constants.KEY_LEFT_VALUE];
          if (leftValue === Constants.KEY_ABOUT_PROFILE_IMAGE) {
            profileImageURL = aboutItem[Constants.KEY_RIGHT_VALUE];
          } else if (leftValue === Constants.KEY_ABOUT_MOBILE_NO) {
            phoneNo = aboutItem[Constants.KEY_RIGHT_VALUE];
          } else if (leftValue === Constants.KEY_ABOUT_NAME) {
            name = aboutItem[Constants.KEY_RIGHT_VALUE];
          } else if (leftValue === Constants.KEY_COUNTRY_ID) {
            countryID = aboutItem[Constants.KEY_RIGHT_VALUE];
          } else if (leftValue === Constants.KEY_MEMBER_TYPE) {
            memberType = aboutItem[Constants.KEY_RIGHT_VALUE];
          } else if (
            leftValue === Constants.KEY_ABOUT_COMMENT &&
            this.state.userType === Constants.USER_TYPE_OWNER
          ) {
            detailAboutList.push(aboutItem);
          } else if (leftValue === Constants.KEY_ABOUT_BMI) {
            currentBMI = aboutItem[Constants.KEY_RIGHT_VALUE];
          } else if (leftValue === Constants.KEY_ABOUT_GYM_MEMBER_MANAGE_ID) {
            gymMemberManageID = aboutItem[Constants.KEY_RIGHT_VALUE];
          } else if (leftValue === 'largeImage') {
            largeProfileImageURL = aboutItem[Constants.KEY_RIGHT_VALUE];
          } else if (
            leftValue === Constants.KEY_ABOUT_MEMBER_COMMENTS &&
            this.state.userType === Constants.USER_TYPE_MEMBER
          ) {
            let comments = aboutItem[Constants.KEY_RIGHT_VALUE];
            for (
              let commentsIterator = 0;
              commentsIterator < comments.length;
              commentsIterator++
            ) {
              let _comment = comments[commentsIterator];
              let commentText = _comment[Constants.KEY_ABOUT_COMMENT];
              if (commentText === '') {
                commentText = 'No comment';
              }
              let commentBy = 'Comment by ' + _comment[Constants.KEY_GYM_NAME];
              let commentItem = {};
              commentItem[Constants.KEY_LEFT_VALUE] = commentBy;
              commentItem[Constants.KEY_RIGHT_VALUE] = commentText;
              detailAboutList.push(commentItem);
            }
          }
        }

        let phoneNumberWithoutCountryCode = phoneNo;
        phoneNo = countryID + phoneNo;

        let allMembershipPlanList = responseJson[Constants.KEY_MEMBERSHIP];
        if (
          allMembershipPlanList === null ||
          allMembershipPlanList === undefined
        ) {
          console.log('### membership plans were not sent...');
          allMembershipPlanList = [];
        }
        let subscriptionTabHeight =
          thisInstance.getSubscriptionTabHeightWithSubscriptions(
            allMembershipPlanList,
          );
          console.log('====dddd================================');
          console.log(detailAboutList);
          console.log('====ddd================================');
        thisInstance.setState({
          name: name,
          profileImageURL: profileImageURL,
          largeProfileImageURL: largeProfileImageURL,
          age: age,
          currentBMI: currentBMI,
          phoneNumber: phoneNo,
          phoneNumberWithoutCountryCode,
          memberType: memberType,
          memberAboutList: detailAboutList,
          membershipList: allMembershipPlanList,
          endReachedOfSubscriptionPage: false,
          gymMemberManageID: gymMemberManageID,
          isFetchingList: false,
          isDataLoaded: true,
          tabTwoHeight: subscriptionTabHeight,
        });
      }
    });

   
    //   })
    //   .catch((error) => {
    //     thisInstance.setState({
    //       isFetchingList: false,
    //     });
    //     console.log('Error while fetching list....');
    //     console.log(error);
    //   });
  }

  getSubscriptionTabHeightWithSubscriptions(membershipPlans) {
    if (membershipPlans === undefined) {
      membershipPlans = [];
    }
    let subscriptionTabHeight = membershipPlans.length * 210;
    for (let i = 0; i < membershipPlans.length; i++) {
      let membershipPlan = membershipPlans[i];
      let paymentDetails = membershipPlan[Constants.KEY_PAYMENT_DETAILS];
      subscriptionTabHeight += paymentDetails.length * 25;

      let remainingAttendance = '';
      if (membershipPlan[Constants.KEY_REMAINING_ATTENDANCE]) {
        remainingAttendance =
          membershipPlan[Constants.KEY_REMAINING_ATTENDANCE];
      }
      if (remainingAttendance.length > 0) {
        subscriptionTabHeight += 25;
      }
    }

    if (subscriptionTabHeight < containerHeight) {
      subscriptionTabHeight = containerHeight;
    }

    return subscriptionTabHeight;
  }

  renderTabBar = (props) => {
    return (
      <TabBar
        {...props}
        indicatorStyle={{backgroundColor: '#121619'}}
        style={{backgroundColor: 'white'}}
        activeColor={'#121619'}
        inactiveColor={'#8e9092'}
      />
    );
  };

  onSearchTextChanged = (text) => {
    this.setState({
      searchText: text,
    });
  };

  showSearchBar = () => {
    this.setState({
      isShowingSearchView: true,
    });
  };

  hideSearchBar = () => {
    this.setState({
      isShowingSearchView: false,
      searchText: '',
    });
  };

  render() {
    let bottomText = '';
    let canUsePaidFeatures = globals.getSetting().canUsePaidFeatures;
    if (canUsePaidFeatures === 'true') {
      bottomText =
        'Your Prime Membership is expired on ' +
        globals.getSetting().membershipExpireDate +
        '.';
    } else {
      bottomText =
        'Current member ' +
        globals.getSetting().member +
        '/' +
        globals.getSetting().totalAddOn +
        '. Upgrade your plan now.';
    }

    if (this.props.GetMemberDetaildata.isLoading) {
      return (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color="#121619" />
        </View>
      );
    }

    if (this.props.GetMemberDetaildata.error) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() => {
              this.fetchMemberDetails(this.state.memberID);
            }}
            style={{width: '100%'}}>
            <Text style={styles.button}>Retry to fetch data</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const {tabOneHeight, tabTwoHeight, tabThreeHeight, tabFourHeight} =
      this.state;
    let profileInfoCardHeight =
      this.state.userType === Constants.USER_TYPE_OWNER ? 200 : 155;
    const collapsableComponent = (
      <View style={styles.headerContainer}>
        <View style={styles.profileInfoCardContainer}>
          <CardView
            cardElevation={4}
            maxCardElevation={4}
            radius={10}
            backgroundColor={'#ffffff'}
            style={[styles.profileInfoCard, {height: profileInfoCardHeight}]}>
            <View style={styles.profileInfoContainer}>
              <Text style={styles.profileNameText}>{this.state.name}</Text>
              <View style={styles.profileInfoRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.profileInfoColumnTitleText}>Age</Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.profileInfoColumnTitleText}>
                    Current BMI
                  </Text>
                </View>
              </View>
              <View style={styles.profileInfoRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.profileInfoColumnSubtitleText}>
                    {this.state.age}
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.profileInfoColumnSubtitleText}>
                    {this.state.currentBMI}
                  </Text>
                </View>
              </View>
              <View style={styles.separator} />
              {this.state.userType === Constants.USER_TYPE_OWNER ? (
                <View style={styles.profileInfoRow}>
                  <TouchableOpacity
                    style={{flex: 1}}
                    onPress={this.openWhatsapp}>
                    <View style={styles.profileInfoRow}>
                      <Image
                        style={{width: 20, height: 20, marginRight: 10}}
                        resizeMode={'cover'}
                        source={require('../../assets/images/whatsapp_icon.png')}
                      />
                      <Text
                        style={{
                          color: '#00a82d',
                          fontSize: 18,
                          fontWeight: 'bold',
                          textAlign: 'left',
                        }}>
                        Whatsapp
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{flex: 1}}
                    onPress={this.callPhoneNumber}>
                    <View style={styles.profileInfoRow}>
                      <Image
                        style={{width: 20, height: 20, marginRight: 10}}
                        resizeMode={'cover'}
                        source={require('../../assets/images/call_icon.png')}
                      />
                      <Text
                        style={{
                          color: '#2c9fc9',
                          fontSize: 18,
                          fontWeight: 'bold',
                          textAlign: 'left',
                        }}>
                        Call Me
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </CardView>
        </View>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                willShowEnlargedProfileImage: true,
              });
            }}>
            <Image
              style={styles.profileImage}
              resizeMode={'cover'}
              source={{uri: this.state.profileImageURL}}
            />
          </TouchableOpacity>
        </View>
      </View>
    );

    let tabContentHeights = [
      tabOneHeight,
      tabTwoHeight,
      tabThreeHeight,
      tabFourHeight,
    ];
    if (this.state.userType === Constants.USER_TYPE_MEMBER) {
      tabContentHeights = [tabOneHeight, tabTwoHeight, tabFourHeight];
    }

    return (
      <>
        <View
          style={{
            height: getStatusBarHeight(true),
            backgroundColor: '#161a1e',
          }}>
          <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
        </View>
        <View style={styles.headerNavContainer}>
          {this.state.userType === Constants.USER_TYPE_OWNER ? (
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
          ) : null}

          <View style={styles.titleBannerContainer}>
            {this.state.willShowUserNameProfileImageHeader ? (
              <View
                style={{
                  backgroundColor: '#161a1e',
                  width: '100%',
                  height: 50,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                <Image
                  style={{
                    borderWidth: 1,
                    borderColor: 'white',
                    width: 40,
                    aspectRatio: 1,
                    borderRadius: 20,
                  }}
                  resizeMode={'cover'}
                  source={{uri: this.state.profileImageURL}}
                />
                <Text
                  style={{
                    marginLeft: 20,
                    color: 'white',
                    fontWeight: '500',
                    fontSize: 15,
                  }}>
                  {this.state.name}
                </Text>
              </View>
            ) : (
              <Image
                style={styles.titleBanner}
                resizeMode={'cover'}
                source={require('../../assets/images/gymvale_name_logo.png')}
              />
            )}
          </View>
          <TouchableOpacity onPress={this.shareGymVale}>
            <Image
              style={styles.shareIcon}
              source={require('../../assets/images/share_icon.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.goToNotificationsScreen}>
            <Image
              style={styles.notificationIcon}
              source={require('../../assets/images/notification_icon.png')}
            />
          </TouchableOpacity>
        </View>
        {/*
                    this.state.willShowUserNameProfileImageHeader ? (
                        <View
                            style={{
                                backgroundColor:'#161a1e',
                                width:'100%',
                                height:50,
                                flexDirection:'row',
                                justifyContent:'flex-start',
                                alignItems:'center',
                                paddingHorizontal:20,
                            }}
                        >
                            <Image style={{borderWidth:1, borderColor:'white', width: 40, aspectRatio:1, borderRadius:20,}}  resizeMode={"cover"} source={{uri:this.state.profileImageURL}} />
                            <Text style={{marginLeft:20, color:'white', fontWeight:'500', fontSize:15}}>{this.state.name}</Text>
                        </View>
                    ) : null
                    */}
        <ScrollableTabView
          tabContentHeights={tabContentHeights}
          scrollEnabled
          prerenderingSiblingsNumber={Infinity}
          initialPage={0}
          collapsableBar={collapsableComponent}
          renderTabBar={() => (
            <ScrollableTabBar
              backgroundColor={'white'}
              inactiveTextColor="#8e9092"
              activeTextColor="#121619"
            />
          )}
          ref={(tabView) => {
            this.tabView = tabView;
          }}
          onChangeTab={this.handleChangeTab}
          tabBarUnderlineStyle={{backgroundColor: '#121619', height: 2}}
          onCollapsibleStartedCollapsing={() => {
            //console.log("Collapsible Component is starting collapsing:::");
            if (this.state.willShowUserNameProfileImageHeader === false) {
              this.setState({
                willShowUserNameProfileImageHeader: true,
              });
            }
            if (this.state.willStopChildFlatListScrolling === true) {
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
          }}>
          <View
            onLayout={(event) => this.measureTabOne(event)}
            tabLabel={'ABOUT'}>
            <View
              style={{
                height: containerHeight - 44,
              }}>
              <AboutScreen
                gymMemberManageID={this.state.gymMemberManageID}
                aboutList={this.state.memberAboutList}
                willStopChildFlatListScrolling={
                  this.state.willStopChildFlatListScrolling
                }
              />
              
            </View>
          </View>
          {this.state.membershipList.length > 0 && (
            <View tabLabel={'SUBSCRIPTION'}>
              <SubscriptionScreen
              aboutList={this.state.memberAboutList}
                memberID={this.state.memberID}
                membershipPlans={this.state.membershipList}
                onEndReachedOfSubscriptionPage={
                  this.onEndReachedOfSubscriptionPage
                }
                willStopChildFlatListScrolling={
                  this.state.willStopChildFlatListScrolling
                }
              />
            </View>
          )}
          {this.state.userType === Constants.USER_TYPE_OWNER ? (
            <View
              onLayout={(event) => this.measureTabThree(event)}
              tabLabel={'WORKOUT'}>
              <View
                style={{
                  height: containerHeight - 44,
                }}>
                <WorkoutScreen
                  memberID={this.state.memberID}
                  willStopChildFlatListScrolling={
                    this.state.willStopChildFlatListScrolling
                  }
                />
              </View>
            </View>
          ) : null}

          <View
            onLayout={(event) => this.measureTabFour(event)}
            tabLabel={'ATTENDANCE'}>
            <View
              style={{
                height: containerHeight - 44,
              }}>
              <AttendanceScreen
                memberID={this.state.memberID}
                membershipPlans={this.state.membershipList}
              />
            </View>
          </View>
        </ScrollableTabView>
        {this.state.userType === Constants.USER_TYPE_OWNER ? (
          <TouchableOpacity
            style={{width: '100%', padding: 0}}
            onPress={this.goToMembershipPlansScreen}>
            <View
              style={{
                width: '100%',
                height: 20,
                backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 0,
                margin: 0,
              }}>
              <Text
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 12,
                  color: 'white',
                  textTransform: 'uppercase',
                }}>
                {bottomText}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {this.state.currentPage === 1 &&
        this.state.userType === Constants.USER_TYPE_OWNER ? (
          <ActionButton buttonColor="#3fd458">
            <ActionButton.Item
              buttonColor="white"
              title="Create Membership"
              onPress={() => this.addPlan()}>
              <Image
                style={{width: 24, height: 24}}
                resizeMode={'cover'}
                source={require('../../assets/images/add_membership_plan.png')}
              />
            </ActionButton.Item>
            <ActionButton.Item
              buttonColor="white"
              title="Received Payment"
              onPress={() => this.addPayment()}>
              <Image
                style={{width: 23, height: 23}}
                resizeMode={'cover'}
                source={require('../../assets/images/add_payment_received.png')}
              />
            </ActionButton.Item>
          </ActionButton>
        ) : null}
        {this.state.willShowEnlargedProfileImage ? (
          <View
            style={[
              styles.activityIndicatorContainer,
              {paddingHorizontal: 20},
            ]}>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  willShowEnlargedProfileImage: false,
                });
              }}>
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    padding: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    aspectRatio: 1,
                  }}>
                  <Image
                    style={{width: '100%', height: '100%'}}
                    resizeMode={'cover'}
                    source={{uri: this.state.largeProfileImageURL}}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : null}
      </>
    );
  }

  goToMembershipPlansScreen = () => {
    this.props.navigation.navigate('MembershipPlans');
  };

  goBack = () => {
    this.props.navigation.pop();
  };

  goToNotificationsScreen = () => {
    this.props.navigation.navigate('NotificationsScreen');
  };

  shareGymVale = () => {
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      let title = 'Join Our Gym Login Now';
      let referralURL = Constants.REFERRAL_URL_PREFIX + 'g' + this.state.gymID;
      let shareOptions = {
        title: title,
        message: 'Join Our Gym Login Now',
        url: referralURL,
        subject: title,
      };

      Share.open(shareOptions)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    } else if (this.state.userType === Constants.USER_TYPE_MEMBER) {
      let title = 'Have you look this fitness application ?Download Now -';
      let referralURL =
        Constants.REFERRAL_APP_URL_PREFIX + 'm' + this.state.memberID;
      let shareOptions = {
        title: title,
        message: 'Have you look this fitness application ?Download Now -',
        url: referralURL,
        subject: title,
      };

      Share.open(shareOptions)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    }
  };

  openWhatsapp = () => {
    let url = 'https://api.whatsapp.com/send?phone=' + this.state.phoneNumber;
    Linking.openURL(url);
  };

  callPhoneNumber = () => {
    Linking.openURL(`tel:${this.state.phoneNumberWithoutCountryCode}`);
  };

  addPlan = () => {
    let params = {};
    params[Constants.KEY_MEMBER_ID] = this.state.memberID;
    params[Constants.KEY_MEMBER_MEMBERSHIP_ID] = this.state.memberMembershipID;
    this.props.navigation.navigate('SubscribePlanForMember', params);
  };

  addPayment = () => {
    let params = {};
    params[Constants.KEY_MEMBER_ID] = this.state.memberID;
    params[Constants.KEY_MEMBER_MEMBERSHIP_ID] = this.state.memberMembershipID;
    this.props.navigation.navigate('ReceivePayment', params);
  };
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  activityIndicatorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#161a1e',
  },
  headerNavContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 44,
    backgroundColor: '#161a1e',
    paddingHorizontal: 10,
  },
  titleBannerContainer: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleBanner: {
    width: 150,
    height: 21.5,
  },
  backIcon: {
    width: 9,
    height: 16,
    resizeMode: 'cover',
    marginRight: 10,
  },
  searchTextInput: {
    flexGrow: 1,
    textAlign: 'left',
    color: '#41464c',
  },
  searchIcon: {
    width: 13,
    height: 14,
    resizeMode: 'cover',
    marginRight: 20,
  },
  shareIcon: {
    width: 13,
    height: 14,
    resizeMode: 'cover',
    marginRight: 20,
  },
  notificationIcon: {
    width: 13,
    height: 15,
    resizeMode: 'cover',
    marginRight: 20,
  },
  profileInfoCardContainer: {
    width: '100%',
    backgroundColor: '#161a1e',
    //paddingTop:40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileInfoCard: {
    width: '100%',
    height: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 35,
  },
  profileImageContainer: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    left: 0,
  },
  profileImage: {
    width: 70,
    aspectRatio: 1,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'white',
  },
  profileInfoContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 45,
    width: '100%',
  },
  profileNameText: {
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    color: '#343434',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  profileInfoRow: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  profileInfoColumnTitleText: {
    width: '100%',
    color: '#504f4f',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileInfoColumnSubtitleText: {
    width: '100%',
    color: '#9e9e9e',
    fontSize: 14,
    textAlign: 'center',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#d6d6d6',
    marginVertical: 10,
  },
  button: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 3,
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 40,
    lineHeight: 40,
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
)(withNavigationFocus(MemberDetailsScreen));
