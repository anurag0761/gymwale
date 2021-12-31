import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput
, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, ScrollView } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { forgetPinbalancesheet, loginbalancesheet } from '../Redux/Actions/loginBalanceSheetAction';

class PinCodeScreen extends Component {

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
            pincode: '',
            pinCode1: '',
            pinCode2: '',
            pinCode3: '',
            pinCode4: '',
            isPinCode1InFocus: false,
            isPinCode2InFocus: false,
            isPinCode3InFocus: false,
            isPinCode4InFocus: false,
        };
    }

    componentDidMount() {
        
    }

	render() {
        
       return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1, margin:0, padding: 0,}}>
                <KeyboardAvoidingView behavior="padding" style={{flex:1, margin:0, padding: 0,}}>
                    <View style={styles.mainContainer}>
                        <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                            <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                        </View>

                        <View style={styles.headerContainer}>
                            <Text style={styles.tabTitle}></Text>
                            <TouchableOpacity
                                onPress={this.goBack}
                            >
                                <Image style={styles.closeIcon} source={require('../../assets/images/close_icon.png')}/>
                            </TouchableOpacity>
                            
                        </View>
                        
                        <Image style={styles.otpGraphic} source={require('../../assets/images/createpin.png')}/>

                        <Text 
                            style={{
                                color:'#202020', 
                                fontWeight:'bold',
                                fontSize:16, 
                                textAlign:'center', 
                                paddingHorizontal: 30,
                                marginBottom: 20,}}
                        >Use Pin</Text>

                        <Text 
                            style={{
                                color:'#5e6062', 
                                fontSize:14, 
                                textAlign:'center', 
                                paddingHorizontal: 30,
                                flexWrap:'wrap',
                                marginBottom: 20,}}
                        >Admin set a pin for access balance sheet. Please Enter a 4 digit PIN</Text>

                        
                        <View style={styles.pinCodeInputContainer}>
                            <SmoothPinCodeInput password mask="﹡"
                                cellSize={40}
                                codeLength={4}
                                cellSpacing={10}
                                value={this.state.pincode}
                                cellStyle={{
                                    borderWidth: 2,
                                    borderColor: 'gray',
                                }}
                                cellStyleFocused={{
                                    borderColor: 'black',
                                }}
                                restrictToNumbers
                                onFulfill={this.verifyPin}
                                onTextChange={pincode => this.setState({ pincode })}
                            />
                            {/*
                            <TextInput
                                secureTextEntry
                                style={styles.pinCodeInput}
                                value={this.state.pinCode1}
                                onChangeText={this.onPinCode1Change}
                                keyboardType={"numeric"}
                                enablesReturnKeyAutomatically
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    this.pinCode2TextInput.focus();
                                }}
                                onFocus={ () => {
                                    this.setState({
                                        isPinCode1InFocus: true,
                                        pinCode1:'',
                                    });
                                }}
                                onEndEditing={ () => {
                                    this.setState({
                                        isPinCode1InFocus: false,
                                    });
                                }}
                                ref={ref => this.pinCode1TextInput = ref}
                            />
                            <TextInput
                                secureTextEntry
                                style={styles.pinCodeInput}
                                value={this.state.pinCode2}
                                onChangeText={this.onPinCode2Change}
                                keyboardType={"numeric"}
                                enablesReturnKeyAutomatically
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    this.pinCode3TextInput.focus();
                                }}
                                onFocus={ () => {
                                    this.setState({
                                        isPinCode2InFocus: true,
                                        pinCode2:'',
                                    });
                                }}
                                onEndEditing={ () => {
                                    this.setState({
                                        isPinCode2InFocus: false,
                                    });
                                }}
                                ref={ref => this.pinCode2TextInput = ref}
                            />
                            <TextInput
                                secureTextEntry
                                style={styles.pinCodeInput}
                                value={this.state.pinCode3}
                                onChangeText={this.onPinCode3Change}
                                keyboardType={"numeric"}
                                enablesReturnKeyAutomatically
                                returnKeyType={"next"}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    this.pinCode4TextInput.focus();
                                }}
                                onFocus={ () => {
                                    this.setState({
                                        isPinCode3InFocus: true,
                                        pinCode3:'',
                                    });
                                }}
                                onEndEditing={ () => {
                                    this.setState({
                                        isPinCode3InFocus: false,
                                    });
                                }}
                                ref={ref => this.pinCode3TextInput = ref}
                            />
                            <TextInput
                                secureTextEntry
                                style={styles.pinCodeInput}
                                value={this.state.pinCode4}
                                onChangeText={this.onPinCode4Change}
                                keyboardType={"numeric"}
                                enablesReturnKeyAutomatically
                                returnKeyType={"done"}
                                blurOnSubmit={false}
                                onSubmitEditing={() => {
                                    Keyboard.dismiss();
                                }}
                                onFocus={ () => {
                                    this.setState({
                                        isPinCode4InFocus: true,
                                        pinCode4:'',
                                    });
                                }}
                                onEndEditing={ () => {
                                    this.setState({
                                        isPinCode4InFocus: false,
                                    });
                                }}
                                ref={ref => this.pinCode4TextInput = ref}
                            />
                            */}
                        </View>
                        <View style={{flex:1}}></View>
                        <TouchableOpacity onPress={() => this.verifyPin(this.state.pincode)} style={{marginTop: 10}}>
                            <View style={styles.blueButton}>
                                <Text style={styles.buttonText}>Done</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={this.forgotPin} style={{marginTop: 30, marginBottom: 20,}}>
                            <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                <Text style={[styles.forgotPinButtonText, {fontWeight:'bold', textDecorationLine:'underline'}]}>Forget PIN?</Text>
                                <Text style={styles.forgotPinButtonText}>Retrieve PIN on Registered Mobile</Text>
                            </View>
                        </TouchableOpacity>
                        {
                            this.state.isLoading ? (
                                <View style={styles.activityIndicatorContainer}>
                                    <ActivityIndicator size="large" color="#161a1e"/>
                                </View>
                            ): null
                        }
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        
        );
    }

    goBack = () => {
        this.props.navigation.pop();
    }

    onPinCode1Change = (text) => {
        console.log("pincode 1 text after changed:::" + text+"###");
        this.setState({
            pinCode1:text,
        });
        if(text.length > 0) {
            this.pinCode2TextInput.focus();
        }
    };

    onPinCode2Change = (text) => {
        console.log("pincode 2 text after changed:::" + text+"###");
        this.setState({
            pinCode2:text,
        });
        if(text.length > 0) {
            this.pinCode3TextInput.focus();
        } else {
            this.pinCode1TextInput.focus();
        }
    };

    onPinCode3Change = (text) => {
        console.log("pincode 3 text after changed:::" + text+"###");
        this.setState({
            pinCode3:text,
        });
        if(text.length > 0) {
            this.pinCode4TextInput.focus();
        } else {
            this.pinCode2TextInput.focus();
        }
    };

    onPinCode4Change = (text) => {
        console.log("pincode 4 text after changed:::" + text+"###");
        this.setState({
            pinCode4:text,
        });
        if(text === '') {
            this.pinCode3TextInput.focus();
        }
    };

    verifyPin = (pincode) => {
        //let enteredPinCode = this.state.pinCode1 + this.state.pinCode2+ this.state.pinCode3 + this.state.pinCode4;
        let enteredPinCode = pincode;
        if(enteredPinCode.length < 4) {
            Utils.showAlert("", "Please enter 4 digit pin code");
            return;
        }

        this.setState({
            isLoading: true,
        })
        let thisInstance = this;

        let data = new FormData();
        data.append(Constants.KEY_USER_ID, this.state.userID);
        data.append(Constants.KEY_PIN, enteredPinCode);
        
        console.log("BODY:::");
        console.log(data);

           this.props.dispatchLoginBalanceSheet(data)
           setTimeout(() => {
               console.log('data====================================');
               console.log(this.props.LoginBalanceSheetData.data);
               console.log('data====================================');
                let valid = this.props.LoginBalanceSheetData.data[Constants.KEY_VALID];
                thisInstance.setState({
                    isLoading:false
                });
                if(valid === true) {
                    thisInstance.props.navigation.pop();
                    thisInstance.props.navigation.navigate("BalanceSheet");
                } 
                else{
                    let  message = 'Your pin is incorrect.';
                    Utils.showAlert("Error!", message);
                }
                
                if(this.props.LoginBalanceSheetData.error)
                {
                    let  message = 'Some error occurred. Please try agian.';
                    Utils.showAlert("Error!", message);
                }
         
           },2000 );
        
    }    

    forgotPin = () => {
        this.setState({
            isLoading: true,
        })
        let thisInstance = this;

        let data = new FormData();
        data.append(Constants.KEY_USER_ID, this.state.userID);
        
        console.log("BODY:::");
        console.log(data);

        this.props.dispatchForgetpin(data)
        setTimeout(() => {
            console.log("Response JSON:::");
            
            if (this.props.LoginBalanceSheetData.success)
            {
                this.setState({
                    isLoading: false,
                })
                let valid = this.props.LoginBalanceSheetData.forgetdata[Constants.KEY_VALID];

if(valid == true) {
    console.log(valid + 'dash')
    let message = this.props.LoginBalanceSheetData.forgetdata[Constants.KEY_MESSAGE];
    if(!(message && message.length)) {
                    message = "Your Pin Code has been sent to your registered phone number.";
                }
                thisInstance.setState({
                    isLoading:false
                });
                Utils.showAlert("", message);
            } else {
                let message = this.props.LoginBalanceSheetData.forgetdata[Constants.KEY_MESSAGE];
                if(!(message && message.length > 0)) {
                    message = 'Some error occurred. Please try agian.';
                }
                thisInstance.setState({
                    isLoading:false
                });
                Utils.showAlert("Error!", 'Some error occurred. Please try agian.');
            } 
          }
        }, 2000);
        // fetch(Constants.API_URL_FORGOT_BALANCESHEET_PIN, {
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
           
		// })
		// .catch((error) => {
        //     thisInstance.setState({
        //         isLoading: false
        //     });
        //     console.log("Error while sending pin....");
        //     console.log(error);
        //     Utils.showAlert("Some error occurred. Please try again.");
		// });
    }

}

