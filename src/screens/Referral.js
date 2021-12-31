import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import Share from 'react-native-share';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getallreferall} from '../Redux/Actions/getAllReferralAction';

class Referral extends Component {
  constructor(properties) {
    super(properties);

    let gymID = '';
    let memberID = '';

    let userInfo = globals.getSetting().userInfo;
    let body = userInfo[Constants.KEY_USER_DATA];
    let userType = body[Constants.KEY_USER_TYPE];
    let userTypeShortCode = '';
    if (userType === Constants.USER_TYPE_OWNER) {
      let gymData = userInfo[Constants.KEY_GYM_DATA];
      gymID = gymData[Constants.KEY_ID];
      memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, '');
      userTypeShortCode = Constants.USER_TYPE_SHORT_KEY_OWNER;
    } else if (userType === Constants.USER_TYPE_MEMBER) {
      let memberData = userInfo[Constants.KEY_MEMBER_DATA];
      memberData = memberData[0];
      memberID = memberData[Constants.KEY_MEMBER_ID];
      gymID = memberData[Constants.KEY_GYM_ID];
      userTypeShortCode = Constants.USER_TYPE_SHORT_KEY_MEMBER;
    }

    this.state = {
      gymID: gymID,
      memberID: memberID,
      userType: userType,
      userTypeShortCode: userTypeShortCode,
      searchText: '',
      isLoading: false,
      isFetchingData: true,
      isDataLoaded: false,
      referrals: [],
      isShowingSearchView: false,
      totalEarned: 0,
      withdrawLimit: 0,
    };
  }

  componentDidMount() {
    this.fetchData(this.state.searchText);
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

    let referralURLText =
      Constants.REFERRAL_URL_PREFIX + 'r' + this.state.userTypeShortCode;
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      referralURLText += this.state.gymID;
    } else {
      referralURLText += this.state.memberID;
    }

    return (
      <View
        style={{flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
        <View
          style={{
            height: getStatusBarHeight(true),
            backgroundColor: '#161a1e',
          }}>
          <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
        </View>
        {this.state.isShowingSearchView ? (
          <View style={[styles.headerContainer, {backgroundColor: 'white'}]}>
            <TouchableOpacity onPress={this.hideSearchBar}>
              <Image
                style={styles.backIcon}
                source={require('../../assets/images/back_arrow.png')}
              />
            </TouchableOpacity>
            <Image
              style={styles.searchIcon}
              source={require('../../assets/images/search_icon.png')}
            />
            <TextInput
              autoFocus={true}
              autoCorrect={false}
              style={styles.searchTextInput}
              onChangeText={this.onSearchTextChanged}
              value={this.state.searchText}
              placeholder={'Search Here'}
              enablesReturnKeyAutomatically
              returnKeyType={'search'}
              onSubmitEditing={this.onSearchTextChanged}
            />
          </View>
        ) : (
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={this.goBack}>
              <Image
                style={styles.backIcon}
                source={require('../../assets/images/back_icon_white.png')}
              />
            </TouchableOpacity>
            <View style={styles.titleBannerContainer}>
              <Image
                style={styles.titleBanner}
                resizeMode={'cover'}
                source={require('../../assets/images/gymvale_name_logo.png')}
              />
            </View>
            <TouchableOpacity onPress={this.showSearchBar}>
              <Image
                style={styles.searchIcon}
                source={require('../../assets/images/search_icon.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={this.goToNotificationsScreen}>
              <Image
                style={styles.notificationIcon}
                source={require('../../assets/images/notification_icon.png')}
              />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.topInfoContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              marginBottom: 25,
            }}>
            <Text style={{fontSize: 14, color: '#fefefe', marginRight: 10}}>
              Total Earned
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#fcc925',
                fontWeight: 'bold',
                marginRight: 30,
              }}>
              ₹ {this.state.totalEarned}
            </Text>
            {this.state.isDataLoaded ? (
              <TouchableOpacity onPress={this.withdrawEarnings}>
                <View
                  style={{
                    backgroundColor: '#17aae0',
                    width: 100,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 15,
                  }}>
                  <Text style={{fontSize: 16, color: '#feffff'}}>Withdraw</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={{fontSize: 15, color: '#ffffff', fontWeight: 'bold'}}>
            Get Referral Cashback!
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              paddingHorizontal: 30,
              marginTop: 15,
              marginBottom: 10,
            }}>
            <View
              style={{
                flex: 1,
                paddingVertical: 5,
                backgroundColor: 'white',
                borderRadius: 2,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}>
              <Text style={{fontSize: 14, color: '#3b3e41'}}>
                {referralURLText}
              </Text>
            </View>
            <TouchableOpacity onPress={() => this.shareReferralURL()}>
              <View
                style={{
                  backgroundColor: '#17aae0',
                  width: 30,
                  height: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 15,
                }}>
                <Image
                  style={styles.shareIcon}
                  source={require('../../assets/images/share_icon.png')}
                />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={{fontSize: 12, color: '#ffffff'}}>
            {this.state.userType === Constants.USER_TYPE_OWNER
              ? 'Share this link with Gym Owners ONLY'
              : ''}
          </Text>
        </View>

        <FlatList
          style={{width: '100%'}}
          data={this.state.referrals}
          keyExtractor={(item, index) => {
            return index + '';
          }}
          renderItem={({item, index}) => this.renderItem(item, index)}
          ItemSeparatorComponent={this.renderSeparator}
        />

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

        {this.state.isFetchingData ? (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator
              size="large"
              color="#161a1e"
              style={{marginTop: 35}}
            />
          </View>
        ) : null}

        {this.state.isFetchingData === false &&
        this.state.isDataLoaded === false ? (
          <View
            style={[
              styles.activityIndicatorContainer,
              {backgroundColor: 'transparent'},
            ]}>
            <TouchableOpacity
              onPress={() => {
                this.fetchData(this.state.searchText);
              }}
              style={{width: '100%'}}>
              <Text style={styles.button}>Retry to fetch data</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  goToMembershipPlansScreen = () => {
    this.props.navigation.navigate('MembershipPlans');
  };

  fetchData(searchText) {
    this.setState({
      isFetchingData: true,
    });

    let thisInstance = this;
    let body =
      Constants.KEY_S_SEARCH +
      '=' +
      searchText +
      '&' +
      Constants.KEY_REFERRAL_ID +
      '=' +
      (this.state.userType === Constants.USER_TYPE_OWNER
        ? this.state.gymID
        : this.state.memberID) +
      '&' +
      Constants.KEY_USER_TYPE +
      '=' +
      this.state.userTypeShortCode;

    console.log('BODY:::' + body);
    this.props.dispatchReferral(body);
    setTimeout(() => {
      console.log('CCCCCCCCCCCCCCCCCCC0');
      console.log(this.props.getAllReferral.referralData[Constants.KEY_VALID]);
      console.log('CCCCCCCCCCCCCCCCCCC0');
      let referrals = [];
      let totatEarned = 0;
      let withdrawLimit = 0;
      let valid = this.props.getAllReferral.referralData[Constants.KEY_VALID];
      if (valid === true) {
        referrals = this.props.getAllReferral.referralData[Constants.KEY_DATA];
        totatEarned = this.props.getAllReferral.referralData[Constants.KEY_TOTAL_DISCOUNT];
        withdrawLimit = this.props.getAllReferral.referralData[Constants.KEY_WITHDRAW_LIMIT];
      }
      console.log('Total referrals:::' + referrals.length);

      thisInstance.setState({
        referrals: referrals,
        totalEarned: totatEarned,
        withdrawLimit: withdrawLimit,
        isFetchingData: false,
        isDataLoaded: true,
      });
    }, 3000);
  }

  onSearchTextChanged = (text) => {
    this.setState({
      searchText: text,
      hasMoreData: true,
      currentPage: 1,
      dataList: [],
      totalBalance: 0,
      totalReceived: 0,
      totalRemaining: 0,
    });

    this.fetchData(text);
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

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#d6d6d6',
        }}
      />
    );
  };

  renderItem(item, index) {
    let profileImageURL = Constants.IMAGE_BASE_URL + item[Constants.KEY_IMAGE];
    let profileName = item[Constants.KEY_NAME];
    let cityName = item[Constants.KEY_CITY_NAME];
    let discount = 'Trial Account';
    let discountColorCode = '#d5071a';
    if (
      item[Constants.KEY_DISCOUNT] !== Constants.DISCOUNT_TYPE_TRIAL_ACCOUNT
    ) {
      discount = '₹ ' + item[Constants.KEY_DISCOUNT];
      discountColorCode = '#126a03';
    }

    return (
      <TouchableHighlight>
        <View style={styles.memberInfoContainer}>
          <Image
            style={styles.memberProfileImage}
            resizeMode={'cover'}
            source={{uri: profileImageURL}}
          />
          <View style={styles.profileInfoView}>
            <Text style={styles.profileNameText}>{profileName}</Text>
            <Text style={styles.membershipNameText}>{cityName}</Text>
          </View>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={{
                fontWeight: 'bold',
                color: discountColorCode,
                fontSize: 14,
              }}>
              {discount}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  goToNotificationsScreen = () => {
    this.props.navigation.navigate('NotificationsScreen');
  };

  shareReferralURL() {
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      let title = 'Sign Up in GymVale.com';
      let referralURL = Constants.REFERRAL_URL_PREFIX + 'rg' + this.state.gymID;
      let shareOptions = {
        title: title,
        message: 'Sign up in GymVale.com by using the link',
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
    } else {
      let title =
        'Here is the best gym management software login now for FREE !! ';
      let referralURL =
        Constants.REFERRAL_URL_PREFIX + 'rm' + this.state.memberID;
      let shareOptions = {
        title: title,
        message:
          'Here is the best gym management software login now for FREE !! ',
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
  }

  withdrawEarnings = () => {
    if (this.state.totalEarned >= this.state.withdrawLimit) {
      this.goToWithdrawlRequestScreen();
    } else {
      Utils.showAlert(
        'Withdrawal Request',
        'Your Earning should be at least ' + this.state.withdrawLimit + ' Rs.',
      );
    }
  };

  goToWithdrawlRequestScreen() {
    let params = {};
    params[Constants.KEY_WITHDRAW_LIMIT] = this.state.withdrawLimit;
    params[Constants.KEY_TOTAL_DISCOUNT] = this.state.totalEarned;
    this.props.navigation.navigate('ReferralWithdrawalRequest', params);
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
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
  },
  notificationIcon: {
    width: 13,
    height: 15,
    resizeMode: 'cover',
    marginRight: 20,
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
  titleBannerContainer: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleBanner: {
    width: 150,
    height: 21.5,
  },
  topInfoContainer: {
    width: '100%',
    height: 170,
    backgroundColor: '#162029',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTextInput: {
    flexGrow: 1,
    textAlign: 'left',
    color: '#41464c',
  },
  memberInfoContainer: {
    padding: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberProfileImage: {
    width: 45,
    aspectRatio: 1,
    borderRadius: 22.5,
  },
  profileInfoView: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  profileNameText: {
    color: '#343434',
    fontSize: 16,
    flex: 1,
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  membershipNameText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
    color: '#343434',
    flexWrap: 'wrap',
  },
});

const mapStateToprops = (state) => {
  console.log('State:::' + JSON.stringify(state.getAllReferral));
  return {
    getAllReferral: state.getAllReferral,
    allCitiesList: state.getAllCityReducer.allCity,
    Loading: state.getAllCityReducer.isLoading,
    Success: state.getAllCityReducer.success,
  };
};

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      // FetchAllCity: fetchAllCity,
      dispatchReferral: getallreferall,
    },
    dispatch,
  );
}

export default connect(mapStateToprops, mapDispatchToprops)(Referral);
