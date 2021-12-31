import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TouchableHighlight,
  Platform,
  TextInput,
  Alert,
} from 'react-native';

import ActionButton from 'react-native-action-button';
import Share from 'react-native-share';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchgymlist} from '../Redux/Actions/gymaction';

class GymList extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    let userData = userInfo[Constants.KEY_USER_DATA];
    let userID = userData[Constants.KEY_ID];

    this.state = {
      gymID: gymID,
      userID: userID,
      isShowingSearchView: false,
      searchText: '',
      isFetchingData: true,
      // isLoading: this.props.Loading,
      gymList: [],
      isDataLoaded: false,
      willShowUpgradePlanAlert: false,
    };
  }

  componentDidMount() {
    this.fetchGymList(this.state.searchText);
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

    if (!this.props.Success) {
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

    if (this.state.Success === false) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() => {
              this.fetchGymList(this.state.searchText);
            }}
            style={{width: '100%'}}>
            <Text style={styles.button}>Retry to fetch data</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{flex: 1}}>
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
        )}

        <FlatList
          style={{width: '100%'}}
          data={this.props.gymListData.gymlist[Constants.KEY_DATA]}
          keyExtractor={(item, index) => {
            return index + '';
          }}
          renderItem={({item, index}) => this.renderItem(item, index)}
          ItemSeparatorComponent={this.renderSeparator}
        />

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

        <ActionButton buttonColor="#3fd458" onPress={this.addGym} />

        {this.props.isLoading ? (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator
              size="large"
              color="#161a1e"
              style={{marginTop: 35}}
            />
          </View>
        ) : null}
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
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  goToNotificationsScreen = () => {
    this.props.navigation.navigate('NotificationsScreen');
  };

  goToMembershipPlansScreen = () => {
    this.props.navigation.navigate('MembershipPlans');
  };

  shareGymVale = () => {
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
  };

  fetchGymList(searchText) {
    let thisInstance = this;
    let body =
      Constants.KEY_USER_ID +
      '=' +
      this.state.userID +
      '&' +
      Constants.KEY_S_SEARCH +
      '=' +
      searchText;

    console.log('BODY:::' + body);
    this.props.FetchGymList(body);

    //console.log(responseJson);
    // let gymList = this.props.gymListData.gymlist[Constants.KEY_DATA];
    // console.log("Total gyms:::" + gymList.length);

    // thisInstance.setState({
    //     gymList: gymList,
    //     isFetchingData: false,
    //     isDataLoaded: true,
    // });
  }

  onSearchTextChanged = (text) => {
    this.setState({
      searchText: text,
    });

    this.fetchGymList(text);
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
    let profileImageURL =
      Constants.IMAGE_BASE_URL + item[Constants.KEY_PROFILE_IMAGE];
    let profileName = item[Constants.KEY_GYM_NAME];
    let address = item[Constants.KEY_GYM_DISPLAY_LOCATION];
    let gymMemberCount = item[Constants.KEY_GYM_MEMBER_COUNT];
    let gymMemberCountText =
      gymMemberCount + ' Member' + (parseInt(gymMemberCount) > 1 ? 's' : '');
    let backgroundColor = 'white';
    if (item[Constants.KEY_ID] === this.state.gymID) {
      backgroundColor = 'rgba(88, 190, 231, 1)';
    }
    return (
      <TouchableHighlight
        onPress={() => {
          this.onGymSelected(index);
        }}>
        <View
          style={[
            styles.memberInfoContainer,
            {backgroundColor: backgroundColor},
          ]}>
          <Image
            style={styles.memberProfileImage}
            resizeMode={'cover'}
            source={{uri: profileImageURL}}
          />
          <View style={styles.profileInfoView}>
            <Text style={styles.profileNameText}>{profileName}</Text>
            <Text style={styles.membershipNameText}>{address}</Text>
          </View>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: '#343434', fontSize: 12}}>
              {gymMemberCountText}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  addGym = () => {
    let canUsePaidFeatures =
      globals.getSetting()[globals.KEY_CAN_USE_PAID_FEATURES];

    if (canUsePaidFeatures === 'true') {
      this.setState({
        willShowUpgradePlanAlert: true,
      });
      return;
    }

    let params = {};
    let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
    let userData = userInfo[Constants.KEY_USER_DATA];
    let userID = userData[Constants.KEY_ID];
    let phoneNumber = userData[Constants.KEY_PHONE];
    let callingCode = userData[Constants.KEY_COUNTRY_ID];
    params[Constants.KEY_USER_ID] = userID;
    params[Constants.PARAM_PHONE_NUMBER] = phoneNumber;
    params[Constants.PARAM_CALLING_CODE] = callingCode;
    this.props.navigation.navigate('AddNewGym', params);
  };

  async onGymSelected(selectedIndex) {
    let selectedGym = this.state.gymList[selectedIndex];
    selectedGym[Constants.KEY_PROFILE_IMAGE] =
      Constants.IMAGE_BASE_URL + selectedGym[Constants.KEY_PROFILE_IMAGE];
    selectedGym[Constants.KEY_COVER_IMAGE] =
      Constants.IMAGE_BASE_URL + selectedGym[Constants.KEY_COVER_IMAGE];
    let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
    userInfo[Constants.KEY_GYM_DATA] = selectedGym;

    await globals.setOneSetting(globals.KEY_USER_INFO, userInfo);
    console.log('Now selected the gym::::');
    this.props.navigation.popToTop();
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
  headerContainer: {
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
  moreIcon: {
    width: 5,
    height: 22.5,
  },
  closeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'cover',
    marginRight: 10,
  },
});

const mapStateToprops = (state) => ({
  gymListData: state.gymReducer,
  isLoading: state.gymReducer.isLoading,
  Success: state.gymReducer.success,
});

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      FetchGymList: fetchgymlist,
    },
    dispatch,
  );
}

export default connect(mapStateToprops, mapDispatchToprops)(GymList);
