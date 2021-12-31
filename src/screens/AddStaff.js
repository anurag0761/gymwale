import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  Dimensions,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
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

const screenWidth = Dimensions.get('window').width;
const logoSize = screenWidth * (512 / 750);

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';

const goals = [
  {label: 'Stay Fit', value: 'Stay Fit'},
  {label: 'Loose Fat', value: 'Lose fat'},
  {label: 'Build Muscle', value: 'Build muscle'},
  {label: 'Get Stronger', value: 'Get stronger'},
  {label: 'Improve Athletic Skills', value: 'Improve athletic skills'},
  {label: 'Improve Joint Flexibility', value: 'Improve joint flexibility'},
];

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

class AddStaff extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    let userData = userInfo[Constants.KEY_USER_DATA];
    let callingCode = userData[Constants.KEY_COUNTRY_ID];

    this.state = {
      gymID: gymID,
      gender: '',
      goal: '',
      name: '',
      contactNo: '',
      address: '',
      isShowingPhotoPicker: false,
      selectedProfileImage: '',
      temporarySelectedProfileImage: '',
      isLoading: false,
      dateOfBirth: '',
      membershipID: '',
      isShowingCamera: false,
      isShowingPictureTakenWithCamera: false,
      callingCode: callingCode,
    };
  }

  componentDidMount() {
    //this.requestForPhotosPermissionIfNotGranted();
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

  onGenderChanged(gender) {
    this.setState({
      gender: gender,
    });
  }

  onGoalChanged(goal) {
    this.setState({
      goal: goal,
    });
  }

  onBirthDateChanged = (date) => {
    this.setState({
      dateOfBirth: date,
    });
  };

  selectProfilePhoto() {
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
    params['onPictureTaken'] = this.onPictureTaken;
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
    params['onPictureSelectedFromGallery'] = this.onPictureSelectedFromGallery;
    this.props.navigation.navigate('SelectImageFromGallery', params);
  }

  onPhotoSelected = (allSelectedImages, currentSelectedImage) => {
    //console.log("All selected images:::");
    //console.log(allSelectedImages);
    console.log('Currently selected image::');
    console.log(currentSelectedImage);

    this.setState({
      temporarySelectedProfileImage: currentSelectedImage,
    });
  };

  cancelPhotoSelection() {
    this.setState({
      isShowingPhotoPicker: false,
    });
  }

  donePhotoSelection() {
    let selectedPhoto = this.state.temporarySelectedProfileImage;

    if (selectedPhoto) {
      this.setState({
        isShowingPhotoPicker: false,
        selectedProfileImage: selectedPhoto.uri,
      });
    } else {
      this.setState({
        isShowingPhotoPicker: false,
      });
    }
  }

  addStaff = async () => {
    let name = this.state.name;
    if (name.length === 0) {
      Utils.showAlert('', 'Please enter Name');
      return;
    }

    let contactNo = this.state.contactNo;
    if (contactNo.length === 0) {
      Utils.showAlert('', 'Please enter Contact No');
      return;
    }

    let gender = this.state.gender;
    if (gender === null) {
      Utils.showAlert('', 'Please select gender');
      return false;
    }
    if (gender.length === 0) {
      Utils.showAlert('', 'Please select gender');
      return;
    }

    let address = this.state.address;
    let goal = this.state.goal;
    let imageBase64 = '';
    if (this.state.selectedProfileImage.length > 0) {
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
      imageBase64 = await RNFS.readFile(imageURi, 'base64').then();
      //imageBase64 = await RNFS.readFile(this.state.selectedProfileImage, 'base64').then();
    }

    this.setState({
      isLoading: true,
    });
    let thisInstance = this;

    let data = new FormData();
    data.append(Constants.KEY_GYM_MEMBER_MANAGE_ID, '');
    data.append(Constants.KEY_ID, '');
    data.append(Constants.KEY_HEIGHT, '');
    data.append(Constants.KEY_WEIGHT, '');
    data.append(Constants.KEY_AGE, '');
    data.append(Constants.KEY_REGISTRATION_ID, '');
    data.append(Constants.KEY_MEMBER_TYPE, Constants.MEMBER_TYPE_STAFF);
    data.append(Constants.KEY_NAME, name);
    data.append(Constants.KEY_PHONE, contactNo);
    data.append(Constants.KEY_GENDER, gender);
    data.append(Constants.KEY_GOAL, goal);
    data.append(Constants.KEY_DATE_OF_BIRTH, this.state.dateOfBirth);
    data.append(Constants.KEY_ANNIVERSARY_DATE, '');
    data.append(Constants.KEY_ADDRESS, address);
    data.append(Constants.KEY_MEMBERSHIP_ID, this.state.membershipID);
    data.append(Constants.KEY_MEMBERSHIP_DURATION, '');
    data.append(Constants.KEY_MEMBERSHIP_PLAN_TOTAL_FEE, '');
    data.append(Constants.KEY_MEMBER_DAYS, '');
    data.append(Constants.KEY_START_DATE, '');
    data.append(Constants.KEY_END_DATE, '');
    data.append(Constants.KEY_NEXT_INSTALLEMENT, '');
    data.append(Constants.KEY_IMAGE, imageBase64);
    data.append(Constants.KEY_COUNTRY_ID, this.state.callingCode);
    data.append(Constants.KEY_GYM_ID, this.state.gymID);
    data.append(Constants.KEY_EMAIL, '');

    console.log('BODY:::');
    console.log(data);

    fetch(Constants.API_URL_ADD_OR_EDIT_MEMBER, {
      method: 'post',
      body: data,
      headers: {
        'content-type': 'multipart/form-data',
        Accept: 'application/json',
      },
    })
      .then((response) => {
        console.log('Response:::');
        console.log(response);
        return response.json();
      })
      .then((responseJson) => {
        console.log('Response JSON:::');
        console.log(responseJson);
        let valid = responseJson[Constants.KEY_VALID];
        if (valid) {
          thisInstance.setState({
            isLoading: false,
          });
          thisInstance.showStaffAddedAlert();
        } else {
          let message = responseJson[Constants.KEY_MESSAGE];
          if (!(message && message.length > 0)) {
            message = 'Some error occurred. Please try agian.';
          }
          thisInstance.setState({
            isLoading: false,
          });
          Utils.showAlert('Error!', message);
        }
      })
      .catch((error) => {
        thisInstance.setState({
          isLoading: false,
        });
        console.log('Error while adding staff....');
        console.log(error);
        Utils.showAlert('Some error occurred. Please try again.');
      });
  };

  showStaffAddedAlert() {
    let thisInstance = this;
    Alert.alert(
      'Success',
      'Staff member added successfully.',
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

  render() {
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
              if (status !== 'READY') return <PendingView />;
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
              backgroundColor: 'green',
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
            selected={[this.state.temporarySelectedProfileImage]}
          />
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
            backgroundColor: 'green',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <StatusBar backgroundColor="#161a1e" barStyle="light-content" />

          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={this.goBack}>
              <Image
                style={styles.closeIcon}
                source={require('../../assets/images/close_icon.png')}
              />
            </TouchableOpacity>

            <Text style={styles.tabTitle}>Add Staff</Text>
          </View>

          <ScrollView style={{width: '100%', height: '100%'}}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}>
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
              <View style={styles.inputContainer}>
                <View style={styles.inputTitleContainer}>
                  <Text style={styles.inputTitleText}>Member Name</Text>
                  <Text style={styles.requiredTitleText}>*</Text>
                </View>
                <TextInput
                  style={styles.inputText}
                  placeholder={'Enter Member Name'}
                  onChangeText={this.onNameChanged}
                  value={this.state.name}></TextInput>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputTitleContainer}>
                  <Text style={styles.inputTitleText}>Contact No.</Text>
                  <Text style={styles.requiredTitleText}>*</Text>
                </View>
                <TextInput
                  style={styles.inputText}
                  placeholder={'Enter Contact Number'}
                  onChangeText={this.onContactNoChanged}
                  value={this.state.contactNo}
                  keyboardType={'phone-pad'}></TextInput>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputTitleContainer}>
                  <Text style={styles.inputTitleText}>Gender</Text>
                  <Text style={styles.requiredTitleText}>*</Text>
                </View>
                <TouchableOpacity onPress={this.onSelectGenderButtonClicked}>
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
                                            placeholder={{
                                                label: 'Select Gender',
                                                value: null,
                                                color: '#9EA0A4',
                                            }}
                                        />
                                    </View>
                                    */}
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputTitleContainer}>
                  <Text style={styles.inputTitleText}>Address</Text>
                </View>
                <TextInput
                  style={styles.inputText}
                  placeholder={'Enter Address'}
                  onChangeText={this.onAddressChanged}
                  value={this.state.address}></TextInput>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputTitleContainer}>
                  <Text style={styles.inputTitleText}>Goal</Text>
                </View>
                <TouchableOpacity onPress={this.onSelectGoalButtonClicked}>
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
                      {this.state.goal === '' ? 'Select Goal' : this.state.goal}
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
                                                this.onGoalChanged(value);
                                            }}
                                            items={goals}
                                            value={this.state.goal}
                                            style={pickerSelectStyles}
                                            useNativeAndroidPickerStyle={false}
                                            placeholder={{
                                                label: 'Select Goal',
                                                value: '',
                                                color: '#9EA0A4',
                                            }}
                                        />
                                    </View>
                                    */}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputTitleContainer}>
                  <Text style={styles.inputTitleText}>Date of Birth</Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <DatePicker
                    style={styles.datePickerStyle}
                    date={this.state.dateOfBirth}
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
                    onDateChange={this.onBirthDateChanged}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity style={{width: '100%'}} onPress={this.addStaff}>
            <View style={styles.saveButtonContainer}>
              <Text style={styles.saveButtonText}>SAVE</Text>
            </View>
          </TouchableOpacity>
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
      this.setState({
        isShowingPictureTakenWithCamera: false,
        selectedProfileImage: selectedPhoto.uri,
      });
    } else {
      this.setState({
        isShowingPictureTakenWithCamera: false,
      });
    }
  };

  onPictureTaken = (pictureUri) => {
    this.setState({
      selectedProfileImage: pictureUri,
    });
  };

  onPictureSelectedFromGallery = (pictureUris) => {
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

  onSelectGoalButtonClicked = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: 'Select Goal',
        options:
          Platform.OS == 'ios'
            ? Constants.goalOptionsIOS
            : Constants.goalOptionsAndroid,
        cancelButtonIndex: Constants.goalOptionsIOS.length - 1,
        destructiveButtonIndex: Constants.goalOptionsIOS.length - 1,
        tintColor: '#121619',
      },
      (buttonIndex) => {
        console.log('selected button index:::' + buttonIndex);
        if (
          buttonIndex !== undefined &&
          buttonIndex < Constants.goalOptionsAndroid.length
        ) {
          this.onGoalOptionSelected(buttonIndex);
        }
      },
    );
  };

  onGoalOptionSelected(index) {
    let goalOption = Constants.goalOptionsIOS[index];
    let goal = Constants.goalValues[goalOption];
    this.setState({
      goal: goal,
    });
  }
}

const styles = StyleSheet.create({
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
    fontSize: 16,
  },
  titleText: {
    color: '#194164',
    textAlign: 'left',
    textAlignVertical: 'center',
    fontSize: 17,
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
    marginTop: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  inputTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  inputTitleText: {
    color: '#b5b5b5',
    fontSize: 14,
  },
  requiredTitleText: {
    color: '#d83110',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  inputText: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#1d2b36',
    color: '#162029',
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

export default AddStaff;
