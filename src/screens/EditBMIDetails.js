import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, TouchableOpacity, ActivityIndicator, Keyboard
    , Dimensions ,TouchableHighlight, TextInput, TouchableWithoutFeedback, ImageBackground,  
    KeyboardAvoidingView, Platform, Button, ScrollView, PermissionsAndroid, Alert} from 'react-native';

import RNPickerSelect from 'react-native-picker-select';
import DatePicker from 'react-native-datepicker'
import ActionSheet from 'react-native-action-sheet';
import ImageResizer from 'react-native-image-resizer';
import { getStatusBarHeight } from 'react-native-status-bar-height';
var RNFS = require('react-native-fs');

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addOrEditMemberAction } from '../Redux/Actions/addOrEditMember';

const goals = [
    {label:"Stay Fit", value:'Stay Fit'},
    {label:"Loose Fat", value:'Lose fat'},
    {label:"Build Muscle", value:'Build muscle'},
    {label:"Get Stronger", value:'Get stronger'},
    {label:"Improve Athletic Skills", value:'Improve athletic skills'},
    {label:"Improve Joint Flexibility", value:'Improve joint flexibility'},
];

class EditBMIDetails extends Component {

    constructor(properties) {
        super(properties);

        let name = properties.navigation.getParam(Constants.KEY_NAME, "");
        let countryID = properties.navigation.getParam(Constants.KEY_COUNTRY_ID, "");
        let phoneNumber = properties.navigation.getParam(Constants.KEY_PHONE, "");
        let profileImageUri = properties.navigation.getParam(Constants.KEY_PROFILE_IMAGE, "");
        let gender = properties.navigation.getParam(Constants.KEY_GENDER, "");
        let address = properties.navigation.getParam(Constants.KEY_ADDRESS, "");
        let memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, "");
        let goal = properties.navigation.getParam(Constants.KEY_GOAL, "");
        let weight = properties.navigation.getParam(Constants.KEY_WEIGHT, "");
        let height = properties.navigation.getParam(Constants.KEY_HEIGHT, "");
        let dateOfBirth = properties.navigation.getParam(Constants.KEY_DATE_OF_BIRTH, "");

