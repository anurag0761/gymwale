import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Text,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
  TouchableHighlight,
  StatusBar,
} from 'react-native';

import ActionSheet from 'react-native-action-sheet';
import {withNavigationFocus} from 'react-navigation';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import DatePicker from 'react-native-datepicker';

import moment from 'moment';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {allBalance} from '../Redux/Actions/all_balanceAction';

const OPTION_ALL = 'All';
const OPTION_RECEIVED = 'Received';
const OPTION_REMAINING = 'Remaining';
const OPTION_CANCEL = 'Cancel';

const sortOptionsIOS = [
  OPTION_ALL,
  OPTION_RECEIVED,
  OPTION_REMAINING,
  OPTION_CANCEL,
];

const sortOptionsAndroid = [OPTION_ALL, OPTION_RECEIVED, OPTION_REMAINING];

const sortStatuses = [
  Constants.BALANCE_SHEET_SORT_STATUS_ALL,
  Constants.BALANCE_SHEET_SORT_STATUS_RECEIVED,
  Constants.BALANCE_SHEET_SORT_STATUS_REMAINING,
];

const DATE_OPTION_CURRENT_MONTH = 'Current Month';
const DATE_OPTION_LAST_MONTH = 'Last Month';
const DATE_OPTION_THIS_YEAR = 'This Year';
const DATE_OPTION_CUSTOM = 'Custom Range';

const dateOptionsAndroid = [
  DATE_OPTION_CURRENT_MONTH,
  DATE_OPTION_LAST_MONTH,
  DATE_OPTION_THIS_YEAR,
  DATE_OPTION_CUSTOM,
];

const dateOptionsIOS = [
  DATE_OPTION_CURRENT_MONTH,
  DATE_OPTION_LAST_MONTH,
  DATE_OPTION_THIS_YEAR,
  DATE_OPTION_CUSTOM,
  OPTION_CANCEL,
];

const balanceTypeTexts = [
  'Entire Balance',
  'Received Balance',
  'Remaining Balance',
];

