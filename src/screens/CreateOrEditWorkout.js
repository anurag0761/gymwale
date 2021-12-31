import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TouchableHighlight,
  Platform,
  TextInput,
  Button,
  Alert,
  PermissionsAndroid,
} from 'react-native';

import ActionButton from 'react-native-action-button';
import ActionSheet from 'react-native-action-sheet';
import Share from 'react-native-share';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import CameraRollPicker from 'react-native-camera-roll-picker';
import {RNCamera} from 'react-native-camera';
import ImageResizer from 'react-native-image-resizer';
var RNFS = require('react-native-fs');

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {addWorkout} from '../Redux/Actions/addWorkOutAction';
import {fetchWorkoutDetails} from '../Redux/Actions/workoutDetailAction';

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

class CreateOrEditWorkout extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    let exercises = properties.navigation.getParam(Constants.KEY_EXERCISES);
    let exerciseList = {};
    for (let i = 0; i < exercises.length; i++) {
      let exerciseID = exercises[i][Constants.KEY_EXERCISE_ID];
      exerciseList[exerciseID] = exercises[i];
    }

    let workoutName = ''; //properties.navigation.getParam(Constants.KEY_WORKOUT_NAME, "");
    let workoutDays = []; //properties.navigation.getParam(Constants.KEY_WORKOUT_DAYS, []);
    if (workoutDays.length === 0) {
      for (let i = 0; i < 7; i++) {
        let workoutDay = {};
        workoutDay[Constants.KEY_WORKOUT_NAME] = '';
        workoutDay[Constants.KEY_EXERCISES] = [];
        workoutDay.isExpanded = false;
        workoutDays.push(workoutDay);
      }
    }

    let workoutImageURL = null; //properties.navigation.getParam(Constants.KEY_PROFILE_IMAGE, null);
    let workoutID = properties.navigation.getParam(
      Constants.KEY_WORKOUT_ID,
      '',
    );
    let fromWorkout = properties.navigation.getParam(
      Constants.KEY_FROM_WORKOUT,
      '',
    );
    let workoutGymID = properties.navigation.getParam(Constants.KEY_GYM_ID, '');
    let memberID = properties.navigation.getParam(Constants.KEY_MEMBER_ID, '');

    this.state = {
      gymID: gymID,
      memberID: memberID,
      workoutID: workoutID,
      workoutGymID: workoutGymID,
      exercises: exercises,
      exerciseList: exerciseList,
      isLoading: false,
      isShowingPhotoPicker: false,
      selectedProfileImage: '',
      temporarySelectedProfileImage: '',
      workoutDays: workoutDays,
      workoutName: workoutName,
      fromWorkout: fromWorkout,
      workoutImageURL: workoutImageURL,
      isFetchingData: true,
      isDataLoaded: false,
      isShowingCamera: false,
      isShowingPictureTakenWithCamera: false,
    };
  }

  componentDidMount() {
    //this.requestForPhotosPermissionIfNotGranted();
    if (this.state.workoutID !== '') {
      this.fetchWorkoutDetails();
    } else {
      this.setState({
        isDataLoaded: true,
        isFetchingData: false,
      });
    }
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
    if (this.props.AddWorkoutData.error) {
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

    if (this.props.AddWorkoutData.error === true) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() => {
              this.fetchWorkoutDetails();
            }}
            style={{width: '100%'}}>
            <Text style={styles.button}>Retry to fetch data</Text>
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
            selected={[this.state.temporarySelectedProfileImage]}
          />
        </View>
      );
    }

    let workoutImageURL = this.state.selectedProfileImage;
    if (workoutImageURL === '') {
      workoutImageURL = this.state.workoutImageURL;
    }

    return (
      <View style={{flex: 1}}>
        <View
          style={{
            height: getStatusBarHeight(true),
            backgroundColor: '#161a1e',
          }}>
          <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
        </View>

        <View style={styles.headerContainer}>
          <View style={styles.titleBannerContainer}>
            <Image
              style={styles.titleBanner}
              resizeMode={'cover'}
              source={require('../../assets/images/gymvale_name_logo.png')}
            />
          </View>
          <TouchableOpacity onPress={this.shareGymVale}>
            <Image
              style={styles.shareIcon}
              source={require('../../assets/images/share_icon.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.goToNotificationsScreen}>
            <Image
              style={styles.notificationIcon}
              source={require('../../assets/images/notification_icon.png')}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.headerContainer,
            {backgroundColor: 'white', padding: 10},
          ]}>
          <TouchableOpacity onPress={this.goBack}>
            <Image
              style={styles.backIcon}
              source={require('../../assets/images/back_arrow.png')}
            />
          </TouchableOpacity>

          <Text style={styles.tabTitle}>Create Workout</Text>
        </View>

        {this.renderSeparator()}

        <View
          style={[
            styles.headerContainer,
            {backgroundColor: 'white', padding: 10, height: 70},
          ]}>
          <View style={[styles.profileImageContainer, {marginRight: 20}]}>
            <Image
              style={styles.profileImage}
              resizeMode={'cover'}
              ref={(ref) => {
                this._profileImage = ref;
              }}
              source={{uri: workoutImageURL}}
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
          <TextInput
            style={styles.textInput}
            numberOfLines={1}
            placeholderTextColor={'grey'}
            placeholder={'Workout Name'}
            value={this.state.workoutName}
            onChangeText={(text) => this.onWorkoutNameChanged(text)}
          />
        </View>

        {this.renderSeparator()}

        <FlatList
          style={{width: '100%', flex: 1}}
          data={this.state.workoutDays}
          keyExtractor={(item, index) => {
            return index + '';
          }}
          renderItem={({item, index}) => this.renderItem(item, index)}
          ItemSeparatorComponent={this.renderSeparator}
        />
        <TouchableOpacity onPress={this.saveWorkout}>
          <Text style={styles.saveButton}>SAVE</Text>
        </TouchableOpacity>
        <ActionButton
          buttonColor="#0091ea"
          onPress={this.addExercise}
          renderIcon={(active) => {
            return (
              <Image
                style={{width: 30, height: 22}}
                source={require('../../assets/images/dumbbell_icon.png')}
              />
            );
          }}
          style={{marginBottom: 15}}
        />

        {this.props.AddWorkoutData.isLoading ? (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator
              size="large"
              color="#161a1e"
              style={{marginTop: 35}}
            />
          </View>
        ) : null}
      </View>
    );
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  goToNotificationsScreen = () => {
    this.props.navigation.navigate('NotificationsScreen');
  };

  shareGymVale = () => {
    let title = 'Join Our Gym Login Now';
    let referralURL = Constants.REFERRAL_URL_PREFIX + 'g' + this.state.gymID;
    let shareOptions = {
      title: title,
      message: 'Join Our Gym Login Now',
      url: referralURL,
      subject: title,
    };

    Share.open(shareOptions)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        err && console.log(err);
      });
  };

  fetchWorkoutDetails() {
    this.setState({
      isFetchingData: true,
    });

    let body = Constants.KEY_WORKOUT_ID + '=' + this.state.workoutID;

    console.log('BODY:::' + body);
    this.props.DispatchWorkoutDetails(body);
    setTimeout(() => {
        console.log('////////////')
        console.log(this.props.workoutDetail.data)
        console.log('////////////')
      let valid = this.props.workoutDetail.data[Constants.KEY_VALID];
      if (valid) {
        let dataList = this.props.workoutDetail.data[Constants.KEY_DATA];
        let data = dataList[0];

        let workoutName = data[Constants.KEY_PLAN_NAME];
        let workoutImageURL = data[Constants.KEY_IMAGE];

        let workoutDayName = data[Constants.KEY_WORKOUT_NAME];
        let workoutNames = workoutDayName.split(',');

        let workoutDays = [];
        for (let i = 1; i <= 7; i++) {
          let dayKey = 'day' + i;
          let dayExercisesList = [];
          let dayExercisesIDList = data[dayKey];
          for (let j = 0; j < dayExercisesIDList.length; j++) {
            let dayExercises = dayExercisesIDList[j];
            //console.log("dayExercises:::");
            //console.log(dayExercises);
            if (dayExercises && dayExercises !== '') {
              for (let k = 0; k < dayExercises.length; k++) {
                if (dayExercises[k] !== 'on') {
                  //dayExercisesIDList.push(dayExercises[k]);
                  let exerciseID = dayExercises[k];
                  let exerciseObject = {};
                  exerciseObject[Constants.KEY_BODY_PART_ID] = j;
                  exerciseObject[Constants.KEY_EXERCISE_ID] = exerciseID;
                  dayExercisesList.push(exerciseObject);
                }
              }
            }
          }
          //console.log(dayKey + " exercises List:::");
          //console.log(dayExercisesIDList);
          let workoutDay = {};
          workoutDay[Constants.KEY_WORKOUT_NAME] = workoutNames[i - 1];
          workoutDay[Constants.KEY_EXERCISES] = dayExercisesList;
          workoutDay.isExpanded = false;
          workoutDays.push(workoutDay);
        }

        //workoutDetails[Constants.KEY_DAYS] = workoutDays;

        this.setState({
          workoutName: workoutName,
          workoutImageURL: workoutImageURL,
          workoutDays: workoutDays,
          isDataLoaded: true,
          isFetchingData: false,
        });
      }
    }, 1200);
  }

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

  onWorkoutNameChanged(text) {
    this.setState({
      workoutName: text,
    });
  }

  onDayWorkoutNameChanged(text, index) {
    let workoutDays = this.state.workoutDays;

    workoutDays[index][Constants.KEY_WORKOUT_NAME] = text;

    this.setState({
      workoutDays: workoutDays,
    });
  }

  addDayExercises = (dayIndex, bodyPartIndex, exerciseIDList) => {
    console.log('Adding exercises for dayIndex:::' + dayIndex);
    console.log('exerciseIDList:::');
    console.log(exerciseIDList);
    let workoutDays = this.state.workoutDays;
    let exerciseList =
      this.state.workoutDays[dayIndex][Constants.KEY_EXERCISES];
    for (let i = 0; i < exerciseIDList.length; i++) {
      let exerciseID = exerciseIDList[i];
      let exercise = {};
      exercise[Constants.KEY_EXERCISE_ID] = exerciseID;
      exercise[Constants.KEY_BODY_PART_ID] = bodyPartIndex;
      exerciseList.push(exercise);
    }
    workoutDays[dayIndex][Constants.KEY_EXERCISES] = exerciseList;
    this.setState({
      workoutDays: workoutDays,
    });
  };

  addExercise = () => {
    let params = {};
    params.addDayExercises = this.addDayExercises;
    params[Constants.KEY_EXERCISES] = this.state.exercises;
    this.props.navigation.navigate('AddExerciseToWorkout', params);
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: '#d6d6d6',
        }}
      />
    );
  };

  toggleWorkoutDayExpansion(selectedIndex) {
    let workoutDays = this.state.workoutDays;
    workoutDays[selectedIndex].isExpanded =
      !workoutDays[selectedIndex].isExpanded;
    this.setState({
      workoutDays: workoutDays,
    });
  }

  renderItem(item, index) {
    return (
      <View
        style={{width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <View style={styles.memberInfoContainer}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={styles.dayNameText}>{'Day ' + (index + 1)}</Text>
            <TextInput
              style={styles.textInput}
              numberOfLines={1}
              placeholderTextColor={'grey'}
              placeholder={'Enter Text'}
              value={item[Constants.KEY_WORKOUT_NAME]}
              onChangeText={(text) => this.onDayWorkoutNameChanged(text, index)}
            />
            <TouchableOpacity
              onPress={() => {
                this.toggleWorkoutDayExpansion(index);
              }}>
              {item.isExpanded ? (
                <Image
                  style={styles.downArrow}
                  source={require('../../assets/images/down_arrow_button.png')}
                  resizeMode={'cover'}
                />
              ) : (
                <Image
                  style={styles.rightArrow}
                  source={require('../../assets/images/right_arrow.png')}
                  resizeMode={'cover'}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {item.isExpanded ? this.renderExercises(index) : null}
      </View>
    );
  }

  renderExercises(workoutDayIndex) {
    let workoutDay = this.state.workoutDays[workoutDayIndex];
    let exercises = workoutDay[Constants.KEY_EXERCISES];
    let exercisesViews = exercises.map((exercise, index) => {
      let exerciseID = exercise[Constants.KEY_EXERCISE_ID];
      return this.renderExerciseItem(workoutDayIndex, index, exerciseID);
    });
    if (exercisesViews.length === 0) {
      return (
        <View
          style={[
            styles.headerContainer,
            {
              backgroundColor: 'white',
              paddingHorizontal: 20,
              paddingVertical: 5,
            },
          ]}
          key={'exercise_'}>
          <View style={styles.exerciseInfoContainer}>
            <Text style={styles.exerciseTitle}>Rest Day</Text>
          </View>
        </View>
      );
    }
    return exercisesViews;
  }

  renderExerciseItem(workoutDayIndex, exerciseIndex, exerciseID) {
    let exercise = this.state.exerciseList[exerciseID];
    let imageURL =
      Constants.IMAGE_BASE_URL_EXERCISE +
      exercise[Constants.KEY_EXERCISE_IMAGE];
    let exerciseTitle = exercise[Constants.KEY_EXERCISE_TITLE];
    let exerciseLevel = exercise[Constants.KEY_LEVEL_TITLE];

    return (
      <TouchableHighlight
        onPress={() => this.goToExerciseDetailScreen(exerciseID)}>
        <View
          style={[
            styles.headerContainer,
            {
              backgroundColor: 'white',
              paddingHorizontal: 20,
              paddingVertical: 5,
            },
          ]}
          key={'exercise_' + exerciseID}>
          <Image
            style={styles.exerciseImage}
            resizeMode={'cover'}
            source={{uri: imageURL}}
          />
          <View style={styles.exerciseInfoContainer}>
            <Text style={styles.exerciseTitle}>{exerciseTitle}</Text>
            <Text style={styles.exerciseLevelText}>{exerciseLevel}</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              this.showDeleteConfirmationAlert(workoutDayIndex, exerciseIndex)
            }>
            <Image
              style={styles.deleteIcon}
              source={require('../../assets/images/delete_button.png')}
              resizeMode={'cover'}
            />
          </TouchableOpacity>
        </View>
      </TouchableHighlight>
    );
  }

  goToExerciseDetailScreen(exerciseID) {
    let params = {};
    params[Constants.KEY_EXERCISE_DETAIL] = this.state.exerciseList[exerciseID];
    this.props.navigation.navigate('ExerciseDetails', params);
  }

  showDeleteConfirmationAlert(workoutDayIndex, exerciseIndex) {
    Alert.alert(
      'Remove Exercise',
      'Do you really want to remove this exercise?',
      [
        {
          text: 'Yes, Delete',
          onPress: () =>
            this.deleteExerciseFromWorkoutDay(workoutDayIndex, exerciseIndex),
        },
        {text: 'No', onPress: () => console.log('Not deleting...')},
      ],
      {cancelable: false},
    );
  }

  deleteExerciseFromWorkoutDay(workoutDayIndex, exerciseIndex) {
    let workoutDays = this.state.workoutDays;
    let workoutDay = workoutDays[workoutDayIndex];
    let exercises = workoutDay[Constants.KEY_EXERCISES];
    exercises.splice(exerciseIndex, 1);
    workoutDay[Constants.KEY_EXERCISES] = exercises;
    workoutDays[workoutDayIndex] = workoutDay;
    this.setState({
      workoutDays: workoutDays,
    });
  }

  saveWorkout = async () => {
    let workoutName = this.state.workoutName;
    if (workoutName.length === 0) {
      Utils.showAlert('Create Workout', 'Please enter workout name');
      return;
    }

    let thisInstance = this;

    this.setState({
      isLoading: true,
    });

    let imageBase64 = '';
    if (this.state.selectedProfileImage !== '') {
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
    let workoutNames = [];
    let days = [];
    let workoutDays = this.state.workoutDays;
    for (let i = 0; i < 7; i++) {
      let workoutDay = workoutDays[i];
      console.log('workout day::' + (i + 1));
      console.log(workoutDay);
      workoutNames.push(workoutDay[Constants.KEY_WORKOUT_NAME]);
      // if(workoutNames.length > 0) {
      //     workoutNames += ",";
      // }
      // workoutNames += workoutDay[Constants.KEY_WORKOUT_NAME];

      let bodyPartWiseExercises = [];
      let exercises = workoutDay[Constants.KEY_EXERCISES];
      for (let j = 0; j < exercises.length; j++) {
        let exercise = exercises[j];
        let bodyPartIndex = exercise[Constants.KEY_BODY_PART_ID];
        console.log('exercise::');
        console.log(exercise);
        for (let k = bodyPartWiseExercises.length; k <= bodyPartIndex; k++) {
          let exerciseList = [];
          bodyPartWiseExercises.push(exerciseList);
        }
        let exerciseList = bodyPartWiseExercises[bodyPartIndex];
        exerciseList.push(exercise[Constants.KEY_EXERCISE_ID]);
        bodyPartWiseExercises[bodyPartIndex] = exerciseList;
      }
      let dayExerciseList = [];
      for (let j = 0; j < bodyPartWiseExercises.length; j++) {
        let bodyPartExerciseList = bodyPartWiseExercises[j];
        /*
                if(bodyPartExerciseList.length === 0) {
                    dayExerciseList.push("");
                } else {
                    dayExerciseList.push(bodyPartExerciseList);
                }
                */
        dayExerciseList.push(bodyPartExerciseList);
      }
      /*
            if(dayExerciseList.length === 0) {
                days.push("");
            } else {
                days.push(dayExerciseList);
            }
            */
      days.push(dayExerciseList);
    }

    let data = new FormData();

    let workoutGymID = this.state.workoutGymID;

    data.append(Constants.KEY_GYM_ID, this.state.gymID);
    data.append(Constants.KEY_PLAN_NAME, workoutName);
    data.append(Constants.KEY_PROFILE_IMAGE, imageBase64);
    if (workoutGymID === '0' && this.state.workoutID !== '') {
      data.append(Constants.KEY_WORKOUT_ID, '');
      data.append(Constants.KEY_FROM_WORKOUT, this.state.workoutID);
    } else {
      data.append(Constants.KEY_WORKOUT_ID, this.state.workoutID);
      data.append(Constants.KEY_FROM_WORKOUT, '');
    }

    //data.append(Constants.KEY_WORKOUT_NAME, JSON.stringify(workoutNames));
    data.append(Constants.KEY_MEMBER_ID, this.state.memberID);
    data.append(Constants.KEY_MEMBER_TYPE, '');
    for (let i = 0; i < 7; i++) {
      //data.append("day"+(i+1), JSON.stringify(days[i]));
      let exerciseByBodyParts = days[i];
      for (let j = 0; j < exerciseByBodyParts.length; j++) {
        let exerciseList = exerciseByBodyParts[j];
        if (exerciseList.length === 0) {
          data.append('day' + (i + 1) + '[' + j + ']', '');
        } else {
          for (let k = 0; k < exerciseList.length; k++) {
            data.append(
              'day' + (i + 1) + '[' + j + '][' + k + ']',
              exerciseList[k],
            );
          }
        }
      }
      data.append(Constants.KEY_WORKOUT_NAME + '[' + i + ']', workoutNames[i]);
    }

    console.log(' API_URL_ADD_WORKOUT Body:::');
    //console.log(body);
    console.log(data);

    let apiURL = Constants.API_URL_ADD_WORKOUT;
    if (this.state.memberID.length > 0) {
      apiURL = Constants.API_URL_ADD_WORKOUT_FOR_MEMBER;
    }
    this.props.DispatchaddWorkout(data, apiURL);

    setTimeout(() => {
      if (this.props.AddWorkoutData.success) {
        thisInstance.showWorkoutSavedAlert();
      } else {
        let message = 'Some error occurred. Please try agian.';

        Utils.showAlert('Error!', message);
      }
    }, 2000);
  };

  showWorkoutSavedAlert() {
    let thisInstance = this;
    Alert.alert(
      'Success',
      'Workout saved successfully.',
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
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  button: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 3,
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    width: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 40,
    lineHeight: 40,
    marginTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#162029',
    paddingHorizontal: 10,
    height: 40,
  },
  tabTitle: {
    color: '#343434',
    fontSize: 16,
    fontWeight: '500',
    flexGrow: 1,
    textAlign: 'center',
  },
  titleBannerContainer: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleBanner: {
    width: 150,
    height: 21.5,
  },
  backIcon: {
    width: 11,
    height: 17,
    resizeMode: 'cover',
    marginRight: 10,
  },
  searchTextInput: {
    flexGrow: 1,
    textAlign: 'left',
    color: '#41464c',
  },
  searchIcon: {
    width: 13,
    height: 14,
    resizeMode: 'cover',
    marginRight: 20,
  },
  shareIcon: {
    width: 13,
    height: 14,
    resizeMode: 'cover',
    marginRight: 20,
  },
  notificationIcon: {
    width: 13,
    height: 15,
    resizeMode: 'cover',
    marginRight: 20,
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
  memberInfoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberProfileImage: {
    width: 45,
    aspectRatio: 1,
    borderRadius: 22.5,
    marginHorizontal: 20,
  },
  profileInfoView: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  dayNameText: {
    color: '#343434',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'left',
    marginRight: 10,
  },
  dayWorkoutNameText: {
    color: '#343434',
    fontSize: 18,
    textAlign: 'left',
    marginRight: 10,
    flexGrow: 1,
  },
  rightArrow: {
    width: 11,
    height: 20,
    resizeMode: 'cover',
  },
  downArrow: {
    width: 20,
    height: 11,
    resizeMode: 'cover',
  },
  moreIcon: {
    width: 5,
    height: 22.5,
  },
  deleteIcon: {
    width: 22,
    height: 22,
  },
  exerciseImage: {
    width: 80,
    height: 45,
    resizeMode: 'cover',
  },
  exerciseInfoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginHorizontal: 10,
  },
  exerciseTitle: {
    fontSize: 14,
    color: '#343434',
    textAlign: 'left',
    flex: 1,
    flexWrap: 'wrap',
  },
  exerciseLevelText: {
    fontSize: 12,
    color: 'grey',
    textAlign: 'left',
    flex: 1,
    flexWrap: 'wrap',
  },
  profileImageContainer: {
    width: 50,
    aspectRatio: 1,
  },
  profileImage: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 25,
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
  textInput: {
    flexGrow: 1,
    marginHorizontal: 10,
    color: '#343434',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    width: '100%',
    color: 'white',
    backgroundColor: '#162029',
    lineHeight: 35,
    height: 35,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
const mapStateToProps = (state) => {
  return {
    AddWorkoutData: state.addWorkOutReducer,
    workoutDetail: state.workoutDetailReducer,
  };
};
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      DispatchaddWorkout: addWorkout,
      DispatchWorkoutDetails: fetchWorkoutDetails,
    },
    dispatch,
  );
}
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateOrEditWorkout);
