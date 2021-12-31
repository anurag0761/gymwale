import React, { Component } from 'react';
import { Text, StatusBar, Image, View, Dimensions, StyleSheet, Alert, ActivityIndicator, TextInput
, TouchableOpacity, TouchableWithoutFeedback, KeyboardAvoidingView, Keyboard, Platform, Button
, ScrollView } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import Hyperlink from 'react-native-hyperlink';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { bindActionCreators } from 'redux';
import { ReferralWithdrawalRequestaction } from '../Redux/Actions/referral_RequestAction';
import { connect } from 'react-redux';

class ReferralWithdrawalRequest extends Component {

    constructor(properties) {
        super(properties);

        let gymID = "";
        let memberID = "";
        
        let userInfo = globals.getSetting().userInfo;
        let body = userInfo[Constants.KEY_USER_DATA];
        let userType = body[Constants.KEY_USER_TYPE];
        let userTypeShortCode = "";
        if(userType === Constants.USER_TYPE_OWNER) {
            let gymData = userInfo[Constants.KEY_GYM_DATA];
            gymID = gymData[Constants.KEY_ID];
            memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, "");
            userTypeShortCode = Constants.USER_TYPE_SHORT_KEY_OWNER;
        } else if(userType === Constants.USER_TYPE_MEMBER) {
            let memberData = userInfo[Constants.KEY_MEMBER_DATA];
            memberData = memberData[0];
            memberID = memberData[Constants.KEY_MEMBER_ID];
            gymID = memberData[Constants.KEY_GYM_ID];
            userTypeShortCode = Constants.USER_TYPE_SHORT_KEY_MEMBER;
        }

        let withdrawLimit = properties.navigation.getParam(Constants.KEY_WITHDRAW_LIMIT, 200);
        let totalEarned = properties.navigation.getParam(Constants.KEY_TOTAL_DISCOUNT, 0);
        
