import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
} from 'react-native';

import ActionButton from 'react-native-action-button';
import ActionSheet from 'react-native-action-sheet';
import Icon from 'react-native-vector-icons/Ionicons';
import Share from 'react-native-share';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {assignToMember} from '../Redux/Actions/assignToMemberAction';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

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

class AssignToMembersScreen extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    let workoutID = properties.navigation.getParam(Constants.KEY_WORKOUT_ID);

    this.state = {
      isFetchingList: true,
      isShowingSearchView: false,
      membersList: [],
      selectedMembersList: [],
      gymID: gymID,
      workoutID: workoutID,
      currentPage: 0,
      sortStatus: Constants.SORT_ID_A_TO_Z,
      hasMoreData: true,
      searchText: '',
      isLoading: false,
    };
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.setState({
        membersList: [],
        selectedMembersList: [],
      });
      this.fetchMembers(1, this.state.searchText, this.state.sortStatus);
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  fetchMembers(page, searchText, sortStatus) {
    this.setState({
      isFetchingList: true,
    });
    let thisInstance = this;
    let body =
      Constants.KEY_GYM_ID +
      '=' +
      this.state.gymID +
      '&' +
      Constants.KEY_MEMBER_TYPE +
      '=' +
      Constants.MEMBER_TYPE_USER +
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
      page;

    console.log('BODY:::' + body);
    fetch(Constants.API_URL_GET_ALL_MEMBERS, {
      method: 'post',
      body: body,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        //console.log(responseJson);
        let limit = responseJson[Constants.KEY_LIMIT];

        let members = responseJson[Constants.KEY_DATA];
        console.log('FEtched members:::' + members.length);
        let hasMoreData = true;
        if (members.length < limit) {
          hasMoreData = false;
        }
        thisInstance.setState((previousState) => {
          let membersList = previousState.membersList;
          let selectedMembersList = previousState.selectedMembersList;
          for (let i = 0; i < membersList.length; i++) {
            selectedMembersList.push(false);
          }
          console.log('Total members::' + membersList.length);
          membersList.push(...members);
          console.log('TOtal members after adding:::' + membersList.length);
          return {
            isFetchingList: false,
            membersList: membersList,
            currentPage: page,
            hasMoreData: hasMoreData,
            selectedMembersList: selectedMembersList,
          };
        });
      })
      .catch((error) => {
        thisInstance.setState({
          isFetchingList: false,
        });
        console.log('Error while fetching list....');
        console.log(error);
      });
  }

  onEndReached = () => {
    if (this.state.hasMoreData && !this.state.isFetchingList) {
      let currentPage = this.state.currentPage;
      this.fetchMembers(
        currentPage + 1,
        this.state.searchText,
        this.state.sortStatus,
      );
    }
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
    this.onSortChanged(sortStatuses[index]);
  }

  onSortChanged(sortStatus) {
    this.setState({
      isFetchingList: true,
      membersList: [],
      sortStatus: sortStatus,
      selectedMembersList: [],
    });
    this.fetchMembers(1, this.state.searchText, sortStatus);
  }

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

  onSearchTextChanged = (searchText) => {
    this.setState({
      isFetchingList: true,
      searchText: searchText,
      membersList: [],
      selectedMembersList: [],
    });
    this.fetchMembers(1, searchText, this.state.sortStatus);
  };

  assignToMembers = () => {
    let totalSelected = 0;
    let memberIDList = [];
    let selectedMembersList = this.state.selectedMembersList;
    for (let i = 0; i < selectedMembersList.length; i++) {
      if (selectedMembersList[i] === true) {
        let member = this.state.membersList[i];
        memberIDList.push(member[Constants.KEY_MEMBER_ID]);
        totalSelected++;
      }
    }

    if (totalSelected === 0) {
      Utils.showAlert('', 'Please select at least one member to assign.');
      return;
    }

    this.setState({
      isLoading: true,
    });

    let thisInstance = this;

    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);
    data.append(Constants.KEY_WORKOUT_ID, this.state.workoutID);

    //data.append(Constants.KEY_MEMBER_ID, memberIDList);
    for (let i = 0; i < totalSelected; i++) {
      data.append(Constants.KEY_MEMBER_ID + '[' + i + ']', memberIDList[i]);
    }

    console.log('BODY:::');
    console.log(data);
    this.props.dispatchAssigntoMember(data);
    // this.props.assignToMemberReducer

    setTimeout(() => {
      if (this.props.assignToMemberReducer.success) {
        let valid = this.props.assignToMemberReducer.data[Constants.KEY_VALID];
        if (valid) {
          thisInstance.setState({
            isLoading: false,
          });

          thisInstance.showWorkoutAssignedAlert();
        }
      } else {
        let message = 'Some error occurred. Please try agian.';

        thisInstance.setState({
          isLoading: false,
        });
        Utils.showAlert('Error!', message);
      }
    }, 2000);
    // // fetch(Constants.API_URL_ASSIGN_WORKOUT, {
    // // 	method: 'post',
    // //     body: data,
    // // 	headers: {
    // //         'Content-type':'multipart/form-data',
    // // 		'Accept': 'application/json',
    // // 	}
    // //   })
    // // .then((response) => {
    // //     console.log("Response:::");
    // //     console.log(response);
    // //     return response.json();
    // // })
    // // .then((responseJson) => {
    //     console.log("Response JSON:::");
    //     console.log(responseJson);

    // })
    // .catch((error) => {
    //     thisInstance.setState({
    //         isLoading: false
    //     });
    //     console.log("Error while assigning workout....");
    //     console.log(error);
    //     Utils.showAlert("Some error occurred. Please try again.");
    // });
  };

  goBack = () => {
    this.props.navigation.pop();
  };

  showWorkoutAssignedAlert() {
    let thisInstance = this;
    Alert.alert(
      'Success',
      'Workout assigned successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            thisInstance.goBack();
          },
        },
      ],
      {cancelable: false},
    );
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
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
          data={this.state.membersList}
          keyExtractor={(item, index) => {
            return index + '';
          }}
          renderItem={({item, index}) => this.renderItem(item, index)}
          refreshing={false}
          ItemSeparatorComponent={this.renderSeparator}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={10}
          refreshing={this.state.isFetchingList}
        />

        <ActionButton
          buttonColor="#3fd458"
          onPress={this.assignToMembers}
          renderIcon={(active) =>
            active ? (
              <Icon name="md-checkmark" style={styles.actionButtonIcon} />
            ) : (
              <Icon name="md-checkmark" style={styles.actionButtonIcon} />
            )
          }
        />
        {this.state.isLoading ? (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator
              size="large"
              color="#161a1e"
              style={{marginTop: 35}}
            />
          </View>
        ) : null}
      </View>
    );
  }

  toggleSelection(index) {
    let selectedMembersList = this.state.selectedMembersList;
    selectedMembersList[index] = !selectedMembersList[index];

    this.setState({
      selectedMembersList: selectedMembersList,
    });
  }

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
    let membershipStatus = item[Constants.KEY_STATUS_MESSAGE];
    let membershipTextColor = item[Constants.KEY_COLOR_CODE];

    let checkIconName = this.state.selectedMembersList[index]
      ? 'ios-checkbox-outline'
      : 'ios-square-outline';

    return (
      <TouchableHighlight onPress={() => this.toggleSelection(index)}>
        <View style={styles.memberInfoContainer}>
          <Image
            style={styles.memberProfileImage}
            resizeMode={'cover'}
            source={{uri: profileImageURL}}
          />
          <View style={styles.profileInfoView}>
            <Text style={styles.profileNameText}>{profileName}</Text>
            <Text
              style={[
                styles.membershipStatusText,
                {color: membershipTextColor},
              ]}>
              {membershipStatus}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.toggleSelection(index);
            }}
            style={{width: 30, height: 30}}>
            <Icon
              name={checkIconName}
              style={[styles.actionButtonIcon, {color: 'blue'}]}
              size={30}
            />
          </TouchableOpacity>
        </View>
      </TouchableHighlight>
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
  },
  profileNameText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'left',
    flex: 1,
    flexWrap: 'wrap',
  },
  membershipStatusText: {
    fontSize: 14,
    width: '100%',
    textAlign: 'left',
    flex: 1,
    flexWrap: 'wrap',
  },
  moreIcon: {
    width: 5,
    height: 22.5,
  },
  addButtonBackground: {
    width: 40,
    height: 40,
    backgroundColor: '#3fd458',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 20,
  },
  addButtonImage: {
    width: 20.5,
    height: 21,
  },
  actionButtonIcon: {
    fontSize: 25,
    color: 'white',
  },
});

const mapStateToProps = (state) => ({
  assignToMemberReducer: state.assignToMemberReducer,
});
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      dispatchAssigntoMember: assignToMember,
    },
    dispatch,
  );
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AssignToMembersScreen);
