import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput
, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Switch } from 'react-native';

import { getStatusBarHeight } from 'react-native-status-bar-height';


import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changebalancesheetpin } from '../Redux/Actions/all_balanceAction';

class BalanceSheetSettings extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];

        let userData = userInfo[Constants.KEY_USER_DATA];
        let userID = userData[Constants.KEY_ID];

        let isPinEnabled = false;
        if(userData[Constants.KEY_PIN_STATUS] === Constants.STATUS_ACTIVE) {
            isPinEnabled = true;
        }

        this.state = {
            gymID: gymID,
            userID: userID,
            isLoading: false,
            pinCode1: '',
            pinCode2: '',
            pinCode3: '',
            pinCode4: '',
            isPinCode1InFocus: false,
            isPinCode2InFocus: false,
            isPinCode3InFocus: false,
            isPinCode4InFocus: false,
            repeatPinCode1: '',
            repeatPinCode2: '',
            repeatPinCode3: '',
            repeatPinCode4: '',
            isRepeatPinCode1InFocus: false,
            isRepeatPinCode2InFocus: false,
            isRepeatPinCode3InFocus: false,
            isRepeatPinCode4InFocus: false,
            isPinEnabled: isPinEnabled,
        };
    }

    componentDidMount() {
        
    }

	render() {
        
       return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1, margin:0, padding: 0,}}>
                <KeyboardAvoidingView behavior="padding" style={{flex:1, margin:0, padding:0}}>
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
                        
                        <Image style={styles.otpGraphic} source={require('../../assets/images/balanesheet_settings_top_image.png')}/>

                        <Text 
                            style={{
                                color:'#202020', 
                                fontWeight:'bold',
                                fontSize:16, 
                                textAlign:'center', 
                                paddingHorizontal: 30,
                                marginBottom: 15,}}
                        >Create Pin</Text>

                        <Text 
                            style={{
                                color:'#5e6062', 
                                fontSize:14, 
                                textAlign:'center', 
                                paddingHorizontal: 30,
                                flexWrap:'wrap',
                                marginBottom: 10,}}
                        >Enter PIN below. We’re just being extra careful</Text>
                        
                        <View style={styles.settingsContainer}>
                            <Switch 
                                style={{marginLeft: 20}}
                                value={this.state.isPinEnabled} 
                                onValueChange={this.onToggleBalanceSheetPin} 
                                thumbColor={'rgba(49, 113, 187, 1)'} 
                                trackColor={{false:'grey', true:'rgba(103, 183, 232, 1)'}} 
                            />
                            <View style={styles.settingsInfoContainer}>
                                <Text style={styles.settingsTitleText}>Pin Enable/Disable</Text>
                            </View>
                        </View>
                        
                        {
                            this.state.isPinEnabled ? (
                                <View
                                    style={{
                                        width:'100%',
                                        justifyContent:'center',
                                        alignItems:'center',
                                    }}
                                >
                                    <Text style={[styles.settingsSubtitleText, {marginTop: 10}]}>Type a PIN</Text>
                                    <View style={styles.pinCodeInputContainer}>
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
                                    </View>
                                    <Text style={[styles.settingsSubtitleText, {marginTop: 10}]}>Re-enter PIN</Text>
                                    <View style={styles.pinCodeInputContainer}>
                                        <TextInput
                                            secureTextEntry
                                            style={styles.pinCodeInput}
                                            value={this.state.repeatPinCode1}
                                            onChangeText={this.onRepeatPinCode1Change}
                                            keyboardType={"numeric"}
                                            enablesReturnKeyAutomatically
                                            returnKeyType={"next"}
                                            blurOnSubmit={false}
                                            onSubmitEditing={() => {
                                                this.repeatPinCode2TextInput.focus();
                                            }}
                                            onFocus={ () => {
                                                this.setState({
                                                    isRepeatPinCode1InFocus: true,
                                                    repeatPinCode1: '',
                                                });
                                            }}
                                            onEndEditing={ () => {
                                                this.setState({
                                                    isRepeatPinCode1InFocus: false,
                                                });
                                            }}
                                            ref={ref => this.repeatPinCode1TextInput = ref}
                                        />
                                        <TextInput
                                            secureTextEntry
                                            style={styles.pinCodeInput}
                                            value={this.state.repeatPinCode2}
                                            onChangeText={this.onRepeatPinCode2Change}
                                            keyboardType={"numeric"}
                                            enablesReturnKeyAutomatically
                                            returnKeyType={"next"}
                                            blurOnSubmit={false}
                                            onSubmitEditing={() => {
                                                this.repeatPinCode3TextInput.focus();
                                            }}
                                            onFocus={ () => {
                                                this.setState({
                                                    isRepeatPinCode2InFocus: true,
                                                    repeatPinCode2:'',
                                                });
                                            }}
                                            onEndEditing={ () => {
                                                this.setState({
                                                    isRepeatPinCode2InFocus: false,
                                                });
                                            }}
                                            ref={ref => this.repeatPinCode2TextInput = ref}
                                        />
                                        <TextInput
                                            secureTextEntry
                                            style={styles.pinCodeInput}
                                            value={this.state.repeatPinCode3}
                                            onChangeText={this.onRepeatPinCode3Change}
                                            keyboardType={"numeric"}
                                            enablesReturnKeyAutomatically
                                            returnKeyType={"next"}
                                            blurOnSubmit={false}
                                            onSubmitEditing={() => {
                                                this.repeatPinCode4TextInput.focus();
                                            }}
                                            onFocus={ () => {
                                                this.setState({
                                                    isRepeatPinCode3InFocus: true,
                                                    repeatPinCode3:'',
                                                });
                                            }}
                                            onEndEditing={ () => {
                                                this.setState({
                                                    isRepeatPinCode3InFocus: false,
                                                });
                                            }}
                                            ref={ref => this.repeatPinCode3TextInput = ref}
                                        />
                                        <TextInput
                                            secureTextEntry
                                            style={styles.pinCodeInput}
                                            value={this.state.repeatPinCode4}
                                            onChangeText={this.onRepeatPinCode4Change}
                                            keyboardType={"numeric"}
                                            enablesReturnKeyAutomatically
                                            returnKeyType={"done"}
                                            blurOnSubmit={false}
                                            onSubmitEditing={() => {
                                                Keyboard.dismiss();
                                            }}
                                            onFocus={ () => {
                                                this.setState({
                                                    isRepeatPinCode4InFocus: true,
                                                    repeatPinCode4:'',
                                                });
                                            }}
                                            onEndEditing={ () => {
                                                this.setState({
                                                    isRepeatPinCode4InFocus: false,
                                                });
                                            }}
                                            ref={ref => this.repeatPinCode4TextInput = ref}
                                        />
                                    </View>
                                </View>
                            ) : null
                        }
                        <View style={{flex:1, flexGrow:1}}></View>
                        <TouchableOpacity onPress={this.changePin} style={{marginTop: 10, marginBottom: 10}}>
                            <View style={styles.blueButton}>
                                <Text style={styles.buttonText}>Done</Text>
                            </View>
                        </TouchableOpacity>
                        {
                            this.props.allBalanceReducer.isLoading ? (
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

    onToggleBalanceSheetPin = (status) => {
        
        this.setState({
            isPinEnabled: status
        });
    }

    onPinCode1Change = (text) => {
        this.setState({
            pinCode1:text,
        });
        if(text !== '') {
            this.pinCode2TextInput.focus();
        }
    };

    onPinCode2Change = (text) => {
        this.setState({
            pinCode2:text,
        });
        if(text !== '') {
            this.pinCode3TextInput.focus();
        } else {
            this.pinCode1TextInput.focus();
        }
    };

    onPinCode3Change = (text) => {
        this.setState({
            pinCode3:text,
        });
        if(text !== '') {
            this.pinCode4TextInput.focus();
        } else {
            this.pinCode2TextInput.focus();
        }
    };

    onPinCode4Change = (text) => {
        this.setState({
            pinCode4:text,
        });
        if(text == '') {
            this.pinCode3TextInput.focus();
        }
    };

    onRepeatPinCode1Change = (text) => {
        this.setState({
            repeatPinCode1:text,
        });
        if(text !== '') {
            this.repeatPinCode2TextInput.focus();
        }
    };

    onRepeatPinCode2Change = (text) => {
        this.setState({
            repeatPinCode2:text,
        });
        if(text !== '') {
            this.repeatPinCode3TextInput.focus();
        } else {
            this.repeatPinCode1TextInput.focus();
        }
    };

    onRepeatPinCode3Change = (text) => {
        this.setState({
            repeatPinCode3:text,
        });
        if(text !== '') {
            this.repeatPinCode4TextInput.focus();
        } else {
            this.repeatPinCode2TextInput.focus();
        }
    };

    onRepeatPinCode4Change = (text) => {
        this.setState({
            repeatPinCode4:text,
        });
        if(text == '') {
            this.repeatPinCode3TextInput.focus();
        }
    };

    changePin = () => {
        let enteredPinCode = "";
        if(this.state.isPinEnabled === true) {
            enteredPinCode = this.state.pinCode1 + this.state.pinCode2
            + this.state.pinCode3 + this.state.pinCode4;

            let enteredRepeatPinCode = this.state.repeatPinCode1 + this.state.repeatPinCode2
            + this.state.repeatPinCode3 + this.state.repeatPinCode4;

            if(enteredPinCode.length < 4) {
                Utils.showAlert("", "Please enter 4 digit PIN");
                return;
            }

            if(enteredPinCode !== enteredRepeatPinCode) {
                Utils.showAlert("", "PIN and Repeated PIN don't match.");
                return;
            }
        } 

        this.setState({
            isLoading: true,
        })
        let thisInstance = this;

        let pinStatus = this.state.isPinEnabled === true ? Constants.STATUS_ACTIVE : Constants.STATUS_INACTIVE;
        let data = new FormData();
        data.append(Constants.KEY_USER_ID, this.state.userID);
        data.append(Constants.KEY_CREATE_PIN, enteredPinCode);
        data.append(Constants.KEY_CONFIRM_PIN, enteredPinCode);
        data.append(Constants.KEY_STATUS, pinStatus);
        
        console.log("BODY:::");
        console.log(data);
this.props.DispatchChangePin(data)
setTimeout(() => {
    console.log('kkkkkkkkkkkkkkkkkkkkkkkk');
console.log(this.props.allBalanceReducer.pindata)
console.log('kkkkkkkkkkkkkkkkkkkkkkkk');
if (this.props.allBalanceReducer.success) {
    let userInfo = globals.getSetting().userInfo;
            let userData = userInfo[Constants.KEY_USER_DATA];
            userData[Constants.KEY_PIN_STATUS] = pinStatus;
            userInfo[Constants.KEY_USER_DATA] = userData;
            globals.setOneSetting(globals.KEY_USER_INFO, userInfo);
            thisInstance.props.navigation.pop();
}else
{
    let  message = 'Some error occurred. Please try agian.';
    Utils.showAlert("Error!", message);

}
}, 2000);

        // fetch(Constants.API_URL_BALANCESHEET_CHANGE_PIN, {
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
        //     console.log(responseJson);
        //     let valid = responseJson[Constants.KEY_VALID];
        //     if(valid === true) {
        //         let userInfo = globals.getSetting().userInfo;
        //         let userData = userInfo[Constants.KEY_USER_DATA];
        //         userData[Constants.KEY_PIN_STATUS] = pinStatus;
        //         userInfo[Constants.KEY_USER_DATA] = userData;
        //         globals.setOneSetting(globals.KEY_USER_INFO, userInfo);

        //         thisInstance.setState({
        //             isLoading:false
        //         });
        //         thisInstance.props.navigation.pop();
                
        //     } else {
        //         let message = responseJson[Constants.KEY_MESSAGE];
        //         if(!(message && message.length > 0)) {
        //             message = 'Some error occurred. Please try agian.';
        //         }
        //         thisInstance.setState({
        //             isLoading:false
        //         });
        //         Utils.showAlert("Error!", message);
        //     }
		// })
		// .catch((error) => {
        //     thisInstance.setState({
        //         isLoading: false
        //     });
        //     console.log("Error while sending notification....");
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
        width:169,
        height:169,
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
    settingsContainer: {
        backgroundColor:'white',
        width:'100%',
        flexDirection:'row-reverse',
        justifyContent:'center',
        alignItems:'center',
        marginTop: 10,
    },
    settingsInfoContainer: {
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    settingsTitleText: {
        color:'#737373',
        fontSize:16,
        width:'100%',
        textAlign:'left',
    },
    settingsSubtitleText: {
        width:'100%',
        color:'#5e6062',
        fontSize:14,
        textAlign:'left',
        flexWrap: 'wrap',
    },
});

const mapStateToProps = (state) => {
    return {
        allBalanceReducer: state.allBalanceReducer,
    };
  };
  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        // DispatchaddWorkout: addWorkout,
        DispatchChangePin: changebalancesheetpin,
      },
      dispatch,
    );
  }
  export default connect(
    mapStateToProps,
    mapDispatchToProps,
  ) (BalanceSheetSettings);