class BalanceSheet extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    let userData = userInfo[Constants.KEY_USER_DATA];
    let userID = userData[Constants.KEY_ID];
    let pinStatus = false;
    if (userData[Constants.KEY_PIN_STATUS] === Constants.STATUS_ACTIVE) {
      pinStatus = true;
    }

    this.state = {
      gymID: gymID,
      userID: userID,
      isLoading: false,
      isFetchingData: true,
      isDataLoaded: false,
      isShowingSearchView: false,
      searchText: '',
      sortStatus: Constants.BALANCE_SHEET_SORT_STATUS_ALL,
      balanceType: balanceTypeTexts[0],
      pinStatus: pinStatus,
      startDate: moment().startOf('month').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      totalBalance: 0,
      totalReceived: 0,
      totalRemaining: 0,
      currentPage: 0,
      dataList: [],
      hasMoreData: true,
      isShowingCustomDateRangeModal: false,
      customRangeStartDate: new Date(),
      customRangeEndDate: new Date(),
    };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      let userInfo = globals.getSetting().userInfo;
      let userData = userInfo[Constants.KEY_USER_DATA];
      let pinStatus = false;
      if (userData[Constants.KEY_PIN_STATUS] === Constants.STATUS_ACTIVE) {
        pinStatus = true;
      }
      this.setState({
        pinStatus: pinStatus,
      });

      this.fetchBalanceSheetData(
        this.state.currentPage + 1,
        this.state.searchText,
        this.state.sortStatus,
        this.state.startDate,
        this.state.endDate,
      );
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  render() {
    if (this.props.isLoading) {
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

    if (this.props.success === false) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity onPress={() => {}} style={{width: '100%'}}>
            <Text style={styles.button}>Retry to fetch data</Text>
          </TouchableOpacity>
        </View>
      );
    }

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
            <TouchableOpacity onPress={this.onSortButtonClicked}>
              <Image
                style={styles.sortIcon}
                source={require('../../assets/images/sort_icon.png')}
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
          <Text style={styles.balanceText}>{this.getTotalBalanceText()}</Text>
          <Text style={styles.balanceTypeText}>{this.state.balanceType}</Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity onPress={this.onDateButtonClicked}>
              <Image
                style={styles.calendarIcon}
                source={require('../../assets/images/calendar.png')}
              />
            </TouchableOpacity>
            <Text style={styles.dateRangeText}>{this.getDateRangeText()}</Text>
          </View>
        </View>

        <FlatList
          style={{width: '100%'}}
          data={this.state.dataList}
          keyExtractor={(item, index) => {
            return index + '';
          }}
          renderItem={({item, index}) => this.renderItem(item, index)}
          ItemSeparatorComponent={this.renderSeparator}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={5}
          refreshing={this.state.isFetchingData}
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

        <View style={styles.keyButtonContainer}>
          <TouchableOpacity onPress={this.goToBalanceSheetSettings}>
            <View
              style={[
                styles.redKeyButton,
                {backgroundColor: this.state.pinStatus ? 'green' : '#f5184c'},
              ]}>
              <Image
                style={styles.keyIcon}
                source={require('../../assets/images/key_icon.png')}
              />
            </View>
          </TouchableOpacity>
        </View>
        {this.state.isShowingCustomDateRangeModal ? (
          <View style={[styles.activityIndicatorContainer, {padding: 30}]}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 15,
                backgroundColor: 'white',
                borderRadius: 5,
              }}>
              <Text
                style={{
                  width: '100%',
                  color: '#202020',
                  fontWeight: 'bold',
                  fontSize: 16,
                  textAlign: 'left',
                  marginBottom: 5,
                }}>
                Start Date
              </Text>
              <DatePicker
                style={styles.datePickerStyle}
                date={this.state.customRangeStartDate}
                mode="date"
                placeholder="select date"
                format="YYYY-MM-DD"
                //minDate="2016-05-01"
                maxDate={new Date()}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    right: 0,
                    top: 4,
                    marginLeft: 0,
                  },
                  dateInput: {
                    marginLeft: 0,
                    borderWidth: 0,
                  },
                  dateText: {
                    textAlign: 'left',
                    color: '#1d2b36',
                    fontSize: 16,
                    width: '100%',
                  },
                  placeholderText: {
                    textAlign: 'left',
                    fontSize: 16,
                    width: '100%',
                  },
                }}
                onDateChange={this.onCustomRangeStartDateChanged}
              />
              <Text
                style={{
                  width: '100%',
                  color: '#202020',
                  fontWeight: 'bold',
                  fontSize: 16,
                  textAlign: 'left',
                  marginBottom: 5,
                  marginTop: 15,
                }}>
                End Date
              </Text>
              <DatePicker
                style={styles.datePickerStyle}
                date={this.state.customRangeEndDate}
                mode="date"
                placeholder="select date"
                format="YYYY-MM-DD"
                //minDate="2016-05-01"
                maxDate={new Date()}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    right: 0,
                    top: 4,
                    marginLeft: 0,
                  },
                  dateInput: {
                    marginLeft: 0,
                    borderWidth: 0,
                  },
                  dateText: {
                    textAlign: 'left',
                    color: '#1d2b36',
                    fontSize: 16,
                    width: '100%',
                  },
                  placeholderText: {
                    textAlign: 'left',
                    fontSize: 16,
                    width: '100%',
                  },
                }}
                onDateChange={this.onCustomRangeEndDateChanged}
              />
              <TouchableOpacity
                onPress={this.onSaveCustomDateRange}
                style={{marginTop: 30}}>
                <View style={styles.blueButton}>
                  <Text style={styles.buttonText}>Done</Text>
                </View>
              </TouchableOpacity>
            </View>
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

  getTotalBalanceText() {
    let totalBalanceText = '₹ ';
    if (this.state.sortStatus === Constants.BALANCE_SHEET_SORT_STATUS_ALL) {
      totalBalanceText += this.state.totalBalance;
    } else if (
      this.state.sortStatus === Constants.BALANCE_SHEET_SORT_STATUS_RECEIVED
    ) {
      totalBalanceText += this.state.totalReceived;
    } else if (
      this.state.sortStatus === Constants.BALANCE_SHEET_SORT_STATUS_REMAINING
    ) {
      totalBalanceText += this.state.totalRemaining;
    }

    return totalBalanceText;
  }

  getDateRangeText() {
    let dateRangeText =
      moment(this.state.startDate, 'YYYY-MM-DD').format('MMM DD YYYY') +
      ' - ' +
      moment(this.state.endDate, 'YYYY-MM-DD').format('MMM DD YYYY');

    return dateRangeText;
  }

  onSearchTextChanged = (text) => {
    this.setState({
      searchText: text,
      hasMoreData: true,
      currentPage: 0,
      dataList: [],
      totalBalance: 0,
      totalReceived: 0,
      totalRemaining: 0,
    });

    this.fetchBalanceSheetData(
      1,
      text,
      this.state.sortStatus,
      this.state.startDate,
      this.state.endDate,
    );
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

  onSortButtonClicked = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Sort By',
        options: Platform.OS == 'ios' ? sortOptionsIOS : sortOptionsAndroid,
        cancelButtonIndex: sortOptionsIOS.length - 1,
        destructiveButtonIndex: sortOptionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        if (
          buttonIndex !== undefined &&
          buttonIndex < sortOptionsAndroid.length
        ) {
          this.onSortStatusSelected(buttonIndex);
        }
      },
    );
  };

  onSortStatusSelected(index) {
    console.log('Sort status index:::', index);
    let sortStatus = sortStatuses[index];
    this.setState({
      sortStatus: sortStatus,
      hasMoreData: true,
      currentPage: 0,
      dataList: [],
      totalBalance: 0,
      totalReceived: 0,
      totalRemaining: 0,
      balanceType: balanceTypeTexts[index],
    });

    this.fetchBalanceSheetData(
      1,
      this.state.searchText,
      sortStatus,
      this.state.startDate,
      this.state.endDate,
    );
  }

  onDateButtonClicked = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Date Range',
        options: Platform.OS == 'ios' ? dateOptionsIOS : dateOptionsAndroid,
        cancelButtonIndex: dateOptionsIOS.length - 1,
        destructiveButtonIndex: dateOptionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        if (
          buttonIndex !== undefined &&
          buttonIndex < dateOptionsAndroid.length
        ) {
          this.onDateRangeSelected(buttonIndex);
        }
      },
    );
  };

  onDateRangeSelected(index) {
    let dateOption = dateOptionsIOS[index];
    let startDate = moment().startOf('month').format('YYYY-MM-DD');
    let endDate = moment().format('YYYY-MM-DD');
    if (dateOption === DATE_OPTION_LAST_MONTH) {
      endDate = moment()
        .startOf('month')
        .subtract(1, 'days')
        .format('YYYY-MM-DD');
      startDate = moment()
        .startOf('month')
        .subtract(1, 'days')
        .startOf('month')
        .format('YYYY-MM-DD');
    } else if (dateOption === DATE_OPTION_THIS_YEAR) {
      startDate = moment().startOf('year').format('YYYY-MM-DD');
    } else if (dateOption === DATE_OPTION_CUSTOM) {
      this.setState({
        isShowingCustomDateRangeModal: true,
      });
      return;
    }

    this.setState({
      startDate: startDate,
      endDate: endDate,
      hasMoreData: true,
      currentPage: 0,
      dataList: [],
      totalBalance: 0,
      totalReceived: 0,
      totalRemaining: 0,
    });

    this.fetchBalanceSheetData(
      1,
      this.state.searchText,
      this.state.sortStatus,
      startDate,
      endDate,
    );
  }

  onCustomRangeStartDateChanged = (date) => {
    this.setState({
      customRangeStartDate: date,
    });
  };

  onCustomRangeEndDateChanged = (date) => {
    this.setState({
      customRangeEndDate: date,
    });
  };

  onSaveCustomDateRange = () => {
    let startDate = this.state.customRangeStartDate;
    let endDate = this.state.customRangeEndDate;

    this.setState({
      startDate: startDate,
      endDate: endDate,
      hasMoreData: true,
      currentPage: 0,
      dataList: [],
      totalBalance: 0,
      totalReceived: 0,
      totalRemaining: 0,
      isShowingCustomDateRangeModal: false,
    });

    this.fetchBalanceSheetData(
      1,
      this.state.searchText,
      this.state.sortStatus,
      startDate,
      endDate,
    );
  };

  goToBalanceSheetSettings = () => {
    this.props.navigation.navigate('BalanceSheetSettings');
  };

  fetchBalanceSheetData(page, searchText, sortStatus, startDate, endDate) {
    this.setState({
      isFetchingData: true,
    });
    let thisInstance = this;
    let body =
      Constants.KEY_GYM_ID +
      '=' +
      this.state.gymID +
      '&' +
      Constants.KEY_SORT_STATUS +
      '=' +
      sortStatus +
      '&' +
      Constants.KEY_S_SEARCH +
      '=' +
      searchText +
      '&' +
      Constants.KEY_PAGE +
      '=' +
      page +
      '&' +
      Constants.KEY_START_DATE +
      '=' +
      startDate +
      '&' +
      Constants.KEY_END_DATE +
      '=' +
      endDate;

    console.log('BODY:::' + body);
    this.props.dispatchAllBalance(body);
    // fetch(Constants.API_URL_GET_GYM_BALANCE_SHEET_DATA, {
    //   method: 'post',
    //   body: body,
    //   headers: {
    //     'Content-type': 'application/x-www-form-urlencoded',
    //     Accept: 'application/json',
    //   },
    // })
    //   .then((response) => response.json())
    //   .then((responseJson) => {

    setTimeout(() => {
      if (this.props.success) {
        let responseJson = this.props.balanceData.allbalance;
        let _sortStatus = responseJson[Constants.KEY_SORT_STATUS];
        if (_sortStatus !== sortStatus) {
          return;
        }
        let valid = responseJson[Constants.KEY_VALID];
        if (valid) {
          let limit = responseJson[Constants.KEY_LIMIT];

          let _dataList = responseJson[Constants.KEY_DATA];
          console.log('Fetched data:::' + _dataList.length);
          let hasMoreData = true;
          if (_dataList.length < limit) {
            hasMoreData = false;
          }

          let _totalBalance = 0;
          let _totalReceived = 0;
          let _totalRemaining = 0;

          /*
                      if(responseJson[Constants.KEY_TOTAL_FEE_AMOUNT] && _dataList.length > 0) {
                          _totalBalance = responseJson[Constants.KEY_TOTAL_FEE_AMOUNT];
                      }
                      */

          if (
            responseJson[Constants.KEY_TOTAL_RECEIVE] &&
            _dataList.length > 0
          ) {
            _totalReceived = responseJson[Constants.KEY_TOTAL_RECEIVE];
          }

          if (
            responseJson[Constants.KEY_TOTAL_REMAINING] &&
            _dataList.length > 0
          ) {
            _totalRemaining = responseJson[Constants.KEY_TOTAL_REMAINING];
          }

          _totalBalance = _totalReceived + _totalRemaining;

          thisInstance.setState((previousState) => {
            let dataList = [];
            let totalBalance = 0;
            let totalReceived = 0;
            let totalRemaining = 0;

            if (page > 1) {
              dataList = previousState.dataList;
              totalBalance = previousState.totalBalance;
              totalReceived = previousState.totalReceived;
              totalRemaining = previousState.totalRemaining;
            }

            dataList.push(..._dataList);
            console.log('TOtal data after adding:::' + dataList.length);
            totalBalance += _totalBalance;
            totalReceived += _totalReceived;
            totalRemaining += _totalRemaining;

            return {
              isFetchingData: false,
              dataList: dataList,
              currentPage: page,
              hasMoreData: hasMoreData,
              totalBalance: totalBalance,
              totalReceived: totalReceived,
              totalRemaining: totalRemaining,
              isDataLoaded: true,
            };
          });
        } else {
          thisInstance.setState({
            isFetchingData: false,
            hasMoreData: false,
            currentPage: page,
          });
        }
      }
    }, 1500);
  }

  onEndReached = () => {
    if (this.state.hasMoreData && !this.state.isFetchingData) {
      let currentPage = this.state.currentPage + 1;
      this.fetchBalanceSheetData(
        currentPage,
        this.state.searchText,
        this.state.sortStatus,
        this.state.startDate,
        this.state.endDate,
      );
    }
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
    let membershipName = item[Constants.KEY_MEMBERSHIP_NAME];
    let amount = '0';
    if (this.state.sortStatus === Constants.BALANCE_SHEET_SORT_STATUS_ALL) {
      amount = item[Constants.KEY_TOTAL_FEE_AMOUNT];
    } else if (
      this.state.sortStatus === Constants.BALANCE_SHEET_SORT_STATUS_RECEIVED
    ) {
      amount = item[Constants.KEY_RECEIVE_AMOUNT];
    } else if (
      this.state.sortStatus === Constants.BALANCE_SHEET_SORT_STATUS_REMAINING
    ) {
      amount = item[Constants.KEY_REMAINING_AMOUNT];
    }

    let startDate = item[Constants.KEY_START_DATE];
    let endDate = item[Constants.KEY_END_DATE];
    let membershipTime =
      moment(startDate, 'YYYY-MM-DD').format('MMM YYYY') +
      ' - ' +
      moment(endDate, 'YYYY-MM-DD').format('MMM YYYY');

    return (
      <TouchableHighlight
        onPress={() => {
          this.showMemberDetails(index);
        }}>
        <View style={styles.memberInfoContainer}>
          <Image
            style={styles.memberProfileImage}
            resizeMode={'cover'}
            source={{uri: profileImageURL}}
          />
          <View style={styles.profileInfoView}>
            <Text style={styles.profileNameText}>{profileName}</Text>
            <Text style={styles.membershipNameText}>{membershipName}</Text>
          </View>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={[
                styles.profileNameText,
                {fontWeight: 'bold', color: '#202020'},
              ]}>
              ₹ {amount}
            </Text>
            <Text
              style={[
                styles.membershipNameText,
                {color: '#808080', fontSize: 10},
              ]}>
              {membershipTime}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  showMemberDetails(selectedIndex) {
    let data = this.state.dataList[selectedIndex];
    let params = {};
    params[Constants.KEY_MEMBER_ID] = data[Constants.KEY_MEMBER_ID];
    params[Constants.KEY_MEMBER_MEMBERSHIP_ID] =
      data[Constants.KEY_MEMBER_MEMBERSHIP_ID];
    this.props.navigation.navigate('MemberDetailsScreen', params);
  }

  goToNotificationsScreen = () => {
    this.props.navigation.navigate('NotificationsScreen');
  };
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
  searchTextInput: {
    flexGrow: 1,
    textAlign: 'left',
    color: '#41464c',
  },
  searchIcon: {
    width: 13,
    height: 14,
    resizeMode: 'cover',
    marginRight: 10,
  },
  sortIcon: {
    width: 22,
    height: 18,
    resizeMode: 'cover',
    marginRight: 10,
  },
  calendarIcon: {
    width: 18,
    height: 18,
    resizeMode: 'cover',
    marginRight: 10,
  },
  notificationIcon: {
    width: 13,
    height: 15,
    resizeMode: 'cover',
    marginRight: 10,
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
    height: 100,
    backgroundColor: '#162029',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 22.5,
    fontWeight: '400',
    color: 'white',
  },
  balanceTypeText: {
    color: 'white',
    fontSize: 15,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateRangeText: {
    color: 'white',
    fontSize: 11,
  },
  keyButtonContainer: {
    width: '100%',
    height: 40,
    paddingRight: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'absolute',
    top: 120,
    left: 0,
  },
  redKeyButton: {
    width: 40,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#f5184c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyIcon: {
    width: 20,
    height: 21,
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
  blueButton: {
    backgroundColor: '#0086fe',
    width: 232,
    height: 37,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  datePickerStyle: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#1d2b36',
    width: '100%',
  },
});

const mapStateToProps = (state) => ({
  balanceData: state.allBalanceReducer,
  success: state.allBalanceReducer.success,
  isLoading: state.allBalanceReducer.isLoading,
});
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      dispatchAllBalance: allBalance,
    },
    dispatch,
  );
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withNavigationFocus(BalanceSheet));
