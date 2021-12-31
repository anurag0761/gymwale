import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  Text,
  FlatList,
} from 'react-native';

import Share from 'react-native-share';

const deviceWidth = Dimensions.get('window').width;
import ScrollableTabView, {
  ScrollableTabBar,
  DefaultTabBar,
} from 'rn-collapsing-tab-bar';
const containerHeight = Dimensions.get('window').height;

import ServicesScreen from '../screens/ServicesScreen';
import FacilitiesScreen from '../screens/FacilitiesScreen';
import GalleryScreen from '../screens/GalleryScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

//import { ScrollableTabView, ScrollableTabBar } from '@valdio/react-native-scrollable-tabview'
// import { ScrollableTabBar } from '@valdio/react-native-scrollable-tabview'

class EditGymProfile extends Component {
  constructor(properties) {
    super(properties);

    console.log('Editgymprofile constructor::::');

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];
    let gymName = gymData[Constants.KEY_GYM_NAME];
    let gymLocation = gymData[Constants.KEY_GYM_DISPLAY_LOCATION];
    let profileImageURL = gymData[Constants.KEY_PROFILE_IMAGE];
    let coverImageURL = gymData[Constants.KEY_COVER_IMAGE];

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

    this.state = {
      isLoading: false,
      initialPage: 0,
      gymID: gymID,
      gymName: gymName,
      gymLocation: gymLocation,
      gymProfileImageURL: profileImageURL,
      gymCoverImageURL: coverImageURL,
      tabOneHeight: containerHeight,
      tabTwoHeight: containerHeight,
      tabThreeHeight: containerHeight,
      tabFourHeight: containerHeight,
    };
  }

  measureTabOne = (event) => {
    this.setState({
      tabOneHeight: event.nativeEvent.layout.height,
    });
  };
  measureTabTwo = (event) => {
    this.setState({
      tabTwoHeight: event.nativeEvent.layout.height,
    });
  };

  measureTabThree = (event) => {
    this.setState({
      tabThreeHeight: event.nativeEvent.layout.height,
    });
  };
  measureTabFour = (event) => {
    if (this.state.endReachedOfSubscriptionPage === false) {
      this.setState({
        tabFourHeight: event.nativeEvent.layout.height + 10,
      });
    }
  };

  onEndReachedOfSubscriptionPage = () => {
    console.log('onEndReachedOfSubscriptionPage::::::');
    this.setState({
      endReachedOfSubscriptionPage: true,
    });
  };

  onSubscriptionScreenMainHeightCalculated = (mainHeight) => {
    let tabFourHeight = this.state.tabFourHeight;
    if (mainHeight > tabFourHeight) {
      tabFourHeight = mainHeight;
    }
    this.setState({
      tabFourHeight: tabFourHeight,
    });
  };

  onSubscriptionPageListHeightChanged = (isExpanded, height) => {
    console.log('onSubscriptionPageListHeightChanged:::::');
    let currentHeight = this.state.tabFourHeight;
    if (isExpanded) {
      currentHeight += height;
    } else {
      currentHeight -= height;
    }
    this.setState({
      tabFourHeight: currentHeight,
    });
  };

  collapsableComponent = () => {
    return (
      <View style={styles.gymHeaderContainer}>
        <Image
          style={styles.gymCoverImage}
          source={{uri: this.state.gymCoverImageURL}}
        />
        <View style={styles.gymHeaderInfoContainer}>
          <View style={styles.gymInfoContainer}>
            <Text style={styles.gymNameText}>{this.state.gymName}</Text>
            <View style={styles.gymLocationInfoRow}>
              <Image
                style={styles.locationIcon}
                source={require('../../assets/images/location_icon.png')}
              />
              <Text style={styles.locationInfoText}>
                {this.state.gymLocation}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  render() {
    const {tabOneHeight, tabTwoHeight, tabThreeHeight, tabFourHeight} =
      this.state;

    const collapsableComponent = (
      <View style={styles.gymHeaderContainer}>
        <Image
          style={styles.gymCoverImage}
          source={{uri: this.state.gymCoverImageURL}}
        />
        <View style={styles.gymHeaderInfoContainer}>
          <View style={styles.gymInfoContainer}>
            <Text style={styles.gymNameText}>{this.state.gymName}</Text>
            <View style={styles.gymLocationInfoRow}>
              <Image
                style={styles.locationIcon}
                source={require('../../assets/images/location_icon.png')}
              />
              <Text style={styles.locationInfoText}>
                {this.state.gymLocation}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );

    return (
      <>
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
            <Image
              style={styles.titleBanner}
              resizeMode={'cover'}
              source={require('../../assets/images/gymvale_name_logo.png')}
            />
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

        <ScrollableTabView
          tabContentHeights={[
            tabOneHeight,
            tabTwoHeight,
            tabThreeHeight,
            tabFourHeight,
          ]}
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
          tabBarUnderlineStyle={{backgroundColor: '#121619', height: 2}}>
          <View
            onLayout={(event) => this.measureTabOne(event)}
            tabLabel={'SERVICES'}>
            <View
              style={{
                height: containerHeight - 44,
              }}>
              <ServicesScreen goToNextPage={() => this.goToPage(1)} />
            </View>
          </View>
          <View
            onLayout={(event) => this.measureTabTwo(event)}
            tabLabel={'FACILITIES'}>
            <View
              style={{
                height: containerHeight - 44,
              }}>
              <FacilitiesScreen goToNextPage={() => this.goToPage(2)} />
            </View>
          </View>
          <View
            onLayout={(event) => this.measureTabThree(event)}
            tabLabel={'GALLERY'}>
            <View
              style={{
                height: containerHeight - 44,
              }}>
              <GalleryScreen goToNextPage={() => this.goToPage(3)} />
            </View>
          </View>
          <View tabLabel={'SUBSCRIPTION'}>
            <SubscriptionsScreen
              onEndReachedOfSubscriptionPage={
                this.onEndReachedOfSubscriptionPage
              }
              onSubscriptionScreenMainHeightCalculated={
                this.onSubscriptionScreenMainHeightCalculated
              }
              onSubscriptionPageListHeightChanged={
                this.onSubscriptionPageListHeightChanged
              }
              goToNextPage={() => this.goToPage(4)}
            />
          </View>
        </ScrollableTabView>
      </>
    );
  }

  goToPage = (index) => {
    if (index < 4) {
      this.tabView.goToPage(index);
    } else {
      this.props.navigation.navigate('MainApp');
    }
  };

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
    height: 44,
    backgroundColor: '#161a1e',
    paddingHorizontal: 10,
  },
  gymHeaderContainer: {
    width: '100%',
    backgroundColor: 'white',
    height: 180,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  gymCoverImage: {
    backgroundColor: '#161a1e',
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  gymHeaderInfoContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  gymInfoContainer: {
    backgroundColor: '#f7f7f7',
    width: '100%',
    height: 60,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gymNameText: {
    color: '#202020',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
    width: '100%',
  },
  gymLocationInfoRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  locationIcon: {
    width: 10,
    height: 15,
    marginRight: 10,
  },
  locationInfoText: {
    flexGrow: 1,
    textAlign: 'left',
    color: '#202020',
    fontSize: 12,
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
    width: 11,
    height: 20,
    resizeMode: 'cover',
    marginRight: 10,
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

export default EditGymProfile;
