import React, {Component} from 'react';
import {
  Text,
  FlatList,
  Image,
  ImageBackground,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  Platform,
  Button,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchgallery} from '../Redux/Actions/imageGalleryAction';

class GymGalleryScreen extends Component {
  constructor(properties) {
    super(properties);

    let gymID = properties.gymID;

    this.state = {
      gymID: gymID,
      isLoading: false,
      isFetchingData: true,
      isDataLoaded: false,
      galleryImages: [],
    };
  }

  componentDidMount() {
    this.fetchGymGalleryImages();
  }

  render() {
    if (this.state.isFetchingData) {
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

    if (this.state.isDataLoaded === false) {
      return (
        <View style={styles.mainContainer}>
          <TouchableOpacity
            onPress={() => {
              this.fetchGymGalleryImages();
            }}
            style={{width: '100%'}}>
            <Text style={styles.button}>Retry to fetch data</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.mainContainer}>
        {this.state.willShowSaveButton ? (
          <TouchableOpacity onPress={this.next} style={{width: '100%'}}>
            <View style={styles.nextButton}>
              <Text style={{color: 'white', fontSize: 16, textAlign: 'center'}}>
                SAVE
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
        <FlatList
          style={{width: '100%', marginTop: 20}}
          data={this.state.galleryImages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => this.renderItem(item, index)}
          numColumns={2}
        />

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
    );
  }

  fetchGymGalleryImages() {
    let thisInstance = this;
    this.setState({
      isFetchingData: true,
    });
    let data = new FormData();
    data.append(Constants.KEY_GYM_ID, this.state.gymID);

    console.log('BODY:::');
    console.log(data);
    this.props.fetchgallery(data).then(() => {
      let valid = this.props.imageGalleryReducer[Constants.KEY_VALID];
      if (valid) {
        let galleryImages = [];
        if (this.props.imageGalleryReducer[Constants.KEY_BODY]) {
          galleryImages = this.props.imageGalleryReducer[Constants.KEY_BODY];
          for (let i = 0; i < galleryImages.length; i++) {
            galleryImages[i][Constants.KEY_IS_UPLOADED] = true;
          }
        }

        thisInstance.setState({
          galleryImages: galleryImages,
          isDataLoaded: true,
          isFetchingData: false,
        });
      } else {
        let message = this.props.imageGalleryReducer[Constants.KEY_MESSAGE];
        if (!(message && message.length > 0)) {
          message = 'Some error occurred. Please try agian.';
        }
        thisInstance.setState({
          isFetchingData: false,
        });
        Utils.showAlert('Error!', message);
      }
    });
  }

  renderItem(item, index) {
    let imageURL = item[Constants.KEY_IMAGE];

    return (
      <TouchableHighlight style={styles.innerCard}>
        <ImageBackground
          style={styles.galleryImage}
          resizeMode={'cover'}
          source={{uri: imageURL}}></ImageBackground>
      </TouchableHighlight>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#3d4a55',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  nextButton: {
    width: '100%',
    height: 35,
    backgroundColor: '#2c9fc9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCard: {
    //flex:1,
    width: '50%',
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: 175,
    height: 75,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 10,
  },
  removeIcon: {
    width: 15,
    height: 15,
  },
});

const mapStateToprops = (state) => {
  return {
    imageGalleryReducer: state.imageGalleryReducer.fetchgallery,
  };
};

function mapDispatchToprops(dispatch) {
  return bindActionCreators(
    {
      fetchgallery: fetchgallery,
    },
    dispatch,
  );
}

export default connect(mapStateToprops, mapDispatchToprops)(GymGalleryScreen);
