import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  Dimensions,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
  TouchableOpacity,
  Linking,
  TouchableHighlight,
} from 'react-native';

import ActionButton from 'react-native-action-button';
import {withNavigationFocus} from 'react-navigation';
import ActionSheet from 'react-native-action-sheet';
import {getStatusBarHeight} from 'react-native-status-bar-height';

const screenWidth = Dimensions.get('window').width;

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {connect} from 'react-redux';
import {fetchMembers} from '../Redux/Actions/FetchMemberAction';
import {bindActionCreators} from 'redux';
import {deleteMember} from '../Redux/Actions/DeleteMemberAction';
import {RenewMessage} from '../Redux/Actions/RenewMeesageAction';

const ACTION_ADD_PLAN = 'Add Plan';
const ACTION_PAYMENT = 'Payment';
const ACTION_SEND_SMS = 'Send SMS';
const ACTION_EDIT = 'Edit';
const ACTION_DELETE = 'Delete';
const ACTION_CANCEL = 'Cancel';

const moreActionsIOS = [
  ACTION_ADD_PLAN,
  ACTION_PAYMENT,
  ACTION_SEND_SMS,
  ACTION_EDIT,
  ACTION_DELETE,
  ACTION_CANCEL,
];

const moreActions = [
  ACTION_ADD_PLAN,
  ACTION_PAYMENT,
  ACTION_SEND_SMS,
  ACTION_EDIT,
  ACTION_DELETE,
];

