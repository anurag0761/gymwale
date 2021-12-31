import React, { Component } from 'react';
import { Text, StatusBar, Image, View, StyleSheet, Alert, ActivityIndicator, TextInput
, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform, Button
, ScrollView, Switch, PermissionsAndroid } from 'react-native';
import { withNavigationFocus } from 'react-navigation' 

import { RNCamera } from 'react-native-camera';

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

class TakePicture extends Component {
    constructor(properties) {
        super(properties);

        this.state = {
            temporaryTakenImage: '',
            isShowingTakenPicture: false,
        };
    }

    render() {

        const isFocused  = this.props.navigation.isFocused();
        console.log("isFocused::::");
        console.log(isFocused);

        if(this.state.isShowingTakenPicture) {
            return (
                <View style={styles.cameraContainer}>
                    <Image 
                        style={{
                            width: '100%',
                            flex:1,
                        }}
                        resizeMode={"cover"}
                        source={{uri:this.state.temporaryTakenImage.uri}}
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

        /*
        if(!isFocused) {
            return (
                <View style={{flex:1}}>

                </View>
            );
        }
        */

        return (
            <View style={styles.cameraContainer}>
                { isFocused && <RNCamera
                    style={styles.cameraPreview}
                    type={RNCamera.Constants.Type.back}
                    //flashMode={RNCamera.Constants.FlashMode.on}
                    androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                    }}
                    ref={ref => {
                        this.camera = ref;
                    }}
                    captureAudio={false}
                >
                    <View style={{flex:0, flexDirection: 'row', justifyContent: 'center', alignItems:'center' }}>
                        <TouchableOpacity onPress={this.takePicture.bind(this)} style={styles.captureButton}>
                            <Text style={{ fontSize: 14 }}> SNAP </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.cancelCapture()} style={styles.cancelCaptureButton}>
                            <Text style={{ fontSize: 14 }}> Cancel </Text>
                        </TouchableOpacity>
                    </View>
                </RNCamera>
                    
                }
            </View>
              
        );
    }

    takePicture = async () => {
        const options = { quality: 0.8, base64: true, fixOrientation: true };
        const data = await this.camera.takePictureAsync(options);
        //  eslint-disable-next-line
        console.log("Picture taken:::");
        console.log(data.uri);

        this.setState({
            temporaryTakenImage: data,
            isShowingTakenPicture: true,
        })
    };

    cancelCapture = () => {
        this.props.navigation.pop();
    }

    retakePicture = () => {
        this.setState({
            isShowingTakenPicture: false,
        });
    }

    confirmTakenPicture = () => {
        let selectedPhoto = this.state.temporaryTakenImage;

        if(this.props.navigation.state.params.onPictureTaken) {
            this.props.navigation.state.params.onPictureTaken(selectedPhoto.uri);
        }

        this.props.navigation.pop();
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
});

export default withNavigationFocus(TakePicture);