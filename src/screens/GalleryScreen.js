import React, { Component } from 'react';
import { Text, FlatList, Image, ImageBackground, View, StyleSheet, TouchableOpacity, TouchableHighlight
, ActivityIndicator, Platform, Button, PermissionsAndroid, Alert } from 'react-native';

import ActionButton from 'react-native-action-button';

import CameraRollPicker from 'react-native-camera-roll-picker';
import { RNCamera } from 'react-native-camera';
import ActionSheet from 'react-native-action-sheet';
import ImageResizer from 'react-native-image-resizer';
var RNFS = require('react-native-fs');

import { withNavigationFocus } from "react-navigation";

import * as globals from '../utils/globals';
import * as Constants from '../utils/Constants';
import * as Utils from '../utils/Utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addgallery, deletegallery, fetchgallery } from '../Redux/Actions/imageGalleryAction';

const photoOptionsIOS = [
    "Capture with Camera", 
    "Select from Gallery",
    "Cancel"
];

const photoOptionsAndroid = [
    "Capture with Camera", 
    "Select from Gallery"
];

const PendingView = () => (
    <View
      style={{
        flex: 1,
        width:'100%',
        backgroundColor: 'lightgreen',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Waiting</Text>
    </View>
);

class GalleryScreen extends Component {

    constructor(properties) {
        super(properties);

        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];
        
        //let willShowNextButton = globals.getSetting()[globals.KEY_USER_ACCOUNT_SETUP_STATUS] === globals.KEY_ACCOUNT_SETUP_STATUS_FINISHED ? false: true;
        let willStopChildFlatListScrolling = properties.willStopChildFlatListScrolling;
        this.state = {
            gymID: gymID,
            //willShowNextButton: willShowNextButton,
            isLoading: false,
            isFetchingData: true,
            isDataLoaded: false,
            galleryImages: [],
            removedImages:[],
            isShowingPhotoPicker: false,
            temporarySelectedImage:'',
            isShowingCamera: false,
            isShowingPictureTakenWithCamera: false,
            willUpdateData: true,
            willShowSaveButton: false,
            willStopChildFlatListScrolling,
        };
    }

    componentDidMount() {
        this.fetchGymGalleryImages();
        //this.requestForPhotosPermissionIfNotGranted();
        this.focusListener = this.props.navigation.addListener("didFocus", () => {
            if(this.state.willUpdateData) {
                this.updateData(); 
            } else {
                this.setState({
                    willUpdateData: true,
                });
            }
        });
    }

    requestForPhotosPermissionIfNotGranted() {
        try {
            const granted = PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              {
                title: "Access External Storage",
                message:
                  "Cool Photo App needs access to your camera " +
                  "so you can take awesome pictures.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
              }
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

    componentWillUnmount() {
        if(this.focusListener) {
            this.focusListener.remove();
        }
    }

    async updateData() {
        await this.updateGymInfo();
        this.fetchGymGalleryImages();
    }

    async updateGymInfo() {
        let userInfo = globals.getSetting().userInfo;

        let gymData = userInfo[Constants.KEY_GYM_DATA];
        let gymID = gymData[Constants.KEY_ID];
        
        await this.promisedSetState({
            gymID: gymID,
            isLoading: false,
            isFetchingData: true,
            isDataLoaded: false,
            galleryImages: [],
            removedImages:[],
            isShowingPhotoPicker: false,
            temporarySelectedImage:'',
            willShowSaveButton: false,
        });
    }

    promisedSetState = (newState) => {
        return new Promise((resolve) => {
            this.setState(newState, () => {
                resolve()
            });
        });
    }

	render() {
        if(this.state.isShowingCamera) {
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
                    }}
                  >
                    {({ camera, status, recordAudioPermissionStatus }) => {
                      if (status !== 'READY') return <PendingView />;
                      return (
                        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', alignItems:'center' }}>
                            <TouchableOpacity onPress={() => this.takePicture(camera)} style={styles.captureButton}>
                                <Text style={{ fontSize: 14 }}> SNAP </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.cancelCapture()} style={styles.cancelCaptureButton}>
                                <Text style={{ fontSize: 14 }}> Cancel </Text>
                            </TouchableOpacity>
                        </View>
                      );
                    }}
                  </RNCamera>
                </View>
              );
        }

        if(this.state.isShowingPictureTakenWithCamera) {
            return (
                <View style={styles.cameraContainer}>
                    <Image 
                        style={{
                            width: '100%',
                            flex:1,
                        }}
                        resizeMode={"cover"}
                        source={{uri:this.state.temporarySelectedImage.uri}}
                    />
                    
                    <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', alignItems:'center' }}>
                        <TouchableOpacity onPress={() => this.retakePicture()} style={styles.captureButton}>
                            <Text style={{ fontSize: 14 }}> Retake </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.confirmTakenPicture()} style={styles.cancelCaptureButton}>
                            <Text style={{ fontSize: 14 }}> Confirm </Text>
                        </TouchableOpacity>
                    </View>
                </View>
              );
        }

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
                        selected={[this.state.temporarySelectedImage]}
                    />
                </View>
              );
        }

        if(this.state.isFetchingData) {
            return (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                </View>
            );
        }

        if(this.state.isDataLoaded === false) {
            return (
                <View style={styles.mainContainer}>
                    <TouchableOpacity 
                        onPress={()=> {
                            this.fetchGymGalleryImages();
                        }}
                        style={{width:'100%'}}
                    >
                        <Text
                            style={styles.button}
                        >
                        Retry to fetch data
                        </Text>
                    </TouchableOpacity>
                </View>
            );
            
        }

        return (
			<View style={styles.mainContainer}>
                {
                    this.state.willShowSaveButton ? (
                        <TouchableOpacity onPress={this.next} style={{width:'100%'}}>
                            <View style={styles.nextButton}> 
                                <Text style={{color:'white', fontSize:16, textAlign: 'center'}}>SAVE</Text>
                            </View>
                        </TouchableOpacity>
                    ) : null
                }
                <FlatList
                    style={{ width: "100%", marginTop: 20, }}
                    data={this.state.galleryImages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => this.renderItem(item, index)}
                    numColumns={2}
                    scrollEnabled={!this.state.willStopChildFlatListScrolling}
                />
                
                {/*
                    this.state.willShowNextButton ? (
                        <TouchableOpacity onPress={this.next} style={{width:'100%'}}>
                            <View style={styles.nextButton}> 
                                <Text style={{color:'white', fontSize:16, textAlign: 'center'}}>NEXT</Text>
                            </View>
                        </TouchableOpacity>
                    ) : null
                */}

                {/*
                    this.state.willShowNextButton ? (
                        <ActionButton
                            buttonColor="#ec386c"
                            onPress={this.addImage}
                            renderIcon={(active) => (
                                <Image style={{width:20, height:18}} resizeMode={"cover"} source={require("../../assets/images/add_photo_icon.png")} />
                            )}
                        />
                    ) : null
                */}
                
                {
                    this.state.isLoading ? (
                        <View style={styles.activityIndicatorContainer}>
                            <ActivityIndicator size="large" color="#161a1e" style={{marginTop: 35}}/>
                        </View>
                    ): null
                }
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
        
        console.log("BODY:::");
        console.log(data);
        this.props.DispatchFetchGallery(data)
      
setTimeout(() => {
    if(this.props.ImageGalleryReducerdata.success) {
        
        let galleryImages = [];
        if(this.props.ImageGalleryReducerdata.fetchgallery[Constants.KEY_BODY]) {
            galleryImages = this.props.ImageGalleryReducerdata.fetchgallery[Constants.KEY_BODY];
            for(let i = 0; i < galleryImages.length; i++) {
                galleryImages[i][Constants.KEY_IS_UPLOADED] = true;
            }
        }

        thisInstance.setState({
            galleryImages: galleryImages,
            isDataLoaded: true,
            isFetchingData: false,
        }); 
        
    } else {
      
        let   message = 'Some error occurred. Please try agian.';
        
        thisInstance.setState({
            isFetchingData: false,
        });
        Utils.showAlert("Error!", message);
    }
}, 1200);
          
		
    }

    renderItem(item, index) {
    
        let imageURL = item[Constants.KEY_IMAGE];
    
        return (
    
            <TouchableHighlight style={styles.innerCard}>    
                <ImageBackground 
                    style={styles.galleryImage} 
                    resizeMode={"cover"} 
                    source={{uri: imageURL}}
                >
                    <TouchableOpacity onPress={()=>this.showDeleteConfirmationAlert(index)}>
                        <Image style={styles.removeIcon} resizeMode={"cover"} source={require("../../assets/images/remove_image_icon.png")} />
                    </TouchableOpacity>
                    
                </ImageBackground>
            </TouchableHighlight>
    
        );
    }

    showDeleteConfirmationAlert(index) {
        Alert.alert(
            "Remove Image", "Do you really want to remove this image?",
            [
              { text: 'Yes, Delete', onPress: () => this.removeImageAtIndex(index) },
              { text: 'No', onPress: () => console.log("Not deleting...") },
            ],
            { cancelable: false },
        );
    }

    removeImageAtIndex(index) {
        let thisInstance = this;
        this.props.onLoadingStatusChanged(true);
        /*
        this.setState({
            isLoading: true,
        });
        */
        let allGalleryImages = this.state.galleryImages;
        let image = allGalleryImages[index];
        let data = new FormData();
        let imageID = image[Constants.KEY_ID]
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_IMAGE_ID, imageID);
        
        console.log("BODY:::");
        console.log(data);
        this.props.Dispatchdeletegallery(data);
        
        setTimeout(() => {
            if(this.props.ImageGalleryReducerdata.success) {

                allGalleryImages.splice(index, 1);

                thisInstance.setState({
                    galleryImages: allGalleryImages,
                    isLoading: false,
                });
                thisInstance.props.onLoadingStatusChanged(false);
                
            } else {
               
                
                   let  message = 'Some error occurred. Please try agian.';
                
                thisInstance.setState({
                    isLoading: false,
                });
                thisInstance.props.onLoadingStatusChanged(false);
                Utils.showAlert("Error!",message);
            }
        }, 1200);

       
        /*
        let allGalleryImages = this.state.galleryImages;
        let removedImages  = this.state.removedImages;
        let image = allGalleryImages[index];
        if(image[Constants.KEY_IS_UPLOADED] === true) {
            removedImages.push(image);
        }
        allGalleryImages.splice(index, 1);
        this.setState({
            galleryImage: allGalleryImages,
            removedImages: removedImages,
            //willShowSaveButton: true,
        });

        console.log("Current state:::");
        console.log(this.state);
        */
    }

    addImage = () => {
        if(this.state.galleryImages.length >= Constants.MAX_GALLERY_IMAGE) {
            Utils.showAlert("", "You can upload maximum " + Constants.MAX_GALLERY_IMAGE + " images.");
            return;
        }

        this.selectOrCaptureGalleryPhoto();
    }

    selectOrCaptureGalleryPhoto() {
        ActionSheet.showActionSheetWithOptions({
            title: 'Add Photo By',
            options: (Platform.OS == 'ios') ? photoOptionsIOS : photoOptionsAndroid,
            cancelButtonIndex: photoOptionsIOS.length-1,
            destructiveButtonIndex: photoOptionsIOS.length-1,
            tintColor: '#121619'
        },
        (buttonIndex) => {
            if(buttonIndex !== undefined && buttonIndex < photoOptionsAndroid.length) {
                this.onOptionSelected(buttonIndex);
            }
        });
    }

    onOptionSelected(index) {
        if(index === 0) {
            this.captureWithCamera();
        } else if(index === 1){
            this.selectFromGallery();
        }
    } 

    captureWithCamera() {
        /*
        this.setState({
            temporarySelectedImage: '',
            isShowingCamera: true,
        })
        */
        this.setState({
            willUpdateData: false,
        });
        let params = {};
        params['onPictureTaken'] = this.onPictureTaken;
        this.props.navigation.navigate("TakePicture", params);
    }

    selectFromGallery() {
        /*
        this.setState({
            isShowingPhotoPicker: true,
            temporarySelectedImage: '',
        });
        */
        this.setState({
            willUpdateData: false,
        });
        let params = {};
        params['onPictureSelectedFromGallery'] = this.onPictureSelectedFromGallery;
        params['maximum_photos'] = Constants.MAX_GALLERY_IMAGE - this.state.galleryImages.length;
        this.props.navigation.navigate("SelectImageFromGallery", params);
    }

    onPhotoSelected = (allSelectedImages, currentSelectedImage) => {
        //console.log("All selected images:::");
        //console.log(allSelectedImages);
        console.log("Currently selected image::");
        console.log(currentSelectedImage);
        
       this.setState({
        temporarySelectedImage: currentSelectedImage
       });
    }

    cancelPhotoSelection() {
        this.setState({
            isShowingPhotoPicker:false,
        });
    }

    donePhotoSelection() {
        let selectedPhoto = this.state.temporarySelectedImage;

        if(selectedPhoto) {
            let galleryImages = this.state.galleryImages;
            let image = {};
            image[Constants.KEY_IMAGE] = selectedPhoto.uri;
            image[Constants.KEY_IS_UPLOADED] = false;
            galleryImages.push(image);
            this.setState({
                galleryImages: galleryImages,
                isShowingPhotoPicker:false,
                //willShowSaveButton: true,
            });
        } else {
            this.setState({
                isShowingPhotoPicker:false,
            });    
        }
    }

    takePicture = async (camera) => {
        const options = { quality: 0.8, base64: true };
        const data = await camera.takePictureAsync(options);
        //  eslint-disable-next-line
        console.log("Picture taken:::");
        console.log(data.uri);

        this.setState({
            temporarySelectedImage: data,
            isShowingCamera: false,
            isShowingPictureTakenWithCamera: true,
        })
    };

    cancelCapture = () => {
        this.setState({
            isShowingCamera: false,
        });
    }

    retakePicture = () => {
        this.setState({
            isShowingPictureTakenWithCamera: false,
        });
        this.captureWithCamera();
    }

    confirmTakenPicture = () => {
        let selectedPhoto = this.state.temporarySelectedImage;

        if(selectedPhoto) {
            let galleryImages = this.state.galleryImages;
            let image = {};
            image[Constants.KEY_IMAGE] = selectedPhoto.uri;
            image[Constants.KEY_IS_UPLOADED] = false;
            galleryImages.push(image);
            this.setState({
                galleryImages: galleryImages,
                isShowingPictureTakenWithCamera:false,
                //willShowSaveButton: true,
            });
        } else {
            this.setState({
                isShowingPictureTakenWithCamera:false,
            });    
        }
    }

    onPictureTaken = (pictureUri) => {
        if(pictureUri) {
            let galleryImages = this.state.galleryImages;
            let image = {};
            image[Constants.KEY_IMAGE] = pictureUri;
            image[Constants.KEY_IS_UPLOADED] = false;
            galleryImages.push(image);
            let imagesToUpload = [];
            imagesToUpload.push(image);
            this.setState({
                galleryImages: galleryImages,
            });
            this.uploadImages(imagesToUpload);
        }
    }

    onPictureSelectedFromGallery = (pictureUris) => {
        if(pictureUris.length > 0) {
            let galleryImages = this.state.galleryImages;
            let imagesToUpload = [];
            for(let i = 0; i < pictureUris.length; i++) {
                let pictureUri = pictureUris[i].uri;
                console.log("Selected Image URI in GalleryScreen:::" + pictureUri);
                let image = {};
                image[Constants.KEY_IMAGE] = pictureUri;
                image[Constants.KEY_IS_UPLOADED] = false;
                galleryImages.push(image);
                imagesToUpload.push(image);
            }
            this.setState({
                galleryImages: galleryImages,
            });
            this.uploadImages(imagesToUpload);
        }
    }

    next = () => {
        let allGalleryImages = this.state.galleryImages;
        let imagesToUpload = [];
        for(let i = 0; i < allGalleryImages.length; i++) {
            let image = allGalleryImages[i];
            if(image[Constants.KEY_IS_UPLOADED] === false) {
                imagesToUpload.push(image);
            }
        }

        let removedImages = this.state.removedImages;

        console.log('imagesToUpload:::');
        console.log(imagesToUpload);

        if(imagesToUpload.length > 0) {
            this.uploadImages(imagesToUpload);
        } else if(removedImages.length > 0) {
            this.removeUploadedImages();
        }/* else {
            this.goToSubscriptionScreen();
        }
        */
        
        
    }

    uploadImages = async (imagesToUpload) => {
        let thisInstance = this;
        this.props.onLoadingStatusChanged(true);
        /*
        this.setState({
            isLoading: true,
        });
        */
        let data = new FormData();
        let imageBase64List = [];
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        for(let i = 0; i < imagesToUpload.length; i++) {
            let image = imagesToUpload[i];
            
            let imageURi = image[Constants.KEY_IMAGE];
            try {
                let response = await ImageResizer.createResizedImage(imageURi, 1000, 1000, "JPEG", 60);
                console.log("response:::");
                console.log(response);
                imageURi = response.uri;
            } catch(error) {
                console.log("Error while resizing image...");
                console.log(error);
            }
            let imageBase64 = await RNFS.readFile(imageURi, 'base64').then();
            //let imageBase64 = await RNFS.readFile(image[Constants.KEY_IMAGE], 'base64').then();
            imageBase64List.push(imageBase64);
        }
        data.append(Constants.KEY_IMAGE, JSON.stringify(imageBase64List));
        
        console.log("upload gallery data:::");
        console.log(data);
        this.props.Dispatchaddgallery(data);
        setTimeout(() => {
          
            let valid = this.props.ImageGalleryReducerdata.gallery[Constants.KEY_VALID];
            if(valid) {

                //let willShowNextButton = thisInstance.state.willShowNextButton;

                let galleryImages = thisInstance.state.galleryImages;
                for(let i = 0; i < galleryImages.length; i++) {
                    galleryImages[i][Constants.KEY_IS_UPLOADED] = true;
                }
                thisInstance.setState({
                    galleryImages: galleryImages,
                    isLoading: false,
                    willShowSaveButton: false,
                });
                thisInstance.props.onLoadingStatusChanged(false);
                
            }
            else {
                let message = this.props.ImageGalleryReducerdata.gallery[Constants.KEY_MESSAGE];
                if(!(message && message.length > 0)) {
                    message = 'Some error occurred. Please try agian.';
                }
                thisInstance.setState({
                    isLoading: false,
                });
                thisInstance.props.onLoadingStatusChanged(false);
                Utils.showAlert("Error!", message);
            }
        }, 1500);
       

            
                /*
                if(thisInstance.state.removedImages.length > 0) {
                    thisInstance.setState({
                        galleryImages: galleryImages,
                    });
                    thisInstance.removeUploadedImages();
                } else {
                    thisInstance.setState({
                        galleryImages: galleryImages,
                        isLoading: false,
                        willShowSaveButton: false,
                    });
                }
                */
                /*
                if(willShowNextButton) {
                    globals.setOneSetting(globals.KEY_USER_ACCOUNT_SETUP_STATUS, globals.KEY_ACCOUNT_SETUP_STATUS_GYM_GALLERY_DONE);
                    if(thisInstance.state.removedImages.length > 0) {
                        thisInstance.removeUploadedImages();
                    } else {
                        thisInstance.goToSubscriptionScreen();
                    }
                }
                */
                
            
		
    }

    removeUploadedImages() {
        let removedImages = this.state.removedImages;

        if(removedImages.length > 0) {
            this.removeUploadedImage();
        } else {
            this.setState({
                isLoading: false,
                willShowSaveButton: false,
            });
            /*
            let willShowNextButton = this.state.willShowNextButton;
            if(willShowNextButton) {
                this.goToSubscriptionScreen();
            }
            */
        }

    }

    removeUploadedImage() {
        let thisInstance = this;
        this.setState({
            isLoading: true,
        });
        let data = new FormData();
        let image = this.state.removedImages[0];
        let imageID = image[Constants.KEY_ID]
        data.append(Constants.KEY_GYM_ID, this.state.gymID);
        data.append(Constants.KEY_IMAGE_ID, imageID);
        
        console.log("BODY:::");
        console.log(data);
        this.props.Dispatchdeletegallery(data);
        
setTimeout(() => {
    if(this.props.ImageGalleryReducerdata.success) {

        let removedImages = thisInstance.state.removedImages;
        removedImages.splice(0,1);
        thisInstance.setState({
            removedImages: removedImages,
        });

        thisInstance.removeUploadedImages();
        
    } else {
       
            message = 'Some error occurred. Please try agian.';
        
        thisInstance.setState({
            isLoading: false,
        });
        Utils.showAlert("Error!", message);
    }
}, 1100);
           
		
    }

    goToSubscriptionScreen() {
        this.props.goToNextPage();
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
        width:'100%',
        height:'100%',
        backgroundColor:'white',
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
    nextButton: {
        width: '100%',
        height:35,
        backgroundColor:'#2c9fc9',
        justifyContent:'center',
        alignItems:'center',
    },
    innerCard: {
        //flex:1,
        width: "50%",
        height: 75,
        justifyContent:'center',
        alignItems:'center',
    },
    galleryImage:{
        width:175, 
        height:75,
        justifyContent: 'flex-start',
        alignItems:'flex-end',
        padding:10,
    },
    removeIcon: {
        width:15,
        height: 15,
    }
});

const mapStateToprops = (state) => {
    return {
        ImageGalleryReducerdata:state.imageGalleryReducer
    };
  };
  function mapDispatchToprops(dispatch) {
    return bindActionCreators(
      { DispatchFetchGallery:fetchgallery,
          Dispatchaddgallery:addgallery,
        Dispatchdeletegallery:deletegallery,
      },
      dispatch,
    );
  }
  export default connect(
    mapStateToprops,
    mapDispatchToprops,
  )(withNavigationFocus(GalleryScreen));
