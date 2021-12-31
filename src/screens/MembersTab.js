import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

import ActionSheet from 'react-native-action-sheet';
import Share from 'react-native-share';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import MembersScreen from './MembersScreen';
import StaffsScreen from './StaffsScreen';
import GuestsScreen from './GuestsScreen';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

const screenWidth = Dimensions.get('window').width;

const tabTitles = ['Members', 'Trainer', 'Guest'];

const sortOptionsIOS = [
  'A to Z',
  'Registered Member',
  'Expired Membership',
  'Upcoming Expired',
  'Next Installment',
  'Cancel',
];

const sortOptionsAndroid = [
  'A to Z',
  'Registered Member',
  'Expired Membership',
  'Upcoming Expired',
  'Next Installment',
];

const sortStatuses = [
  Constants.SORT_ID_A_TO_Z,
  Constants.SORT_ID_REGISTERED_MEMBER,
  Constants.SORT_ID_EXPIRED_MEMBERSHIP,
  Constants.SORT_ID_UPCOMING_EXPIRED,
  Constants.SORT_ID_NEXT_INSTALLMENT,
];

class MembersTab extends Component {
  state = {
    index: 0,
    routes: [
      {key: 'MembersScreen', title: 'MEMBERS'},
      {key: 'StaffsScreen', title: 'TRAINER'},
      {key: 'GuestsScreen', title: 'GUEST'},
    ],
    isComponentMounted: false,
  };

  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    this.state = {
      gymID: gymID,
      index: 0,
      routes: [
        {key: 'MembersScreen', title: 'MEMBERS'},
        {key: 'StaffsScreen', title: 'TRAINER'},
        {key: 'GuestsScreen', title: 'GUEST'},
      ],
      isComponentMounted: false,
      searchText: '',
    };
  }

  componentDidMount() {
    this.setState({
      isComponentMounted: true,
      isShowingSearchView: false,
      searchText: '',
      sortStatus: 4,
    });
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
    /*
        switch(this.state.index) {
            case 0:
            if(this._membersScreen) {
                this._membersScreen.onSortChanged(sortStatuses[index]);
            }
            break;
        }
        */
    this.setState({
      sortStatus: sortStatuses[index],
    });
  }

  onSearchTextChanged = (text) => {
    this.setState({
      searchText: text,
    });
    /*
        switch(this.state.index) {
            case 0:
            if(this._membersScreen) {
                this._membersScreen.onSearchTextChanged(text);
            }
            break;
        }
        */
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
    return (
      <>
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
            <Text style={styles.tabTitle}>{tabTitles[this.state.index]}</Text>
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

        <TabView
          style={{flex: 1}}
          navigationState={this.state}
          renderScene={SceneMap({
            MembersScreen: () => {
              return (
                <MembersScreen
                  searchText={this.state.searchText}
                  sortStatus={this.state.sortStatus}
                  parentNav={this.props.navigation}
                />
              );
            },
            StaffsScreen: () => {
              return (
                <StaffsScreen
                  searchText={this.state.searchText}
                  sortStatus={this.state.sortStatus}
                  parentNav={this.props.navigation}
                />
              );
            },
            GuestsScreen: () => {
              return (
                <GuestsScreen
                  searchText={this.state.searchText}
                  sortStatus={this.state.sortStatus}
                  parentNav={this.props.navigation}
                />
              );
            },
          })}
          onIndexChange={(index) => this.setState({index})}
          initialLayout={{width: screenWidth}}
          renderTabBar={this.renderTabBar}
        />
      </>
    );
  }

  goToNotificationsScreen = () => {
    this.props.navigation.navigate('NotificationsScreen');
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
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 36,
    backgroundColor: '#161a1e',
    paddingHorizontal: 10,
  },
  tabTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flexGrow: 1,
    textAlign: 'left',
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
  sortIcon: {
    width: 22,
    height: 18,
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
});

export default MembersTab;
