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
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Button,
  ScrollView,
  PermissionsAndroid,
} from 'react-native';

import RNPickerSelect from 'react-native-picker-select';
import CameraRollPicker from 'react-native-camera-roll-picker';
import DatePicker from 'react-native-datepicker';
import {RNCamera} from 'react-native-camera';
import ActionSheet from 'react-native-action-sheet';
import ImageResizer from 'react-native-image-resizer';
var RNFS = require('react-native-fs');
import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

import GetLocation from 'react-native-get-location';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchAllCity} from '../Redux/Actions/getAllCityAction';
import {editgym} from '../Redux/Actions/gymaction';

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

class ProfileTab extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
    let userData = userInfo[Constants.KEY_USER_DATA];

    console.log('userInfo::::');
    console.log(userInfo);

    let userType = userData[Constants.KEY_USER_TYPE];
    let gymID = '';
    let phoneNumber = userData[Constants.KEY_MOBILE];
    let callingCode = userData[Constants.KEY_COUNTRY_ID];
    // let countryCode = properties.navigation.getParam(Constants.PARAM_COUNTRY_CODE);

    let name = '';
    let userID = userData[Constants.KEY_ID];
    let profileImageURL = null;
    let coverImageURL = null;
    let contactNo = '';
    let cityID = '';
    let address = '';
    let memberID = '';
    let gender = genders[0].value;
    let goal = '';
    let weight = '';
    let height = '';
    let dateOfBirth = '';

    if (userType === Constants.USER_TYPE_OWNER) {
      let gymData = userInfo[Constants.KEY_GYM_DATA];
      phoneNumber = gymData[Constants.KEY_GYM_MOBILE_PHONE];
      gymID = gymData[Constants.KEY_ID];
      name = gymData[Constants.KEY_GYM_NAME];
      profileImageURL = gymData[Constants.KEY_PROFILE_IMAGE];
      coverImageURL = gymData[Constants.KEY_COVER_IMAGE];
      contactNo = phoneNumber;
      cityID = gymData[Constants.KEY_CITY_ID];
      address = gymData[Constants.KEY_GYM_DISPLAY_LOCATION];
    } else if (userType === Constants.USER_TYPE_MEMBER) {
      let memberData = userInfo[Constants.KEY_MEMBER_DATA];
      memberData = memberData[0];
      memberID = memberData[Constants.KEY_MEMBER_ID];
      name = memberData[Constants.KEY_NAME];
      profileImageURL = memberData[Constants.KEY_IMAGE];
      phoneNumber = memberData[Constants.KEY_PHONE];
      contactNo = phoneNumber;
      gender = memberData[Constants.KEY_GENDER];
      goal = memberData[Constants.KEY_GOAL];
      weight = memberData[Constants.KEY_WEIGHT];
      if (weight === null) {
        weight = '';
      }
      height = memberData[Constants.KEY_HEIGHT];
      if (height === null) {
        height = '';
      }
      dateOfBirth = memberData[Constants.KEY_DATE_OF_BIRTH];
      address = memberData[Constants.KEY_ADDRESS];
    }

    this.state = {
      isLoading: false,
      contactNo: contactNo,
      phoneNumber: phoneNumber,
      callingCode: callingCode,
      //countryCode: countryCode,
      userType: userType,
      useriD: userID,
      gymID: gymID,
      name: name,
      memberID: memberID,
      address: address,
      city: '',
      cityID: cityID,
      workoutSinceDate: '',
      gender: gender,
      isShowingPhotoPicker: false,
      selectedProfileImage: null,
      temporarySelectedImage: '',
      selectedCoverImage: null,
      allCities: [],
      photoSelectionTask: '',
      isFetchingData: true,
      isDataLoaded: false,
      isShowingCamera: false,
      isShowingPictureTakenWithCamera: false,
      profileImageURL: profileImageURL,
      coverImageURL: coverImageURL,
      latitude: '',
      longitude: '',
      goal: goal,
      weight: weight,
      height: height,
      dateOfBirth: dateOfBirth,
    };
  }
  componentDidMount() {
    this.fetchCities();
  }

  render() {
    if (this.props.Loadingedit) {
      return (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator
            size="large"
            color="#161a1e"
            style={{marginTop: 35}}
          />
        </View>
      );
    }

    if (this.props.error) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() => {
              this.fetchCities();
            }}
            style={{width: '100%'}}>
            <Text style={styles.button}>Retry to fetch data ...</Text>
          </TouchableOpacity>
        </View>
      );
    }

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
      coverPhotoURL = this.state.coverImageURL;
    }

    let profilePhotoURL = this.state.selectedProfileImage;
    if (profilePhotoURL === null) {
      profilePhotoURL = this.state.profileImageURL;
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
              }}
            />
          </ImageBackground>

          {this.state.userType === Constants.USER_TYPE_OWNER ? (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 50,
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
              top: 140,
              left: 0,
            }}>
            <View style={styles.cardView}>
              <ScrollView
                style={{width: '100%', height: '100%'}}
                scrollEnabled={true}
                contentContainerStyle={{flexGrow: 1}}>
                <KeyboardAvoidingView
                  behavior="padding"
                  style={{flex: 1, backgroundColor: 'white'}}>
                  <View
                    style={[styles.inputContainer, {paddingHorizontal: 20}]}
                    onStartShouldSetResponder={() => true}>
                    <View style={styles.inputTitleContainer}>
                      <Text style={styles.inputTitleText}>
                        {this.state.userType === Constants.USER_TYPE_OWNER
                          ? 'Fitness Center '
                          : ''}
                        Name
                      </Text>
                      <Text style={styles.requiredTitleText}>*</Text>
                    </View>
                    <TextInput
                      style={styles.inputText}
                      onChangeText={this.onNameChanged}
                      value={this.state.name}
                      placeholder={
                        this.state.userType === Constants.USER_TYPE_OWNER
                          ? 'Enter your fitness center name'
                          : 'Enter your name'
                      }
                      enablesReturnKeyAutomatically
                      returnKeyType={'next'}
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        //this.phoneNumberInput.focus();
                        this.addressInput.focus();
                      }}
                    />

                    <View style={styles.inputTitleContainer}>
                      <Text style={styles.inputTitleText}>
                        {this.state.userType === Constants.USER_TYPE_OWNER
                          ? 'Registered Contact Number'
                          : 'Contact No'}
                      </Text>
                      <Text style={styles.requiredTitleText}>*</Text>
                    </View>
                    <TextInput
                      ref={(ref) => (this.phoneNumberInput = ref)}
                      editable={false}
                      style={[
                        styles.inputText,
                        {color: 'grey', borderBottomColor: 'grey'},
                      ]}
                      onChangeText={this.onContactNoChanged}
                      value={this.state.contactNo}
                      placeholder={'Enter Contact No'}
                      enablesReturnKeyAutomatically
                      keyboardType={'number-pad'}
                      returnKeyType={'next'}
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        this.addressInput.focus();
                      }}
                    />

                    <View style={styles.inputTitleContainer}>
                      <Text style={styles.inputTitleText}>Address</Text>
                    </View>
                    <TextInput
                      ref={(ref) => (this.addressInput = ref)}
                      style={styles.inputText}
                      onChangeText={this.onAddressChanged}
                      value={this.state.address}
                      placeholder={'Enter address'}
                      enablesReturnKeyAutomatically
                      returnKeyType={'done'}
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        Keyboard.dismiss();
                      }}
                    />

                    {this.state.userType === Constants.USER_TYPE_OWNER ? (
                      <View style={styles.inputContainer}>
                        <View style={styles.inputTitleContainer}>
                          <Text style={styles.inputTitleText}>Select City</Text>
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
                        <TouchableOpacity onPress={this.getCurrentLocation}>
                          <View
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginTop: 15,
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
                      </View>
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

                    <TouchableOpacity
                      onPress={this.nextStep}
                      style={styles.createProfileButton}>
                      <Text style={styles.createProfileButtonText}>
                        Next Step
                      </Text>
                    </TouchableOpacity>
                  </View>
                </KeyboardAvoidingView>
              </ScrollView>
            </View>
          </View>
          <View style={styles.profileImageParent}>
            <View style={styles.profileImageContainer}>
              <Image
                style={styles.profileImage}
                resizeMode={'cover'}
                ref={(ref) => {
                  this._profileImage = ref;
                }}
                source={{uri: profilePhotoURL}}
              />
              <View style={styles.cameraButtonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    this.selectProfilePhoto();
                  }}>
                  <Image
                    resizeMode={'contain'}
                    style={styles.cameraButton}
                    source={require('../../assets/images/camera_icon.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {this.props.Loading && this.props.Loadingedit ? (
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

  fetchCities() {
    this.setState({
      isFetchingData: true,
    });

    let thisInstance = this;
    this.props.FetchAllCity().then(() => {
      // let allCities = this.props.allCitiesList.cities;
      let allCities = this.props.allCitiesList.cities.filter((item) => {
        return item.state_id === globals.getSetting().stateId;
      });
      console.log(',,,', allCities);
      let city = '';
      let selectedCityID = thisInstance.state.cityID;
      if (selectedCityID !== '') {
        for (let i = 0; i < allCities.length; i++) {
          let cityObject = allCities[i];
          if (cityObject[Constants.KEY_ID] === selectedCityID) {
            city = cityObject[Constants.KEY_NAME];
            break;
          }
        }
      }
      thisInstance.setState({
        allCities: allCities,
        // isDataLoaded: true,
        // isFetchingData: false,
        city: city,
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

  onCitySelected = (city) => {
    console.log('City Selected:::');
    console.log(city);
    this.setState({
      city: city[Constants.KEY_NAME],
      cityID: city[Constants.KEY_ID],
    });
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
    this.props.navigation.navigate('GymCitySelectionScreen', navigationParams);
  };

  nextStep = () => {
    if (this.state.userType === Constants.USER_TYPE_OWNER) {
      this.addGym();
    } else if (this.state.userType === Constants.USER_TYPE_MEMBER) {
      this.saveMemberInfo();
    }
  };

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
    this.props.navigation.navigate('TakePicture', params);
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
    this.props.navigation.navigate('SelectImageFromGallery', params);
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
    let contactnumber = this.state.contactNo;

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
    data.append(Constants.KEY_GYM_DISPLAY_LOCATION, this.state.address);
    data.append(Constants.KEY_GYM_MAP_LOCATION, this.state.address);
    data.append(Constants.KEY_LATITUDE, this.state.latitude);
    data.append(Constants.KEY_LONGITUDE, this.state.longitude);
    data.append(Constants.KEY_CITY_ID, this.state.cityID);
    data.append(Constants.KEY_CITY_NAME, this.state.city);
    data.append(Constants.KEY_PROFILE_IMAGE, profileImageBase64);
    data.append(Constants.KEY_COVER_IMAGE, coverImageBase64);
    data.append(Constants.KEY_GYM_ID, this.state.gymID);

    console.log('BODY:::');
    // console.log(data);
    this.props.DispatchEditgym(data);

    // fetch(Constants.API_URL_EDIT_GYM, {
    // 	method: 'post',
    //     body: data,
    // 	headers: {
    //         'Content-type':'multipart/form-data',
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

    setTimeout(() => {
      let valid = this.props.editgymdata[Constants.KEY_VALID];
      if (valid) {
        let body = this.props.editgymdata[Constants.KEY_BODY];
        let userID = body[Constants.KEY_ID];
        let userInfo = globals.getSetting()[globals.KEY_USER_INFO];
        userInfo[Constants.KEY_GYM_DATA] = body;

        globals.setOneSetting(globals.KEY_USER_INFO, userInfo);

        thisInstance.goToEditGymProfileScreen();
        this.setState({
          isLoading: false,
        });
      } else {
        let message = this.props.editgymdata[Constants.KEY_MESSAGE];
        if (!(message && message.length > 0)) {
          message = 'Some error occurred. Please try agian.';
        }
        thisInstance.setState({
          isLoading: false,
        });
        Utils.showAlert('Error!', message);
      }
    }, 2000);
    // })
    // .catch((error) => {
    //     thisInstance.setState({
    //         isLoading: false
    //     });
    //     console.log("Error while assigning workout....");
    //     console.log(error);
    //     Utils.showAlert("Some error occurred. Please try again.");
    // });
  };

  goToEditGymProfileScreen() {
    //this.props.navigation.navigate("EditGymProfile");
    globals.setOneSetting(Constants.KEY_INITIAL_TAB_INDEX, 0);
    this.props.navigation.navigate('MembershipTab');
  }

  saveMemberInfo() {
    let name = this.state.name;
    let contactnumber = this.state.contactNo;

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
    params[Constants.KEY_MEMBER_ID] = this.state.memberID;
    params[Constants.KEY_GOAL] = this.state.goal;
    params[Constants.KEY_WEIGHT] = this.state.weight;
    params[Constants.KEY_HEIGHT] = this.state.height;
    params[Constants.KEY_DATE_OF_BIRTH] = this.state.dateOfBirth;
    this.props.navigation.navigate('EditBMIDetails', params);
  }
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
    height: '100%',
    borderRadius: 10,
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
    marginTop: 10,
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
    margin: 30,
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
    top: 100 - 37.5,
    left: 0,
  },
  profileImageContainer: {
    width: 75,
    aspectRatio: 1,
  },
  profileImage: {
    width: 75,
    aspectRatio: 1,
    borderRadius: 37.5,
    borderWidth: 1,
    borderColor: 'white',
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
    editgymdata: state.gymReducer.gymedit,
    Loadingedit: state.gymReducer.isLoading,
    Loading: state.getAllCityReducer.isLoading,
    Success: state.getAllCityReducer.success,
    Error: state.getAllCityReducer.error,
  };
};

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      FetchAllCity: fetchAllCity,
      DispatchEditgym: editgym,
    },
    dispatch,
  );
}
export default connect(mapStateToprops, mapDispatchToprops)(ProfileTab);
