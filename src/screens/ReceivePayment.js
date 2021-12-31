import React, { Component } from 'react';
import { Text, StatusBar, View, StyleSheet, Alert, ActivityIndicator, TextInput, Platform, Image
, TouchableOpacity, TouchableWithoutFeedback, Keyboard, ScrollView, Switch } from 'react-native';
import DatePicker from 'react-native-datepicker'
import RNPickerSelect from 'react-native-picker-select';
import ActionSheet from 'react-native-action-sheet';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { paymentRecieve } from '../Redux/Actions/RecievePaymentAction';
import { fetchMemberDetails } from '../Redux/Actions/memberDetailAction';

class ReceivePayment extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];

        let userData = userInfo[Constants.KEY_USER_DATA];
        let userID = userData[Constants.KEY_ID];

        let memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID);
        let membershipID = properties.navigation.getParam(Constants.KEY_MEMBER_MEMBERSHIP_ID);

        console.log("memberID:::" + memberID + "::: membershipID::" + membershipID);
        
        this.state = {
            isFetchingList: true,
            isLoading: false,
            membershipPlans: [],
            membershipPlansOptions: [],
            membershipPlansOptionsIOS: [],
            membershipPlansOptionsAndroid: [],
            gymID: gymID,
            userID:userID,
            memberID: memberID,
            membershipID: membershipID,
            selectedMembershipPlanIndex:'',
            selectedMembershipPlanID:'',
            totalFee:'',
            remainingFee:'',
            date: new Date().toISOString().substring(0, 10),
            paymentReceivedAmount: '',
        }

    }

    componentDidMount() {
        this.fetchMembershipPlans();
    }

    fetchMembershipPlans() {
        this.setState({
            isFetchingList: true,
        });
        let thisInstance = this;
        
        /*
        let data = new FormData();
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_MEMBER_ID, this.state.memberID);

        console.log("DATA:::");
        console.log(data);
        */

        let body = Constants.KEY_GYM_ID+'='+this.state.gymID
        +"&"+Constants.KEY_MEMBER_ID + "=" + this.state.memberID;
        this.props.DispatchFetchmember(body);
setTimeout(() => {
    if(this.props.GetMemberDetaildata.success)
    {
        let responseJson = this.props.GetMemberDetaildata.data;
        let valid = responseJson[Constants.KEY_VALID];
        if(valid) {
            let allMembershipPlanList = responseJson[Constants.KEY_MEMBERSHIP];
            let membershipPlanList = [];
            for(let i = 0; i < allMembershipPlanList.length; i++) {
                let membershipPlan = allMembershipPlanList[i];
                if(membershipPlan[Constants.KEY_STATUS] === Constants.STATUS_ACTIVE) {
                    membershipPlanList.push(membershipPlan);
                }
            }
    
            let membershipPlansOptions = [];
            let membershipPlansOptionsIOS = [];
            let membershipPlansOptionsAndroid = [];
            for(let i = 0; i < membershipPlanList.length; i++) {
                let plan = membershipPlanList[i];
                let planName = plan[Constants.KEY_MEMBERSHIP_NAME];
                membershipPlansOptions.push({
                    label:planName,
                    value:""+i
                });
                membershipPlansOptionsIOS.push(planName);
                membershipPlansOptionsAndroid.push(planName);
            }
            membershipPlansOptionsIOS.push("Cancel");
            thisInstance.setState({
                membershipPlans:membershipPlanList,
                membershipPlansOptions: membershipPlansOptions,
                membershipPlansOptionsIOS: membershipPlansOptionsIOS,
                membershipPlansOptionsAndroid: membershipPlansOptionsAndroid,
                isFetchingList:false,
            });
        } 
    }
  else {
        thisInstance.setState({
            isFetchingList:false,
        })
    }
}, 2000);
       
          
			
	
    }

    goBack = () => {
        this.props.navigation.pop();
    }

    onMembershipPlanChanged(planIndex) {
        if(planIndex === null) {
            this.setState({
                selectedMembershipPlanIndex:"",
                totalFee:"",
                paymentReceivedAmount:"",
                selectedMembershipPlanID: "",
            });
            return;
        }
        
        let membershipPlan = this.state.membershipPlans[parseInt(planIndex)];
        let membershipPlanID = membershipPlan[Constants.KEY_MEMBERSHIP_TYPE_ID];
        let totalFee = membershipPlan[Constants.KEY_TOTAL_FEE_WITH_TAX_AND_DISCOUNT];
        let paidFee = membershipPlan[Constants.KEY_PAID_FEE];

        let remainingFee = parseInt(totalFee) - parseInt(paidFee);

        let paymentReceivedAmount = totalFee;

        this.setState({
            selectedMembershipPlanIndex:planIndex,
            totalFee:totalFee,
            remainingFee: "" + remainingFee,
            paymentReceivedAmount:paymentReceivedAmount,
            selectedMembershipPlanID: membershipPlanID,
        });
    }

    onTotalFeeChanged = (text) => {
        this.setState({
            totalFee: text,
        });
    }

    onDateChanged = (date) => {
        this.setState({
            date: date,
        });
        
    }

    onPaymentReceivedAmountChanged = (text) => {
        this.setState({
            paymentReceivedAmount: text,
        });
    }

    saveMembershipPlan = () => {
        if(this.validateInformation() === false) {
            return;
        }

        this.updatePaymentReceived();
    }

    validateInformation() {
        if(this.state.selectedMembershipPlanIndex.length === 0) {
            Utils.showAlert("", "Please select membership plan");
            return false;
        }

        let paidAmount = parseInt(this.state.paymentReceivedAmount);
        if(paidAmount < 0) {
            Utils.showAlert("", "Please enter paid amount greater than 0");
            return false;
        }
        let remainingFee = parseInt(this.state.remainingFee);
        if(paidAmount > remainingFee) {
            Utils.showAlert("", "Paid amount can't be greater than remaining fee.");
            return false;
        }
        
        return true;
    }

    updatePaymentReceived() {
        
        let thisInstance = this;

        this.setState({
            isLoading: true,
        });

        let dateString = this.state.date;
        dateString = dateString.replace(/-/g, "");
        let data = new FormData();
        data.append(Constants.KEY_USER_ID, this.state.userID);
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_MEMBER_MEMBERSHIP_ID, this.state.membershipID);
        data.append(Constants.KEY_MEMBER_ID, this.state.memberID);
        data.append(Constants.KEY_MEMBERSHIP_ID, this.state.selectedMembershipPlanID);
        data.append(Constants.KEY_MEMBERSHIP_TYPE_ID, this.state.selectedMembershipPlanID);
        data.append(Constants.KEY_DATE, dateString);
        data.append(Constants.KEY_FEES, this.state.paymentReceivedAmount);

        console.log("Body:::");
        console.log(data);
