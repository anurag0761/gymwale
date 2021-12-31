/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import CardView from 'react-native-rn-cardview';
import {withNavigationFocus} from 'react-navigation';
import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import AsyncStorage from '@react-native-community/async-storage';


import * as Utils from '../utils/Utils';
// import admob, { MaxAdContentRating } from '@react-native-firebase/admob';
import { BannerAd, BannerAdSize, TestIds } from '@react-native-firebase/admob';
import {connect} from 'react-redux';
import {stat} from 'react-native-fs';
import {bindActionCreators} from 'redux';
import {
  DeleteMembership,
  FetchSubscriptionAction,
} from '../Redux/Actions/FetchSubscriptionAction';

const screenWidth = Dimensions.get('window').width;
var _settings = {
  ram: false,

};
// const advert = firebase.admob().interstitial('ca-app-pub-4186764082078301/5640882568');
// const advert = firebase.admob().interstitial('ca-app-pub-3940256099942544/1033173712');


class SubscriptionsScreen extends Component {
  constructor(properties) {
    super(properties);


    let userInfo = globals.getSetting().userInfo;
    

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];
    let searchText = this.props.searchText;
    let sortStatus = this.props.sortStatus;

    let willShowNextButton =
      globals.getSetting()[globals.KEY_USER_ACCOUNT_SETUP_STATUS] ===
      globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED
        ? false
        : true;

    let willStopChildFlatListScrolling =
      properties.willStopChildFlatListScrolling;

  

