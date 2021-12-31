import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Switch,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';

import {getStatusBarHeight} from 'react-native-status-bar-height';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {PaymentSetting} from '../Redux/Actions/paymentsettingActon';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

class Settings extends Component {
  constructor(properties) {
    super(properties);

    let gymID = '';
    let paytmStatus = '';
    let paytmMerchantID = '';
    let paytmMerchantKey = '';
    let userInfo = globals.getSetting().userInfo;
    let userData = userInfo[Constants.KEY_USER_DATA];
    let userType = userData[Constants.KEY_USER_TYPE];
    if (userType === Constants.USER_TYPE_OWNER) {
      let gymData = userInfo[Constants.KEY_GYM_DATA];
      gymID = gymData[Constants.KEY_ID];
      paytmStatus =
        gymData[Constants.KEY_PAYTM_STATUS] === Constants.STATUS_ACTIVE
          ? true
          : false;
      paytmMerchantID = gymData[Constants.KEY_PAYTM_MERCHANT_MID];
      paytmMerchantKey = gymData[Constants.KEY_PAYTM_MERCHANT_KEY];
    }

    let userID = userData[Constants.KEY_ID];

    let passwordStatus =
      userData[Constants.KEY_PASSWORD_STATUS] === Constants.STATUS_ACTIVE
        ? true
        : false;
    let originalPassword = userData[Constants.KEY_ORIGINAL_PASSWORD];

    let isPushNotificationsOn = globals.getSetting()[
      Constants.KEY_IS_PUSH_NOTIFICATIONS_ON
    ];

    this.state = {
      gymID: gymID,
      userID: userID,
      userType: userType,
      isLoading: false,
      isPushNotificationsOn: isPushNotificationsOn,
      paytmStatus: paytmStatus,
      paytmMerchantID: paytmMerchantID,
      paytmMerchantKey: paytmMerchantKey,
      passwordStatus: passwordStatus,
      originalPassword: originalPassword,
      repeatPassword: originalPassword,
    };
  }

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

