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
} from 'react-native';
import {WebView} from 'react-native-webview';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

class RenewMembershipWithPaytm extends Component {
  constructor(properties) {
    super(properties);

    let memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, '');
    let order_id = properties.navigation.getParam('order_id', '');
    let customer_id = properties.navigation.getParam('customer_id', '');
    let customer_phone = properties.navigation.getParam('customer_phone', '');
    let amount = properties.navigation.getParam('amount', '');
    let merchantPaymentID = properties.navigation.getParam(
      Constants.KEY_PAYTM_MERCHANT_MID,
      '',
    );
    let merchantPaymentKey = properties.navigation.getParam(
      Constants.KEY_PAYTM_MERCHANT_KEY,
      '',
    );
    let gymID = properties.navigation.getParam(Constants.KEY_GYM_ID, '');
    let membershipID = properties.navigation.getParam(
      Constants.KEY_MEMBERSHIP_ID,
      '',
    );

    this.state = {
      memberID: memberID,
      customer_id: customer_id,
      customer_phone: customer_phone,
      amount: amount,
      order_id: order_id,
      isLoading: false,
      isSavingDataToServer: false,
      merchantPaymentID: merchantPaymentID,
      merchantPaymentKey: merchantPaymentKey,
      gymID: gymID,
      membershipID: membershipID,
    };
  }

  componentDidMount() {}

  render() {
    let url =
      'https://gymvale.com/app/paytm/paytm_payment.php?order_id=' +
      this.state.order_id +
      '&customer_id=' +
      this.state.customer_id +
      '&customer_phone=' +
      this.state.customer_phone +
      '&amount=' +
      this.state.amount +
      '&merchant_id=' +
      encodeURIComponent(this.state.merchantPaymentID) +
      '&merchant_key=' +
      encodeURIComponent(this.state.merchantPaymentKey);
    //url = encodeURI(url);
    console.log('URL:::' + url);
    return (
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

            <Text style={[styles.tabTitle, {color: 'white'}]}>Payment</Text>
          </View>
          <WebView
            source={{uri: url}}
            style={{flex: 1}}
            javaScriptEnabled={true}
            startInLoadingState={true}
            scrollEnabled={true}
            useWebKit={true}
            onNavigationStateChange={(navigationState) => {
              if (navigationState.title == 'true') {
                this.saveDataInServer();
              } else if (navigationState.title == 'false') {
                Utils.showAlert(
                  'Error!',
                  'Transaction failed. Please try again.',
                );
              }
            }}
          />
        </View>
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

  goBack = () => {
    this.props.navigation.pop();
  };

  saveDataInServer() {
    if (this.state.isSavingDataToServer) {
      return;
    }

    this.setState({
      isLoading: true,
      isSavingDataToServer: true,
    });

    let thisInstance = this;

    let date = new Date();
    let body =
      Constants.KEY_GYM_ID +
      '=' +
      this.state.gymID +
      '&' +
      Constants.KEY_MEMBER_ID +
      '=' +
      this.state.memberID +
      '&' +
      Constants.KEY_MEMBERSHIP_ID +
      '=' +
      this.state.membershipID;

    console.log('BODY:::' + body);
    fetch(Constants.API_URL_MEMBERSHIP_PAYMENT_RENEW, {
      method: 'post',
      body: body,
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        let valid = responseJson[Constants.KEY_VALID];

        thisInstance.setState({
          isLoading: false,
        });

        if (valid === true) {
          Utils.showAlert('', 'Membership plan subscribed successfully.');
        } else {
          let message = 'Some error occurred. Please try again.';
          if (responseJson['message'] !== undefined) {
            message = responseJson['message'];
          }
          Utils.showAlert('Error!', message);
        }
      })
      .catch((error) => {
        thisInstance.setState({
          isLoading: false,
        });
        console.log('Error while fetching list....');
        console.log(error);
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
});

export default RenewMembershipWithPaytm;