const styles = StyleSheet.create({
    mainContainer: {
        width:'100%',
        height:'100%',
        backgroundColor:'white',
        justifyContent:'center',
        alignItems:'center',
        paddingHorizontal:15,
        margin:0,
    },
    backIcon: {
        width:11,
        height:20,
        resizeMode:'cover',
        marginRight:10,
    },
    button: {
        borderColor:'black',
        borderWidth:2,
        borderRadius:3,
        color:'black',
        fontSize:16,
        fontWeight:'bold',
        textTransform: 'uppercase',
        width:'100%',
        textAlign:'center',
        textAlignVertical:'center',
        height:40,
        lineHeight:40,
        marginTop: 20,
    },
    tabTitle: {
        color:'#202020',
        fontSize:14,
        flexGrow:1,
        fontWeight:'bold',
        textAlign:'left',
    },
    headerContainer: {
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
        backgroundColor:'white',
        height: 40,
    },
    closeIcon: {
        width:16,
        height:16,
        resizeMode:'cover',
        marginLeft:10,
    },
    activityIndicatorContainer: {
        flex:1,
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:0,
        right:0,
        left:0,
        zIndex:99999999,
        backgroundColor:'rgba(0,0,0,0.5)',
    },
    blueButton: {
        backgroundColor:'#0086fe',
        width:232,
        height:37,
        borderRadius: 17,
        justifyContent:'center',
        alignItems:'center',
    },
    buttonText: {
        color:'white',
        fontSize:18,
        textTransform:'uppercase',
        textAlign:'center',
    },
    blueBorderCircle: {
        borderWidth:1,
        borderColor:'#2c9fc9',
        width:16,
        aspectRatio:1,
        borderRadius:8,
        justifyContent:'center',
        alignItems:'center',
    },
    memberTypeContainer:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
        paddingVertical:3,
    },
    blueCircle:{
        backgroundColor:'#2c9fc9',
        width:7,
        aspectRatio:1,
        borderRadius:3.5,
    },
    blackBorderCircle: {
        borderWidth:1,
        borderColor:'#202020',
        width:16,
        aspectRatio:1,
        borderRadius:8,
    },
    memberTypeText: {
        color:'#202020',
        fontSize:16,
        marginLeft:10,
        textAlign:'left',
    },
    notificationDetailsContainer: {
        backgroundColor:'#f7f7f7',
        width:'100%',
        paddingVertical:20,
        paddingHorizontal:10,
        marginTop: 20,
    },
    notificationBoxText: {
        fontSize:14,
        color:'#7e7e7e',
    },
    notificationMessageBox: {
        backgroundColor:'white',
        borderRadius: 10,
        padding:10, 
        marginTop: 20,
    },
    notificationTitleInputText: {
        width:'100%',
        borderWidth:0,
        borderBottomWidth:1,
        borderBottomColor:'#202020',
    },
    notificationMessageInputText: {
        width:'100%',
        borderWidth:0,
    },
    otpGraphic: {
        width:228,
        height:217,
        resizeMode:'cover',
        marginBottom: 20,
    },
    pinCodeInputContainer: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
    },
    pinCodeInput: {
        width:50,
        aspectRatio:1,
        backgroundColor:'#f1f1f1',
        color:'#2a2a2a',
        fontSize:18,
        textAlign:'center',
        marginHorizontal:5,
        justifyContent:'center',
        alignItems:'center',
    },
    forgotPinButtonText: {
        color:'#737373',
        fontSize:14,
        width:'100%',
        paddingHorizontal:40,
        flexWrap:'wrap',
        textAlign:'center',
    },
});

const mapStateToprops = (state) => {
    return {
     LoginBalanceSheetData:state.LoginBalanceSheetReducer
    };
  };
  function mapDispatchToprops(dispatch) {
    return bindActionCreators(
      {
        dispatchLoginBalanceSheet: loginbalancesheet,
        dispatchForgetpin:forgetPinbalancesheet
      },
      dispatch,
    );
  }
  export default connect(
    mapStateToprops,
    mapDispatchToprops,
  ) (PinCodeScreen);
