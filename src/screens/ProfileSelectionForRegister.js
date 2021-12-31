import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, TouchableOpacity, ActivityIndicator, Keyboard
    , Dimensions ,TouchableHighlight, TextInput, TouchableWithoutFeedback, 
    KeyboardAvoidingView } from 'react-native';

import CardView from 'react-native-rn-cardview';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RegisterAction } from '../Redux/Actions/registerAction';

class ProfileSelectionForRegister extends Component {

    constructor(properties) {
        super(properties);

        let phoneNumber = properties.navigation.getParam(Constants.PARAM_PHONE_NUMBER);
        let callingCode = properties.navigation.getParam(Constants.PARAM_CALLING_CODE);
        //let countryCode = properties.navigation.getParam(Constants.PARAM_COUNTRY_CODE);

        this.state = {
            isLoading: false,
            phoneNumber: phoneNumber,
            callingCode: callingCode,
            //countryCode: countryCode,
            userType: "",
            name: '',
        };
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}} style={{flex:1, backgroundColor:'#161a1e'}}>
                <KeyboardAvoidingView behavior="padding" style={{flex:1, backgroundColor:'#161a1e'}}>
                    <View style={styles.mainContainer}>
                        <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                            <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                        </View>

                        <View style={[styles.headerContainer, {padding:10, justifyContent:'flex-start'}]}>
                            <TouchableOpacity
                                onPress={this.goBack}
                                style={{width: 30, height: 30, justifyContent:'center', alignItems:'center'}}
                            >
                                <Image style={styles.backIcon} source={require('../../assets/images/back_icon_white.png')}/>
                            </TouchableOpacity>
                        </View>
                        
                        <Text 
                            style={{
                                color:'white', 
                                fontSize:18, 
                                fontWeight:'bold',
                                textAlign:'center',}}
                        >Help us to Serve You Better</Text>

                        <Text 
                            style={{
                                color:'white', 
                                fontSize:13, 
                                textAlign:'center',}}
                        >Select Your Profile Type</Text>
                        
                        <View
                            style={{
                                width:'100%',
                                padding:20,
                            }}
                        >
                            <CardView 
                                    cardElevation={4}
                                    maxCardElevation={4}
                                    radius={10}
                                    backgroundColor={'#ffffff'}
                                    style={styles.cardViewStyle}
                            >
                                <View 
                                    style={{
                                        flexDirection:'row',
                                        justifyContent:'center',
                                        alignItems:'center',
                                        marginBottom: 20,
                                    }}
                                >
                                    <View style={styles.filledCircle} />
                                    <View style={styles.blankCircle} />
                                    <View style={styles.blankCircle} />
                                </View>

                                <View style={styles.inputContainer}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Your {this.state.userType === Constants.USER_TYPE_OWNER ? "Fitness Center ":""}Name</Text>
                                        <Text style={styles.requiredTitleText}>*</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        onChangeText={this.onNameChanged}
                                        value={this.state.name}
                                        placeholder={
                                            this.state.userType === Constants.USER_TYPE_OWNER 
                                            ? "Enter your fitness center name"
                                            : "Enter your name"
                                        }
                                        enablesReturnKeyAutomatically
                                        returnKeyType={"done"}
                                        blurOnSubmit={false}
                                        onSubmitEditing={() => {
                                            Keyboard.dismiss();
                                        }}
                                    />
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Select if you are a fitness club Owner</Text>
                                    </View>
                                    <TouchableOpacity onPress={this.selectUserTypeOwner}>
                                        <View style={[styles.inputText, {flexDirection:'row', justifyContent:'center', alignItems:'center'}]}>
                                            <Text style={styles.userTypeSelectionText}>I am a fitness club Owner</Text>
                                            <View style={this.state.userType === Constants.USER_TYPE_OWNER ? styles.filledCircle : styles.blankCircle} />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Select if you are a Member</Text>
                                    </View>
                                    <TouchableOpacity onPress={this.selectUserTypeMember}>
                                        <View style={[styles.inputText, {flexDirection:'row', justifyContent:'center', alignItems:'center'}]}>
                                            <Text style={styles.userTypeSelectionText}>I am a member Looking for Gym</Text>
                                            <View style={this.state.userType === Constants.USER_TYPE_MEMBER ? styles.filledCircle : styles.blankCircle} />
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={this.createProfile} style={styles.createProfileButton}>
                                        <Text style={styles.createProfileButtonText}>Create My Profile</Text>
                                    </TouchableOpacity>

                                </View>
                                
                                
                            </CardView>
                        </View>
                        
                        {
                            this.state.isLoading ? (
                                <View style={styles.activityIndicatorContainer}>
                                    <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
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

    onNameChanged = (text) => {
        this.setState({
            name:text
        });
    }

    selectUserTypeOwner = () => {
        this.setState({
            userType: Constants.USER_TYPE_OWNER
        });
    }

    selectUserTypeMember = () => {
        this.setState({
            userType: Constants.USER_TYPE_MEMBER
        });
    }

    createProfile = () => {

        let name = this.state.name;
        
        if(name === "") {
            Utils.showAlert("", "Please enter a name");
            return;
        }

        if(this.state.userType === "") {
            Utils.showAlert("", "Please select user type Gym Owner or Member");
            return;
        }

        this.setState({
            isLoading: true,
        });

        let thisInstance = this;

        let data = new FormData();
        data.append(Constants.KEY_NAME, name);
        data.append(Constants.KEY_COUNTRY_ID, this.state.callingCode);
        data.append(Constants.KEY_PHONE, this.state.phoneNumber);
        data.append(Constants.KEY_DEVICE_ID, "");
        data.append(Constants.KEY_USER_TYPE, this.state.userType);

        console.log("BODY:::");
        console.log(data);
        this.props.dispatchRegister(data).then(() => {
            let valid = this.props.RegisterReducerReducer.data[Constants.KEY_VALID];
           
            
                if(valid) {
                    let body = this.props.RegisterReducerReducer.data[Constants.KEY_BODY];
                    let userID = body[Constants.KEY_ID];
                    let userInfo = this.props.RegisterReducerReducer.data;
                    userInfo[Constants.KEY_USER_DATA] = body;
                    globals.setOneSetting(globals.KEY_USER_INFO, userInfo);
                    globals.setOneSetting(globals.KEY_IS_USER_LOGGED_IN, true);
                    let setupStatus = globals.KEY_ACCOUNT_SETUP_STATUS_OWNER_CREATED;
                    if(thisInstance.state.userType === Constants.USER_TYPE_MEMBER) {
                        setupStatus = globals.KEY_ACCOUNT_SETUP_STATUS_MEMBER_CREATED;
                    }
                    globals.setOneSetting(globals.KEY_USER_ACCOUNT_SETUP_STATUS, setupStatus);
                    
                    thisInstance.setState({
                        isLoading:false
                    }); 
    
                    thisInstance.goToEditProfileInfoWithID(userID);
                    
                }
            
            else {
                let message = this.props.RegisterReducerReducer.data[Constants.KEY_MESSAGE];
                if(!(message && message.length > 0)) {
                    message = 'Some error occurred. Please try agian.';
                }
                thisInstance.setState({
                    isLoading:false
                });
                Utils.showAlert("Error!", message);
            }
        })
        
      
       
    }

    goToEditProfileInfoWithID = (userID) => {
        let navigationParams = {};
        navigationParams[Constants.PARAM_CALLING_CODE] = this.state.callingCode;
        //navigationParams[Constants.PARAM_COUNTRY_CODE] = this.state.countryCode;
        navigationParams[Constants.PARAM_PHONE_NUMBER] = this.state.phoneNumber;
        navigationParams[Constants.KEY_USER_TYPE] = this.state.userType;
        navigationParams[Constants.KEY_NAME] = this.state.name;
        navigationParams[Constants.KEY_USER_ID] = userID;
        this.props.navigation.navigate("EditProfileInfo", navigationParams);
    }

}

const styles = StyleSheet.create({
    mainContainer: {
        width:'100%',
        height:'100%',
        backgroundColor:'#161a1e',
        justifyContent:'flex-start',
        alignItems:'center',
    },
    button: {
        width:'100%',
        backgroundColor:'#3d4a55',
        height:40,
        justifyContent:'center',
        alignItems:'center',
    },
    headerContainer: {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        backgroundColor:'#161a1e',
        paddingHorizontal: 10,
    },
    backIcon: {
        width:11,
        height:20,
        resizeMode:'cover',
        marginRight:10,
    },
    activityIndicatorContainer: {
        width:'100%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:0,
        left:0,
        zIndex:99999999,
        backgroundColor:'rgba(0,0,0,0.5)'
    },
    cardViewStyle: {
        width:'100%',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent:'center',
        padding: 30,
    },
    filledCircle: {
        backgroundColor:'#161a1e',
        width:14,
        aspectRatio:1,
        borderRadius: 7,
        borderWidth:1,
        borderColor:'#161a1e',
        marginHorizontal:10,
    },
    blankCircle: {
        backgroundColor:'white',
        width:14,
        aspectRatio:1,
        borderRadius: 7,
        borderWidth:1,
        borderColor:'#626060',
        marginHorizontal:10,
    },
    inputContainer: {
        width:'100%',
        marginTop:20,
        justifyContent:'flex-start',
        alignItems:'center',
    },
    inputTitleContainer:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
        marginTop: 20,
    },
    inputTitleText: {
        color:'#979797',
        fontSize:12,
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
        fontSize:14,
        width:'100%',
    },
    userTypeSelectionText: {
        flexGrow:1,
        marginRight:5,
        textAlign:'left',
        color:'#1d2b36',
        fontSize: 14,
    },
    createProfileButton: {
        backgroundColor:'#17aae0',
        borderRadius: 12,
        height:40,
        width:'100%',
        margin:30,
        justifyContent:'center',
        alignItems:'center',
    },
    createProfileButtonText: {
        fontSize:20,
        fontWeight:'bold',
        textAlign:'center',
        color:'white',
    },
});

const mapStateToprops = (state) => {
    return {
        RegisterReducerReducer:state.RegisterReducerReducer,
    };
  };
  function mapDispatchToprops(dispatch) {
    return bindActionCreators(
      {
       
        dispatchRegister:RegisterAction
      },
      dispatch,
    );
  }
  export default connect(
    mapStateToprops,
    mapDispatchToprops,
  )(ProfileSelectionForRegister);
