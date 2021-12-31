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
  FlatList,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import CardView from 'react-native-rn-cardview';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getmygym} from '../Redux/Actions/GetmyGymAction';
import {MembershipForMember} from '../Redux/Actions/membershipformemberAction';

const screenWidth = Dimensions.get('window').width;

class GymSubscriptionsScreen extends Component {
  constructor(properties) {
    super(properties);

    let gymID = properties.gymID;
    let memberID = properties.memberID;
    let memberPhone = properties.memberPhone;
    let memberName = properties.memberName;
    this.parentNav = properties.parentNav;

    this.state = {
      isFetchingList: true,
      membershipPlans: [],
      isExpanded: [],
      gymID: gymID,
      memberID: memberID,
      memberPhone: memberPhone,
      memberName: memberName,
      gymData: {},
      hasPayTMInfo: false,
    };
  }

  componentDidMount() {
    this.fetchMembershipPlans();
  }

  render() {
    if (this.state.isFetchingList) {
      return (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color="#121619" />
        </View>
      );
    }

    return (
      <View style={styles.mainContainer}>
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

  fetchMembershipPlans() {
    this.setState({
      isFetchingList: true,
    });
    let thisInstance = this;

    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);

    console.log('DATA:::');
    console.log(data);

    let body = Constants.KEY_GYM_ID + '=' + this.state.gymID;
    this.props.MembershipForMember(body).then(() => {
      let valid =
        this.props.MemberShipForMemberReducer.data[Constants.KEY_VALID];
      if (valid) {
        let membershipPlanList =
          this.props.MemberShipForMemberReducer.data[Constants.KEY_DATA];
        let isExpanded = [];
        for (let i = 0; i < membershipPlanList.length; i++) {
          isExpanded.push(false);
        }
        console.log('Total membership plan::::' + membershipPlanList.length);
        if (thisInstance.props.onSubscriptionScreenMainHeightCalculated) {
          thisInstance.props.onSubscriptionScreenMainHeightCalculated(
            membershipPlanList.length * 100,
          );
        }

        let gymData =
          this.props.MemberShipForMemberReducer.data[Constants.KEY_GYM_DATA];
        gymData = gymData[0];
        let hasPayTMInfo = true;
        if (
          gymData[Constants.KEY_PAYTM_MERCHANT_KEY] === '' ||
          gymData[Constants.KEY_PAYTM_MERCHANT_MID] === ''
        ) {
          hasPayTMInfo = false;
        }

        thisInstance.setState({
          membershipPlans: membershipPlanList,
          isExpanded: isExpanded,
          isFetchingList: false,
          gymData: gymData,
          hasPayTMInfo: hasPayTMInfo,
        });
      } else {
        thisInstance.setState({
          isFetchingList: false,
        });
      }
    });
  }

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

    let willShowWhatsAppButton = false;

    if (
      installmentEnabled === Constants.YES ||
      this.state.hasPayTMInfo === false ||
      Platform.OS === 'ios'
    ) {
      willShowWhatsAppButton = true;
    }

    return (
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
              {willShowWhatsAppButton === true ? (
                <TouchableOpacity
                  onPress={() => {
                    this.openWhatsApp(index);
                  }}>
                  <View
                    style={{
                      backgroundColor: 'green',
                      color: 'white',
                      width: 120,
                      paddingVertical: 10,
                      borderRadius: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{color: 'white'}}>Whatsapp Chat</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    this.payNow(index);
                  }}>
                  <View
                    style={{
                      backgroundColor: '#007ee5',
                      color: 'white',
                      width: 120,
                      paddingVertical: 10,
                      borderRadius: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{color: 'white'}}>Pay Now</Text>
                  </View>
                </TouchableOpacity>
              )}
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

  payNow = (selectedIndex) => {
    let membershipPlan = this.state.membershipPlans[selectedIndex];
    let membershipID = membershipPlan[Constants.KEY_ID];
    let totalFee = membershipPlan[Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE];

    let params = {};
    params[Constants.KEY_MEMBER_ID] = this.state.memberID;
    params.order_id =
      'ORDS_m' +
      this.state.memberID +
      '_g' +
      this.state.gymID +
      '_p' +
      membershipID +
      '_' +
      Math.ceil(Math.random() * 100000);
    params.customer_id = 'CUST' + this.state.memberID;
    params.amount = totalFee;
    params.customer_phone = this.state.memberPhone;
    params[Constants.KEY_PAYTM_MERCHANT_MID] =
      this.state.gymData[Constants.KEY_PAYTM_MERCHANT_MID];
    params[Constants.KEY_PAYTM_MERCHANT_KEY] =
      this.state.gymData[Constants.KEY_PAYTM_MERCHANT_KEY];
    params[Constants.KEY_GYM_ID] = this.state.gymID;
    params[Constants.KEY_MEMBERSHIP_ID] = membershipID;
    if (this === undefined) {
      console.log('this is undefined');
    }
    if (this.props === undefined) {
      console.log('this.props is undefined');
    }

    if (this.props.navigation === undefined) {
      console.log('this.props.navigation is undefined');
    }
    this.parentNav.navigate('RenewMembershipWithPaytm', params);
  };

  openWhatsApp(selectedIndex) {
    let membershipPlan = this.state.membershipPlans[selectedIndex];
    let planName = membershipPlan[Constants.KEY_NAME];
    let phoneNumber =
      this.state.gymData[Constants.KEY_COUNTRY_ID] +
      this.state.gymData[Constants.KEY_PHONE];
    let message =
      'Hello  how to buy ' +
      planName +
      ' membership online?  From - ' +
      this.state.memberName +
      ' and contact no. is ' +
      this.state.memberPhone;
    let url =
      'https://api.whatsapp.com/send?phone=' + phoneNumber + '&text=' + message;
    Linking.openURL(url);
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

const mapStateToprops = (state) => {
  return {
    MemberShipForMemberReducer: state.MemberShipForMemberReducer,
  };
};

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      MembershipForMember: MembershipForMember,
    },
    dispatch,
  );
}

export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(GymSubscriptionsScreen);