this.props.dispatchpayment(data)
setTimeout(() => {
   
    let valid =   this.props.RecievePaymentReducer.data[Constants.KEY_VALID];
   if (this.props.RecievePaymentReducer.success) {
    if(valid) {
        thisInstance.setState({
            isLoading:false
        });
        thisInstance.showPaymentReceivedAlert();
    } 
   }
   else {
    let message =   this.props.RecievePaymentReducer.data[Constants.KEY_MESSAGE];
    if(!(message && message.length > 0)) {
        message = 'Some error occurred. Please try agian.';
    }
    thisInstance.setState({
        isLoading:false
    });
    Utils.showAlert("Error!", message);
}
}, 2000);
        // fetch(Constants.API_URL_RECEIVE_FEES, {
		// 	method: 'post',
        //     body: data,
  		// 	headers: { 
        //         'content-type':'multipart/form-data',
		// 		'Accept': 'application/json',
		// 	}
		//   })
		// .then((response) => {
        //     console.log("Response:::");
        //     console.log(response);
        //     return response.json();
        // })
		// .then((responseJson) => {
        //     console.log("Response JSON:::");
            // console.log(responseJson);
           
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

    
    showPaymentReceivedAlert() {
        let thisInstance = this;
        Alert.alert(
            "Success", "Payment receive info saved successfully.",
            [
                { 
                    text: 'OK', 
                    onPress: () => {
                        thisInstance.goBack();
                    } 
                },
            ],
            { cancelable: false },
          );
    }

    createMembershipPlan() {
        this.props.navigation.navigate("CreateMembershipPlan");
    }
    
	render() {

        if(this.state.isFetchingList) {
            return (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="large" color="#121619" />
                </View>
            );
        }

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}}>
                
                <View
                    style={
                        { 
                            flex: 1,
                            backgroundColor: 'white',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }
                    }
                >
                    <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                        <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                    </View>
                    
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            onPress={this.goBack}
                        >
                            <Image style={styles.closeIcon} source={require('../../assets/images/close_icon.png')}/>
                        </TouchableOpacity>

                        <Text style={styles.tabTitle}>Received Payment</Text>
                    </View>

                    <ScrollView 
                        style={{width:'100%', height:'100%'}}
                        contentContainerStyle={{ flexGrow: 1 }}
                        scrollEnabled={true}
                    >
                        <View 
                            style={{width:'100%', justifyContent:'center', alignItems:'center', padding:20}}
                            onStartShouldSetResponder={() => true}
                        >
                            
                            <View style={styles.inputContainer}>
                                <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>Select Membership</Text>
                                    <Text style={styles.requiredTitleText}>*</Text>
                                </View>
                                <TouchableOpacity onPress={this.onSelectMembershipPlanButtonClicked} style={{marginTop: 10,}}>
                                    <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                        <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.selectedMembershipPlanIndex === "" ? "Select Membership Plan": this.state.membershipPlansOptionsIOS[parseInt(this.state.selectedMembershipPlanIndex)]}</Text>
                                        <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
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
                                <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>Date</Text>
                                    <Text style={styles.requiredTitleText}>*</Text>
                                </View>
                                <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                    <DatePicker
                                        style={styles.datePickerStyle}
                                        date={this.state.date}
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
                                                marginLeft: 0
                                            },
                                            dateInput: {
                                                marginLeft: 0,
                                                borderWidth:0,
                                                
                                            },
                                            dateText: {
                                                textAlign:'left',
                                                color:'#1d2b36',
                                                fontSize:16,
                                                width:'100%',
                                            },
                                            placeholderText: {
                                                textAlign:'left',
                                                fontSize:16,
                                                width:'100%',
                                            }
                                        }}
                                        onDateChange={this.onStartDateChanged}
                                    />
                                </View>
                                <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>Paid Amount</Text>
                                    <Text style={styles.requiredTitleText}>*</Text>
                                </View>
                                <TextInput 
                                    style={styles.inputText}
                                    placeholder={"Enter Paid Amount"}
                                    placeholderTextColor={"#1d2b36"}
                                    onChangeText={this.onPaymentReceivedAmountChanged}
                                    value={this.state.paymentReceivedAmount}
                                    keyboardType={"number-pad"}
                                />
                                <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>Remaining Amount: {this.state.remainingFee}</Text>
                                </View>
                            </View>
                            
                            <TouchableOpacity
                                style={{width:'100%'}}
                                onPress={this.saveMembershipPlan}
                            >
                                <View style={styles.saveButtonContainer}>
                                    <Text style={styles.saveButtonText}>SAVE</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                    {
                        this.state.isLoading ? (
                            <View style={styles.activityIndicatorContainer}>
                                <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                            </View>
                        ): null
                    }
                </View>
                
            </TouchableWithoutFeedback>
			
		);
    }

    onSelectMembershipPlanButtonClicked = () => {
        let membershipPlansOptionsIOS = this.state.membershipPlansOptionsIOS;
        let membershipPlansOptionsAndroid = this.state.membershipPlansOptionsAndroid;
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Membership Plan',
            options: (Platform.OS == 'ios') ? membershipPlansOptionsIOS : membershipPlansOptionsAndroid,
            cancelButtonIndex: membershipPlansOptionsIOS.length-1,
            destructiveButtonIndex: membershipPlansOptionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
              console.log("selected button index:::" + buttonIndex);
              if(buttonIndex !== undefined && buttonIndex < membershipPlansOptionsAndroid.length) {
                this.onMmbershipPlanOptionSelected(buttonIndex);
            }
        });
    }

    onMmbershipPlanOptionSelected(index) {
        let planIndex = ""+index;
        let membershipPlan = this.state.membershipPlans[parseInt(planIndex)];
        let membershipPlanID = membershipPlan[Constants.KEY_MEMBERSHIP_TYPE_ID];
        let totalFee = membershipPlan[Constants.KEY_TOTAL_FEE_WITH_TAX_AND_DISCOUNT];
        let paidFee = membershipPlan[Constants.KEY_PAID_FEE];
        let remainingFee = parseInt(totalFee) - parseInt(paidFee);

        let paymentReceivedAmount = remainingFee;
        this.setState({
            selectedMembershipPlanIndex:planIndex,
            totalFee:totalFee,
            remainingFee: "" + remainingFee,
            paymentReceivedAmount:paymentReceivedAmount,
            selectedMembershipPlanID: membershipPlanID,
        });
    }
}