        this.state = {
            gymID: gymID,
            memberID: memberID,
            userType: userType,
            userTypeShortCode: userTypeShortCode,
            isLoading: false,
            withdrawLimit: withdrawLimit,
            totalEarned: totalEarned,
            name: '',
            upiID: '',
            paytmMobileNo: '',
            withdrawalAmountText: "" + withdrawLimit,
            withdrawalAmountErrorText: '',
        }

    }
  

	render() {

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

                            <Text style={styles.tabTitle}>Referral Withdraw Request</Text>
                        </View>
                        {/*
                        <View style={styles.headerContainer}>
                            <TouchableOpacity
                                onPress={this.goBack}
                            >
                                <Text style={styles.closeButton}>X</Text>
                            </TouchableOpacity>

                            <Text style={styles.titleText}>Referral Withdraw Request</Text>
                        </View>
                        */}
                        <ScrollView style={{width:'100%', height:'100%'}}>
                            <View style={{width:'100%', justifyContent:'flex-start', alignItems:'center', padding:20}}>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Your Name</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        autoCapitalize={"words"}
                                        placeholder={"Enter Your Name"}
                                        onChangeText={this.onNameChanged}
                                        value={this.state.name}
                                    >

                                    </TextInput>
                                </View>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>UPI Id</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Enter UPI Id"}
                                        onChangeText={this.onUPIIDChanged}
                                        value={this.state.upiID}
                                        keyboardType={"email-address"}
                                        autoCapitalize={"none"}
                                    >
                                    </TextInput>
                                </View>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Paytm Mobile No.</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Paytm Mobile No to get paid"}
                                        onChangeText={this.onPaytmMobileNoChanged}
                                        value={this.state.paytmMobileNo}
                                        keyboardType={"number-pad"}
                                    >
                                    </TextInput>
                                </View>
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Total Withdrawal Amount</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        placeholder={"Amount you want to withdraw"}
                                        onChangeText={this.onWithdrawalAmountChanged}
                                        value={this.state.withdrawalAmountText}
                                        keyboardType={"numeric"}
                                    >
                                    </TextInput>
                                    <Text style={{fontSize:11, color:'#df5e47', textAlign:'left', width:'100%'}}>{this.state.withdrawalAmountErrorText}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={this.sendWithdrawalRequest}
                                >
                                    <View style={styles.saveButtonContainer}>
                                        <Text style={styles.saveButtonText}>Withdraw</Text>
                                    </View>
                                </TouchableOpacity>
                                <Hyperlink 
                                    linkDefault={ true }
                                    style={{paddingHorizontal:20}}
                                    linkStyle={{color:'#005caf'}}
                                >
                                    <Text style={{color:'#162029', fontSize:12, flex:1, flexWrap:'wrap', fontWeight:'500'}}>
                                    You will recive withdrawal within 24 Hours you can mail us at help@gymvale.com   
                                    </Text>
                                </Hyperlink>
                                
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

    goBack = () => {
        this.props.navigation.pop();
    }

    onNameChanged = (text) => {
        this.setState({
            name:text
        });
    }

    onUPIIDChanged = (text) => {
        this.setState({
            upiID: text,
        });
    }

    onPaytmMobileNoChanged = (text) => {
        this.setState({
            paytmMobileNo: text,
        });
    }

    onWithdrawalAmountChanged = (text) => {

        this.setState({
            withdrawalAmountText: text,
        });
    }

    sendWithdrawalRequest = async () => {
        let name = this.state.name;
        if(name.length === 0) {
            Utils.showAlert("", "Please enter Name");
            return;
        }

        let upiID = this.state.upiID;
        if(upiID.length === 0) {
            Utils.showAlert("", "Please enter UPI Id");
            return;
        }

        let paytmMobileNo = this.state.paytmMobileNo;
        if(paytmMobileNo.length === 0) {
            Utils.showAlert("", "Please enter your Paytm Mobile No");
            return;
        }

        let withdrawalAmount = 0;
        let withdrawalAmountErrorText = "";
        try {
            withdrawalAmount = parseInt(this.state.withdrawalAmountText);
            if(withdrawalAmount == 0) {
                withdrawalAmountErrorText = "You can not withdrawal less than " + this.state.withdrawLimit;
            } else if(withdrawalAmount == 0) {
                withdrawalAmountErrorText = "You can't withdraw more than you earned ("+ this.state.totalEarned +" Rs.)";
            }
        } catch(error) {
            withdrawalAmountErrorText = "Please enter a valid amount";
        }

        if(withdrawalAmountErrorText !== "") {
            this.setState({
                withdrawalAmountErrorText: withdrawalAmountErrorText
            });
            Utils.showAlert("", withdrawalAmountErrorText);
            return;
        } else {
            this.setState({
                withdrawalAmountErrorText:"",
            });
        }

        this.setState({
            isLoading: true,
        })
        let thisInstance = this;
        let referralID = "";
        if(this.state.userType === Constants.USER_TYPE_OWNER) {
            referralID = this.state.gymID;
        } else {
            referralID = this.state.memberID;
        }
        let data = new FormData();
        data.append(Constants.KEY_REFERRAL_ID, referralID);
        data.append(Constants.KEY_USER_TYPE, this.state.userTypeShortCode);
        data.append(Constants.KEY_NAME, name);
        data.append(Constants.KEY_UPI_ID, upiID);
        data.append(Constants.KEY_MOBILE, paytmMobileNo);
        data.append(Constants.KEY_AMOUNT, withdrawalAmount);
        
        console.log("BODY:::");
        console.log(data);

this.props.dispatchwithdrawReq(data)
setTimeout(() => {
   
   console.log("Response JSON:::");
            console.log(responseJson);
            let valid = this.props.ReferralWithdrawReqData.withdrawdata[Constants.KEY_VALID];
            if(valid) {
              
                thisInstance.showWithdrawalRequestSubmittedAlert();
            } else {
                let message = this.props.ReferralWithdrawReqData.withdrawdata[Constants.KEY_MESSAGE];
                if(!(message && message.length > 0)) {
                    message = 'Some error occurred. Please try agian.';
                }
                thisInstance.setState({
                    isLoading:false
                });
                Utils.showAlert("Error!", message);
            }
}, 3000);
      
    }

    showWithdrawalRequestSubmittedAlert() {
        let thisInstance = this;
        Alert.alert(
            "Success", "Withdrawal request submitted successfully.",
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
        marginTop:15,
        justifyContent:'flex-start',
        alignItems:'center',
    },
    inputTitleContainer:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
    },
    inputTitleText: {
        color:'#162029',
        fontSize:14,
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
        color:'#162029',
        fontSize:16,
        width:'100%',
    },
    saveButtonContainer: {
        marginTop:40,
        marginBottom: 20,
        width:240,
        backgroundColor:'#17aae0',
        borderRadius: 20,
        height:40,
        justifyContent:'center',    
        alignItems:'center'
    },
    saveButtonText: {
        color:'white',
        fontSize:18,
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
    console.log('State:::' + JSON.stringify(state.getAllReferral));
    return {
        ReferralWithdrawReqData: state.ReferralWithdrawReq,
    
      Loading: state.getAllCityReducer.isLoading,
      Success: state.getAllCityReducer.success,
    };
  };
  
  function mapDispatchToprops(dispatch) {
    return bindActionCreators(
      {
        // FetchAllCity: fetchAllCity,
        dispatchwithdrawReq: ReferralWithdrawalRequestaction,
      },
      dispatch,
    );
  }
  
  export default connect(mapStateToprops, mapDispatchToprops) (ReferralWithdrawalRequest);
