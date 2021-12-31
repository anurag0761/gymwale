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
  ScrollView,
  FlatList,
  TouchableHighlight,
} from 'react-native';

import CardView from 'react-native-rn-cardview';
import {withNavigationFocus} from 'react-navigation';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {activeplan} from '../Redux/Actions/activePlanAction';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getDashboardDetail} from '../Redux/Actions/getDashboardDetailAction';
import {notificationApi} from '../Redux/Actions/NotyIpAddressAction';
import AsyncStorage from '@react-native-community/async-storage';
import {Value} from 'react-native-reanimated';
import {colors} from 'react-native-elements';
var Apidata = {
  callapi: true,
};
// _retrieveData = async () => {
//   try {
//     const value = await AsyncStorage.getItem('TASKS');
//     if (value !== null) {
//       // We have data!!
//       console.log(value);
//     }
//   } catch (error) {
//     // Error retrieving data
//   }
// };
// async ()

const PAGELINK_MEMBERSHIP = 'membership';
const PAGELINK_MEMBERS = 'members';
const PAGELINK_WORKOUT_LIST = 'workout-list';
const PAGELINK_NOTIFICATION = 'notification';
const PAGELINK_QRSCANNER = 'qrscanner';
const PAGELINK_QRCODE = 'qrcode';
const PAGELINK_MULTIPLE_GYMS = 'multiple_gyms';
const PAGELINK_FACILITY = 'facility';
const PAGELINK_SERVICES = 'services';
const PAGELINK_GALLERY = 'gallery';
const PAGELINK_MEMBERSHIP_PLAN = 'membership-plan';
const PAGELINK_SETTING = 'setting';
const PAGELINK_BALANCESHEET = 'balancesheet';
const PAGELINK_REFERRAL_CODE = 'referral-code';
const PAGELINK_SEND_NOTIFICATION = 'Filter-notification';
const PAGELINK_SUPPORT = 'support';
const PAGELINK_LOGOUT = 'logoutcookie';
const PAGELINK_MEMBER_ABOUT = 'member-profile';
const PAGELINK_FIND_A_GYM = '/';

class HomeTab extends Component {
  constructor(properties) {
    super(properties);
    let userInfo = globals.getSetting().userInfo;
    let profileImageURL = '';
    let numberOfGymMembers = 0;
    let gymID = '';
    let pinStatus = false;
    let gymName = '';
    let memberID = '';
    let memberName = '';
    let userType = '';
    let userID = '';
    if (userInfo) {
      let body = userInfo[Constants.KEY_USER_DATA];
      if (body) {
        userType = body[Constants.KEY_USER_TYPE];
        userID = body[Constants.KEY_ID];
        let pinActive = body[Constants.KEY_PIN_STATUS];
        if (pinActive === Constants.STATUS_ACTIVE) {
          pinStatus = true;
        }
        if (userType === Constants.USER_TYPE_OWNER) {
          let gymData = userInfo[Constants.KEY_GYM_DATA];
          if (gymData) {
            gymID = gymData[Constants.KEY_ID];
            gymName = gymData[Constants.KEY_GYM_NAME];
            if (gymData[Constants.KEY_PROFILE_IMAGE]) {
              profileImageURL = gymData[Constants.KEY_PROFILE_IMAGE];
            }
          }
          numberOfGymMembers = globals.getSetting()[Constants.KEY_MEMBER];
        } else if (userType === Constants.USER_TYPE_MEMBER) {
          let memberData = userInfo[Constants.KEY_MEMBER_DATA];
          if (memberData) {
            memberData = memberData[0];
          }
          if (memberData) {
            memberID = memberData[Constants.KEY_MEMBER_ID];
            memberName = memberData[Constants.KEY_NAME];
            if (memberData[Constants.KEY_IMAGE]) {
              profileImageURL = memberData[Constants.KEY_IMAGE];
            }
          }
        }
      }
    }
    this.state = {
      firstlaunch: null,
      userType: userType,
      userID: userID,
      gymID: gymID,
      memberID: memberID,
      memberName: memberName,
      isFetchingData: true,
      profileImageURL: profileImageURL,
      numberOfMembers: numberOfGymMembers,
      dashboardList: [],
      pinStatus: pinStatus,
      isDataLoaded: false,
      gymName: gymName,
      willShowUpgradePlanAlert: false,
    };
  }
  componentWillUnmount() {
    // this.listener1();
    // this.listener2();
    // this.listener3();
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }
  async _retrieveData() {
    try {
      const value = await AsyncStorage.getItem('alreadylaunche');
      console.log('============valeu========================');
      console.log(value);
      console.log('=============valeu=======================');
      if (value == null) {
        this.updateData();
        // We have data!!
        console.log(value);
      }
    } catch (error) {
      // Error retrieving data
    }
  }