const styles = StyleSheet.create({
    activityIndicatorContainer: {
        width:'100%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:0,
        left:0,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    headerContainer: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        padding:15,
        height:40,
    },
    closeButton: {
        color:'#194164',
        textAlign:'center',
        textAlignVertical:'center',
        fontSize:24,
        fontWeight:'bold',
    },
    titleText: {
        color:'#194164',
        textAlign:'left',
        textAlignVertical:'center',
        fontSize:20,
        fontWeight:'bold',
        flexGrow:1,
        marginLeft:10,
    },
    profileImageContainer: {
        width:75,
        aspectRatio:1,
    },
    profileImage: {
        width:75,
        aspectRatio:1,
        borderRadius:37.5,
        borderWidth:StyleSheet.hairlineWidth,
        borderColor:'black',
    },
    cameraButtonContainer: {
        position:'absolute',
        top:21,
        right:-16.5,
    },
    cameraButton: {
        width:33,
        height:33,
        backgroundColor:'transparent',
    },
    inputContainer: {
        width:'100%',
        //marginTop:15,
        justifyContent:'flex-start',
        alignItems:'center',
    },
    inputTitleContainer:{
        marginTop:10,
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
    },
    inputTitleText: {
        color:'#979797',
        fontSize:16,
    }, 
    requiredTitleText:{
        color:'#d83110',
        fontSize:16,
        fontWeight:'bold',
        marginLeft:5,
    }, 
    inputText: {
        borderWidth:0,
        borderBottomWidth:1,
        borderBottomColor:'#1d2b36',
        color:'#1d2b36',
        fontSize:16,
        width:'100%',
    },
    saveButtonContainer: {
        marginTop:15,
        width:'100%',
        backgroundColor:'#162029',
        height:40,
        justifyContent:'center',
        alignItems:'center'
    },
    saveButtonText: {
        color:'white',
        fontSize:22,
    },
    datePickerStyle: {
        borderWidth:0,
        borderBottomWidth:1,
        borderBottomColor:'#1d2b36',
        width:'100%',
    },
    closeIcon: {
        width:16,
        height:16,
        resizeMode:'cover',
        marginRight: 10,
    },
    tabTitle: {
        color:'#202020',
        fontSize:14,
        flexGrow:1,
        fontWeight:'bold',
        textAlign:'left',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        paddingHorizontal: 10,
        color:'#162029',
        fontSize:16,
        fontWeight:'bold',
        textAlign:'left',
        width:'100%',
        borderBottomWidth:2,
        borderColor:'#162029',
    },
    inputAndroid: {
        paddingHorizontal: 10,
        color:'#162029',
        fontSize:16,
        fontWeight:'bold',
        textAlign:'left',
        width:'100%',
        borderBottomWidth:2,
        borderColor:'#162029',
    },
  });

  const mapStateToprops = (state) => {
    return {
        RecievePaymentReducer:state.RecievePaymentReducer,
        GetMemberDetaildata: state.MemberDetailReducer,
    };
  };
  function mapDispatchToprops(dispatch) {
    return bindActionCreators(
      {
        dispatchpayment:paymentRecieve,
        DispatchFetchmember: fetchMemberDetails,
      },
      dispatch,
    );
  }
  export default connect(
    mapStateToprops,
    mapDispatchToprops,
  ) (ReceivePayment);