    this.state = {
      subwaiting: true,
      ads: true,
      isFetchingList: true,
      membershipPlans: [],
      isExpanded: [],
      gymID: gymID,
      sortStatus: sortStatus,
      searchText: searchText,
      willShowNextButton: willShowNextButton,
      willStopChildFlatListScrolling,
    };
  }

  componentDidMount() {
    // firebase.initializeAplp(this)
    // const AdRequest = firebase.admob.AdRequest;
    // const request = new AdRequest();
    // request.addKeyword('foo').addKeyword('bar');
    // advert.loadAd(request.build());
    // advert.on('onAdLoaded', () => {
    //   console.log('Advert ready to show.');
    // });
    // setTimeout(() => {
    //   if (advert.isLoaded()) {
    //     advert.show();
    //     console.log('show', advert.isLoaded())
    //   } else {
    //   console.log('Unable to show interstitial - not loaded yet.', advert.isLoaded())
    //   }
    // }, 2000);
    

    this.fetchMembershipPlans(this.state.searchText);
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.updateData();
    });
  }
  //     componentDidMount() {
  //         console.log('admob')
  //         admob()
  //   .setRequestConfiguration({
  //     // Update all future requests suitable for parental guidance
  //     maxAdContentRating: MaxAdContentRating.PG,

  //     // Indicates that you want your content treated as child-directed for purposes of COPPA.
  //     tagForChildDirectedTreatment: true,

  //     // Indicates that you want the ad request to be handled in a
  //     // manner suitable for users under the age of consent.
  //     tagForUnderAgeOfConsent: true,
  //   })
  //   .then(() => {
  //     // Request config successfully set!
  //   });
  //     }
  // _retrieveData = async () => {
  //   try {
  //     const value = await AsyncStorage.getItem('@mydata');
  //     if (value !== null) {
  //       // We have data!!
  //       let data = JSON.parse(value)
  //     console.log('success',data['ram']);

  //     }
  //   } catch (error) {
  //     // Error retrieving data
  //     console.log('error',error);
  //   }
  // };

  // _storeData = async (key,val) => {
  //   _settings[key] = val;
  //   try {
  //     await AsyncStorage.setItem(
  //       '@mydata',
  //       JSON.stringify(_settings)
  //     );
  //     console.log('====================================');
  //     console.log('super','success',key,val);
  //     console.log('====================================');
  //   } catch (error) {
  //     // Error saving data
  //     console.log('====================================');
  //     console.log(error,'error');
  //     console.log('====================================');
  //   }
  // };


  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  async updateData() {
    await this.updateGymIno();
    this.fetchMembershipPlans(this.state.searchText);
  }

  async updateGymIno() {
    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    await this.promisedSetState({
      isFetchingList: true,
      membershipPlans: [],
      isExpanded: [],
      gymID: gymID,
    });
  }

  promisedSetState = (newState) => {
    return new Promise((resolve) => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  fetchMembershipPlans(searchText) {
    this.setState({
      subwaiting: true,
    });
    let thisInstance = this;

    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);

    console.log('DATA:::');
    console.log(data);

    let body = Constants.KEY_GYM_ID + '=' + this.state.gymID;
    this.props.getSubscription(body);

    setTimeout(() => {
      let valid = this.props.mydata.subscription[Constants.KEY_VALID];
      if (this.props.mydata.success) {
        if (valid) {
          let membershipPlanList = this.props.mydata.subscription[
            Constants.KEY_BODY
          ];

          let isExpanded = [];
          for (let i = 0; i < membershipPlanList.length; i++) {
            isExpanded.push(false);
          }
          this.setState({
            subwaiting: false,
          });
          console.log('Total membership plan::::' + membershipPlanList.length);
          if (thisInstance.props.onSubscriptionScreenMainHeightCalculated) {
            thisInstance.props.onSubscriptionScreenMainHeightCalculated(
              membershipPlanList.length * 100,
            );
            thisInstance.setState({
              isExpanded: this.state.isExpanded,
              isFetchingList: false,
              membershipPlans: membershipPlanList,
            });
          }
        }
      }
    }, 1000);

    //     } else {
    //         thisInstance.setState({
    //             isFetchingList:false,
    //         })
    //     }

    // })
    // .catch((error) => {
    //     thisInstance.setState({
    //         isFetchingList: false
    //     });
    //     console.log("Error while fetching list....");
    //     console.log(error);
    // });
  }

  onSearchTextChanged(searchText) {
    /*
        console.log("OnSearchTextChanged:::" + searchText);
        this.setState({
            isFetchingList: true,
            searchText:searchText,
        });
        */
  }

  addMembershipPlan = () => {
    let params = {};
    params[Constants.KEY_MEMBERSHIP_PLAN] = null;
    this.props.navigation.navigate('AddOrEditMembershipPlan', params);
  };

  editMembershipPlan(selectedIndex) {
    let membershipPlan = this.state.membershipPlans[selectedIndex];
    //let membershipPlanID = membershipPlan[Constants.KEY_ID];

    let params = {};
    params[Constants.KEY_MEMBERSHIP_PLAN] = membershipPlan;
    this.props.navigation.navigate('AddOrEditMembershipPlan', params);
  }

  deleteMembershipPlan(selectedIndex) {
    this.setState({
      isLoading: true,
    });

    let membershipPlan = this.state.membershipPlans[selectedIndex];
    let membershipPlanID = membershipPlan[Constants.KEY_ID];

    let thisInstance = this;

    let data = new FormData();
    data.append(Constants.KEY_MEMBERSHIP_ID, membershipPlanID);

    console.log('BODY:::');
    console.log(data);
    this.props.deleteMembershipPlan(data);

    setTimeout(() => {
      let valid = this.props.mydata.deletesub[Constants.KEY_VALID];
      console.log('memberdelete====================================');
      console.log(this.props.mydata.deletesub);
      console.log('memberdelete====================================');
      if (this.props.mydata.success) {
        if (valid) {
          let membershipPlans = thisInstance.state.membershipPlans;
          membershipPlans.splice(selectedIndex, 1);
          thisInstance.setState({
            isLoading: false,
            membershipPlans: membershipPlans,
          });
        }
      } else {
        let message = this.props.mydata.deletesub[Constants.KEY_MESSAGE];
        if (!(message && message.length > 0)) {
          message = 'Some error occurred. Please try agian.';
        }
        thisInstance.setState({
          isLoading: false,
        });
        Utils.showAlert('Error!', message);
      }
    }, 2000);
  }

  showDeleteConfirmationAlert(selectedIndex) {
    Alert.alert(
      'Delete Membership Plan',
      'Do you really want to delete this membership plan?',
      [
        {
          text: 'Yes, Delete',
          onPress: () => this.deleteMembershipPlan(selectedIndex),
        },
        {text: 'No', onPress: () => console.log('Not deleting...')},
      ],
      {cancelable: true},
    );
  }
  AdsHandler = () => {
    this.setState({ads: !this.state.ads});
    // this._retrieveData();
    // this._storeData('ram',true)
  };

  render() {
    if (this.state.subwaiting) {
      return (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color="#121619" />
        </View>
      );
    }

    return (
      <View style={styles.mainContainer}>
        <Button title={'Ads'} onPress={this.AdsHandler} />

        <FlatList
          style={{width: '100%', paddingHorizontal: 10}}
          data={this.state.membershipPlans}
          keyExtractor={(item, index) => {
            return index + '';
          }}
          renderItem={({item, index}) => this.renderItem(item, index)}
          onEndReached={() => {
            this.props.onEndReachedOfSubscriptionPage();
          }}
          onEndReachedThreshold={0.0}
          scrollEnabled={!this.state.willStopChildFlatListScrolling}
        />
        {this.state.willShowNextButton ? (
          <TouchableOpacity onPress={this.finish} style={{width: '100%'}}>
            <View style={styles.nextButton}>
              <Text style={{color: 'white', fontSize: 16, textAlign: 'center'}}>
                FINISH
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
        {/*
                <ActionButton
                    buttonColor="#3fd458"
                    onPress={this.addMembershipPlan}
                    style={{marginBottom: 20}}
                />
                */}
      </View>
    );
  }

  finish = () => {
    globals.setOneSetting(
      globals.KEY_USER_ACCOUNT_SETUP_STATUS,
      globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED,
    );
    this.props.goToNextPage();
  };

  renderItem(item, index) {
    let membershipPlan = item;
    let gymID = membershipPlan[Constants.KEY_GYM_ID];
    let name = membershipPlan[Constants.KEY_NAME];
    let duration = membershipPlan[Constants.KEY_MEMBERSHIP_DURATION];
    let colorCode = membershipPlan[Constants.KEY_MEMBERSHIP_PLAN_COLOR_CODE];
    let totalFee = membershipPlan[Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE];
    let taxStatus = membershipPlan[Constants.KEY_TAX_STATUS];
    let taxValue = membershipPlan[Constants.KEY_TAX_VALUE];
    let discountStatus = membershipPlan[Constants.KEY_DISCOUNT_STATUS];
    let discountType = membershipPlan[Constants.KEY_DISCOUNT_TYPE];
    let discountAmount = membershipPlan[Constants.KEY_DISCOUNT_AMOUNT];
    let totalFeeWithTaxAndDiscount =
      membershipPlan[Constants.KEY_TOTAL_FEE_WITH_TAX_AND_DISCOUNT];
    let installmentEnabled = membershipPlan[Constants.KEY_INSTALLMENT_ENABLED];
    let isExpanded = this.state.isExpanded[index];

    let willShowTaxInfo = taxStatus === Constants.STATUS_ACTIVE ? true : false;
    let willShowDiscountInfo =
      discountStatus === Constants.STATUS_ACTIVE ? true : false;
    let willShowSubtotal = false;
    if (willShowTaxInfo || willShowDiscountInfo) {
      willShowSubtotal = true;
    }

    let taxText = 'Tax (' + taxValue + '%)';
    let taxAmount = 0;
    if (taxValue.length > 0) {
      let taxPercentage = parseInt(taxValue);
      taxAmount = parseInt((parseInt(totalFee) * taxPercentage) / 100);
    }

    let discountText = '';
    let discountFee = 0;
    if (discountType === Constants.DISCOUNT_TYPE_PERCENTAGE) {
      discountText = 'Discount (' + discountAmount + '%)';
      if (discountAmount.length > 0) {
        let discountIntValue = parseInt(discountAmount);
        discountFee = parseInt((parseInt(totalFee) * discountIntValue) / 100);
      }
    } else {
      discountText = 'Discount (₹' + discountAmount + ')';
      if (discountAmount.length > 0) {
        discountFee = parseInt(discountAmount);
      }
    }

    let willShowEditOptions = true;
    if (gymID !== this.state.gymID) {
      willShowEditOptions = false;
    }
    let i = 1;
    let row = [];

    return (
      <View>
        {/* { (index + 1) % 2 === 0 ? */}
        <CardView
          cardElevation={4}
          maxCardElevation={4}
          radius={10}
          backgroundColor={'#ffffff'}
          style={styles.cardViewStyle}>
          <View style={styles.infoContainer}>
            <View style={styles.planTitleRow}>
              <View style={[styles.colorBar, {backgroundColor: colorCode}]} />
              <Text style={styles.planTitleText}>{name}</Text>
              <Text style={[styles.installmentStatus, {color: colorCode}]}>
                {installmentEnabled === Constants.YES ? 'Easy Installment' : ''}
              </Text>
            </View>
            <View style={styles.planTitleRow}>
              <Text style={styles.planDurationText}>
                {duration === '1' ? '1 month' : duration + ' months'}
              </Text>
              <Text style={styles.planFeeText}>{'₹ ' + totalFee}</Text>
            </View>
            {isExpanded && willShowTaxInfo ? (
              <View style={styles.planTitleRow}>
                <Text style={styles.planDurationText}>{taxText}</Text>
                <Text style={styles.planFeeText}>{'₹ ' + taxAmount}</Text>
              </View>
            ) : null}
            {isExpanded && willShowDiscountInfo ? (
              <View style={styles.planTitleRow}>
                <Text style={styles.planDurationText}>{discountText}</Text>
                <Text style={styles.planFeeText}>{'₹ ' + discountFee}</Text>
              </View>
            ) : null}
            {isExpanded && willShowSubtotal ? (
              <View style={styles.planTitleRow}>
                <Text style={styles.planDurationText}>SubTotal</Text>
                <Text style={styles.planFeeText}>
                  {'₹ ' + totalFeeWithTaxAndDiscount}
                </Text>
              </View>
            ) : null}
            {isExpanded && willShowEditOptions ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    this.editMembershipPlan(index);
                  }}>
                  <View style={styles.buttonStyle}>
                    <Text>Edit</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.showDeleteConfirmationAlert(index);
                  }}>
                  <View style={styles.buttonStyle}>
                    <Text>Delete</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.expandRow(index);
                }}>
                <View
                  style={{
                    width: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: '100%',
                      height: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    }}
                  />
                  <View
                    style={{
                      width: '100%',
                      height: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      marginTop: 2,
                    }}
                  />
                  <View
                    style={{
                      width: '100%',
                      height: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      marginTop: 2,
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </CardView>

        {this.state.ads && (index + 1) % 1 === 0 ? (
          <View
            style={{
              height: 70,
              width: '95%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
               {/* { advert.show()} */}
            <BannerAd
unitId={'ca-app-pub-4186764082078301/5640882568'}
size={BannerAdSize.FULL_BANNER}
requestOptions={{
 requestNonPersonalizedAdsOnly: true,
}}
/>
          </View>
        ) : null}
      </View>
    );
  }

  expandRow(selectedIndex) {
    let height = 0;
    let membershipPlan = this.state.membershipPlans[selectedIndex];
    let gymID = membershipPlan[Constants.KEY_GYM_ID];
    let taxStatus = membershipPlan[Constants.KEY_TAX_STATUS];
    let discountStatus = membershipPlan[Constants.KEY_DISCOUNT_STATUS];
    let willShowTaxInfo = taxStatus === Constants.STATUS_ACTIVE ? true : false;
    let willShowDiscountInfo =
      discountStatus === Constants.STATUS_ACTIVE ? true : false;
    let willShowSubtotal = false;
    if (willShowTaxInfo || willShowDiscountInfo) {
      willShowSubtotal = true;
    }

    let willShowEditOptions = true;
    if (gymID !== this.state.gymID) {
      willShowEditOptions = false;
    }

    if (willShowTaxInfo) {
      height += 28;
    }

    if (willShowDiscountInfo) {
      height += 28;
    }

    if (willShowSubtotal) {
      height += 28;
    }

    if (willShowEditOptions) {
      height += 34;
    }

    console.log('Will expand row in index...' + selectedIndex);
    let isExpanded = this.state.isExpanded;
    isExpanded[selectedIndex] = !isExpanded[selectedIndex];

    this.props.onSubscriptionPageListHeightChanged(
      isExpanded[selectedIndex],
      height,
    );

    this.setState({
      isExpanded: isExpanded,
    });
  }
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
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  profileNameText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'left',
  },
  membershipStatusText: {
    fontSize: 16,
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
  cardViewStyle: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  infoContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 5,
  },
  planTitleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  colorBar: {
    width: 4,
    borderRadius: 2,
    height: '100%',
  },
  planTitleText: {
    flexGrow: 1,
    marginLeft: 20,
    color: '#202020',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  installmentStatus: {
    fontSize: 16,
    textAlign: 'right',
    marginRight: 24,
  },
  planDurationText: {
    color: '#202020',
    fontSize: 18,
    textAlign: 'left',
    flexGrow: 1,
    marginLeft: 24,
  },
  planFeeText: {
    color: '#202020',
    fontSize: 18,
    textAlign: 'right',
    marginRight: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonStyle: {
    width: 80,
    height: 30,
    borderColor: 'rgba(32,32,32,0.8)',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  nextButton: {
    width: '100%',
    height: 35,
    backgroundColor: '#2c9fc9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => ({
  mydata: state.FetchSubscriptionReducer,
});
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getSubscription: FetchSubscriptionAction,
      deleteMembershipPlan: DeleteMembership,
    },
    dispatch,
  );
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withNavigationFocus(SubscriptionsScreen));