class MembersScreen extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];
    let searchText = this.props.searchText;
    let sortStatus = this.props.sortStatus;

    this.state = {
      isFetchingList: true,
      membersList: [],
      gymID: gymID,
      currentPage: 0,
      sortStatus: sortStatus,
      hasMoreData: true,
      searchText: searchText,
      isLoading: false,
      willShowEnlargedProfileImage: false,
      profileImageURL: null,
      largeProfileImageURL: null,
      willShowUpgradePlanAlert: false,
    };
  }

  componentDidMount() {
    //let currentPage = this.state.currentPage;
    this.fetchMembers(1, this.state.searchText);
    let thisInstance = this;
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      thisInstance.updateData();
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  async updateData() {
    await this.updateGymInfo();
    this.fetchMembers(1, this.state.searchText);
  }

  async updateGymInfo() {
    let userInfo = globals.getSetting().userInfo;
    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    await this.promisedSetState({
      membersList: [],
      gymID: gymID,
      currentPage: 0,
      hasMoreData: true,
      willShowEnlargedProfileImage: false,
    });
  }

  promisedSetState = (newState) => {
    let thisInstance = this;
    return new Promise((resolve) => {
      thisInstance.setState(newState, () => {
        resolve();
      });
    });
  };

  fetchMembers(page, searchText) {
    // this.setState({
    //     isFetchingList: true,
    // });
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
      this.state.sortStatus +
      '&' +
      Constants.KEY_S_SEARCH +
      '=' +
      searchText +
      '&' +
      Constants.KEY_PAGE +
      '=' +
      page;
    // console.log("BODY:::" + body);
    this.props.FetchMember(body).then(() => {
   

      let limit = this.props.gymMemberList[Constants.KEY_LIMIT];

      let members = this.props.gymMemberList[Constants.KEY_DATA];
      console.log('FEtched members:::' + members.length);
      let hasMoreData = true;
      if (members.length < limit) {
        hasMoreData = false;
      }
      thisInstance.setState((previousState) => {
        let membersList = previousState.membersList;
        console.log('Total members::' + membersList.length);
        if (page === 1) {
          membersList = [];
        }
        membersList.push(...members);
        console.log('TOtal members after adding:::' + membersList.length);
        return {
          isFetchingList: false,
          membersList: membersList,
          currentPage: page,
          hasMoreData: hasMoreData,
        };
      });
    });

   
  }

  onEndReached = () => {
    if (this.state.hasMoreData && !this.state.isFetchingList) {
      let currentPage = this.state.currentPage;
      this.fetchMembers(currentPage + 1, this.state.searchText);
    }
  };
  /*
    onSortChanged(sortStatus){
        console.log("onSortChanged:::" + sortStatus);
        this.setState({
            isFetchingList: true,
            membersList:[],
            sortStatus:sortStatus,
        });
        this.fetchMembers(1, this.state.searchText);
    }
    */
  onSearchTextChanged(searchText) {
    console.log('OnSearchTextChanged:::' + searchText);
    this.setState({
      isFetchingList: true,
      searchText: searchText,
      membersList: [],
    });
    this.fetchMembers(1, searchText);
  }

  addMember = () => {
    this.props.parentNav.navigate('AddOrEditMember');
  };

  render() {
    /*
        if(this.state.isFetchingList) {
            return (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="large" color="#121619" />
                </View>
            );
        }
        */

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

        <FlatList
          style={{width: '100%'}}
          data={this.state.membersList}
          keyExtractor={(item, index) => {
            return index + '';
          }}
          renderItem={({item, index}) => this.renderItem(item, index)}
          ItemSeparatorComponent={this.renderSeparator}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.3}
          refreshing={this.state.isFetchingList}
          // onRefresh={()=>this.fetchMembers(1, this.state.searchText)}
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

        <ActionButton buttonColor="#3fd458" onPress={this.addMember} />
        {this.props.Loading ? (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator
              size="large"
              color="#161a1e"
              style={{marginTop: 35}}
            />
          </View>
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

  goToMembershipPlansScreen = () => {
    this.props.parentNav.navigate('MembershipPlans');
  };

  showMoreActions(index) {
    this.setState({
      selectedIndex: index,
    });
    ActionSheet.showActionSheetWithOptions(
      {
        title: null,
        options: Platform.OS == 'ios' ? moreActionsIOS : moreActions,
        cancelButtonIndex: moreActionsIOS.length - 1,
        destructiveButtonIndex: moreActionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        if (buttonIndex !== undefined && buttonIndex < moreActions.length) {
          this.onMoreActionSelected(buttonIndex, index);
        }
      },
    );
  }

  onMoreActionSelected(actionIndex, selectedItemIndex) {
    let action = moreActionsIOS[actionIndex];
    console.log('Selected Action:::');
    if (action === ACTION_ADD_PLAN) {
      this.addPlan(selectedItemIndex);
    } else if (action === ACTION_PAYMENT) {
      this.addPayment(selectedItemIndex);
    } else if (action == ACTION_SEND_SMS) {
      this.sendSMS(selectedItemIndex);
    } else if (action == ACTION_EDIT) {
      let canUsePaidFeatures =
        globals.getSetting()[globals.KEY_CAN_USE_PAID_FEATURES];
      if (canUsePaidFeatures === 'false') {
        this.editMember(selectedItemIndex);
      } else {
        this.setState({
          willShowUpgradePlanAlert: true,
        });
      }
    } else if (action === ACTION_DELETE) {
      let canUsePaidFeatures =
        globals.getSetting()[globals.KEY_CAN_USE_PAID_FEATURES];
      if (canUsePaidFeatures === 'true') {
        this.showDeleteConfirmationAlert(selectedItemIndex);
      } else {
        this.setState({
          willShowUpgradePlanAlert: true,
        });
      }
    }
  }

  addPlan(selectedIndex) {
    let member = this.state.membersList[selectedIndex];
    let params = {};
    params[Constants.KEY_MEMBER_ID] = member[Constants.KEY_MEMBER_ID];
    params[Constants.KEY_MEMBER_MEMBERSHIP_ID] =
      member[Constants.KEY_MEMBER_MEMBERSHIP_ID];
    this.props.parentNav.navigate('SubscribePlanForMember', params);
  }

  addPayment(selectedIndex) {
    let member = this.state.membersList[selectedIndex];
    let params = {};
    params[Constants.KEY_MEMBER_ID] = member[Constants.KEY_MEMBER_ID];
    params[Constants.KEY_MEMBER_MEMBERSHIP_ID] =
      member[Constants.KEY_MEMBER_MEMBERSHIP_ID];
    this.props.parentNav.navigate('ReceivePayment', params);
  }

  sendSMS(selectedIndex) {
    let member = this.state.membersList[selectedIndex];

    let phone = member[Constants.KEY_PHONE];
    /*
            let url = "https://api.whatsapp.com/send?phone=91"+phone;
            Linking.openURL(url);
            */

    let url = 'sms:' + phone;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.log('Unsupported url: ' + url);
          Utils.showAlert(
            'Send SMS',
            'There is no option to send SMS in this device.',
          );
        } else {
          let thisInstance = this;

          this.setState({
            isLoading: true,
          });

          let data = new FormData();
          data.append(Constants.KEY_GYM_ID, this.state.gymID);
          data.append(Constants.KEY_MEMBER_ID, member[Constants.KEY_MEMBER_ID]);
          data.append(
            Constants.KEY_MEMBERSHIP_ID,
            member[Constants.KEY_MEMBER_MEMBERSHIP_ID],
          );
          data.append(Constants.KEY_MEMBER_PHONE, phone);

          console.log('BODY:::');
          console.log(data);

          this.props.DispatchMessage(data);
          setTimeout(() => {
            if (this.props.messageSend.success) {
              let valid = this.props.messageSend.data[Constants.KEY_VALID];
              if (valid) {
                let smsMessage =
                  this.props.messageSend.data[Constants.KEY_SMS_MESSAGE];

                if (Platform.OS === 'ios') {
                  url += '&';
                } else {
                  url += '?';
                }
                url += 'body=' + smsMessage;

                thisInstance.setState({
                  isLoading: false,
                });

                Linking.openURL(url);
              }
            } else {
              let message = this.props.messageSend.data[Constants.KEY_MESSAGE];
              if (!(message && message.length > 0)) {
                message = 'Some error occurred. Please try agian.';
              }
              thisInstance.setState({
                isLoading: false,
              });
              Utils.showAlert('Error!', message);
            }
          }, 2000);

          //return Linking.openURL(url)
        }
      })
      .catch((err) => console.error('An error occurred', err));
  }

  editMember(selectedIndex) {
    let member = this.state.membersList[selectedIndex];
    console.log('Selected Member:::' + member);
    this.props.parentNav.navigate('AddOrEditMember', member);
  }

  deleteMember(selectedIndex) {
    this.setState({
      isLoading: true,
    });

    let member = this.state.membersList[selectedIndex];
    let memberID = member[Constants.KEY_MEMBER_ID];

    let thisInstance = this;

    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);
    data.append(Constants.KEY_MEMBER_ID, memberID);

    console.log('BODY:::');
    console.log(data);
    this.props.deleteMember(data);
    setTimeout(() => {
      console.log(this.props.DeleteMemberReducer.data);
      let valid = this.props.DeleteMemberReducer.data[Constants.KEY_VALID];
      if (this.props.DeleteMemberReducer.success) {
        if (valid) {
          let membersList = thisInstance.state.membersList;
          membersList.splice(selectedIndex, 1);
          thisInstance.setState({
            isLoading: false,
            membersList: membersList,
          });
        }
      } else {
        let message =
          this.props.DeleteMemberReducer.data[Constants.KEY_MESSAGE];
        if (!(message && message.length > 0)) {
          message = 'Some error occurred. Please try agian.';
        }
        thisInstance.setState({
          isLoading: false,
        });
        Utils.showAlert('Error!', message);
      }
    }, 2000);
    // fetch(Constants.API_URL_DELETE_MEMBER, {
    //     method: 'post',
    //     body: data,
    //     headers: {
    //         'content-type':'multipart/form-data',
    //         'Accept': 'application/json',
    //     }
    //   })
    // .then((response) => {
    //     return response.json();
    // })
    // .then((responseJson) => {
    //     console.log("Response JSON:::");

    // })
    // .catch((error) => {
    //     thisInstance.setState({
    //         isLoading: false
    //     });
    //     console.log("Error while adding guest....");
    //     console.log(error);
    //     Utils.showAlert("Some error occurred. Please try again.");
    // });
  }

  showDeleteConfirmationAlert(selectedIndex) {
    Alert.alert(
      'Delete Member',
      'Do you really want to delete this member?',
      [
        {text: 'Yes, Delete', onPress: () => this.deleteMember(selectedIndex)},
        {text: 'No', onPress: () => console.log('Not deleting...')},
      ],
      {cancelable: false},
    );
  }

  showMemberDetails(selectedIndex) {
    let member = this.state.membersList[selectedIndex];
    let params = {};
    params[Constants.KEY_MEMBER_ID] = member[Constants.KEY_MEMBER_ID];
    params[Constants.KEY_MEMBER_MEMBERSHIP_ID] =
      member[Constants.KEY_MEMBER_MEMBERSHIP_ID];
    this.props.parentNav.navigate('MemberDetailsScreen', params);
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
    let largeProfileImageURL =
      Constants.IMAGE_BASE_URL_LARGE + item[Constants.KEY_IMAGE];
    let profileName = item[Constants.KEY_NAME];
    let membershipStatus = item[Constants.KEY_STATUS_MESSAGE];
    let membershipTextColor = item[Constants.KEY_COLOR_CODE];
    return (
      <TouchableHighlight
        onPress={() => {
          this.showMemberDetails(index);
        }}>
        <View style={styles.memberInfoContainer}>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                willShowEnlargedProfileImage: true,
                profileImageURL: profileImageURL,
                largeProfileImageURL: largeProfileImageURL,
              });
            }}>
            <Image
              style={styles.memberProfileImage}
              resizeMode={'cover'}
              source={{uri: profileImageURL}}
            />
          </TouchableOpacity>

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
              this.showMoreActions(index);
            }}
            style={{width: 20, height: 30}}>
            <Image
              style={styles.moreIcon}
              source={require('../../assets/images/more.png')}
              resizeMode={'cover'}
            />
          </TouchableOpacity>
        </View>
      </TouchableHighlight>
    );
  }

  goToMembershipPlansScreen = () => {
    this.props.navigation.navigate('MembershipPlans');
  };
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 10,
    flex: 1,
  },
  profileNameText: {
    color: '#343434',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
    flexWrap: 'wrap',
    textAlignVertical: 'center',
  },
  membershipStatusText: {
    fontSize: 12,
    width: '100%',
    textAlign: 'left',
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
  closeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'cover',
    marginRight: 10,
  },
});
const mapStateToprops = (state) => {
  return {
    gymMemberList: state.FetchMemberReducer.gymMember,
    DeleteMemberReducer: state.DeleteMemberReducer,
    messageSend: state.RenewMessageReducer,
    Loading: state.FetchMemberReducer.isLoading,
    Success: state.FetchMemberReducer.success,
  };
};
function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      FetchMember: fetchMembers,
      deleteMember: deleteMember,
      DispatchMessage: RenewMessage,
    },
    dispatch,
  );
}

export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(withNavigationFocus(MembersScreen));