        this.state = {
            isLoading: false,
            goal: goal,
            height: height,
            weight: weight,
            dateOfBirth: dateOfBirth,
            name: name,
            countryID: countryID,
            phoneNumber: phoneNumber,
            profileImageUri: profileImageUri,
            gender: gender,
            address: address,
            memberID: memberID,
        };
    }

    render() {

        if(this.state.isShowingPhotoPicker) {
            return (
                <View style={{ flex: 1 }}>
                    <View
                    style={
                        Platform.OS == "android" ? { paddingTop: 0 } : { paddingTop: 20 }
                    }
                    />
        
                    <View style={{
                                width:'100%', 
                                backgroundColor:'white', 
                                height:50,
                                flexDirection:'row',
                                justifyContent:'space-around',
                                alignItems:'center',
                            }
                        }>
                        <Button
                            style={{width:100, height:'100%'}}
                            color="black"
                            title="Go back"
                            onPress={() => this.cancelPhotoSelection()}
                        />
                        <Button
                            style={{width:100, height:'100%'}}
                            color="black"
                            title="Done"
                            onPress={() => this.donePhotoSelection()}
                        />
                    </View>
                        
            
                    <CameraRollPicker
                        groupTypes="All"
                        callback={this.onPhotoSelected}
                        assetType="Photos"
                        maximum={1}
                        selected={[this.state.temporarySelectedProfileImage]}
                    />
                </View>
              );
        }

        let coverPhotoURL = this.state.temporarySelectedCoverPhoto;
        if(coverPhotoURL === null) {
            coverPhotoURL = this.state.coverPhotoURL;
        }

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}} style={{flex:1, backgroundColor:'#f7f7f7'}}>
                
                    <View style={styles.mainContainer}>
                        <View style={{ height:getStatusBarHeight(true), backgroundColor: "#161a1e"}}>
                            <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
                        </View>
                        <View style={styles.headerContainer}>
                            {/**
                            <TouchableOpacity
                                onPress={this.goBack}
                                style={{width: 30, height: 30, justifyContent:'center', alignItems:'center'}}
                            >
                                <Image style={styles.backIcon} source={require('../../assets/images/back_icon_white.png')}/>
                            </TouchableOpacity>
                             */}
                            
                            <Text
                                style={{
                                    color:'white',
                                    fontSize: 20,
                                    fontWeight:'bold',
                                    width:'100%',
                                    textAlign: 'center',
                                }}
                            >BMI Details</Text>
                        </View>

                        <View
                            style={{
                                width:'100%',
                                height:'100%',
                                paddingHorizontal:20,
                                paddingBottom: 120,
                                position:'absolute',
                                top:100,
                                left:0,
                            }}
                        >
                            <View style={styles.cardView}>
                                {
                                    this.state.memberID === "" ? (
                                        <View 
                                            style={{
                                                flexDirection:'row',
                                                justifyContent:'center',
                                                alignItems:'center',
                                                marginTop:60,
                                                marginBottom: 20,
                                            }}
                                        >
                                            <View style={styles.filledCircle} />
                                            <View style={styles.filledCircle} />
                                            <View style={styles.filledCircle} />
                                        </View>
                                    ) : null
                                }

                                    
                                <View style={[styles.inputContainer, {paddingHorizontal: 20,}]} onStartShouldSetResponder={() => true}>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Goal</Text>
                                    </View>
                                    <TouchableOpacity onPress={ () => {
                                        this.onSelectGoalButtonClicked();
                                    }}>
                                        <View style={[styles.inputText ,{width:'100%', justifyContent:'center', alignItems:'center', flexDirection:'row', paddingVertical:5}]}>
                                            <Text style={{flex:1,color:'#162029',fontSize:16,}}>{this.state.goal === "" ? "Select Goal": this.state.goal}</Text>
                                            <Image style={{marginLeft:10, width:10, height:6,}} resizeMode={"cover"} source={require('../../assets/images/black_down_button.png')} />
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Weight (KG)</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.inputText}
                                        onChangeText={this.onWeightChanged}
                                        value={this.state.weight}
                                        placeholder={"Enter weight in KG"}
                                        enablesReturnKeyAutomatically
                                        keyboardType={"number-pad"}
                                        returnKeyType={"next"}
                                        blurOnSubmit={false}
                                        onSubmitEditing={() => {
                                            this.heightInput.focus();
                                        }}
                                    />

                                    <View style={styles.inputTitleContainer}>
                                    <Text style={styles.inputTitleText}>Height (CM)</Text>
                                    </View>
                                    <TextInput 
                                        ref={ref => this.heightInput = ref}
                                        style={styles.inputText}
                                        onChangeText={this.onHeightChanged}
                                        value={this.state.height}
                                        placeholder={"Enter Height in Centimeter"}
                                        keyboardType={"number-pad"}
                                        enablesReturnKeyAutomatically
                                        returnKeyType={"done"}
                                        blurOnSubmit={false}
                                        onSubmitEditing={() => {
                                            Keyboard.dismiss();
                                        }}
                                    />
                                    
                                    <View style={styles.inputTitleContainer}>
                                        <Text style={styles.inputTitleText}>Date of Birth</Text>
                                    </View>
                                    <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                        <DatePicker
                                            style={styles.datePickerStyle}
                                            date={this.state.dateOfBirth}
                                            mode="date"
                                            placeholder="select birth date"
                                            format="YYYY-MM-DD"
                                            //minDate="2016-05-01"
                                            maxDate={new Date()}
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
                                            onDateChange={this.onDateOfBirthChanged}
                                        />
                                    </View>

                                    <TouchableOpacity onPress={this.nextStep} style={styles.createProfileButton}>
                                        <Text style={styles.createProfileButtonText}>Next Step</Text>
                                    </TouchableOpacity>

                                </View>
                                
                            </View>
                        </View>
                        <View style={styles.profileImageParent}>
                            <View style={styles.profileImageContainer}>
                                <Image style={styles.profileImage} source={require('../../assets/images/bmi_icon.png')}
                                />
                            </View>
                        </View>

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

    onSelectGoalButtonClicked = () => {
        ActionSheet.showActionSheetWithOptions({
            title: 'Select Goal',
            options: (Platform.OS == 'ios') ? Constants.goalOptionsIOS : Constants.goalOptionsAndroid,
            cancelButtonIndex: Constants.goalOptionsIOS.length-1,
            destructiveButtonIndex: Constants.goalOptionsIOS.length-1,
            tintColor: '#121619'
          },
          (buttonIndex) => {
              console.log("selected button index:::" + buttonIndex);
              if(buttonIndex !== undefined && buttonIndex < Constants.goalOptionsAndroid.length) {
                this.onGoalOptionSelected(buttonIndex);
            }
        });
    }

    onGoalOptionSelected(index) {
        let goalOption = Constants.goalOptionsIOS[index];
        let goal = Constants.goalValues[goalOption];
        this.setState({
            goal: goal,
        });
    }

    onGoalChanged(goal) {
        this.setState({
            goal:goal
        });
    }

    onWeightChanged = (text) => {
        this.setState({
            weight:text
        });
    }

    onHeightChanged = (text) => {
        this.setState({
            height: text
        });
    }

    onDateOfBirthChanged = (date) => {
        this.setState({
            dateOfBirth: date
        });
    }

    nextStep = async () => {
        this.setState({
            isLoading: true,
        });

        let thisInstance = this;

        let profileImageBase64 = "";
        if(this.state.profileImageUri &&this.state.profileImageUri.length > 0) {
            let imageURi = this.state.profileImageUri;
            try {
                let response = await ImageResizer.createResizedImage(imageURi, 1000, 1000, "JPEG", 60);
                console.log("response:::");
                console.log(response);
                imageURi = response.uri;
            } catch(error) {
                console.log("Error while resizing image...");
                console.log(error);
            }
            profileImageBase64 = await RNFS.readFile(imageURi, 'base64').then();
            //profileImageBase64 = await RNFS.readFile(this.state.selectedProfileImage, 'base64').then();
        }

        
        let data = new FormData();
        
        data.append(Constants.KEY_GYM_MEMBER_MANAGE_ID, "");
        data.append(Constants.KEY_ID, this.state.memberID);
        data.append(Constants.KEY_HEIGHT, this.state.height);
        data.append(Constants.KEY_WEIGHT, this.state.weight);
        data.append(Constants.KEY_HEIGHTKG, "kg");
        data.append(Constants.KEY_REGISTRATION_ID, "");
        data.append(Constants.KEY_MEMBER_TYPE, Constants.MEMBER_TYPE_USER);
        data.append(Constants.KEY_NAME, this.state.name);
        data.append(Constants.KEY_PHONE, this.state.phoneNumber);
        data.append(Constants.KEY_GENDER, this.state.gender);
        data.append(Constants.KEY_GOAL, this.state.goal);
        data.append(Constants.KEY_DATE_OF_BIRTH, this.state.dateOfBirth);
        data.append(Constants.KEY_ANNIVERSARY_DATE, "");
        data.append(Constants.KEY_ADDRESS, this.state.address);
        data.append(Constants.KEY_MEMBERSHIP_ID, "");
        data.append(Constants.KEY_MEMBERSHIP_DURATION, "");
        data.append(Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE, "");
        data.append(Constants.KEY_MEMBER_DAYS, "");
        data.append(Constants.KEY_START_DATE, "");
        data.append(Constants.KEY_END_DATE, "");
        data.append(Constants.KEY_NEXT_INSTALLEMENT, "");
        data.append(Constants.KEY_IMAGE, profileImageBase64);
        data.append(Constants.KEY_COUNTRY_ID, this.state.countryID);
        data.append(Constants.KEY_GYM_ID, "");
        data.append(Constants.KEY_EMAIL, "");

        console.log("BODY:::");
        console.log(data);

        //return;
        this.props.addoreditmember(data).then(() => {
          let valid = this.props.addoreditmemberdata[Constants.KEY_VALID];
          if(valid) {
              let memberData = this.props.addoreditmemberdata[Constants.KEY_MEMBER_DATA];
              let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
              userInfo[Constants.KEY_MEMBER_DATA] = memberData;
              
              globals.setOneSetting(globals.KEY_USER_INFO, userInfo);
              globals.setOneSetting(globals.KEY_USER_ACCOUNT_SETUP_STATUS, globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED);
              
              thisInstance.setState({
                  isLoading:false
              }); 

              if(thisInstance.state.memberID === "") {
                  thisInstance.goToHomeTab();
              } else {
                  thisInstance.showDataSavedAlert();
              }
              
          } else {
              let message = this.props.addoreditmemberdata[Constants.KEY_MESSAGE];
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

    showDataSavedAlert() {
        let thisInstance = this;
        Alert.alert(
            "Success", "Member info saved successfully.",
            [
                { 
                    text: 'OK', 
                    onPress: () => {
                        thisInstance.goToHomeTab();
                    } 
                },
            ],
            { cancelable: false },
          );
    }

    goToHomeTab() {
        this.props.navigation.navigate("MemberMainApp");
    }

}

const styles = StyleSheet.create({
    mainContainer: {
        width:'100%',
        height:'100%',
        backgroundColor:'#f7f7f7',
        justifyContent:'flex-start',
        alignItems:'center',
    },
    headerContainer: {
        width:'100%',
        backgroundColor:'#161a1e',
        height:180,
        justifyContent:'flex-start',
        alignItems:'flex-start',
        paddingHorizontal: 20,
    },
    coverPhotoChooseButton: {
        width: 20,
        height: 20,
        resizeMode: 'cover',
    },
    cardView: {
        width:'100%',
        height:'100%',
        borderRadius: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent:'center',
    },
    button: {
        width:'100%',
        backgroundColor:'#3d4a55',
        height:40,
        justifyContent:'center',
        alignItems:'center',
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
        justifyContent:'flex-start',
        alignItems:'center',
    },
    inputTitleContainer:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        width:'100%',
        marginTop: 10,
    },
    inputTitleText: {
        color:'#979797',
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
        fontSize:18,
        fontWeight:'bold',
        textAlign:'center',
        color:'white',
    },
    profileImageParent: {
        width:'100%',
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        top:100-37.5,
        left:0,
    },
    profileImageContainer: {
        width:75,
        height:75,
    },
    profileImage: {
        width:75,
        height:75,
        borderRadius:37.5,
        borderWidth:1,
        borderColor:'white',
        resizeMode:'cover',
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
    datePickerStyle: {
        borderWidth:0,
        borderBottomWidth:1,
        borderBottomColor:'#1d2b36',
        width:'100%',
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

  const mapStateToProps = (state) => {
    return {
      Success: state.addOrEditMember.success,
      Loading: state.addOrEditMember.isLoading,
      Loadingstaff: state.addOrEditMember.isLoadingstaff,
      successstaff: state.addOrEditMember.successstaff,
      addoreditmemberdata: state.addOrEditMember.data,
      mydata: state.FetchSubscriptionReducer,
      RecievePaymentReducer: state.RecievePaymentReducer,
    };
  };
  function mapDispatchToProps(dispatch) {
    return bindActionCreators(
      {
        addoreditmember: addOrEditMemberAction,
      },
      dispatch,
    );
  }
  export default connect(mapStateToProps, mapDispatchToProps) (EditBMIDetails);
