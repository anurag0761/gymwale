import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  Linking,
} from 'react-native';

import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getPlanMembership} from '../Redux/Actions/getMembershipPlanAction';
import ownerPaytmRedux from '../Redux/Reducer/ownerPaytmRedux';
import {fetchOwnerpaytm} from '../Redux/Actions/ownerPaytmAction';
import {addplanaction} from '../Redux/Actions/addPlanAction';

class MembershipPlans extends Component {
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
      isLoading: false,
      isFetchingData: true,
      isDataLoaded: false,
      membershipPlans: [],
      ownerData: {},
    };
  }

  componentDidMount() {
    this.fetchMembershipPlans();
    console.log('<<>>');
    console.log(this.props.error);
    console.log('<<x>>');
  }

  render() {
    if (this.props.Success === false) {
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

    if (this.props.error == true) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() => {
              this.fetchMembershipPlans();
            }}
            style={{width: '100%'}}>
            <Text style={styles.button}>Retry to data</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
        style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: '#fafafa'}}>
          <View
            style={{
              height: getStatusBarHeight(true),
              backgroundColor: '#161a1e',
            }}>
            <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
          </View>
          <View style={{flex: 1, backgroundColor: '#fafafa'}}>
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={this.goBack}>
                <Image
                  style={styles.backIcon}
                  source={require('../../assets/images/back_icon_white.png')}
                />
              </TouchableOpacity>

              <Text style={[styles.tabTitle, {color: 'white'}]}>
                Membership Plan
              </Text>
            </View>
            <FlatList
              style={{width: '100%', padding: 20, backgroundColor: '#fafafa'}}
              data={this.state.membershipPlans}
              keyExtractor={(item, index) => {
                return index + '';
              }}
              renderItem={({item, index}) => this.renderItem(item, index)}
              ItemSeparatorComponent={this.renderSeparator}
            />
          </View>
          {this.props.Loading ? (
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

  fetchMembershipPlans() {
    this.setState({
      isFetchingData: true,
    });

    let thisInstance = this;
    // let body = Constants.KEY_TYPE+'='+ Constants.TYPE_LIVE;
    // console.log("BODY:::" + body);
    this.props.getPlanMembership();

    setTimeout(() => {
      let membershipPlans = [];
      let valid = this.props.Getplanlist[Constants.KEY_VALID];
      if (valid === true) {
        membershipPlans = this.props.Getplanlist[Constants.KEY_DATA];
      }
      console.log('Total membership plans:::' + membershipPlans.length);

      thisInstance.setState({
        membershipPlans: membershipPlans,
      });
    }, 1500);

    this.fetchWebsiteOwnerPaytmData();
  }

  fetchWebsiteOwnerPaytmData() {
    let thisInstance = this;
    let body = Constants.KEY_TYPE + '=' + Constants.TYPE_LIVE;
    console.log('BODY:::' + body);
    this.props.DispatchOwnerPaytm(body);
    setTimeout(() => {
      let ownerData = {};
      let valid = this.props.ownerPaytm[Constants.KEY_VALID];
      if (valid === true) {
        let data = this.props.ownerPaytm[Constants.KEY_DATA];
        ownerData[Constants.KEY_PAYTM_MERCHANT_KEY] =
          data[Constants.KEY_PAYTM_MERCHANT_KEY];
        ownerData[Constants.KEY_PAYTM_MERCHANT_MID] =
          data[Constants.KEY_PAYTM_MERCHANT_MID];

        ownerData[Constants.KEY_ADMIN_WHATSAPP] =
          this.props.ownerPaytm[Constants.KEY_ADMIN_WHATSAPP];
      }

      thisInstance.setState({
        ownerData: ownerData,
      });
    }, 3000);
  }

  goToMembershipPlanDetailsScreen(index) {
    let membershipPlan = this.state.membershipPlans[index];
    let params = {};
    params[Constants.KEY_MEMBERSHIP_PLAN] = membershipPlan;
    params[Constants.KEY_OWNER_DATA] = this.state.ownerData;
    this.props.navigation.navigate('MembershipPlanDetails', params);
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 5,
          width: '100%',
          backgroundColor: 'transparent',
        }}
      />
    );
  };

  renderItem(item, index) {
    let title = item[Constants.KEY_TITLE];
    let shortDescription = item[Constants.KEY_SHORT_DESCRIPTION];
    let fee = item[Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE];
    let payButtonText = 'Pay Now';
    if (Platform.OS === 'ios') {
      let paidType = item[Constants.KEY_PAID_TYPE];

      if (paidType === Constants.PAID_TYPE_FREE) {
        payButtonText = 'Get Now';
      } else {
        payButtonText = 'View More';
      }
    }
    return (
      <View style={styles.planContainer}>
        <View style={styles.planInfoContainer}>
          <Text style={styles.planPriceText}>{'₹ ' + fee}</Text>
          <Text style={styles.planTitleText}>{title}</Text>
          <Text style={styles.planShortDescriptionText}>
            {shortDescription}
          </Text>
        </View>
        <View style={styles.rightButtonsContainer}>
          {/*
                    <TouchableOpacity onPress={() => this.payNow(item)}>
                        <View style={styles.payNowButton}>
                            <Text style={styles.payNowButtonText}>{payButtonText}</Text>
                        </View>
                    </TouchableOpacity>
                    */}
          <View style={{flex: 1}} />
          <TouchableOpacity
            onPress={() => this.goToMembershipPlanDetailsScreen(index)}>
            <View style={styles.viewMoreButton}>
              <Text style={styles.viewMoreButtonText}>View More</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  payNow = (item) => {
    let paidType = item[Constants.KEY_PAID_TYPE];

    if (paidType === Constants.PAID_TYPE_FREE) {
      this.payFreePlanWithItem(item);
    } else {
      if (Platform.OS === 'ios') {
        this.purchasePlanWithAppleInAppPurchase(item);
      } else {
        this.payWithPaytm(item);
      }
    }
  };

  purchasePlanWithAppleInAppPurchase(item) {
    let id = item[Constants.KEY_ID];
    if (id === Constants.MEMBERSHIP_PLAN_ID_PRIME) {
      requestSubscription(
        Constants.APPLE_IN_APP_PURCHASE_ID_MEMBERSHIP_PLAN_PRIME,
      );
      /*
            RNIap.buyProduct('com.example.productId').then(purchase => {
                console.log("Receipt:::");
                console.log(purchase.transactionReceipt);
                this.setState({
                    receipt: purchase.transactionReceipt
                });
            // handle success of purchase product
            }).catch((error) => {
                console.log(error.message);
            })
            */
    }
  }

  openAdminWhatsApp() {
    let url =
      'https://api.whatsapp.com/send?phone=' +
      this.state.ownerData[Constants.KEY_ADMIN_WHATSAPP];
    Linking.openURL(url);
  }

  payFreePlanWithItem(item) {
    this.setState({
      isLoading: true,
    });

    let id = item[Constants.KEY_ID];

    let thisInstance = this;
    /*
        let data = new FormData();
        data.append(Constants.KEY_USER_ID, this.state.gymID);
        data.append(Constants.KEY_TRANSACTION_AMOUNT, "0");
        data.append(Constants.KEY_ORDER_ID, "");
        data.append(Constants.KEY_STATUS_PAYMENT, "");
        data.append(Constants.KEY_OWNER_MEMBERSHIP_ID, id);
        data.append(Constants.KEY_PAYMENT_DATE, new Date());
        */

    let date = new Date();
    let body =
      Constants.KEY_USER_ID +
      '=' +
      this.state.gymID +
      '&' +
      Constants.KEY_TRANSACTION_AMOUNT +
      '=0' +
      '&' +
      Constants.KEY_ORDER_ID +
      '=' +
      '&' +
      Constants.KEY_STATUS_PAYMENT +
      '=' +
      '&' +
      Constants.KEY_OWNER_MEMBERSHIP_ID +
      '=' +
      id +
      '&' +
      Constants.KEY_PAYMENT_DATE +
      '=' +
      date;

    console.log('BODY:::' + body);
    this.props.DispatchPlanAdd(body).then(() => {
      let valid = this.props.Getplanlistdata[Constants.KEY_VALID];

      if (valid === true) {
        Utils.showAlert('', 'Membership plan subscribed successfully.');
      } else {
        let message = 'Some error occurred. Please try again.';
        if (this.props.Getplanlistdata.message !== undefined) {
          message = this.props.Getplanlistdata.message;
        }
        Utils.showAlert('Error!', message);
      }
    });
  }

  payWithPaytm(item) {
    let id = item[Constants.KEY_ID];
    let fee = item[Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE];
    let params = {};
    params['order_id'] =
      'ORDS' + this.state.gymID + '_' + id + Math.ceil(Math.random() * 100000);
    params['customer_id'] = 'CUST' + this.state.gymID;
    params['amount'] = fee;
    params['customer_phone'] = this.state.gymPhone;
    params['plan_id'] = id;
    this.props.navigation.navigate('PayWithPaytm', params);
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
  planContainer: {
    width: '100%',
    borderRadius: 5,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  planInfoContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  planPriceText: {
    color: '#202020',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  planTitleText: {
    color: '#1d2b36',
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
    flexWrap: 'wrap',
    marginTop: 15,
  },
  planShortDescriptionText: {
    color: '#5d5d5d',
    fontSize: 12,
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'left',
    marginTop: 10,
    marginBottom: 10,
  },
  rightButtonsContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  payNowButton: {
    height: 25,
    borderWidth: 1,
    borderRadius: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderStyle: 'dashed',
    borderColor: '#f3f3f3',
    backgroundColor: '#f3f3f3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  payNowButtonText: {
    color: '#f5184c',
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
  },
  viewMoreButton: {
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  viewMoreButtonText: {
    fontSize: 12,
    color: '#159bcc',
    textTransform: 'uppercase',
  },
});

const mapStateToprops = (state) => {
  return {
    ownerPaytm: state.ownerPaytmRedux.ownerPaytm,

    Getplanlist: state.getMembershipPlanReducer.plans,
    Loading: state.getMembershipPlanReducer.isLoading,
    Success: state.getMembershipPlanReducer.success,
    error: state.getMembershipPlanReducer.error,
    Getplanlistdata: state.addPlanRedux.addplan,
  };
};
function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      getPlanMembership: getPlanMembership,
      DispatchOwnerPaytm: fetchOwnerpaytm,
      DispatchPlanAdd: addplanaction,
    },
    dispatch,
  );
}
export default connect(mapStateToprops, mapDispatchToprops)(MembershipPlans);
