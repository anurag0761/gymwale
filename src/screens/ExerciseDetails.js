import React, {Component} from 'react';
import {
  Text,
  StatusBar,
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TouchableHighlight,
  TextInput,
  ImageBackground,
  ScrollView,
} from 'react-native';

import HTML from 'react-native-render-html';
import VideoPlayer from 'react-native-video-player';
import {getStatusBarHeight} from 'react-native-status-bar-height';
//import { Video } from 'expo-av';
import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

class ExerciseDetails extends Component {
  constructor(properties) {
    super(properties);

    let userInfo = globals.getSetting().userInfo;

    let gymData = userInfo[Constants.KEY_GYM_DATA];
    let gymID = gymData[Constants.KEY_ID];

    let exerciseDetails = properties.navigation.getParam(
      Constants.KEY_EXERCISE_DETAIL,
    );
    console.log('.....',exerciseDetails,',,,,,,,,,,,,')

    this.state = {
      fullscreen: false,
      gymID: gymID,
      exerciseDetails: exerciseDetails,
    };
  }

  render() {
    let exerciseImageURL =
      Constants.IMAGE_BASE_URL_EXERCISE +
      this.state.exerciseDetails[Constants.KEY_EXERCISE_IMAGE];
    let htmlContent = this.state.exerciseDetails[
      Constants.KEY_EXERCISE_INSTRUCTIONS
    ];
    //+ this.state.exerciseDetails[Constants.KEY_EXERCISE_TIPS];
    let videoURL = this.state.exerciseDetails[Constants.KEY_EXERCISE_VIDEO];

    return (
      <View style={{flex: 1}}>
        <View
          style={{
            height: getStatusBarHeight(true),
            backgroundColor: '#161a1e',
          }}>
          <StatusBar backgroundColor="#161a1e" barStyle="light-content" />
        </View>

        <View
          style={[
            styles.headerContainer,
            {backgroundColor: 'white', padding: 10, marginBottom: 10},
          ]}>
          <TouchableOpacity
            onPress={this.goBack}
            style={{
              width: 30,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={styles.closeButton}>X</Text>
          </TouchableOpacity>
          <Text style={styles.exerciseTitle}>
            {this.state.exerciseDetails[Constants.KEY_EXERCISE_TITLE]}
          </Text>
        </View>
        {/*
                <Video usePoster={true}
                    source={{uri:videoURL}}
                    posterSource={{ uri: exerciseImageURL }}
                    shouldPlay={true}
                    resizeMode="contain"
                    style={{
                        width:screenWidth,
                        height: screenHeight*0.30,
                        borderWidth: 1,
                        borderColor: '#FFF',
                        borderBottomWidth: 0,
                        borderTopWidth: 0,
                        borderLeftWidth: 0,
                        borderRightWidth: 0
                    }}

                />
                */}
        <VideoPlayer
          fullScreenOnLongPress={true}
          endWithThumbnail
          thumbnail={{uri: exerciseImageURL}}
          video={{uri: videoURL}}
          videoWidth={screenWidth}
          videoHeight={screenHeight * 0.3}
          ref={(r) => (this.player = r)}
          controls={false}
          customStyles={{
            playButton: {
              borderColor: 'rgba(15,125,228,1)',
              backgroundColor: 'transparent',
              borderWidth: 2,
            },
            playArrow: {color: 'rgba(15,125,228,1)'},
          }}
          resizeMode={'contain'}
          style={{
            width: screenWidth,
            height: this.state.fullscreen ? screenHeight : screenHeight * 0.3,
            // height: screenHeight * ,
          }}
        />
        <TouchableOpacity
          style={{marginLeft: 10, position: 'absolute', right: 5, top: 40}}
          onPress={() => {
            this.setState({fullscreen: !this.state.fullscreen});
          }}>
          {!this.state.fullscreen ? (
            <Text>Full Screen</Text>
          ) : (
            <Text>exit full Screen</Text>
          )}
        </TouchableOpacity>
        {/*
                <View
                    style={{width:'100%', height:130, justifyContent:'center', alignItems:'center', marginVertical: 20}}
                >


                    <ImageBackground
                        style={{width:178, height: 100, justifyContent: 'center', alignItems: 'center'}}
                        source={{uri:exerciseImageURL}}
                    >
                        <TouchableOpacity onPress={this.playVideo}>
                            <Image resizeMode={"cover"} style={{width:65, height:65}} source={require('../../assets/images/play_icon.png')} />
                        </TouchableOpacity>
                    </ImageBackground>

                </View>
                */}
        <View style={[styles.infoContainer, {marginTop: 20}]}>
          <View style={styles.infoItemContainer}>
            <Image
              style={styles.setsIcon}
              source={require('../../assets/images/sets_icon.png')}
            />
            <Text style={styles.infoTitleText}>Sets</Text>
            <Text style={styles.infoText}>
              {this.state.exerciseDetails[Constants.KEY_EXERCISE_SETS]}
            </Text>
          </View>
          <View style={styles.infoItemContainer}>
            <Image
              style={styles.repsIcon}
              source={require('../../assets/images/reps_icon.png')}
            />
            <Text style={styles.infoTitleText}>Reps</Text>
            <Text style={styles.infoText}>
              {this.state.exerciseDetails[Constants.KEY_EXERCISE_REPS]}
            </Text>
          </View>
          <View style={styles.infoItemContainer}>
            <Image
              style={styles.restIcon}
              source={require('../../assets/images/rest_icon.png')}
            />
            <Text style={styles.infoTitleText}>Rest</Text>
            <Text style={styles.infoText}>
              {this.state.exerciseDetails[Constants.KEY_EXERCISE_REST]}
            </Text>
          </View>
        </View>

        <ScrollView style={{flex: 1, marginHorizontal: 20}}>
          <HTML
            html={htmlContent}
            imagesMaxWidth={Dimensions.get('window').width}
          />
        </ScrollView>
      </View>
    );
  }

  goBack = () => {
    this.props.navigation.pop();
  };

  playVideo = () => {
    let params = {};
    params[Constants.KEY_EXERCISE_DETAIL] = this.state.exerciseDetails;
    this.props.navigation.navigate('ExerciseVideo', params);
  };
}

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#161a1e',
    paddingHorizontal: 10,
  },
  tabTitle: {
    color: '#343434',
    fontSize: 20,
    fontWeight: 'bold',
    flexGrow: 1,
    textAlign: 'left',
  },
  titleBannerContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  titleBanner: {
    width: 199,
    height: 36,
  },
  backIcon: {
    width: 11,
    height: 20,
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
    padding: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
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
  exerciseTitle: {
    fontSize: 15,
    color: '#161616',
    textAlign: 'center',
    flex: 1,
    flexWrap: 'wrap',
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoItemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitleText: {
    color: '#161616',
    fontSize: 20,
    fontWeight: '100',
  },
  infoText: {
    color: 'grey',
    fontSize: 16,
  },
  setsIcon: {
    width: 45,
    height: 41,
    resizeMode: 'cover',
  },
  repsIcon: {
    width: 45,
    height: 41,
    resizeMode: 'cover',
  },
  restIcon: {
    width: 41,
    height: 41,
    resizeMode: 'cover',
  },
  closeButton: {
    color: '#194164',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
  },
});

export default ExerciseDetails;
