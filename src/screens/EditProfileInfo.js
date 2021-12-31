import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  TouchableHighlight,
  TextInput,
  TouchableWithoutFeedback,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Button,
  ScrollView,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import CameraRollPicker from 'react-native-camera-roll-picker';
import DatePicker from 'react-native-datepicker';
import {RNCamera} from 'react-native-camera';
import ActionSheet from 'react-native-action-sheet';
import ImageResizer from 'react-native-image-resizer';
var RNFS = require('react-native-fs');
import {getStatusBarHeight} from 'react-native-status-bar-height';

import GetLocation from 'react-native-get-location';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
  fetchAllCity,
  fetchAllCountry,
  fetchAllStates,
} from '../Redux/Actions/getAllCityAction';
import {addgym} from '../Redux/Actions/gymaction';

const genders = [
  {label: 'Female', value: 'female'},
  {label: 'Male', value: 'male'},
];

const photoOptionsIOS = [
  'Capture with Camera',
  'Select from Gallery',
  'Cancel',
];

const photoOptionsAndroid = ['Capture with Camera', 'Select from Gallery'];

const PendingView = () => (
  <View
    style={{
      flex: 1,
      width: '100%',
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text>Waiting</Text>
  </View>
);

const PHOTO_SELECTION_TASK_PROFILE = 'profile';
const PHOTO_SELECTION_TASK_COVER = 'cover';

class EditProfileInfo extends Component {
  constructor(properties) {
    super(properties);

    let phoneNumber = properties.navigation.getParam(
      Constants.PARAM_PHONE_NUMBER,
    );
    let callingCode = properties.navigation.getParam(
      Constants.PARAM_CALLING_CODE,
    );
    // let countryCode = properties.navigation.getParam(Constants.PARAM_COUNTRY_CODE);
    let userType = properties.navigation.getParam(Constants.KEY_USER_TYPE);
    let name = properties.navigation.getParam(Constants.KEY_NAME);
    let userID = properties.navigation.getParam(Constants.KEY_USER_ID);

    this.state = {
      country: '',
      StateId:'',
      newpassword: '',
      reEnterpassowd: '',
      isLoading: false,
      contactNo: callingCode + phoneNumber,
      phoneNumber: phoneNumber,
      callingCode: callingCode,
      //countryCode: ,
      // userType: Constants.USER_TYPE_OWNER,
      userType: Constants.USER_TYPE_OWNER,
      useriD: userID,
      name: name,
      address: '',
      State: '',
      city: '',
      cityID: '',
      workoutSinceDate: '',
      gender: genders[0].value,
      isShowingPhotoPicker: false,
      selectedProfileImage: null,
      temporarySelectedImage: '',
      selectedCoverImage: null,
      coverPhotoURL: null,
      profilePhotoURL: null,
      allStates: [],
      allCities: [],
      photoSelectionTask: '',
      isFetchingData: true,
      isDataLoaded: false,
      isShowingCamera: false,
      isShowingPictureTakenWithCamera: false,
      latitude: '',
      longitude: '',
      Homeadd:''
    };
  }
  componentDidMount() {
   
    this.fetchAllCountry();
    this.fetchCities();
    this.fetchStates();
  }

  requestForPhotosPermissionIfNotGranted() {
    try {
      const granted = PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Access External Storage',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //console.log("You can use the gallery");
      } else {
        //console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    // if(this.state.isFetchingData) {
    //     return (
    //         <View style={styles.activityIndicatorContainer}>
    //             <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
    //         </View>
    //     );
    // }

    // if(this.state.isDataLoaded === false) {
    //     return (
    //         <View style={styles.mainContainer}>
    //             <TouchableOpacity
    //                 onPress={()=> {
    //                     this.fetchCities();
    //                 }}
    //                 style={{width:'100%'}}
    //             >
    //                 <Text
    //                     style={styles.button}
    //                 >
    //                 Retry to fetch data
    //                 </Text>
    //             </TouchableOpacity>
    //         </View>
    //     );

    // }

    if (this.state.isShowingCamera) {
      return (
        <View style={styles.cameraContainer}>
          <RNCamera
            style={styles.cameraPreview}
            type={RNCamera.Constants.Type.back}
            //flashMode={RNCamera.Constants.FlashMode.on}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}>
            {({camera, status, recordAudioPermissionStatus}) => {
              if (status !== 'READY') {
                return <PendingView />;
              }
              return (
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => this.takePicture(camera)}
                    style={styles.captureButton}>
                    <Text style={{fontSize: 14}}> SNAP </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.cancelCapture()}
                    style={styles.cancelCaptureButton}>
                    <Text style={{fontSize: 14}}> Cancel </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          </RNCamera>
        </View>
      );
    }

    if (this.state.isShowingPictureTakenWithCamera) {
      return (
        <View style={styles.cameraContainer}>
          <Image
            style={{
              width: '100%',
              flex: 1,
            }}
            resizeMode={'cover'}
            source={{uri: this.state.temporarySelectedProfileImage.uri}}
          />

          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => this.retakePicture()}
              style={styles.captureButton}>
              <Text style={{fontSize: 14}}> Retake </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.confirmTakenPicture()}
              style={styles.cancelCaptureButton}>
              <Text style={{fontSize: 14}}> Confirm </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (this.state.isShowingPhotoPicker) {
      return (
        <View style={{flex: 1}}>
          <View
            style={
              Platform.OS == 'android' ? {paddingTop: 0} : {paddingTop: 20}
            }
          />

          <View
            style={{
              width: '100%',
              backgroundColor: 'white',
              height: 50,
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}>
            <Button
              style={{width: 100, height: '100%'}}
              color="black"
              title="Go back"
              onPress={() => this.cancelPhotoSelection()}
            />
            <Button
              style={{width: 100, height: '100%'}}
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
            selected={[this.state.temporarySelectedImage]}
          />
        </View>
      );
    }

    let coverPhotoURL = this.state.selectedCoverImage;
    if (coverPhotoURL === null) {
      coverPhotoURL = this.state.coverPhotoURL;
    }

    return (
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
        style={{flex: 1}}
        style={{flex: 1, backgroundColor: '#f7f7f7'}}>
        <View style={styles.mainContainer}>
          <View
            style={{
              height: getStatusBarHeight(true),
              backgroundColor: '#161a1e',
            }}>
            <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
          </View>
          <ImageBackground
            style={styles.coverPhotoContainer}
            source={{uri: coverPhotoURL}}>
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
                color: 'white',
                fontSize: 20,
                fontWeight: 'bold',
                width: '100%',
                textAlign: 'center',
                marginTop: 10,
              }}>
              Register
            </Text>
          </ImageBackground>
          {this.state.userType === Constants.USER_TYPE_OWNER ? (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
              }}
              onPress={this.selectCoverPhoto}>
              <Image
                style={styles.coverPhotoChooseButton}
                source={require('../../assets/images/box_edit_button.png')}
              />
            </TouchableOpacity>
          ) : null}

          <View
            style={{
              width: '100%',
              height: '100%',
              paddingHorizontal: 20,
              paddingBottom: 120,
              position: 'absolute',
              top: 100,
              left: 0,
            }}>
            <View style={styles.cardView}>
              <View style={styles.profileImageParent}>
                <View style={styles.profileImageContainer}>
                  <Image
                    style={styles.profileImage}
                    resizeMode={'cover'}
                    ref={(ref) => {
                      this._profileImage = ref;
                    }}
                    source={{uri: this.state.selectedProfileImage}}
                  />
                  <TouchableOpacity
                    style={styles.cameraButtonContainer}
                    onPress={() => {
                      this.selectProfilePhoto();
                    }}>
                    <Image
                      style={styles.cameraButton}
                      source={require('../../assets/images/camera_icon.png')}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  top: 30,
                  // bottom:
                }}>
                <View style={styles.filledCircle} />
                <View style={styles.filledCircle} />
                <View style={styles.blankCircle} />
              </View>

              <View
                style={{width: '100%', height: '100%'}}
                scrollEnabled={true}
                // contentContainerStyle={{flexGrow:1,marginBottom:20}}
              >
                {/* <KeyboardAvoidingView behavior="padding" style={{flex:1, backgroundColor:'white'}}> */}
                <View
                  style={[styles.inputContainer, {paddingHorizontal: 20}]}
                  onStartShouldSetResponder={() => true}>
                  <View style={[styles.inputTitleContainer, {marginTop: 45}]}>
                    <Text style={styles.inputTitleText}>
                      {this.state.userType === Constants.USER_TYPE_OWNER
                        ? 'Fitness Center '
                        : ''}
                      Name
                    </Text>
                    <Text style={styles.requiredTitleText}>*</Text>
                  </View>
                  <TextInput
                    style={[styles.inputText, {marginTop: -13}]}
                    onChangeText={this.onNameChanged}
                    value={this.state.name}
                    // placeholder={
                    //     this.state.userType === Constants.USER_TYPE_OWNER
                    //     ? "Enter your fitness center name"
                    //     : "Enter your name"
                    // }
                    enablesReturnKeyAutomatically
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      this.phoneNumberInput.focus();
                    }}
                  />

                  {/* <View style={styles.inputTitleContainer}>
                                                <Text style={styles.inputTitleText}>{this.state.userType === Constants.USER_TYPE_OWNER ? "Registered Contact Number":"Contact No"}</Text>
                                                <Text style={styles.requiredTitleText}>*</Text>
                                            </View> */}
                  {/* <TextInput
                                                ref={ref => this.phoneNumberInput = ref}
                                                style={styles.inputText}
                                                onChangeText={this.onContactNoChanged}
                                                value={this.state.contactNo}
                                                placeholder={"Enter Contact No"}
                                                enablesReturnKeyAutomatically
                                                keyboardType={"number-pad"}
                                                returnKeyType={"next"}
                                                blurOnSubmit={false}
                                                onSubmitEditing={() => {
                                                    this.addressInput.focus();
                                                }}
                                            /> */}

                  <View style={[styles.inputTitleContainer, {marginTop: 20}]}>
                    <Text style={styles.inputTitleText}>E-mail Address</Text>
                  </View>
                  <TextInput
                    ref={(ref) => (this.addressInput = ref)}
                    style={[styles.inputText, {marginTop: -13}]}
                    onChangeText={this.onAddressChanged}
                    value={this.state.address}
                    // placeholder={"Enter Email Address"}
                    enablesReturnKeyAutomatically
                    returnKeyType={'done'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                    }}
                  />
                  <View style={[styles.inputTitleContainer, {marginTop: 20}]}>
                    <Text style={styles.inputTitleText}>
                      Create New Password
                    </Text>
                  </View>
                  <TextInput
                    // ref={ref => this.addressInput = ref}
                    style={[styles.inputText, {marginTop: -13}]}
                    onChangeText={this.onnewpasswordChanged}
                    value={this.state.newpassword}
                    // placeholder={"Enter Password"}
                    enablesReturnKeyAutomatically
                    returnKeyType={'done'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                    }}
                  />
                  <View style={[styles.inputTitleContainer, {marginTop: 15}]}>
                    <Text style={styles.inputTitleText}>Re-enter Password</Text>
                  </View>
                  <TextInput
                    // ref={ref => this.addressInput = ref}
                    style={[styles.inputText, {marginTop: -13}]}
                    onChangeText={this.onrepasswordChanged}
                    value={this.state.reEnterpassowd}
                    // placeholder={"Enter Password"}
                    enablesReturnKeyAutomatically
                    returnKeyType={'done'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                    }}
                  />

                  {this.state.userType === Constants.USER_TYPE_OWNER ? (
                    <>
                      <View style={styles.inputContainer}>
                        <View
                          style={[styles.inputTitleContainer, {marginTop: 20}]}>
                          <Text style={styles.inputTitleText}>
                            Select State
                          </Text>
                          <Text style={styles.requiredTitleText}>*</Text>
                        </View>
                        <TouchableOpacity onPress={this.selectState}>
                          <View
                            style={[
                              styles.inputText,
                              {
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 5,
                              },
                            ]}>
                            <Text style={styles.userTypeSelectionText}>
                              {this.state.State === ''
                                ? 'Select Your State'
                                : this.state.State}
                            </Text>
                            <Image
                              style={{width: 10, height: 6}}
                              resizeMode={'cover'}
                              source={require('../../assets/images/down_arrow.png')}
                            />
                          </View>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={this.getCurrentLocation}>
                                                            <View style={{width:'100%', flexDirection:'row', justifyContent:'center', alignItems:'center', marginTop: 15}}>
                                                                <Image style={{width: 10, height:15}} resizeMode={"cover"} source={require("../../assets/images/location_icon.png")} />
                                                                <Text style={[styles.userTypeSelectionText, {fontSize:12, marginLeft: 10}]}>Find your location</Text>
                                                            </View>
                                                        </TouchableOpacity> */}
                      </View>

                      <View style={styles.inputContainer}>
                        <View
                          style={[styles.inputTitleContainer, {marginTop: 20}]}>
                          <Text style={styles.inputTitleText}>Select City</Text>
                          <Text style={styles.requiredTitleText}>*</Text>
                        </View>
                        <TouchableOpacity onPress={this.selectCity}>
                          <View
                            style={[
                              styles.inputText,
                              {
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 5,
                              },
                            ]}>
                            <Text style={styles.userTypeSelectionText}>
                              {this.state.city === ''
                                ? 'Select Your City'
                                : this.state.city}
                            </Text>
                            <Image
                              style={{width: 10, height: 6}}
                              resizeMode={'cover'}
                              source={require('../../assets/images/down_arrow.png')}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      {/* <View style={[styles.inputTitleContainer,{marginTop:20}]}>
                                                <Text style={styles.inputTitleText}>E-mail Address</Text>
                                            </View> */}
                      <TextInput
                        // ref={ref => this.addressInput = ref}
                        style={[styles.inputText]}
                        onChangeText={this.onHomeaddChanged}
                        value={this.state.Homeadd}
                        placeholder={'Enter Address'}
                        enablesReturnKeyAutomatically
                        returnKeyType={'done'}
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                          Keyboard.dismiss();
                        }}
                      />
                      <TouchableOpacity onPress={this.getCurrentLocation}>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 15,
                            marginBottom: 15,
                          }}>
                          <Image
                            style={{width: 10, height: 15}}
                            resizeMode={'cover'}
                            source={require('../../assets/images/location_icon.png')}
                          />
                          <Text
                            style={[
                              styles.userTypeSelectionText,
                              {fontSize: 12, marginLeft: 10},
                            ]}>
                            Find your location
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.inputContainer}>
                      {/*
                                                        <View style={styles.inputTitleContainer}>
                                                            <Text style={styles.inputTitleText}>Workout Since</Text>
                                                        </View>
                                                        <View style={{width:'100%', justifyContent:'center', alignItems:'center'}}>
                                                            <DatePicker
                                                                style={styles.datePickerStyle}
                                                                date={this.state.workoutSinceDate}
                                                                mode="date"
                                                                placeholder="select date"
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
                                                                onDateChange={this.onWorkoutSinceDateChanged}
                                                            />
                                                        </View>
                                                        */}
                      <View style={styles.inputTitleContainer}>
                        <Text style={styles.inputTitleText}>Gender</Text>
                      </View>
                      <TouchableOpacity
                        onPress={this.onSelectGenderButtonClicked}>
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
                          <Text
                            style={{flex: 1, color: '#162029', fontSize: 16}}>
                            {this.state.gender === ''
                              ? 'Select Gender'
                              : this.state.gender}
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
                                                                    this.onGenderChanged(value);
                                                                }}
                                                                items={genders}
                                                                value={this.state.gender}
                                                                style={pickerSelectStyles}
                                                                useNativeAndroidPickerStyle={false}
                                                                placeholder={{}}
                                                            />
                                                        </View>
                                                        */}
                    </View>
                  )}
                </View>
                {/* </KeyboardAvoidingView> */}
              </View>
            </View>
          </View>
          <View
            style={{
              width: '75%',
              justifyContent: 'flex-end',
              flex: 1,
              marginBottom: 10,
            }}>
            <TouchableOpacity
              onPress={this.nextStep}
              style={[
                styles.createProfileButton,
                {borderRadius: 200, paddingVertical: 25},
              ]}>
              <Text style={styles.createProfileButtonText}>Register</Text>
            </TouchableOpacity>
          </View>

          {this.state.isLoading ? (
            <View style={[styles.activityIndicatorContainer, {zIndex: 100}]}>
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
  fetchAllCountry() {
    this.props.fetchAllCountry().then(() => {
      let allcountry = this.props.allcountrylist.countries;
      let datacou = allcountry.find((item) => {
        return item.phoneCode == '91';
      });
      this.setState({
        country: datacou.id,
      });
   
    });
  }

  fetchStates() {
    this.props.FetchAllStates().then(() => {
      let allStates = this.props.allStatesList;
      let data1 = allStates.states.filter((item) => {
        // return item.country_id.indexOf(this.state.country) > -1;
        return item.country_id == this.state.country
      });
     

      this.setState({
        allStates: data1,
        isDataLoaded: true,
        isFetchingData: false,
      });
    
    });
  }

  fetchCities() {
    
    this.props.FetchAllCity().then(() => {
      let allCities = this.props.allCitiesList;
      
      let data1 = allCities.cities.filter((item) => {
        return item.state_id == this.state.StateId;
      });
      // let result=JSON.parse(allCities)
   
      this.setState({
        allCities: data1,
        isDataLoaded: true,
        isFetchingData: false,
      });
    });
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  onNameChanged = (text) => {
    this.setState({
      name: text,
    });
  };

  onContactNoChanged = (text) => {
    this.setState({
      contactNo: text,
    });
  };

  onAddressChanged = (text) => {
    this.setState({
      address: text,
    });
  };
  onHomeaddChanged = (text) => {
this.setState({Homeadd:text})
  }
  onnewpasswordChanged = (text) => {
    this.setState({
      newpassword: text,
    });
  };

  onrepasswordChanged = (text) => {
    this.setState({
      reEnterpassowd: text,
    });
  };

  onCitySelected = (city) => {
    console.log('City Selected:::');
    console.log(city);
    this.setState({
      city: city[Constants.KEY_NAME],
      cityID: city.id,
    });
  };
  
  onStateSelected = (state) => {
    console.log('state Selected:::');
    console.log(state);
    this.fetchCities();
    this.setState({
      State: state[Constants.KEY_NAME],
      StateId:state.id
      // State: state[Constants.KEY_ID],
    });
    globals.setOneSetting('stateId', state.id);
  };

  onWorkoutSinceDateChanged = (date) => {
    this.setState({
      workoutSinceDate: date,
    });
  };

  onGenderChanged(gender) {
    this.setState({
      gender: gender,
    });
  }

  selectCity = () => {
    let navigationParams = {};
    navigationParams[Constants.KEY_ITEM_LIST] = this.state.allCities;
    navigationParams[Constants.KEY_PROPERTY_TO_SHOW_AS_LABEL] =
      Constants.KEY_NAME;
    navigationParams[Constants.KEY_ON_ITEM_SELECTED] = this.onCitySelected;
    this.props.navigation.navigate('ItemSelectScreen', navigationParams);
  };

  selectState = () => {
    let navigationParams = {};
    navigationParams[Constants.KEY_ITEM_LIST] = this.state.allStates;
    navigationParams[Constants.KEY_PROPERTY_TO_SHOW_AS_LABEL] =
      Constants.KEY_NAME;
    navigationParams[Constants.KEY_ON_ITEM_SELECTED] = this.onStateSelected;
    this.props.navigation.navigate('ItemSelectScreen', navigationParams);
  };

  nextStep = () => {
    console.log('home',this.state.reEnterpassowd)
    console.log('Homeadd',this.state.Homeadd)
    // alert('button pressed')
    if (this.state.newpassword.length < 6) {
      alert('password must be not less than 6');
      return
    } else if (this.state.newpassword !== this.state.reEnterpassowd) {
      alert('Password not matched');
      return
    } else if(this.state.Homeadd.length < 0){
      alert('address is empty')
      return
    }
    else if (this.state.userType === Constants.USER_TYPE_OWNER) {
      this.addGym();
    } else if (this.state.userType === Constants.USER_TYPE_MEMBER) {
      this.addMember();
    }
  };

  selectCoverPhoto = () => {
    this.setState({
      photoSelectionTask: PHOTO_SELECTION_TASK_COVER,
    });
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Add Photo By',
        options: Platform.OS == 'ios' ? photoOptionsIOS : photoOptionsAndroid,
        cancelButtonIndex: photoOptionsIOS.length - 1,
        destructiveButtonIndex: photoOptionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        if (
          buttonIndex !== undefined &&
          buttonIndex < photoOptionsAndroid.length
        ) {
          this.onOptionSelected(buttonIndex);
        }
      },
    );
  };

  selectProfilePhoto() {
    this.setState({
      photoSelectionTask: PHOTO_SELECTION_TASK_PROFILE,
    });
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Sort By',
        options: Platform.OS == 'ios' ? photoOptionsIOS : photoOptionsAndroid,
        cancelButtonIndex: photoOptionsIOS.length - 1,
        destructiveButtonIndex: photoOptionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        if (
          buttonIndex !== undefined &&
          buttonIndex < photoOptionsAndroid.length
        ) {
          this.onOptionSelected(buttonIndex);
        }
      },
    );
  }

  onOptionSelected(index) {
    if (index === 0) {
      this.captureWithCamera();
    } else if (index === 1) {
      this.selectFromGallery();
    }
  }

  captureWithCamera() {
    /*
        this.setState({
            temporarySelectedProfileImage: '',
            isShowingCamera: true,
        })
        */
    let params = {};
    params.onPictureTaken = this.onPictureTaken;
    this.props.navigation.navigate('TakePictureForRegistration', params);
  }

  selectFromGallery() {
    /*
        this.setState({
            isShowingPhotoPicker: true,
            temporarySelectedProfileImage: '',
        });
        */
    let params = {};
    params.onPictureSelectedFromGallery = this.onPictureSelectedFromGallery;
    //this.props.navigation.navigate("SelectImageFromGallery", params);
    this.props.navigation.navigate(
      'SelectImageFromGalleryForRegistration',
      params,
    );
  }

  onPhotoSelected = (allSelectedImages, currentSelectedImage) => {
    //console.log("All selected images:::");
    //console.log(allSelectedImages);
    console.log('Currently selected image::');
    console.log(currentSelectedImage);

    this.setState({
      temporarySelectedImage: currentSelectedImage,
    });
  };

  cancelPhotoSelection() {
    this.setState({
      isShowingPhotoPicker: false,
    });
  }

  donePhotoSelection() {
    let selectedPhoto = this.state.temporarySelectedImage;

    if (selectedPhoto) {
      if (this.state.photoSelectionTask === PHOTO_SELECTION_TASK_PROFILE) {
        this.setState({
          isShowingPhotoPicker: false,
          selectedProfileImage: selectedPhoto.uri,
        });
      } else if (this.state.photoSelectionTask === PHOTO_SELECTION_TASK_COVER) {
        this.setState({
          isShowingPhotoPicker: false,
          selectedCoverImage: selectedPhoto.uri,
        });
      } else {
        this.setState({
          isShowingPhotoPicker: false,
        });
      }
    } else {
      this.setState({
        isShowingPhotoPicker: false,
      });
    }
  }

  takePicture = async (camera) => {
    const options = {quality: 0.8, base64: true};
    const data = await camera.takePictureAsync(options);
    //  eslint-disable-next-line
        console.log("Picture taken:::");
    console.log(data.uri);

    this.setState({
      temporarySelectedProfileImage: data,
      isShowingCamera: false,
      isShowingPictureTakenWithCamera: true,
    });
  };

  cancelCapture = () => {
    this.setState({
      isShowingCamera: false,
    });
  };

  retakePicture = () => {
    this.setState({
      isShowingPictureTakenWithCamera: false,
    });
    this.captureWithCamera();
  };

  confirmTakenPicture = () => {
    let selectedPhoto = this.state.temporarySelectedProfileImage;
    if (selectedPhoto) {
      if (this.state.photoSelectionTask === PHOTO_SELECTION_TASK_PROFILE) {
        this.setState({
          isShowingPictureTakenWithCamera: false,
          selectedProfileImage: selectedPhoto.uri,
        });
      } else if (this.state.photoSelectionTask === PHOTO_SELECTION_TASK_COVER) {
        this.setState({
          isShowingPictureTakenWithCamera: false,
          selectedCoverImage: selectedPhoto.uri,
        });
      } else {
        this.setState({
          isShowingPictureTakenWithCamera: false,
        });
      }
    } else {
      this.setState({
        isShowingPictureTakenWithCamera: false,
      });
    }
  };

  onPictureTaken = (pictureUri) => {
    if (this.state.photoSelectionTask === PHOTO_SELECTION_TASK_PROFILE) {
      this.setState({
        selectedProfileImage: pictureUri,
      });
    } else if (this.state.photoSelectionTask === PHOTO_SELECTION_TASK_COVER) {
      this.setState({
        selectedCoverImage: pictureUri,
      });
    }
  };

  onPictureSelectedFromGallery = (pictureUris) => {
    if (this.state.photoSelectionTask === PHOTO_SELECTION_TASK_PROFILE) {
      if (pictureUris.length > 0) {
        let pictureUri = pictureUris[0].uri;
        this.setState({
          selectedProfileImage: pictureUri,
        });
      }
      /*
            this.setState({
                selectedProfileImage: pictureUri,
            });
            */
    } else if (this.state.photoSelectionTask === PHOTO_SELECTION_TASK_COVER) {
      if (pictureUris.length > 0) {
        let pictureUri = pictureUris[0].uri;
        this.setState({
          selectedCoverImage: pictureUri,
        });
      }
      /*
            this.setState({
                selectedCoverImage: pictureUri,
            });
            */
    }
  };

  onSelectGenderButtonClicked = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Select Gender',
        options:
          Platform.OS == 'ios'
            ? Constants.genderOptionsIOS
            : Constants.genderOptionsAndroid,
        cancelButtonIndex: Constants.genderOptionsIOS.length - 1,
        destructiveButtonIndex: Constants.genderOptionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        console.log('selected button index:::' + buttonIndex);
        if (
          buttonIndex !== undefined &&
          buttonIndex < Constants.genderOptionsAndroid.length
        ) {
          this.onGenderOptionSelected(buttonIndex);
        }
      },
    );
  };

  onGenderOptionSelected(index) {
    let genderOption = Constants.genderOptionsIOS[index];
    let gender = Constants.genderValues[genderOption];
    this.setState({
      gender: gender,
    });
  }

  addGym = async () => {
    let name = this.state.name;
    let contactnumber = this.state.phoneNumber;

    if (name === '') {
      Utils.showAlert('', 'Please enter a name');
      return;
    }

    if (contactnumber === '') {
      Utils.showAlert('', 'Please enter contact number');
      return;
    }

    this.setState({
      isLoading: true,
    });

    let thisInstance = this;

    let profileImageBase64 = '';
    if (
      this.state.selectedProfileImage &&
      this.state.selectedProfileImage.length > 0
    ) {
      let imageURi = this.state.selectedProfileImage;
      try {
        let response = await ImageResizer.createResizedImage(
          imageURi,
          1000,
          1000,
          'JPEG',
          60,
        );
        console.log('response:::');
        console.log(response);
        imageURi = response.uri;
      } catch (error) {
        console.log('Error while resizing image...');
        console.log(error);
      }
      profileImageBase64 = await RNFS.readFile(imageURi, 'base64').then();
      //profileImageBase64 = await RNFS.readFile(this.state.selectedProfileImage, 'base64').then();
    }

    let coverImageBase64 = '';
    if (
      this.state.selectedCoverImage &&
      this.state.selectedCoverImage.length > 0
    ) {
      let imageURi = this.state.selectedCoverImage;
      try {
        let response = await ImageResizer.createResizedImage(
          imageURi,
          1000,
          1000,
          'JPEG',
          60,
        );
        console.log('response:::');
        console.log(response);
        imageURi = response.uri;
      } catch (error) {
        console.log('Error while resizing image...');
        console.log(error);
      }
      coverImageBase64 = await RNFS.readFile(imageURi, 'base64').then();
      //coverImageBase64 = await RNFS.readFile(this.state.selectedCoverImage, 'base64').then();
    }

    let data = new FormData();
    data.append(Constants.KEY_USER_ID, this.state.useriD);
    data.append(Constants.KEY_GYM_NAME, name);
    data.append(Constants.KEY_GYM_MOBILE_PHONE, this.state.contactNo);
    data.append(Constants.KEY_GYM_DISPLAY_LOCATION, this.state.Homeadd);
    data.append(Constants.KEY_GYM_MAP_LOCATION, this.state.Homeadd);
    data.append(Constants.KEY_LATITUDE, this.state.latitude);
    data.append(Constants.KEY_LONGITUDE, this.state.longitude);
    data.append(Constants.KEY_CITY_ID, this.state.cityID);
    data.append(Constants.KEY_CITY_NAME, this.state.city);
    data.append(Constants.KEY_PROFILE_IMAGE, profileImageBase64);
    data.append(Constants.KEY_COVER_IMAGE, coverImageBase64);

    console.log('BODY:::');
    console.log(data);
    this.props.dispatchgymadd(data).then(() => {
   
        let valid = this.props.addGymData.gymadd[Constants.KEY_VALID];
      
        if (valid) {
      
          let body = this.props.addGymData.gymadd[Constants.KEY_BODY];
          let userID = body[Constants.KEY_ID];
          let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
          userInfo[Constants.KEY_GYM_DATA] = body;

          globals.setOneSetting(globals.KEY_USER_INFO, userInfo);
          globals.setOneSetting(
            globals.KEY_USER_ACCOUNT_SETUP_STATUS,
            globals.KEY_ACCOUNT_SETUP_STATUS_GYM_ADDED,
          );

          thisInstance.setState({
            isLoading: false,
          });

          thisInstance.goToEditGymProfileScreen();
        }
       else {
        let message = 'Some error occurred. Please try agian.';

        thisInstance.setState({
          isLoading: false,
        });
        Utils.showAlert('Error!', message);
      }
    });
   
    
  };

  async addMember() {
    let name = this.state.name;
    let contactnumber = this.state.phoneNumber;

    if (name === '') {
      Utils.showAlert('', 'Please enter a name');
      return;
    }

    if (contactnumber === '') {
      Utils.showAlert('', 'Please enter contact number');
      return;
    }

    let params = {};
    params[Constants.KEY_NAME] = this.state.name;
    params[Constants.KEY_COUNTRY_ID] = this.state.callingCode;
    params[Constants.KEY_PHONE] = contactnumber;
    params[Constants.KEY_PROFILE_IMAGE] = this.state.selectedProfileImage;
    params[Constants.KEY_GENDER] = this.state.gender;
    params[Constants.KEY_ADDRESS] = this.state.address;
    this.props.navigation.navigate('EditBMIDetails', params);

    /*

        this.setState({
            isLoading: true,
        });

        let thisInstance = this;

        let profileImageBase64 = "";
        if(this.state.selectedProfileImage &&this.state.selectedProfileImage.length > 0) {
            let imageURi = this.state.selectedProfileImage;
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
        data.append(Constants.KEY_ID, "");
        data.append(Constants.KEY_HEIGHT, "");
        data.append(Constants.KEY_WEIGHT, "");
        data.append(Constants.KEY_AGE, "");
        data.append(Constants.KEY_REGISTRATION_ID, "");
        data.append(Constants.KEY_MEMBER_TYPE, Constants.MEMBER_TYPE_USER);
        data.append(Constants.KEY_NAME, name);
        data.append(Constants.KEY_PHONE, contactnumber);
        data.append(Constants.KEY_GENDER, this.state.gender);
        data.append(Constants.KEY_GOAL, "");
        data.append(Constants.KEY_DATE_OF_BIRTH, "");
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
        data.append(Constants.KEY_COUNTRY_ID, this.state.callingCode);
        data.append(Constants.KEY_GYM_ID, "");
        data.append(Constants.KEY_EMAIL, "");

        console.log("BODY:::");
        console.log(data);

        //return;
        fetch(Constants.API_URL_ADD_OR_EDIT_MEMBER, {
			method: 'post',
            body: data,
  			headers: {
                'Content-type':'multipart/form-data',
				'Accept': 'application/json',
			}
		  })
		.then((response) => {
            console.log("Response:::");
            console.log(response);
            return response.json();
        })
		.then((responseJson) => {
            console.log("Response JSON:::");
            console.log(responseJson);

            let valid = responseJson[Constants.KEY_VALID];
            if(valid) {
                let memberData = responseJson[Constants.KEY_MEMBER_DATA];
                let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
                userInfo[Constants.KEY_MEMBER_DATA] = memberData;

                globals.setOneSetting(globals.KEY_USER_INFO, userInfo);
                globals.setOneSetting(globals.KEY_USER_ACCOUNT_SETUP_STATUS, globals.KEY_ACCOUNT_SETUP_STATUS_USER_DETAILS_ADDED);

                thisInstance.setState({
                    isLoading:false
                });

                thisInstance.goToEditBMIDetailsScreen();

            } else {
                let message = responseJson[Constants.KEY_MESSAGE];
                if(!(message && message.length > 0)) {
                    message = 'Some error occurred. Please try agian.';
                }
                thisInstance.setState({
                    isLoading:false
                });
                Utils.showAlert("Error!", message);
            }
		})
		.catch((error) => {
            thisInstance.setState({
                isLoading: false
            });
            console.log("Error while assigning workout....");
            console.log(error);
            Utils.showAlert("Some error occurred. Please try again.");
        });
        */
  }

  goToEditGymProfileScreen() {
    //this.props.navigation.navigate("EditGymProfile");
    globals.setOneSetting(Constants.KEY_INITIAL_TAB_INDEX, 0);
    this.props.navigation.navigate('MembershipTab');
  }

  goToEditBMIDetailsScreen() {
    this.props.navigation.navigate('EditBMIDetails');
  }

  getCurrentLocation = () => {
    this.setState({
      isLoading: true,
    });

    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 150000,
    })
      .then((location) => {
        console.log('Location:::');
        console.log(location);
        this.setState({
          latitude: '' + location.latitude,
          longitude: '' + location.longitude,
          isLoading: false,
        });
      })
      .catch((ex) => {
        const {code, message} = ex;
        console.warn(code, message);
        if (code === 'CANCELLED') {
          Alert.alert('Location cancelled by user or by another request');
        }
        if (code === 'UNAVAILABLE') {
          Alert.alert(
            'Location service is disabled or unavailable. Please enable location service.',
          );
        }
        if (code === 'TIMEOUT') {
          Alert.alert('Location request timed out');
        }
        if (code === 'UNAUTHORIZED') {
          Alert.alert('Authorization denied');
        }
        this.setState({
          isLoading: false,
        });
      });
  };
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f7f7f7',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  coverPhotoContainer: {
    width: '100%',
    backgroundColor: '#161a1e',
    height: 180,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  coverPhotoChooseButton: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  cardView: {
    width: '100%',
    height: '92%',
    borderRadius: 5,
    shadowColor: 'gray',
    // marginBottom:30,
    elevation: 2,
    // overflow:'hidden',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#3d4a55',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#161a1e',
    paddingHorizontal: 10,
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
  cardViewStyle: {
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  filledCircle: {
    backgroundColor: '#161a1e',
    width: 14,
    aspectRatio: 1,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#161a1e',
    marginHorizontal: 10,
  },
  blankCircle: {
    backgroundColor: 'white',
    width: 14,
    aspectRatio: 1,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#626060',
    marginHorizontal: 10,
  },
  inputContainer: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  inputTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
  },
  inputTitleText: {
    color: '#979797',
    fontSize: 12,
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
    color: '#162029',
    fontSize: 14,
    width: '100%',
  },
  userTypeSelectionText: {
    flexGrow: 1,
    marginRight: 5,
    textAlign: 'left',
    color: '#1d2b36',
    fontSize: 16,
  },
  createProfileButton: {
    backgroundColor: '#17aae0',
    borderRadius: 12,
    height: 40,
    width: '100%',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createProfileButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  profileImageParent: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -54,
    left: 0,
    zIndex: 20,
  },
  profileImageContainer: {
    width: 75,
    aspectRatio: 1,
    zIndex: 100,
  },
  profileImage: {
    width: 75,
    aspectRatio: 1,
    borderRadius: 37.5,
    borderWidth: 2,
    borderColor: 'white',
    // zIndex:100
  },
  cameraButtonContainer: {
    position: 'absolute',
    top: 40,
    right: -16.5,
    zIndex: 20,
  },
  cameraButton: {
    width: 33,
    height: 33,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  captureButton: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  cancelCaptureButton: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  datePickerStyle: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#1d2b36',
    width: '100%',
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

const mapStateToprops = (state) => {
  return {
    allCitiesList: state.getAllCityReducer.allCity,
    allStatesList: state.getAllCityReducer.allStates,
    allcountrylist: state.getAllCityReducer.allcountry,
    addGymData: state.gymReducer,
    Loading: state.getAllCityReducer.isLoading,
    Success: state.getAllCityReducer.success,
  };
};
function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      FetchAllCity: fetchAllCity,
      FetchAllStates: fetchAllStates,
      fetchAllCountry: fetchAllCountry,
      dispatchgymadd: addgym,
    },
    dispatch,
  );
}

export default connect(mapStateToprops, mapDispatchToprops)(EditProfileInfo);
