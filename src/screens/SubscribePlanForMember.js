import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import DatePicker from 'react-native-datepicker';
import RNPickerSelect from 'react-native-picker-select';
import {withNavigationFocus} from 'react-navigation';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import ActionSheet from 'react-native-action-sheet';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {RenewMembership} from '../Redux/Actions/RenewMembershipAction';
import {paymentRecieve} from '../Redux/Actions/RecievePaymentAction';
import {FetchSubscriptionAction} from '../Redux/Actions/FetchSubscriptionAction';

const membershipDurations = [
  {label: '1 Month', value: '1'},
  {label: '2 Months', value: '2'},
  {label: '3 Months', value: '3'},
  {label: '4 Months', value: '4'},
  {label: '5 Months', value: '5'},
  {label: '6 Months', value: '6'},
  {label: '7 Months', value: '7'},
  {label: '8 Months', value: '8'},
  {label: '9 Months', value: '9'},
  {label: '10 Months', value: '10'},
  {label: '11 Months', value: '11'},
  {label: '12 Months', value: '12'},
];

//const membershipPlansOptions = [];

class SubscribePlanForMember extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    let userData = userInfo[Constants.KEY_USER_DATA];
    let userID = userData[Constants.KEY_ID];

    let memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID);
    let membershipID = properties.navigation.getParam(
      Constants.KEY_MEMBER_MEMBERSHIP_ID,
    );

    console.log('memberID:::' + memberID + '::: membershipID::' + membershipID);

    this.state = {
      isFetchingList: true,
      isLoading: false,
      membershipPlans: [],
      membershipPlansOptions: [],
      membershipPlansOptionsIOS: [],
      membershipPlansOptionsAndroid: [],
      gymID: gymID,
      userID: userID,
      memberID: memberID,
      membershipID: membershipID,
      selectedMembershipPlanIndex: '',
      selectedMembershipPlanID: '',
      membershipDuration: '',
      numberOfValidDays: '',
      totalFee: '',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '',
      isPaymentReceived: false,
      paymentReceivedAmount: '',
      willShowNextInstallmentDate: false,
      nextInstallmentDate: '',
    };
  }

  componentDidMount() {
    //this.fetchMembershipPlans();
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.fetchMembershipPlans();
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  fetchMembershipPlans() {
    this.setState({
      isFetchingList: true,
    });
    let thisInstance = this;

    /*
        let data = new FormData();
        data.append(Constants.KEY_GYM_ID, this.state.gymID);

        console.log("DATA:::");
        console.log(data);
        */

    let body = Constants.KEY_GYM_ID + '=' + this.state.gymID;
    this.props.getSubscription(body).then(() => {
      let valid = this.props.mydata.subscription[Constants.KEY_VALID];
      if (valid) {
        let membershipPlanList =
          this.props.mydata.subscription[Constants.KEY_BODY];
        let membershipPlansOptions = [];
        let membershipPlansOptionsIOS = [];
        let membershipPlansOptionsAndroid = [];
        let selectedMembershipPlanIndex = '';
        for (let i = 0; i < membershipPlanList.length; i++) {
          let plan = membershipPlanList[i];
          let planName = plan[Constants.KEY_NAME];
          membershipPlansOptions.push({
            label: planName,
            value: '' + i,
          });
          membershipPlansOptionsIOS.push(planName);
          membershipPlansOptionsAndroid.push(planName);
        }
        membershipPlansOptionsIOS.push('Cancel');
        thisInstance.setState({
          membershipPlans: membershipPlanList,
          membershipPlansOptions: membershipPlansOptions,
          selectedMembershipPlanIndex: selectedMembershipPlanIndex,
          membershipPlansOptionsIOS: membershipPlansOptionsIOS,
          membershipPlansOptionsAndroid: membershipPlansOptionsAndroid,
          isFetchingList: false,
        });
      } else {
        thisInstance.setState({
          isFetchingList: false,
        });
      }
    });
  
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  onMembershipPlanChanged(planIndex) {
    if (planIndex === null) {
      this.setState({
        selectedMembershipPlanIndex: '',
        endDate: '',
        totalFee: '',
        paymentReceivedAmount: '',
        selectedMembershipPlanID: '',
        membershipDuration: '',
        numberOfValidDays: '',
        nextInstallmentDate: '',
        willShowNextInstallmentDate: false,
      });
      return;
    }

    let membershipPlan = this.state.membershipPlans[parseInt(planIndex)];
    let membershipPlanID = membershipPlan[Constants.KEY_ID];
    let totalFee =
      membershipPlan[Constants.KEY_TOTAL_FEE_WITH_TAX_AND_DISCOUNT];
    let monthDuration = membershipPlan[Constants.KEY_MEMBERSHIP_DURATION];
    let endDateString = this.getEndDateWithMonthDuration(
      monthDuration,
      this.state.startDate,
    );
    let paymentReceivedAmount = '';
    let nextInstallmentDate = '';
    let willShowNextInstallmentDate = false;
    if (this.state.isPaymentReceived) {
      paymentReceivedAmount = totalFee;
    }

    if (membershipPlan[Constants.KEY_INSTALLMENT_ENABLED] === Constants.YES) {
      willShowNextInstallmentDate = true;
      let installmentPeriod = membershipPlan[Constants.KEY_INSTALLMENT_DAYS];
      nextInstallmentDate = this.getNextInstallmentDateWithInstallmentPeriod(
        installmentPeriod,
        this.state.startDate,
      );
    }

    this.setState({
      selectedMembershipPlanIndex: planIndex,
      endDate: endDateString,
      totalFee: totalFee,
      paymentReceivedAmount: paymentReceivedAmount,
      selectedMembershipPlanID: membershipPlanID,
      membershipDuration: '',
      numberOfValidDays: '',
      nextInstallmentDate: nextInstallmentDate,
      willShowNextInstallmentDate: willShowNextInstallmentDate,
    });
  }

  onMembershipDurationChanged(duration) {
    let endDateString = '';
    if (duration) {
      endDateString = this.getEndDateWithMonthDuration(
        duration,
        this.state.startDate,
      );
    }

    this.setState({
      membershipDuration: duration,
      endDate: endDateString,
    });
  }

  onTotalFeeChanged = (text) => {
    this.setState({
      totalFee: text,
    });
  };

  onNumberOfValidDaysChanged = (text) => {
    this.setState({
      numberOfValidDays: text,
    });
  };

  onStartDateChanged = (date) => {
    let endDateString = '';
    let nextInstallmentDate = '';
    if (this.state.selectedMembershipPlanIndex !== '') {
      let membershipPlan =
        this.state.membershipPlans[
          parseInt(this.state.selectedMembershipPlanIndex)
        ];
      let monthDuration = membershipPlan[Constants.KEY_MEMBERSHIP_DURATION];
      if (this.state.membershipDuration.length > 0) {
        monthDuration = this.state.membershipDuration;
      }
      endDateString = this.getEndDateWithMonthDuration(monthDuration, date);

      if (membershipPlan[Constants.KEY_INSTALLMENT_ENABLED] == Constants.YES) {
        let installmentPeriod = membershipPlan[Constants.KEY_INSTALLMENT_DAYS];
        nextInstallmentDate = this.getNextInstallmentDateWithInstallmentPeriod(
          installmentPeriod,
          date,
        );
      }
    }

    this.setState({
      startDate: date,
      endDate: endDateString,
      nextInstallmentDate: nextInstallmentDate,
    });
  };

  onNextInstallmentDateChanged = (date) => {
    this.setState({
      nextInstallmentDate: date,
    });
  };

  onTogglePaymentReceived = (value) => {
    if (value === true) {
      let totatlFees = this.state.totalFee;
      this.setState({
        isPaymentReceived: value,
        paymentReceivedAmount: totatlFees,
      });
    } else {
      this.setState({
        isPaymentReceived: value,
        paymentReceivedAmount: '',
      });
    }
  };

  onPaymentReceivedAmountChanged = (text) => {
    this.setState({
      paymentReceivedAmount: text,
    });
  };

  getEndDateWithMonthDuration(monthDuration, startDate) {
    let durationInMonths = parseInt(monthDuration);
    let daysToAddToEndDate = durationInMonths * 30;
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToAddToEndDate);
    return endDate.toISOString().substring(0, 10);
  }

  getNextInstallmentDateWithInstallmentPeriod(installmentPeriod, startDate) {
    let numberOfDays = parseInt(installmentPeriod);
    let nextInstallmentDate = new Date(startDate);
    nextInstallmentDate.setDate(nextInstallmentDate.getDate() + numberOfDays);
    return nextInstallmentDate.toISOString().substring(0, 10);
  }

  saveMembershipPlan = () => {
    if (this.validateInformation() === false) {
      return;
    }

    this.subscribeMembershipPlan();
  };

  validateInformation() {
    if (this.state.selectedMembershipPlanIndex.length === 0) {
      Utils.showAlert('', 'Please select membership plan');
      return false;
    }

    if (
      this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_SPECIAL ||
      this.state.selectedMembershipPlanID ===
        Constants.MEMBERSHIP_ID_UNIVERSAL ||
      this.state.selectedMembershipPlanID ===
        Constants.MEMBERSHIP_ID_FLEXI_FITNESS
    ) {
      if (this.state.membershipDuration.length === 0) {
        Utils.showAlert('', 'Please select membership duration');
        return false;
      }

      if (this.state.totalFee.length === 0) {
        Utils.showAlert('', 'Please enter fee.');
        return false;
      }
      let totalFees = parseInt(this.state.totalFee);
      if (totalFees < 0) {
        Utils.showAlert('', "Fee can't be negative");
        return false;
      }
    }

    if (
      this.state.selectedMembershipPlanID ===
        Constants.MEMBERSHIP_ID_UNIVERSAL ||
      this.state.selectedMembershipPlanID ===
        Constants.MEMBERSHIP_ID_FLEXI_FITNESS
    ) {
      if (this.state.numberOfValidDays.length === 0) {
        Utils.showAlert('', 'Please enter number of valid days.');
        return false;
      }
      let numberOfValidDays = parseInt(this.state.numberOfValidDays);
      if (numberOfValidDays < 0) {
        Utils.showAlert('', "Number of valid days can't be negative");
        return false;
      }

      let monthDuration = parseInt(this.state.membershipDuration);
      let totalDays = monthDuration * 30;
      if (numberOfValidDays > totalDays) {
        Utils.showAlert(
          '',
          "Number of valid days can't be greater than membership duration.",
        );
        return false;
      }
    }

    if (this.state.isPaymentReceived) {
      let paidAmount = parseInt(this.state.paymentReceivedAmount);
      if (paidAmount < 0) {
        Utils.showAlert('', 'Please enter paid amount greater than 0');
        return false;
      }
      let totalFees = parseInt(this.state.totalFee);
      if (paidAmount > totalFees) {
        Utils.showAlert('', "Paid amount can't be greater than total fee.");
        return false;
      }
    }

    return true;
  }

  subscribeMembershipPlan() {
    let thisInstance = this;

    this.setState({
      isLoading: true,
    });

    let membershipPlan =
      this.state.membershipPlans[
        parseInt(this.state.selectedMembershipPlanIndex)
      ];

    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);
    data.append(Constants.KEY_MEMBER_ID, this.state.memberID);
    data.append(Constants.KEY_MEMBERSHIP_ID, membershipPlan[Constants.KEY_ID]);
    data.append(Constants.KEY_START_DATE, this.state.startDate);
    data.append(Constants.KEY_END_DATE, this.state.endDate);
    data.append(
      Constants.KEY_NEXT_INSTALLEMENT,
      this.state.nextInstallmentDate,
    );

    if (
      this.state.selectedMembershipPlanID === Constants.MEMBERSHIP_ID_SPECIAL ||
      this.state.selectedMembershipPlanID ===
        Constants.MEMBERSHIP_ID_UNIVERSAL ||
      this.state.selectedMembershipPlanID ===
        Constants.MEMBERSHIP_ID_FLEXI_FITNESS
    ) {
      data.append(
        Constants.KEY_MEMBERSHIP_DURATION,
        this.state.membershipDuration,
      );
      data.append(Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE, this.state.totalFee);
      if (
        this.state.selectedMembershipPlanID ===
          Constants.MEMBERSHIP_ID_UNIVERSAL ||
        this.state.selectedMembershipPlanID ===
          Constants.MEMBERSHIP_ID_FLEXI_FITNESS
      ) {
        data.append(Constants.KEY_MEMBER_DAYS, this.state.numberOfValidDays);
      }
    }

    console.log('Body:::');
    console.log(data);
    this.props.RenewMembership(data).then(() => {
      console.log(this.props.RenewMemberReducer.data);

      let valid = this.props.RenewMemberReducer.data[Constants.KEY_VALID];
      if (this.props.RenewMemberReducer.success) {
        if (valid) {
          if (thisInstance.state.isPaymentReceived) {
            let dataObject =
              this.props.RenewMemberReducer.data[Constants.KEY_DATA];
            let membershipID = dataObject[Constants.KEY_MEMBER_MEMBERSHIP_ID];
            thisInstance.updatePaymentReceived(membershipID);
          } else {
            thisInstance.setState({
              isLoading: false,
            });
            thisInstance.showMembershipPlanSubscribedAlert();
          }
        }
      } else {
        let message = this.props.RenewMemberReducer.data[Constants.KEY_MESSAGE];
        if (!(message && message.length > 0)) {
          message = 'Some error occurred. Please try agian.';
        }
        thisInstance.setState({
          isLoading: false,
        });
        Utils.showAlert('Error!', 'Some error occurred. Please try agian.');
      }
    });
  }

  updatePaymentReceived(membershipID) {
    let thisInstance = this;

    let membershipPlan =
      this.state.membershipPlans[
        parseInt(this.state.selectedMembershipPlanIndex)
      ];

    let currentDate = new Date();
    let dateString = currentDate.toISOString().substring(0, 10);
    dateString = dateString.replace(/-/g, '');
    let data = new FormData();
    data.append(Constants.KEY_USER_ID, this.state.userID);
    data.append(Constants.KEY_GYM_ID, this.state.gymID);
    data.append(Constants.KEY_MEMBER_MEMBERSHIP_ID, membershipID);
    data.append(Constants.KEY_MEMBER_ID, this.state.memberID);
    data.append(Constants.KEY_MEMBERSHIP_ID, membershipPlan[Constants.KEY_ID]);
    data.append(
      Constants.KEY_MEMBERSHIP_TYPE_ID,
      membershipPlan[Constants.KEY_ID],
    );
    data.append(Constants.KEY_DATE, dateString);
    data.append(Constants.KEY_FEES, this.state.paymentReceivedAmount);

    console.log('Body:::');
    console.log(data);
    this.props.dispatchpayment(data).then(() => {
      let valid = this.props.RecievePaymentReducer.data[Constants.KEY_VALID];
      if (valid) {
        thisInstance.setState({
          isLoading: false,
        });
        thisInstance.showMembershipPlanSubscribedAlert();
      } else {
        let message =
          this.props.RecievePaymentReducer.data[Constants.KEY_MESSAGE];
        if (!(message && message.length > 0)) {
          message = 'Some error occurred. Please try agian.';
        }
        thisInstance.setState({
          isLoading: false,
        });
        Utils.showAlert('Error!', message);
      }
    });
    
  }

  showMembershipPlanSubscribedAlert() {
    let thisInstance = this;
    Alert.alert(
      'Success',
      'Membership Plan added successfully.',
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

  createMembershipPlan() {
    this.props.navigation.navigate('CreateMembershipPlan');
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
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
        style={{flex: 1}}>
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

          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={this.goBack}>
              <Image
                style={styles.closeIcon}
                source={require('../../assets/images/close_icon.png')}
              />
            </TouchableOpacity>

            <Text style={styles.tabTitle}>Add Plan</Text>
          </View>

          <ScrollView
            style={{width: '100%', height: '100%'}}
            contentContainerStyle={{flexGrow: 1}}
            scrollEnabled={true}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}
              onStartShouldSetResponder={() => true}>
              <View style={styles.inputContainer}>
                <View style={styles.inputTitleContainer}>
                  <Text style={styles.inputTitleText}>Select Membership</Text>
                  <Text style={([styles.inputTitleText], {color: '#0b0a0a'})}>
                    {' '}
                    OR{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      this.createMembershipPlan();
                    }}>
                    <Text
                      style={
                        ([styles.inputTitleText],
                        {
                          color: '#2c9fc9',
                          textDecorationLine: 'underline',
                          textDecorationColor: '#2c9fc9',
                        })
                      }>
                      Create Membership
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.requiredTitleText}>*</Text>
                </View>
                <TouchableOpacity
                  onPress={this.onSelectMembershipPlanButtonClicked}
                  style={{marginTop: 10}}>
                  <View
                    style={[
                      styles.inputText,
                      {
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        paddingVertical: 5,
                      },
                    ]}>
                    <Text style={{flex: 1, color: '#162029', fontSize: 16}}>
                      {this.state.selectedMembershipPlanIndex === ''
                        ? 'Select Membership Plan'
                        : this.state.membershipPlansOptionsIOS[
                            parseInt(this.state.selectedMembershipPlanIndex)
                          ]}
                    </Text>
                    <Image
                      style={{marginLeft: 10, width: 10, height: 6}}
                      resizeMode={'cover'}
                      source={require('../../assets/images/black_down_button.png')}
                    />
                  </View>
                </TouchableOpacity>
                {/*
                                <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                    <RNPickerSelect
                                        onValueChange={(value) => {
                                            this.onMembershipPlanChanged(value);
                                        }}
                                        items={this.state.membershipPlansOptions}
                                        value={this.state.selectedMembershipPlanIndex}
                                        style={pickerSelectStyles}
                                        useNativeAndroidPickerStyle={false}
                                        placeholder={{
                                            label: 'Select Membership Plan',
                                            value: null,
                                            color: '#1d2b36',
                                        }}
                                        placeholderTextColor={"#1d2b36"}
                                    />
                                </View>
                                */}
                {this.state.selectedMembershipPlanID ===
                  Constants.MEMBERSHIP_ID_SPECIAL ||
                this.state.selectedMembershipPlanID ===
                  Constants.MEMBERSHIP_ID_UNIVERSAL ||
                this.state.selectedMembershipPlanID ===
                  Constants.MEMBERSHIP_ID_FLEXI_FITNESS ? (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputTitleContainer}>
                      <Text style={styles.inputTitleText}>Time Duration</Text>
                      <Text style={styles.requiredTitleText}>*</Text>
                    </View>
                    <TouchableOpacity
                      onPress={this.onSelectMembershipDurationButtonClicked}>
                      <View
                        style={[
                          styles.inputText,
                          {
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            paddingVertical: 5,
                          },
                        ]}>
                        <Text style={{flex: 1, color: '#162029', fontSize: 16}}>
                          {this.state.membershipDuration === ''
                            ? 'Select Membership Duration'
                            : this.state.membershipDuration === '1'
                            ? '1 Month'
                            : this.state.membershipDuration + ' Months'}
                        </Text>
                        <Image
                          style={{marginLeft: 10, width: 10, height: 6}}
                          resizeMode={'cover'}
                          source={require('../../assets/images/black_down_button.png')}
                        />
                      </View>
                    </TouchableOpacity>
                    {/*
                                            <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                                <RNPickerSelect
                                                    onValueChange={(value) => {
                                                        this.onMembershipDurationChanged(value);
                                                    }}
                                                    items={membershipDurations}
                                                    value={this.state.membershipDuration}
                                                    style={pickerSelectStyles}
                                                    useNativeAndroidPickerStyle={false}
                                                    placeholder={{
                                                        label: 'Select Duration',
                                                        value: null,
                                                        color: '#1d2b36',
                                                    }}
                                                    placeholderTextColor={"#1d2b36"}
                                                />
                                            </View>
                                            */}
                    <View style={styles.inputTitleContainer}>
                      <Text style={styles.inputTitleText}>Fees</Text>
                      <Text style={styles.requiredTitleText}>*</Text>
                    </View>
                    <TextInput
                      style={styles.inputText}
                      placeholder={'Enter Fee'}
                      placeholderTextColor={'#1d2b36'}
                      onChangeText={this.onTotalFeeChanged}
                      value={this.state.totalFee}
                      keyboardType={'number-pad'}
                    />
                  </View>
                ) : null}
                {this.state.selectedMembershipPlanID ===
                  Constants.MEMBERSHIP_ID_UNIVERSAL ||
                this.state.selectedMembershipPlanID ===
                  Constants.MEMBERSHIP_ID_FLEXI_FITNESS ? (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputTitleContainer}>
                      <Text style={styles.inputTitleText}>
                        Valid for number of days
                      </Text>
                      <Text style={styles.requiredTitleText}>*</Text>
                    </View>
                    <TextInput
                      style={styles.inputText}
                      placeholder={'Enter number of days'}
                      placeholderTextColor={'#1d2b36'}
                      onChangeText={this.onNumberOfValidDaysChanged}
                      value={this.state.numberOfValidDays}
                      keyboardType={'number-pad'}
                    />
                  </View>
                ) : null}
                <View style={styles.inputTitleContainer}>
                  <Text style={styles.inputTitleText}>Start Date</Text>
                  <Text style={styles.requiredTitleText}>*</Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <DatePicker
                    style={styles.datePickerStyle}
                    date={this.state.startDate}
                    mode="date"
                    placeholder="select start date"
                    format="YYYY-MM-DD"
                    //minDate={new Date()}
                    //maxDate={new Date()}
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
                    onDateChange={this.onStartDateChanged}
                  />
                </View>
                <View style={styles.inputTitleContainer}>
                  <Text style={styles.inputTitleText}>End Date</Text>
                </View>
                <TextInput
                  style={styles.inputText}
                  value={this.state.endDate}
                  editable={false}
                />
                {this.state.willShowNextInstallmentDate ? (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputTitleContainer}>
                      <Text style={styles.inputTitleText}>
                        Next Installment
                      </Text>
                      <Text style={styles.requiredTitleText}>*</Text>
                    </View>
                    <View
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <DatePicker
                        style={styles.datePickerStyle}
                        date={this.state.nextInstallmentDate}
                        mode="date"
                        placeholder="select Next Installment date"
                        format="YYYY-MM-DD"
                        //minDate={new Date()}
                        //maxDate={new Date()}
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
                        onDateChange={this.onNextInstallmentDateChanged}
                      />
                    </View>
                  </View>
                ) : null}
                <View style={styles.inputTitleContainer}>
                  <Text style={([styles.inputTitleText], {color: '#1d2b36'})}>
                    Total Fees: {this.state.totalFee}
                  </Text>
                  <Text
                    style={[
                      styles.inputTitleText,
                      {flexGrow: 1, color: '#1d2b36', textAlign: 'right'},
                    ]}>
                    Payment Received
                  </Text>
                  <Switch
                    onValueChange={this.onTogglePaymentReceived}
                    value={this.state.isPaymentReceived}
                    trackColor={'#162029'}
                  />
                </View>
                {this.state.isPaymentReceived ? (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputTitleContainer}>
                      <Text style={styles.inputTitleText}>Paid Amount</Text>
                      <Text style={styles.requiredTitleText}>*</Text>
                    </View>
                    <TextInput
                      style={styles.inputText}
                      placeholder={'Enter Paid Amount'}
                      placeholderTextColor={'#1d2b36'}
                      onChangeText={this.onPaymentReceivedAmountChanged}
                      value={this.state.paymentReceivedAmount}
                      keyboardType={'number-pad'}
                    />
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={{width: '100%'}}
                onPress={this.saveMembershipPlan}>
                <View style={styles.saveButtonContainer}>
                  <Text style={styles.saveButtonText}>SAVE</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
      </TouchableWithoutFeedback>
    );
  }

  onSelectMembershipPlanButtonClicked = () => {
    let membershipPlansOptionsIOS = this.state.membershipPlansOptionsIOS;
    let membershipPlansOptionsAndroid =
      this.state.membershipPlansOptionsAndroid;
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Select Membership Plan',
        options:
          Platform.OS == 'ios'
            ? membershipPlansOptionsIOS
            : membershipPlansOptionsAndroid,
        cancelButtonIndex: membershipPlansOptionsIOS.length - 1,
        destructiveButtonIndex: membershipPlansOptionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        console.log('selected button index:::' + buttonIndex);
        if (
          buttonIndex !== undefined &&
          buttonIndex < membershipPlansOptionsAndroid.length
        ) {
          this.onMmbershipPlanOptionSelected(buttonIndex);
        }
      },
    );
  };

  onMmbershipPlanOptionSelected(index) {
    let planIndex = '' + index;
    let membershipPlan = this.state.membershipPlans[parseInt(planIndex)];
    let membershipPlanID = membershipPlan[Constants.KEY_ID];
    let totalFee =
      membershipPlan[Constants.KEY_TOTAL_FEE_WITH_TAX_AND_DISCOUNT];
    let monthDuration = membershipPlan[Constants.KEY_MEMBERSHIP_DURATION];
    let endDateString = this.getEndDateWithMonthDuration(
      monthDuration,
      this.state.startDate,
    );
    let paymentReceivedAmount = '';
    let nextInstallmentDate = '';
    let willShowNextInstallmentDate = false;
    if (this.state.isPaymentReceived) {
      paymentReceivedAmount = totalFee;
    }

    if (membershipPlan[Constants.KEY_INSTALLMENT_ENABLED] === Constants.YES) {
      willShowNextInstallmentDate = true;
      let installmentPeriod = membershipPlan[Constants.KEY_INSTALLMENT_DAYS];
      nextInstallmentDate = this.getNextInstallmentDateWithInstallmentPeriod(
        installmentPeriod,
        this.state.startDate,
      );
    }

    this.setState({
      selectedMembershipPlanIndex: planIndex,
      endDate: endDateString,
      totalFee: totalFee,
      paymentReceivedAmount: paymentReceivedAmount,
      selectedMembershipPlanID: membershipPlanID,
      membershipDuration: '',
      numberOfValidDays: '',
      nextInstallmentDate: nextInstallmentDate,
      willShowNextInstallmentDate: willShowNextInstallmentDate,
    });
  }

  onSelectMembershipDurationButtonClicked = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Select Membership Duration',
        options:
          Platform.OS == 'ios'
            ? Constants.membershipDurationOptionsIOS
            : Constants.membershipDurationOptionsAndroid,
        cancelButtonIndex: Constants.membershipDurationOptionsIOS.length - 1,
        destructiveButtonIndex:
          Constants.membershipDurationOptionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        console.log('selected button index:::' + buttonIndex);
        if (
          buttonIndex !== undefined &&
          buttonIndex < Constants.membershipDurationOptionsAndroid.length
        ) {
          this.onMembershipDurationOptionSelected(buttonIndex);
        }
      },
    );
  };

  onMembershipDurationOptionSelected(index) {
    let durationOption = Constants.membershipDurationOptionsIOS[index];
    let duration = Constants.membershipDurationValues[durationOption];

    let endDateString = this.getEndDateWithMonthDuration(
      duration,
      this.state.startDate,
    );

    this.setState({
      membershipDuration: duration,
      endDate: endDateString,
    });
  }
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    height: 40,
  },
  closeButton: {
    color: '#194164',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleText: {
    color: '#194164',
    textAlign: 'left',
    textAlignVertical: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    flexGrow: 1,
    marginLeft: 10,
  },
  profileImageContainer: {
    width: 75,
    aspectRatio: 1,
  },
  profileImage: {
    width: 75,
    aspectRatio: 1,
    borderRadius: 37.5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'black',
  },
  cameraButtonContainer: {
    position: 'absolute',
    top: 21,
    right: -16.5,
  },
  cameraButton: {
    width: 33,
    height: 33,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    width: '100%',
    //marginTop:15,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  inputTitleContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  inputTitleText: {
    color: '#979797',
    fontSize: 16,
  },
  requiredTitleText: {
    color: '#d83110',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  inputText: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#1d2b36',
    color: '#1d2b36',
    fontSize: 16,
    width: '100%',
  },
  saveButtonContainer: {
    marginTop: 15,
    width: '100%',
    backgroundColor: '#162029',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 22,
  },
  datePickerStyle: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#1d2b36',
    width: '100%',
  },
  closeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'cover',
    marginRight: 10,
  },
  tabTitle: {
    color: '#202020',
    fontSize: 14,
    flexGrow: 1,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingHorizontal: 10,
    color: '#162029',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    width: '100%',
    borderBottomWidth: 2,
    borderColor: '#162029',
  },
  inputAndroid: {
    paddingHorizontal: 10,
    color: '#162029',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    width: '100%',
    borderBottomWidth: 2,
    borderColor: '#162029',
  },
});

const mapStateToprops = (state) => ({
  RenewMemberReducer: state.RenewMemberReducer,
  RecievePaymentReducer: state.RecievePaymentReducer,
  mydata: state.FetchSubscriptionReducer,
});

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      RenewMembership: RenewMembership,
      dispatchpayment: paymentRecieve,
      getSubscription: FetchSubscriptionAction,
    },
    dispatch,
  );
}

export default connect(
  mapStateToprops,
  mapDispatchToprops,
)(withNavigationFocus(SubscribePlanForMember));
