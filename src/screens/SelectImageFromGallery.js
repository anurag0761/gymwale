import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, Alert, ActivityIndicator, TextInput
, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, Button
, ScrollView, Switch, PermissionsAndroid } from 'react-native';

import CameraRollPicker from 'react-native-camera-roll-picker';

class SelectImageFromGallery extends Component {
    constructor(properties) {
        super(properties);

        let maximumPhotosToSelect = properties.navigation.getParam("maximum_photos", 1);

        this.state = {
            temporarySelectedImages: [],
            willShowCameraRollPicker: false,
            maximumPhotosToSelect: maximumPhotosToSelect,
        };
    }

    componentDidMount() {
        if(Platform.OS == 'android') {
            this.requestForPhotosPermissionIfNotGranted();
        }
    }

    render() {

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
                    
                {
                    this.state.willShowCameraRollPicker === true ? (
                        <CameraRollPicker
                            groupTypes="All"
                            callback={this.onPhotoSelected}
                            assetType="Photos"
                            maximum={this.state.maximumPhotosToSelect}
                            selected={this.state.temporarySelectedImages}
                        />
                    ) : null
                }
                
            </View>
        );
    }

    async requestForPhotosPermissionIfNotGranted() {
        let thisInstance = this;
        try {
            const granted = await PermissionsAndroid.request(
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
              console.log("You can use the gallery");
              thisInstance.setState({
                  willShowCameraRollPicker: true,
              });
              
            } else {
              console.log("Camera permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    }

    cancelPhotoSelection() {
        this.setState({
            temporarySelectedImages: [],
        });
        this.props.navigation.pop();
    }

    donePhotoSelection() {
        /*
        let selectedPhoto = this.state.temporarySelectedImage;

        if(selectedPhoto !== '') {
            if(this.props.navigation.state.params.onPictureSelectedFromGallery) {
                this.props.navigation.state.params.onPictureSelectedFromGallery(selectedPhoto.uri);
            }
        }
        */
        if(this.state.temporarySelectedImages.length > 0) {
            if(this.props.navigation.state.params.onPictureSelectedFromGallery) {
                this.props.navigation.state.params.onPictureSelectedFromGallery(this.state.temporarySelectedImages);
            }
        }

        this.setState({
            temporarySelectedImages: [],
        })
        this.props.navigation.pop();
    }

    onPhotoSelected = (allSelectedImages, currentSelectedImage) => {
        console.log("All selected images:::");
        console.log(allSelectedImages);
        console.log("Currently selected image::");
        console.log(currentSelectedImage);
        
        this.setState({
            //temporarySelectedImage: currentSelectedImage
            temporarySelectedImages: allSelectedImages,
        });

        if(allSelectedImages.length === this.state.maximumPhotosToSelect) {
            this.donePhotoSelection();
        }
    }
}

const styles = StyleSheet.create({
    
});

export default SelectImageFromGallery;