    return (
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
        style={{flex: 1}}>
        <View style={{flex: 1}}>
          <View
            style={{
              height: getStatusBarHeight(true),
              backgroundColor: '#161a1e',
            }}>
            <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
          </View>
          <ScrollView style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor: '#fafafa'}}>
              <View style={styles.headerContainer}>
                <TouchableOpacity onPress={this.goBack}>
                  <Image
                    style={styles.backIcon}
                    source={require('../../assets/images/back_icon_white.png')}
                  />
                </TouchableOpacity>

                <Text style={[styles.tabTitle, {color: 'white'}]}>
                  Settings
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}>
                <View style={styles.settingsContainer}>
                  <Switch
                    style={{marginLeft: 20}}
                    value={this.state.isPushNotificationsOn}
                    onValueChange={this.onTogglePushNotification}
                    thumbColor={'rgba(49, 113, 187, 1)'}
                    trackColor={{false: 'grey', true: 'rgba(103, 183, 232, 1)'}}
                  />
                  <View style={styles.settingsInfoContainer}>
                    <Text style={styles.settingsTitleText}>
                      Show App Notification
                    </Text>
                    <Text style={styles.settingsSubtitleText}>
                      Notification are important for your business we
                      recommended you to allow on
                    </Text>
                  </View>
                </View>

                {this.state.userType === Constants.USER_TYPE_OWNER ? (
                  <View style={styles.settingsContainer}>
                    <Switch
                      style={{marginLeft: 20}}
                      value={this.state.paytmStatus}
                      onValueChange={this.onTogglePaytmSetting}
                      thumbColor={'rgba(49, 113, 187, 1)'}
                      trackColor={{
                        false: 'grey',
                        true: 'rgba(103, 183, 232, 1)',
                      }}
                    />
                    <View style={styles.settingsInfoContainer}>
                      <Text style={styles.settingsTitleText}>
                        Paytm Setting
                      </Text>
                      <Text style={styles.settingsSubtitleText}>
                        Please enter your PaytmMerchant ID to receive online
                        payment
                      </Text>
                    </View>
                  </View>
                ) : null}
                {this.state.paytmStatus ? (
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputTitleText}>Paytm Merchant ID</Text>
                    <TextInput
                      style={styles.inputText}
                      placeholder={''}
                      onChangeText={this.onPaytmMerchantIDChanged}
                      value={this.state.paytmMerchantID}
                    />
                    <Text style={styles.inputTitleText}>
                      Paytm Merchant Secret Key
                    </Text>
                    <TextInput
                      style={styles.inputText}
                      placeholder={''}
                      onChangeText={this.onPaytmMerchantKeyChanged}
                      value={this.state.paytmMerchantKey}
                    />
                  </View>
                ) : null}

                <View style={styles.settingsContainer}>
                  <Switch
                    style={{marginLeft: 20}}
                    value={this.state.passwordStatus}
                    onValueChange={this.onTogglePasswordSetting}
                    thumbColor={'rgba(49, 113, 187, 1)'}
                    trackColor={{false: 'grey', true: 'rgba(103, 183, 232, 1)'}}
                  />
                  <View style={styles.settingsInfoContainer}>
                    <Text style={styles.settingsTitleText}>
                      Password Setting
                    </Text>
                    <Text style={styles.settingsSubtitleText}>
                      Create Your Login Password
                    </Text>
                  </View>
                </View>
                {this.state.passwordStatus ? (
                  <View style={styles.inputTextContainer}>
                    <Text style={styles.inputTitleText}>Password</Text>
                    <TextInput
                      secureTextEntry
                      style={styles.inputText}
                      placeholder={''}
                      onChangeText={this.onOriginalPasswordChanged}
                      value={this.state.originalPassword}
                    />
                    <Text style={styles.inputTitleText}>Re-enter Password</Text>
                    <TextInput
                      secureTextEntry
                      style={styles.inputText}
                      placeholder={''}
                      onChangeText={this.onRepeatPasswordChanged}
                      value={this.state.repeatPassword}
                    />
                  </View>
                ) : null}
                {this.state.userType === Constants.USER_TYPE_MEMBER && (
                  <View style={styles.inputTextContainer}>
                    <TextInput
                      placeholder="Enter Email"
                      style={styles.inputText}
                    />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

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
          <TouchableOpacity onPress={this.saveSettings}>
            <Text style={styles.saveButton}>SAVE</Text>
          </TouchableOpacity>
          {this.props.paymentSettingReducer.isLoading ? (
            <View style={styles.activityIndicatorContainer}>
              <ActivityIndicator
                size="large"
                color="#161a1e"
                style={{marginTop: 35}}
              />
            </View>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  goToMembershipPlansScreen = () => {
    this.props.navigation.navigate('MembershipPlans');
  };

  onTogglePushNotification = (status) => {
    console.log('Push notification status::' + status);
    this.setState({
      isPushNotificationsOn: status,
    });
  };

  onTogglePaytmSetting = (status) => {
    this.setState({
      paytmStatus: status,
    });
  };

  onTogglePasswordSetting = (status) => {
    this.setState({
      passwordStatus: status,
    });
  };

  onPaytmMerchantIDChanged = (text) => {
    this.setState({
      paytmMerchantID: text,
    });
  };

  onPaytmMerchantKeyChanged = (text) => {
    this.setState({
      paytmMerchantKey: text,
    });
  };

  onOriginalPasswordChanged = (text) => {
    this.setState({
      originalPassword: text,
    });
  };

  onRepeatPasswordChanged = (text) => {
    this.setState({
      repeatPassword: text,
    });
  };

  saveSettings = () => {
    if (this.state.paytmStatus) {
      if (this.state.paytmMerchantID === '') {
        Utils.showAlert('', 'Please enter Paytm Merchant ID');
        return;
      }

      if (this.state.paytmMerchantKey === '') {
        Utils.showAlert('', 'Please enter Paytm Secret Key');
        return;
      }
    }

    if (this.state.passwordStatus) {
      if (this.state.originalPassword === '') {
        Utils.showAlert('', 'Please enter Password');
        return;
      }

      if (this.state.originalPassword !== this.state.repeatPassword) {
        Utils.showAlert('', "Password and repeat password don't match.");
        return;
      }
    }

    let thisInstance = this;

    this.setState({
      isLoading: true,
    });

    let notificationStatus = this.state.isPushNotificationsOn;

    let paytmMerchantID = '';
    let paytmMerchantSecretKey = '';
    let password = '';
    let paytmStatus = Constants.STATUS_INACTIVE;
    let passwordStatus = Constants.STATUS_INACTIVE;

    if (this.state.paytmStatus) {
      paytmMerchantID = this.state.paytmMerchantID;
      paytmMerchantSecretKey = this.state.paytmMerchantKey;
      paytmStatus = Constants.STATUS_ACTIVE;
    }

    if (this.state.passwordStatus) {
      password = this.state.originalPassword;
      passwordStatus = Constants.STATUS_ACTIVE;
    }

    let data = new FormData();

    data.append(Constants.KEY_USER_ID, this.state.userID);
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      data.append(Constants.KEY_GYM_ID, this.state.gymID);
      data.append(Constants.KEY_PAYTM_MERCHANT_MID, paytmMerchantID);
      data.append(Constants.KEY_PAYTM_MERCHANT_KEY, paytmMerchantSecretKey);
      data.append(Constants.KEY_PAYTM_STATUS, paytmStatus);
    }
    data.append(Constants.KEY_PASSWORD, password);
    data.append(Constants.KEY_PASSWORD_STATUS, passwordStatus);

    console.log('Body:::');
    console.log(data);
    this.props.DispatchPaymentSetting(data);

    setTimeout(() => {
      if (this.props.paymentSettingReducer.success) {
        globals.setOneSetting(
          Constants.KEY_IS_PUSH_NOTIFICATIONS_ON,
          notificationStatus,
        );

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        gymData[Constants.KEY_PAYTM_STATUS] = paytmStatus;
        gymData[Constants.KEY_PAYTM_MERCHANT_MID] = paytmMerchantID;
        gymData[Constants.KEY_PAYTM_MERCHANT_KEY] = paytmMerchantSecretKey;

        let userData = userInfo[Constants.KEY_USER_DATA];
        userData[Constants.KEY_PASSWORD_STATUS] = passwordStatus;
        userData[Constants.KEY_ORIGINAL_PASSWORD] = password;

        userInfo[Constants.KEY_GYM_DATA] = gymData;
        userInfo[Constants.KEY_USER_DATA] = userData;

        globals.setOneSetting(globals.KEY_USER_INFO, userInfo);

        Utils.showAlert('', 'Settings Saved Successfully');
      }
      if (this.props.paymentSettingReducer.success == false) {
        let message = 'Some error occurred. Please try agian.';

        Utils.showAlert('Error!', message);
      }
    }, 2000);
  };
}

const styles = StyleSheet.create({
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
  tabTitle: {
    color: '#343434',
    fontSize: 20,
    fontWeight: 'bold',
    flexGrow: 1,
    textAlign: 'left',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#162029',
    paddingHorizontal: 10,
    height: 40,
  },
  backIcon: {
    width: 11,
    height: 20,
    resizeMode: 'cover',
    marginRight: 10,
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
  textInput: {
    flexGrow: 1,
    marginHorizontal: 10,
    color: '#343434',
    fontSize: 18,
  },
  saveButton: {
    marginTop: 10,
    width: '100%',
    color: 'white',
    backgroundColor: '#162029',
    lineHeight: 35,
    height: 35,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  settingsContainer: {
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  settingsInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTitleText: {
    color: '#1d2b36',
    fontSize: 16,
    width: '100%',
    textAlign: 'left',
  },
  settingsSubtitleText: {
    width: '100%',
    color: '#838383',
    fontSize: 14,
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  inputTextContainer: {
    width: '100%',
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  inputText: {
    width: '100%',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#1d2b36',
    color: '#1d2b36',
    fontSize: 16,
  },
  inputTitleText: {
    color: '#7e7e7e',
    fontSize: 14,
  },
});

const mapStateToprops = (state) => ({
  paymentSettingReducer: state.paymentSettingReducer,
  Loading: state.FetchGymServiceReducer.isLoading,
  Success: state.FetchGymServiceReducer.success,
});

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      DispatchPaymentSetting: PaymentSetting,
    },
    dispatch,
  );
}

export default connect(mapStateToprops, mapDispatchToprops)(Settings);
