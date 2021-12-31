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
  Alert,
} from 'react-native';

import {getStatusBarHeight} from 'react-native-status-bar-height';

import RNIap, {
  InAppPurchase,
  Product,
  PurchaseError,
  Subscription,
  SubscriptionPurchase,
  finishTransactionIOS,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
  getSubscriptions,
} from 'react-native-iap';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {addplanaction} from '../Redux/Actions/addPlanAction';

class MembershipPlanDetails extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];
    let gymPhone = gymData[Constants.KEY_GYM_MOBILE_PHONE];

    let userData = userInfo[Constants.KEY_USER_DATA];
    let userID = userData[Constants.KEY_ID];

    let membershipPlan = properties.navigation.getParam(
      Constants.KEY_MEMBERSHIP_PLAN,
    );
    let ownerData = properties.navigation.getParam(Constants.KEY_OWNER_DATA);

    this.state = {
      gymID: gymID,
      gymPhone: gymPhone,
      userID: userID,
      isLoading: false,
      isFetchingData: true,
      isDataLoaded: false,
      membershipPlan: membershipPlan,
      ownerData: ownerData,
      isPurchaseBeingDone: false,
      productCode: '',
      planID: '',
      planAmount: '',
    };
  }

  componentDidMount() {
    this.getSubscriptions();
    this.initializeInAppPurchaseListener();
  }

  componentWillUnmount() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }
  }

  getSubscriptions() {
    this.setState({
      isLoading: true,
    });
    getSubscriptions([
      Constants.APPLE_IN_APP_PURCHASE_ID_MEMBERSHIP_PLAN_PRIME,
      Constants.APPLE_IN_APP_PURCHASE_ID_MEMBERSHIP_PLAN_REBRANDING,
    ])
      .then((skus) => {
        console.log('subscriptions:::');
        console.log(skus);
        this.setState({
          isLoading: false,
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
        });
        console.log('error while getting subscriptions list::');
        console.log(error);
      });
  }

  render() {
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
              data={[this.state.membershipPlan]}
              keyExtractor={(item, index) => {
                return index + '';
              }}
              renderItem={({item, index}) => this.renderItem(item, index)}
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

  renderItem(item) {
    let title = item[Constants.KEY_TITLE];
    let fullDescription = item[Constants.KEY_FULL_DESCRIPTION];
    let fee = item[Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE];
    let payButtonText = 'Pay Now';
    if (Platform.OS === 'ios') {
      let paidType = item[Constants.KEY_PAID_TYPE];

      if (paidType === Constants.PAID_TYPE_FREE) {
        payButtonText = 'Get Now';
      } else {
        payButtonText = 'Get Now';
      }
    }
    return (
      <View style={styles.planContainer}>
        <View style={styles.planInfoContainer}>
          <Text style={styles.planPriceText}>{'₹ ' + fee}</Text>
          <Text style={styles.planTitleText}>{title}</Text>
          <Text style={styles.planShortDescriptionText}>{fullDescription}</Text>
        </View>
        <View style={styles.rightButtonsContainer}>
          <TouchableOpacity
            onPress={() => this.payNow(item)}
            disabled={this.state.isPurchaseBeingDone}>
            <View style={styles.payNowButton}>
              <Text style={styles.payNowButtonText}>{payButtonText}</Text>
            </View>
          </TouchableOpacity>
          <View style={{flex: 1}} />
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

  async purchasePlanWithAppleInAppPurchase(item) {
    let id = item[Constants.KEY_ID];
    let productCode = '';
    let planAmount = item[Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE];

    if (id === Constants.MEMBERSHIP_PLAN_ID_PRIME) {
      productCode = Constants.APPLE_IN_APP_PURCHASE_ID_MEMBERSHIP_PLAN_PRIME;
    } else if (id === Constants.MEMBERSHIP_PLAN_ID_REBRANDING) {
      productCode =
        Constants.APPLE_IN_APP_PURCHASE_ID_MEMBERSHIP_PLAN_REBRANDING;
    }

    if (productCode !== '') {
      this.setState({
        isPurchaseBeingDone: true,
        productCode: productCode,
        planID: id,
        planAmount: planAmount,
      });
      try {
        await requestSubscription(productCode);
      } catch (err) {
        this.setState({
          isPurchaseBeingDone: false,
        });
        console.warn(err.code, err.message);
      }
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
      let valid = this.props.Getplanlist[Constants.KEY_VALID];

      if (valid === true) {
        Utils.showAlert('', 'Membership plan subscribed successfully.');
      } else {
        let message = 'Some error occurred. Please try again.';
        if (this.props.Getplanlist.message !== undefined) {
          message = this.props.Getplanlist.message;
        }
        Utils.showAlert('Error!', message);
      }
    });
    
  }

  payWithPaytm(item) {
    let id = item[Constants.KEY_ID];
    let fee = item[Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE];
    let params = {};
    params.order_id =
      'ORDS' + this.state.gymID + '_' + id + Math.ceil(Math.random() * 100000);
    params.customer_id = 'CUST' + this.state.gymID;
    params.amount = fee;
    params.customer_phone = this.state.gymPhone;
    params.plan_id = id;
    this.props.navigation.navigate('PayWithPaytm', params);
  }

  initializeInAppPurchaseListener() {
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt;
        console.log('receipt:::');
        console.log(receipt);
        if (receipt) {
          try {
            if (Platform.OS === 'ios') {
              finishTransactionIOS(purchase.transactionId);
            }
            const ackResult = await finishTransaction(purchase);
            console.log('ackResult', ackResult);
            this.setState({
              isPurchaseBeingDone: false,
            });
            this.saveDataInServer();
          } catch (ackErr) {
            this.setState({
              isPurchaseBeingDone: false,
            });
            console.warn('ackErr', ackErr);
          }

          //Alert.alert('purchase error in purchaseUpdatedListener:::::', JSON.stringify(receipt));
        }
      },
    );

    this.purchaseErrorSubscription = purchaseErrorListener((error) => {
      this.setState({
        isPurchaseBeingDone: false,
      });
      console.log('purchaseErrorListener', error);
      //Alert.alert('purchase error in purchaseErrorListener:::', JSON.stringify(error));
      Alert('Error!!!', 'Please try again later');
    });
  }

  saveDataInServer() {
    this.setState({
      isLoading: true,
    });

    let thisInstance = this;

    let date = new Date();
    let orderID =
      'ORDS' +
      this.state.gymID +
      '_' +
      this.state.planID +
      Math.ceil(Math.random() * 100000);
    let body =
      Constants.KEY_USER_ID +
      '=' +
      this.state.gymID +
      '&' +
      Constants.KEY_TRANSACTION_AMOUNT +
      '=' +
      this.state.planAmount +
      '&' +
      Constants.KEY_ORDER_ID +
      '=' +
      orderID +
      '&' +
      Constants.KEY_STATUS_PAYMENT +
      '=TXN_SUCCESS' +
      '&' +
      Constants.KEY_OWNER_MEMBERSHIP_ID +
      '=' +
      this.state.planID +
      '&' +
      Constants.KEY_PAYMENT_DATE +
      '=' +
      date;

    console.log('BODY:::' + body);
    this.props.DispatchPlanAdd(body).then(() => {
      let valid = this.props.Getplanlist[Constants.KEY_VALID];

      if (valid === true) {
        Utils.showAlert('', 'Membership plan subscribed successfully.');
      } else {
        let message = 'Some error occurred. Please try again.';
        if (this.props.Getplanlist.message !== undefined) {
          message = this.props.Getplanlist.message;
        }
        Utils.showAlert('Error!', message);
      }
    });
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
    flexDirection: 'column',
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
    justifyContent: 'flex-start',
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
    Getplanlist: state.addPlanRedux.addplan,

    Loading: state.addPlanRedux.isLoading,
    Success: state.addPlanRedux.success,
    error: state.addPlanRedux.error,
  };
};
function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      DispatchPlanAdd: addplanaction,
    },
    dispatch,
  );
}
export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(MembershipPlanDetails);