  componentDidMount() {
    this._retrieveData();
    // this.updateData();

    this.updateOneSignalUserIDInServer();
    this.focusListener = this.props.navigation.addListener(
      'didFocus',
      () => {},
    );
  }
  // componentDidUpdate() {
  //   console.log('Greeting - shouldComponentUpdate lifecycle');

  //   return false;
  // }
  async _storeData() {
    console.log('calling store');
    // Apidata[key] = val;
    try {
      await AsyncStorage.setItem(
        'alreadylaunche',
        JSON.stringify({Value: true}),
      );
      // console.log("Saved Info:", key, info);
    } catch (error) {
      //console.log("Saving Info Failed: ", error.message);
    }
  }

  async updateData() {
    await this.updateGymInfo();
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      this.fetchOwnerActivePlanStatus();
    } else if (this.state.userType === Constants.USER_TYPE_MEMBER) {
      this.fetchDashboardDetail();
    }
  }

  render() {
    if (this.props.getDashboard.isLoading) {
      console.log(!this.props.getDashboard.success);
      return (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator
            size="large"
            color="#161a1e"
            style={{marginTop: 35}}
          />
        </View>
      );
    }

    if (this.props.dispatchDashboardDetail.error) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() => {
              this.fetchDashboardDetail();
            }}
            style={{width: '100%'}}>
            <Text style={styles.button}>Retry to fetch data</Text>
          </TouchableOpacity>
        </View>
      );
    }

    //if(this.state.dashboardList.length > 0) {
    return (
      <View
        style={[styles.mainContainer, {marginTop: getStatusBarHeight(true)}]}>
        <View style={styles.headerContainer} />
        <View style={styles.scrollViewStyle}>
          <View style={[styles.scrollViewContentStyle, {marginBottom: 30}]}>
            <View style={styles.profileInfoView}>
              <View style={styles.profileInfoLeftView}>
                <Text style={{color: 'white', fontSize: 18, width: '100%'}}>
                  {this.state.userType === Constants.USER_TYPE_OWNER
                    ? this.state.gymName
                    : this.state.memberName}
                </Text>
                <Text style={{color: '#52baff', fontSize: 14, width: '100%'}}>
                  {this.state.userType === Constants.USER_TYPE_OWNER
                    ? this.state.numberOfMembers + ' Members'
                    : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => this.goToEditProfileInfoScreen()}>
                <Image
                  style={styles.profileImageView}
                  source={{uri: this.state.profileImageURL}}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              style={{width: '100%', flexGrow: 1, paddingBottom: 10}}
              data={this.props.getDashboard.data[Constants.KEY_DASHBOARD]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item, index}) => this.renderItem(item, index)}
              numColumns={2}
            />
          </View>
        </View>
        {this.state.willShowUpgradePlanAlert ? (
          <View
            style={[
              styles.activityIndicatorContainer,
              {paddingHorizontal: 40},
            ]}>
            <View
              style={{
                width: '100%',
                height: 240,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
                borderTopEndRadius: 4,
              }}>
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  padding: 10,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      willShowUpgradePlanAlert: false,
                    });
                  }}>
                  <Image
                    style={styles.closeIcon}
                    source={require('../../assets/images/close_icon.png')}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  width: '100%',
                  fontSize: 15,
                  color: '#202020',
                }}>
                Upgrade Your Plan
              </Text>
              <Text
                style={{
                  padding: 30,
                  textAlign: 'center',
                  width: '100%',
                  flexWrap: 'wrap',
                  fontSize: 18,
                  fontWeight: '500',
                  color: '#202020',
                }}>
                Get A Prime Membership For Edit or Delete this member
              </Text>
              <View style={{paddingHorizontal: 30, width: '100%'}}>
                <TouchableOpacity
                  style={{width: '100%'}}
                  onPress={() => {
                    this.setState({
                      willShowUpgradePlanAlert: false,
                    });
                    this.goToMembershipPlansScreen();
                  }}>
                  <View
                    style={{
                      backgroundColor: '#159bcc',
                      width: '100%',
                      height: 30,
                      borderRadius: 2.5,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: 'white',
                        width: '100%',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                      }}>
                      Go Prime
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    );
    //}
  }

  async updateGymInfo() {
    let userInfo = globals.getSetting().userInfo;
    let profileImageURL = '';
    let numberOfGymMembers = 0;
    let gymID = '';
    let pinStatus = false;
    let memberName = '';
    let gymName = '';
    if (userInfo) {
      let body = userInfo[Constants.KEY_USER_DATA];
      if (body) {
        let userType = body[Constants.KEY_USER_TYPE];
        let pinActive = body[Constants.KEY_PIN_STATUS];
        if (pinActive === Constants.STATUS_ACTIVE) {
          pinStatus = true;
        }
        if (userType === Constants.USER_TYPE_OWNER) {
          let gymData = userInfo[Constants.KEY_GYM_DATA];
          if (gymData) {
            gymID = gymData[Constants.KEY_ID];
            gymName = gymData[Constants.KEY_GYM_NAME];
            if (gymData[Constants.KEY_PROFILE_IMAGE]) {
              profileImageURL = gymData[Constants.KEY_PROFILE_IMAGE];
            }
          }
          numberOfGymMembers = globals.getSetting()[Constants.KEY_MEMBER];
        } else if (userType === Constants.USER_TYPE_MEMBER) {
          let memberData = userInfo[Constants.KEY_MEMBER_DATA];

          if (memberData !== undefined) {
            memberData = memberData[0];
          }

          if (memberData) {
            memberName = memberData[Constants.KEY_NAME];
            if (memberData[Constants.KEY_IMAGE]) {
              profileImageURL = memberData[Constants.KEY_IMAGE];
            }
          }
        }
      }
    }
    await this.promisedSetState({
      gymID: gymID,
      gymName: gymName,
      memberName: memberName,
      profileImageURL: profileImageURL,
      numberOfMembers: numberOfGymMembers,
      dashboardList: [],
      isDataLoaded: false,
      pinStatus: pinStatus,
    });
  }

  promisedSetState = (newState) => {
    return new Promise((resolve) => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  fetchOwnerActivePlanStatus() {
    let thisInstance = this;

    let data = new FormData();
    data.append(Constants.KEY_USER_ID, this.state.gymID);

    console.log('Body:::');
    console.log(data);
    this.props.dispatchActivePlan(data);
    setTimeout(() => {
      if (this.props.getActivePlan.success) {
        let featuresLock = this.props.getActivePlan.data[
          Constants.KEY_FEATURES_LOCK
        ];
        let totalAddOn = this.props.getActivePlan.data[
          Constants.KEY_TOTAL_ADDON
        ];
        globals.setOneSetting(globals.KEY_CAN_USE_PAID_FEATURES, featuresLock);
        globals.setOneSetting(globals.KEY_TOTAL_ADDON, totalAddOn);

        let membershipExpireDate = '';
        if (featuresLock) {
          let list = this.props.getActivePlan.data[Constants.KEY_DATA];
          for (let i = 0; i < list.length; i++) {
            let item = list[i];
            if (item[Constants.KEY_MEMBERSHIP_LIMIT] === 'unlimited') {
              membershipExpireDate = item[Constants.KEY_MEMBERSHIP_END_DATE];
              break;
            }
          }
        }
        globals.setOneSetting(
          globals.KEY_MEMBERSHIP_EXPIRE_DATE,
          membershipExpireDate,
        );

        thisInstance.fetchDashboardDetail();
      }
      if (this.props.getActivePlan.error) {
        let message = 'Some error occurred. Please try again.';
        Utils.showAlert('Error!', message);
      }
    }, 2000);
  }

  fetchDashboardDetail = async () => {
    let thisInstance = this;

    let data = new FormData();
    data.append(Constants.KEY_USER_ID, this.state.userID);
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      data.append(Constants.KEY_GYM_ID, this.state.gymID);
    } else if (this.state.userType === Constants.USER_TYPE_MEMBER) {
      data.append(Constants.KEY_MEMBER_ID, this.state.memberID);
    }

    console.log('Body:::');
    console.log(data);
    thisInstance.setState({
      isFetchingData: true,
    });
    this.props.dispatchDashboardDetail(data).then(() => {
      let valid = this.props.getDashboard.data[Constants.KEY_VALID];
      if (this.props.getDashboard.success) {
        let member = this.props.getDashboard.data[Constants.KEY_MEMBER];
        let dashboardList = this.props.getDashboard.data[
          Constants.KEY_DASHBOARD
        ];
        globals.setOneSetting(Constants.KEY_MEMBER, member);

        thisInstance.setState({
          numberOfMembers: member,
          dashboardList: dashboardList,
          isFetchingData: false,
        });
        this._storeData();
      } else {
        let message = 'Some error occurred. Please try agian.';
        Utils.showAlert('Error!', message);
      }
    });
    // setTimeout(() => {}, 1500);
  };

  updateOneSignalUserIDInServer() {
    let thisInstance = this;
    let oneSignalUserID = globals.getSetting()[globals.KEY_ONESIGNAL_USER_ID];
    if (oneSignalUserID === '') {
      return;
    }
    let data = new FormData();
    data.append(Constants.KEY_IP_ADDRESS, oneSignalUserID);
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      data.append(Constants.KEY_GYM_ID, this.state.gymID);
    } else if (this.state.userType === Constants.USER_TYPE_MEMBER) {
      data.append(Constants.KEY_MEMBER_ID, this.state.memberID);
    }

    console.log('Body:::');
    console.log(data);
    this.props.dispatchNotifyApi(data);
    setTimeout(() => {
      if (this.props.NotifyApiReducer.error) {
        Utils.showAlert('Some error occurred. Please try again.');
      }
    }, 2000);
  }

  renderItem(item, index) {
    let name = item[Constants.KEY_NAME];
    let imageURL = item[Constants.KEY_IMAGELINK];

    return (
      <TouchableHighlight
        underlayColor="transparent"
        style={styles.dashboardItemContainer}
        onPress={() => this.onDashboardItemSelected(index)}>
        <CardView
          cardElevation={4}
          maxCardElevation={4}
          radius={8}
          backgroundColor={'white'}
          style={styles.menuItem}>
          <Image
            source={{uri: imageURL}}
            style={{height: 48, width: 48}}
            resizeMode={'cover'}
          />
          <Text
            style={{
              width: '100%',
              paddingHorizontal: 8,
              fontSize: 14,
              color: 'grey',
              textAlign: 'center',
              marginTop: 10,
            }}>
            {name}
          </Text>
        </CardView>
      </TouchableHighlight>
    );
  }

  onDashboardItemSelected(index) {
    let dashboardItem = this.props.getDashboard.data[Constants.KEY_DASHBOARD][
      index
    ];
    let pagelink = dashboardItem[Constants.KEY_PAGELINK];
    let pageType = dashboardItem[Constants.KEY_PAGE_TYPE];
    let name = dashboardItem[Constants.KEY_NAME];

    let canUsePaidFeatures = globals.getSetting()[
      globals.KEY_CAN_USE_PAID_FEATURES
    ];

    if (pageType === Constants.PAGE_TYPE_NORMAL) {
      if (pagelink === PAGELINK_MEMBERSHIP) {
        this.goToMembershipTab();
      } else if (pagelink === PAGELINK_MEMBERS) {
        this.goToMembersTab();
      } else if (pagelink === PAGELINK_WORKOUT_LIST) {
        this.goToWorkoutTab();
      } else if (pagelink === PAGELINK_NOTIFICATION) {
        this.goToNotificationsScreen();
      } else if (pagelink === PAGELINK_QRSCANNER) {
        this.goToQRCodeScannerScreen();
      } else if (pagelink === PAGELINK_QRCODE) {
        this.goToQRCodeScreen();
      } else if (pagelink === PAGELINK_MULTIPLE_GYMS) {
        this.goToGymListScreen();
      } else if (pagelink === PAGELINK_FACILITY) {
        this.goToFacilitiesTab();
      } else if (pagelink === PAGELINK_SERVICES) {
        this.goToServicesTab();
      } else if (pagelink === PAGELINK_GALLERY) {
        this.goToGalleryTab();
      } else if (pagelink === PAGELINK_MEMBERSHIP_PLAN) {
        this.goToMembershipPlansScreen();
      } else if (pagelink === PAGELINK_SETTING) {
        this.goToSettings();
      } else if (pagelink === PAGELINK_BALANCESHEET) {
        if (canUsePaidFeatures === 'true') {
          this.goToBalanceSheetScreen();
        } else {
          this.setState({
            willShowUpgradePlanAlert: true,
          });
        }
      } else if (pagelink === PAGELINK_REFERRAL_CODE) {
        this.goToReferralScreen();
      } else if (pagelink === PAGELINK_SEND_NOTIFICATION) {
        this.goToSendNotificationScreen();
      } else if (pagelink === PAGELINK_SUPPORT) {
        this.goToSupportScreen();
      } else if (pagelink === PAGELINK_LOGOUT) {
        this.showLogOutConfirmationAlert();
      } else if (pagelink === PAGELINK_MEMBER_ABOUT) {
        this.goToMemberAboutTab();
      } else if (pagelink === PAGELINK_FIND_A_GYM) {
        this.goToGymSearchScreen();
      } else {
        Utils.showAlert('', 'This feature will be coming soon');
      }
    } else if (pageType === Constants.PAGE_TYPE_WEBSITE) {
      this.goToWebviewWithPageLink(pagelink, name);
    }
  }

  goToMembershipTab = () => {
    let params = {};
    //params[Constants.KEY_INITIAL_TAB_INDEX] = 0;
    globals.setOneSetting(Constants.KEY_INITIAL_TAB_INDEX, 0);
    this.props.navigation.navigate('MembershipTab');
  };

  goToMemberAboutTab = () => {
    this.props.navigation.navigate('MemberAboutTab');
  };

  goToMembersTab = () => {
    this.props.navigation.navigate('MembersTab');
  };

  goToWorkoutTab = () => {
    this.props.navigation.navigate('WorkoutTab');
  };

  goToNotificationsScreen = () => {
    this.props.navigation.navigate('NotificationsScreen');
  };

  goToQRCodeScannerScreen = () => {
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      this.props.navigation.navigate('QRCodeScanner');
    } else if (this.state.userType === Constants.USER_TYPE_MEMBER) {
      this.props.navigation.navigate('MemberQRScannerTab');
    }
  };

  goToQRCodeScreen = () => {
    this.props.navigation.navigate('QRCodeScreen');
  };

  goToGymListScreen = () => {
    let screen = '';
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      screen = 'GymList';
    } else if (this.state.userType === Constants.USER_TYPE_MEMBER) {
      screen = 'MemberGymList';
    }
    this.props.navigation.navigate(screen);
  };

  goToFacilitiesTab = () => {
    let params = {};
    globals.setOneSetting(Constants.KEY_INITIAL_TAB_INDEX, 3);
    this.props.navigation.navigate('MembershipTab', params);
  };

  goToServicesTab = () => {
    let params = {};
    globals.setOneSetting(Constants.KEY_INITIAL_TAB_INDEX, 2);
    this.props.navigation.navigate('MembershipTab', params);
  };

  goToGalleryTab = () => {
    let params = {};
    globals.setOneSetting(Constants.KEY_INITIAL_TAB_INDEX, 1);
    this.props.navigation.navigate('MembershipTab', params);
  };

  goToMembershipPlansScreen = () => {
    this.props.navigation.navigate('MembershipPlans');
  };

  goToSettings = () => {
    let params = {};
    this.props.navigation.navigate('Settings', params);
  };

  goToBalanceSheetScreen = () => {
    if (this.state.pinStatus === true) {
      let params = {};
      this.props.navigation.navigate('PinCodeScreen', params);
    } else {
      let params = {};
      this.props.navigation.navigate('BalanceSheet', params);
    }
  };

  goToReferralScreen = () => {
    this.props.navigation.navigate('Referral');
  };

  goToSendNotificationScreen = () => {
    this.props.navigation.navigate('SendNotification');
  };

  goToSupportScreen = () => {
    let params = {};
    params[Constants.KEY_PAGELINK] = Constants.SUPPORT_URL;
    this.props.navigation.navigate('Webview', params);
  };

  logOut = async () => {
    console.log('work')
    globals.setOneSetting(globals.KEY_USER_INFO, null);
    globals.setOneSetting(globals.KEY_IS_USER_LOGGED_IN, false);
    this.props.navigation.navigate('Auth');

    // try {
    AsyncStorage.removeItem('alreadylaunche');

    //   }
    // } catch (error) {
    //   // Error retrieving data
    // }

  };

  goToWebviewWithPageLink(pageLink, pageName) {
    let params = {};
    params[Constants.KEY_PAGELINK] = pageLink;
    params[Constants.KEY_NAME] = pageName;
    this.props.navigation.navigate('Webview', params);
  }

  showLogOutConfirmationAlert() {
    Alert.alert(
      'Log Out',
      'Sure You want to logout ?',
      [
        {text: 'Yes', onPress: () => this.logOut()},
        {text: 'No', onPress: () => console.log('Not logging out...')},
      ],
      {cancelable: false},
    );
  }

  goToEditProfileInfoScreen() {
    this.props.navigation.navigate('ProfileTab');
  }

  goToGymSearchScreen() {
    this.props.navigation.navigate('GymSearchScreen');
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'rgba(245,245,245,1)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    //padding:0,
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#161a1e',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 150,
    margin: 0,
  },
  scrollViewStyle: {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scrollViewContentStyle: {
    flexDirection: 'column',
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  profileInfoView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfoLeftView: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexGrow: 1,
  },
  profileImageView: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  menuItemContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  menuItem: {
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 174,
  },
  activityIndicatorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    top: 0,
    left: 0,
    zIndex: 99999999,
  },
  dashboardItemContainer: {
    width: '50%',
    height: 184,
    paddingVertical: 10,
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
  closeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'cover',
    marginRight: 10,
  },
});

const mapStateToprops = (state) => {
  return {
    getActivePlan: state.activePlanReducer,
    getDashboard: state.getDashboardDetailReducer,
    NotifyApiReducer: state.NotifyApiReducer,
  };
};

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      dispatchNotifyApi: notificationApi,
      dispatchActivePlan: activeplan,
      dispatchDashboardDetail: getDashboardDetail,
    },
    dispatch,
  );
}

export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(withNavigationFocus(HomeTab));
